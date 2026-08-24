from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List
import os
import re
from dotenv import load_dotenv
import google.generativeai as genai

from .database import get_db, engine, Base
from .models import Scheme, SchemeChunk
from .schemas import Profile, SchemeRecommendation, SchemeDetailResponse, ChatRequest, ChatResponse, EligibilityFieldStatus
from .eligibility_engine import evaluate_scheme
from .seed import seed_db, generate_embedding

load_dotenv()

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

app = FastAPI(title="CivicAI API")

def get_cors_origins() -> list[str]:
    raw_origins = os.getenv("CORS_ORIGINS", "*")
    if raw_origins.strip() == "*":
        return ["*"]
    return [origin.strip() for origin in raw_origins.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

def normalize_official_source_url(url: str | None) -> str | None:
    if not url:
        return url
    if url.startswith("https://rules.myscheme.gov.in/"):
        return "https://www.myscheme.gov.in/"
    return url

def get_gemini_explanation(scheme_name: str, status: str, results: List[EligibilityFieldStatus]) -> str:
    if not api_key:
        return "Gemini API key missing. Explanation unavailable."
    
    prompt = f"""
    You are an AI assistant for a government scheme portal. 
    A citizen has applied for the scheme "{scheme_name}". 
    The deterministic engine has evaluated their eligibility as "{status}".
    
    Here are the detailed criterion results:
    """
    for res in results:
        prompt += f"- {res.criterion}: {res.status.upper()} ({res.reason})\n"
        
    prompt += """
    Based ONLY on these results, provide a 2-3 sentence plain-language explanation of why the citizen does or doesn't match this scheme. 
    Do not add new eligibility claims. Do not hallucinate. Be empathetic but direct.
    """
    
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"Gemini error: {e}")
        return "Could not generate explanation at this time."

def build_fallback_chat_answer(question: str, chunks: List[SchemeChunk]) -> str:
    if not chunks:
        return "I could not find enough verified information for that scheme right now. Please check the official portal for the latest details."

    question_words = {word for word in re.findall(r"[a-z0-9]+", question.lower()) if len(word) > 2}

    def score_chunk(chunk: SchemeChunk) -> tuple[int, int]:
        chunk_words = set(re.findall(r"[a-z0-9]+", chunk.content.lower()))
        overlap = len(question_words & chunk_words)
        return overlap, -len(chunk.content)

    ordered_chunks = sorted(chunks, key=score_chunk, reverse=True)
    selected = ordered_chunks[:2]

    highlights = []
    for chunk in selected:
        cleaned = chunk.content.strip().replace("\n", " ")
        if cleaned:
            highlights.append(cleaned[:300].rstrip())

    if not highlights:
        return "I could not find enough verified information for that scheme right now. Please check the official portal for the latest details."

    return (
        "Based on the verified scheme information I found, here is the safest answer: "
        + " ".join(highlights)
        + " If you want, I can help you rephrase the question or point you to the official portal details."
    )

@app.on_event("startup")
def startup_initialize_database():
    seed_db()

@app.post("/profile", response_model=Profile)
def create_profile(profile: Profile):
    # Store or validate profile for session
    return profile

@app.get("/schemes", response_model=List[SchemeDetailResponse])
def list_schemes(db: Session = Depends(get_db)):
    schemes = db.query(Scheme).all()
    for scheme in schemes:
        scheme.official_source_url = normalize_official_source_url(scheme.official_source_url)
    return schemes

@app.post("/recommend", response_model=List[SchemeRecommendation])
def recommend_schemes(profile: Profile, db: Session = Depends(get_db)):
    schemes = db.query(Scheme).all()
    recommendations = []
    
    for scheme in schemes:
        match_percentage, status, results = evaluate_scheme(profile, scheme)
        
        # We only want to process and explain if there's some chance of eligibility
        # Or maybe we show all. The prompt says "ranked list of scheme matches".
        if status in ["likely_eligible", "possibly_eligible", "insufficient_data"]:
            ai_explanation = get_gemini_explanation(scheme.name, status, results)
            
            recommendations.append(SchemeRecommendation(
                scheme_id=scheme.scheme_id,
                name=scheme.name,
                match_percentage=match_percentage,
                status=status,
                verification_status=scheme.verification_status,
                per_criterion_results=results,
                ai_explanation=ai_explanation
            ))
            
    # Rank: highest match percentage first
    recommendations.sort(key=lambda x: x.match_percentage, reverse=True)
    return recommendations

@app.get("/scheme/{scheme_id}", response_model=SchemeDetailResponse)
def get_scheme(scheme_id: str, db: Session = Depends(get_db)):
    scheme = db.query(Scheme).filter(Scheme.scheme_id == scheme_id).first()
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found")
    scheme.official_source_url = normalize_official_source_url(scheme.official_source_url)
    return scheme

@app.post("/chat", response_model=ChatResponse)
def chat_with_scheme(chat_req: ChatRequest, db: Session = Depends(get_db)):
    try:
        query = db.query(SchemeChunk)
        if chat_req.scheme_id:
            query = query.filter(SchemeChunk.scheme_id == chat_req.scheme_id)

        query = query.limit(25)
        all_chunks = query.all()

        if not api_key:
            return ChatResponse(answer=build_fallback_chat_answer(chat_req.question, all_chunks))

        try:
            # Use the same deterministic local embedding scheme as the seed process.
            query_embedding = generate_embedding(chat_req.question)

            # Order by distance using the stored vector embeddings.
            top_chunks = db.query(SchemeChunk)
            if chat_req.scheme_id:
                top_chunks = top_chunks.filter(SchemeChunk.scheme_id == chat_req.scheme_id)

            top_chunks = top_chunks.order_by(SchemeChunk.embedding.l2_distance(query_embedding)).limit(3).all()

            if not top_chunks:
                return ChatResponse(answer=build_fallback_chat_answer(chat_req.question, all_chunks))

            context = "\n".join([chunk.content for chunk in top_chunks])

            prompt = f"""
            You are a helpful assistant for CivicAI, a portal for Indian government schemes.
            Answer the user's question based ONLY on the provided context below.
            If the answer is not in the context, reply exactly with: "I don't have verified information on that — please check the official source link."

            Context:
            {context}

            Question: {chat_req.question}
            """

            model = genai.GenerativeModel('gemini-1.5-flash')
            response = model.generate_content(prompt)

            return ChatResponse(answer=response.text.strip())
        except Exception as inner_error:
            print(f"Chat fallback triggered: {inner_error}")
            return ChatResponse(answer=build_fallback_chat_answer(chat_req.question, all_chunks))
        
    except Exception as e:
        print(f"Chat error: {e}")
        return ChatResponse(answer="I’m having trouble retrieving the answer right now, but you can still review the scheme details and official portal for the latest information.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
