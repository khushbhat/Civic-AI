from pydantic import BaseModel
from typing import List, Optional, Any, Dict

class Profile(BaseModel):
    state: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    category: Optional[str] = None # General, OBC, SC, ST, EBC, DNT
    income: Optional[int] = None
    education_level: Optional[str] = None
    disability_status: Optional[str] = None # 'none' or specific
    studying_or_working: Optional[str] = None

class EligibilityFieldStatus(BaseModel):
    criterion: str
    status: str # "pass", "fail", "unknown"
    reason: str

class SchemeRecommendation(BaseModel):
    scheme_id: str
    name: str
    match_percentage: int
    status: str # "likely_eligible", "possibly_eligible", "not_eligible", "insufficient_data"
    verification_status: str
    per_criterion_results: List[EligibilityFieldStatus]
    ai_explanation: Optional[str] = None

class SchemeDetailResponse(BaseModel):
    scheme_id: str
    name: str
    government_level: str
    ministry: str
    benefits: str
    documents_required: List[str]
    application_process: List[str]
    official_source_url: str
    verification_status: str

class ChatRequest(BaseModel):
    scheme_id: Optional[str] = None
    question: str

class ChatResponse(BaseModel):
    answer: str
