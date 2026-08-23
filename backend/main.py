from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List
import os
from dotenv import load_dotenv
import google.generativeai as genai

from .database import get_db, engine, Base
from .models import Scheme, SchemeChunk
from .schemas import Profile, SchemeRecommendation, SchemeDetailResponse, ChatRequest, ChatResponse, EligibilityFieldStatus
from .eligibility_engine import evaluate_scheme

load_dotenv()

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

app = FastAPI(title="CivicAI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For hackathon, allow all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

@app.post("/profile", response_model=Profile)
def create_profile(profile: Profile):
    # Store or validate profile for session
    return profile

@app.get("/schemes", response_model=List[SchemeDetailResponse])
def list_schemes(db: Session = Depends(get_db)):
    schemes = db.query(Scheme).all()
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
    return scheme

@app.post("/chat", response_model=ChatResponse)
def chat_with_scheme(chat_req: ChatRequest, db: Session = Depends(get_db)):
    if not api_key:
        return ChatResponse(answer="I cannot answer questions right now (API Key missing).")
        
    try:
        # Generate embedding for the question
        emb_result = genai.embed_content(
            model="models/text-embedding-004",
            content=chat_req.question,
            task_type="retrieval_query"
        )
        query_embedding = emb_result['embedding']
        
        # Retrieve top 3 relevant chunks
        # Using pgvector `<->` operator for L2 distance
        # We must format the vector correctly for the raw query or use SQLAlchemy integration
        from pgvector.sqlalchemy import Vector
        
        query = db.query(SchemeChunk)
        if chat_req.scheme_id:
            query = query.filter(SchemeChunk.scheme_id == chat_req.scheme_id)
            
        # Order by distance
        top_chunks = query.order_by(SchemeChunk.embedding.l2_distance(query_embedding)).limit(3).all()
        
        if not top_chunks:
            return ChatResponse(answer="I don't have verified information on that — please check the official source link.")
            
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
        
    except Exception as e:
        print(f"Chat error: {e}")
        return ChatResponse(answer="An error occurred while trying to process your question.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
