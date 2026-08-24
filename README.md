# CivicAI

CivicAI is a customer-facing web application that helps people discover Indian government welfare and scholarship schemes they may be eligible for. The app combines deterministic eligibility rules, a PostgreSQL database with pgvector, and optional Gemini-powered explanations to keep the experience practical and easy to understand.

## What The Project Does

- Collects a user profile with state, age, gender, category, income, education, disability status, and current activity.
- Evaluates that profile against a curated scheme database.
- Returns ranked recommendations with eligibility reasoning.
- Opens a scheme detail page with benefits, documents, application steps, and a question-and-answer panel.
- Keeps the user in a single guided flow from profile to match results to official scheme details.

## Tech Stack

- Frontend: React, Vite, Tailwind CSS 4, Oxlint
- Backend: Python, FastAPI, SQLAlchemy, Pydantic, Uvicorn
- Database: PostgreSQL 16 with pgvector
- AI: Google Gemini via `google-generativeai`
- Local orchestration: Docker Compose for the database

## Project Workflow

The runtime flow is:

1. Start PostgreSQL in Docker.
2. Start the FastAPI backend.
3. Start the React frontend.
4. Open the website in the browser.
5. Submit the profile form.
6. The frontend sends the profile to `POST /recommend`.
7. The backend scores each scheme with the rule engine.
8. The backend returns ranked recommendations and plain-language explanations.
9. The user opens a scheme detail page.
10. The detail page loads scheme metadata from `GET /scheme/{scheme_id}`.
11. The chat panel calls `POST /chat` for scheme-specific questions.

## Repository Layout

- `backend/` contains the API, database layer, eligibility rules, data models, schemas, and seeding logic.
- `frontend/` contains the React app, page shell, API client, and UI components.
- `docker-compose.yml` starts the PostgreSQL database.
- `SEED_DATA_TODO.md` lists scheme fields that still need verification.

## Prerequisites

- Windows PowerShell
- Docker Desktop
- Python 3.10+ recommended
- Node.js 18+ recommended
- A Gemini API key if you want generated explanations and chat responses

## Render Deployment

Use the following values in Render:

- Backend Web Service name: `civicai-backend`
- Frontend Static Site name: `Civic-AI`
- PostgreSQL database: the one you already created

### Backend Service Settings

- Root Directory: `.`
- Environment: `Python 3`
- Build Command: `pip install -r backend/requirements.txt`
- Start Command: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`

After deployment, verify the backend before testing the frontend by opening:

```text
https://your-backend-name.onrender.com/health
```

It must return:

```json
{"status":"ok"}
```

Add these environment variables in the backend service:

- `DATABASE_URL` = your Render PostgreSQL internal database URL
- `GEMINI_API_KEY` = your Gemini key
- `CORS_ORIGINS` = your frontend URL after deployment, for example `https://Civic-AI.onrender.com`

Do not include a trailing slash in either service URL.

### Frontend Service Settings

- Root Directory: `frontend`
- Build Command: `npm install && npm run build`
- Publish Directory: `dist`

Add this environment variable in the frontend service:

- `VITE_API_URL` = your backend URL, for example `https://civicai-backend.onrender.com`

### Render Setup Order

1. Deploy the backend service first.
2. Copy the backend URL from Render.
3. Set `VITE_API_URL` in the frontend service.
4. Deploy the frontend static site.
5. Copy the frontend URL and set it in `CORS_ORIGINS` for the backend service.
6. Redeploy the backend service once after setting `CORS_ORIGINS`.

### Database Note

- Render PostgreSQL already exists in your account.
- Keep using the internal database URL in `DATABASE_URL`.
- The backend seeds the database automatically on startup if the tables are empty.

## Initial Setup

### 1. Start The Database

From the project root:

```bash
docker compose up -d
```

This starts PostgreSQL 16 with pgvector on port `5432`.

### 2. Configure Environment Variables

The backend reads `GEMINI_API_KEY` from the environment.

```powershell
$env:GEMINI_API_KEY="your_api_key_here"
```

You can place environment variables in a root `.env` file if you prefer, but the application also works when the variable is set directly in the shell session.

### 3. Create And Activate A Python Environment

From the project root:

```powershell
python -m venv venv
.\venv\Scripts\activate
```

### 4. Install Backend Dependencies

```powershell
pip install -r backend/requirements.txt
```

### 5. Seed The Database

```powershell
python -m backend.seed
```

This creates the tables if needed, loads the verified scheme data from `backend/schemes.json`, and generates embeddings when Gemini is available.

### 6. Start The Backend

```powershell
python -m backend.main
```

The API runs at `http://localhost:8000`.

### 7. Start The Frontend

Open a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

The app runs at the Vite URL shown in the terminal, usually `http://localhost:5173`.

## Day-To-Day Run Order

Use this order when starting the app for normal development:

1. Start Docker Desktop.
2. Run `docker compose up -d` from the project root.
3. Activate the Python environment.
4. Start the backend with `python -m backend.main`.
5. Start the frontend with `npm run dev` inside `frontend/`.
6. Open the frontend URL in the browser.

## Stop And Restart

- Stop the frontend with `Ctrl+C` in the frontend terminal.
- Stop the backend with `Ctrl+C` in the backend terminal.
- Stop the database with `docker compose down`.
- If you want to remove the database volume too, run `docker compose down -v`.

## Runtime Behavior

### Home Screen

- Introduces the app and the three-stage flow.
- Sends the user to the profile form.

### Profile Form

- Collects the minimum profile data needed for recommendation scoring.
- Sends the data to the backend recommendation endpoint.
- Shows a friendly connection message if the API cannot be reached.

### Recommendations Screen

- Shows matched schemes in ranked order.
- Surfaces match percentage, status, and a human-readable explanation.
- Lets the user open any scheme for more detail.

### Scheme Detail Screen

- Loads the selected scheme from the backend.
- Shows benefits, required documents, and application steps.
- Includes an assistant panel for scheme-specific questions.

### Chat Panel

- Calls the backend chat endpoint.
- Uses verified scheme chunks for answers.
- Falls back to a calm service-unavailable message if the backend or Gemini path is unavailable.

## Backend API

### `POST /recommend`

Input: user profile JSON.

Output: ranked list of scheme matches with score, eligibility status, verification status, and explanation.

### `GET /scheme/{scheme_id}`

Returns the full detail record for a single scheme.

### `POST /chat`

Input: `scheme_id` and `question`.

Output: scheme-specific answer based on verified scheme chunks.

### `GET /schemes`

Returns all schemes in the database.

## Important Configuration

- Frontend API base URL is `http://localhost:8000` in `frontend/src/api.js`.
- Database connection defaults to `postgresql://postgres:password@localhost:5432/civicai` in `backend/database.py`.
- Docker Compose uses the `civicai_db` container with the `postgres` user and `password` password.

## Data And Verification Notes

- `backend/schemes.json` contains the current scheme dataset.
- `SEED_DATA_TODO.md` lists fields that still need manual verification.
- Some explanations and chat answers depend on Gemini; if no API key is configured, the app still runs but those features degrade gracefully.

## Troubleshooting

### Recommendations Fail To Load

- Confirm the backend terminal is running on `http://localhost:8000`.
- Confirm PostgreSQL is running with `docker compose ps`.
- Confirm `backend.seed` has been run so the `schemes` table is populated.
- Confirm the frontend is still pointing at `http://localhost:8000`.

### Empty Or Missing Results

- The profile may not match any schemes in the dataset.
- Some scheme records are intentionally conservative until the remaining verification fields are filled in.

### Chat Replies With A Fallback Message

- Confirm `GEMINI_API_KEY` is set in the shell that started the backend.
- Confirm the backend has network access to Gemini.
- If the API key is missing, the chat panel still opens but answers will be limited.

### Database Or Seed Errors

- Make sure Docker Desktop is running.
- Make sure port `5432` is not already in use.
- Re-run `docker compose up -d` and then `python -m backend.seed`.

## Development Checks

From `frontend/`:

```bash
npm run build
npm run lint
```

From the project root:

```powershell
python -m backend.main
```

## Notes On Eligibility Logic

Eligibility is computed in `backend/eligibility_engine.py`. The rule engine decides the score and status, while Gemini is used to turn that output into plain-language explanations and scheme Q&A.

## Project Status

This is an MVP that is already wired for local development. The core run path is complete, the frontend is customer-friendly, and the remaining work is mainly data verification and scheme content expansion.
