from sqlalchemy import Column, Integer, String, Text, JSON, ForeignKey
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import Vector
from .database import Base

class Scheme(Base):
    __tablename__ = "schemes"

    scheme_id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    government_level = Column(String)
    ministry = Column(String)
    category = Column(String)
    target_groups = Column(JSON) # list of strings
    
    # Eligibility rules
    eligibility_state = Column(String, nullable=True)
    eligibility_age_min = Column(Integer, nullable=True)
    eligibility_age_max = Column(Integer, nullable=True)
    eligibility_gender = Column(String, nullable=True)
    eligibility_category = Column(String, nullable=True)
    eligibility_income_max = Column(Integer, nullable=True) # Storing as integer if verified, or null if TODO
    eligibility_education_level = Column(String, nullable=True)
    eligibility_course_level = Column(String, nullable=True)
    eligibility_institution_type = Column(String, nullable=True)
    eligibility_other_conditions = Column(JSON, nullable=True) # list of strings
    
    benefits = Column(Text)
    documents_required = Column(JSON) # list of strings
    application_process = Column(JSON) # list of strings
    
    official_source_url = Column(String)
    source_name = Column(String)
    last_verified_date = Column(String)
    verification_status = Column(String)
    
    chunks = relationship("SchemeChunk", back_populates="scheme", cascade="all, delete-orphan")

class SchemeChunk(Base):
    __tablename__ = "scheme_chunks"
    
    id = Column(Integer, primary_key=True, index=True)
    scheme_id = Column(String, ForeignKey("schemes.scheme_id"))
    content = Column(Text, nullable=False)
    # Gemini embeddings (e.g., text-embedding-004) are 768 dimensions
    embedding = Column(Vector(768))

    scheme = relationship("Scheme", back_populates="chunks")
