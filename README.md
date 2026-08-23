# CivicAI

CivicAI is a hackathon MVP web app that helps Indian citizens discover government welfare and scholarship schemes they are genuinely eligible for. It uses a hybrid deterministic-rules and LLM architecture.

## Architecture
- **Database**: PostgreSQL with `pgvector`
- **Backend**: Python, FastAPI, SQLAlchemy
- **Frontend**: React, Vite, Tailwind CSS
- **AI**: Gemini API (for explanations and RAG)

## Setup Instructions

### 1. Start the Database
Ensure Docker Desktop is running.
```bash
docker-compose up -d
```
This starts a PostgreSQL 16 container with the `pgvector` extension on port 5432.

### 2. Configure Environment Variables
Create a `.env` file in the root directory (or just set it in your environment) with your Gemini API key.
```bash
# Windows PowerShell
$env:GEMINI_API_KEY="your_api_key_here"
```

### 3. Setup and Seed the Backend
Open a terminal in the root project directory:
```bash
# (Optional) Create a virtual environment
python -m venv venv
.\venv\Scripts\activate

# Install dependencies
pip install -r backend/requirements.txt

# Seed the database with schemes and embeddings
python -m backend.seed
```

### 4. Start the Backend Server
```bash
python -m backend.main
```
The FastAPI server will be running on `http://localhost:8000`.

### 5. Start the Frontend
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
The Vite React app will be running (usually on `http://localhost:5173`). Open the URL provided in your terminal.

## Note on Eligibility
All eligibility is handled by the deterministic rule engine in `backend/eligibility_engine.py`. Gemini is strictly used to translate the output of the rule engine into plain English and for answering Q&A via RAG on the scheme details.
