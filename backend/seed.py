import json
import os
from dotenv import load_dotenv
from pathlib import Path
import hashlib
import random
from sqlalchemy.orm import Session
from sqlalchemy import text
from .database import engine, Base, SessionLocal
from .models import Scheme, SchemeChunk

load_dotenv()

def generate_embedding(text: str) -> list[float]:
    seed_bytes = hashlib.sha256(text.encode("utf-8")).digest()
    seed = int.from_bytes(seed_bytes[:8], "big", signed=False)
    generator = random.Random(seed)
    return [generator.uniform(-1.0, 1.0) for _ in range(768)]

def seed_db():
    print("Creating tables...")
    # This also enables pgvector extension if not already done, but we should do it manually if it fails
    with engine.connect() as conn:
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        conn.commit()

    Base.metadata.create_all(bind=engine)
    
    db: Session = SessionLocal()
    
    # Check if data already exists
    if db.query(Scheme).count() > 0:
        print("Database already seeded. Run carefully if you want to overwrite.")
        return

    schemes_path = Path(__file__).resolve().parent / "schemes.json"

    with schemes_path.open("r", encoding="utf-8") as f:
        schemes_data = json.load(f)
        
    for data in schemes_data:
        print(f"Seeding scheme: {data['scheme_id']}")
        eligibility = data.get('eligibility', {})
        
        income_max = eligibility.get('income_max')
        if income_max == "TODO_VERIFY":
            income_max = None
        elif income_max:
            income_max = int(income_max)
            
        scheme = Scheme(
            scheme_id=data['scheme_id'],
            name=data['name'],
            government_level=data['government_level'],
            ministry=data['ministry'],
            category=data['category'],
            target_groups=data['target_groups'],
            
            eligibility_state=eligibility.get('state'),
            eligibility_age_min=None if eligibility.get('age_min') == "TODO_VERIFY" else eligibility.get('age_min'),
            eligibility_age_max=None if eligibility.get('age_max') == "TODO_VERIFY" else eligibility.get('age_max'),
            eligibility_gender=eligibility.get('gender'),
            eligibility_category=eligibility.get('category'),
            eligibility_income_max=income_max,
            eligibility_education_level=None if eligibility.get('education_level') == "TODO_VERIFY" else eligibility.get('education_level'),
            eligibility_course_level=eligibility.get('course_level'),
            eligibility_institution_type=eligibility.get('institution_type'),
            eligibility_other_conditions=eligibility.get('other_conditions', []),
            
            benefits=data.get('benefits', ''),
            documents_required=data.get('documents_required', []),
            application_process=data.get('application_process', []),
            official_source_url=data['official_source_url'],
            source_name=data['source_name'],
            last_verified_date=data['last_verified_date'],
            verification_status=data['verification_status']
        )
        db.add(scheme)
        db.commit() # Commit so we can link chunks
        
        # Create chunks for RAG
        chunks = []
        # Chunk 1: Benefits
        if scheme.benefits:
            chunks.append(f"Benefits for {scheme.name}: {scheme.benefits}")
        
        # Chunk 2: Documents
        if scheme.documents_required:
            docs = ", ".join(scheme.documents_required)
            chunks.append(f"Documents required for {scheme.name}: {docs}")
            
        # Chunk 3: Application process
        if scheme.application_process:
            process = " -> ".join(scheme.application_process)
            chunks.append(f"Application process for {scheme.name}: {process}")
            
        # Chunk 4: Eligibility / Other conditions
        if scheme.eligibility_other_conditions:
            conds = ", ".join(scheme.eligibility_other_conditions)
            chunks.append(f"Other conditions for {scheme.name}: {conds}")

        for content in chunks:
            print(f"  Embedding chunk: {content[:30]}...")
            embedding = generate_embedding(content)
            chunk = SchemeChunk(
                scheme_id=scheme.scheme_id,
                content=content,
                embedding=embedding
            )
            db.add(chunk)
            
    db.commit()
    db.close()
    print("Seeding complete.")

if __name__ == "__main__":
    from sqlalchemy import text
    seed_db()
