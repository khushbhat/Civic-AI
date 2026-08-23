# CivicAI Frontend

This is the customer-facing React app for CivicAI. It helps people check possible government scheme matches, review the reasoning behind each match, and ask scheme-specific questions in one guided flow.

## Run Locally

1. Start the backend API from the project root so the frontend can fetch recommendations and scheme details.
2. From this folder, install dependencies if needed with `npm install`.
3. Start the app with `npm run dev`.

## Notes

- The UI is built with React, Vite, Tailwind CSS, and Oxlint.
- The frontend expects the API at `http://localhost:8000`.
- If the API is unavailable, the app will show a friendly connection message instead of breaking the flow.
