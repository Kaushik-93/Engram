# Engram

Engram is a Next.js app for deep reading and retention. It lets you upload PDFs, highlight and annotate while you read, generate AI flashcards, and run active-recall sessions so knowledge sticks.

## Features
- PDF library with upload, search, sort, and favorites.
- In‑browser PDF reader with highlights and notes.
- Notes view to review highlights by book.
- AI flashcard generation from highlights or selected text.
- Active recall sessions with AI‑graded answers and feedback.
- Retrieval‑augmented Q&A over your PDFs via embeddings.
- Dashboard with quick actions and session summaries.

## Tech Stack
- Next.js App Router, React 19, TypeScript
- Tailwind CSS 4, Radix UI components
- Supabase Postgres + pgvector (books, highlights, flashcards, embeddings)
- Google Gemini via `@ai-sdk/google`
- PDF.js for text extraction and reading

## Project Structure
- `app/`: Routes, layouts, and API endpoints
- `components/`: UI and feature components
- `lib/`: Client stores, AI utilities, Supabase helpers
- `supabase/schema.sql`: Database schema and vector search setup
- `public/`: Static assets

## Getting Started

### 1) Install dependencies
```bash
npm install
```

### 2) Configure environment
Create `.env.local` with:
```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
GOOGLE_GENERATIVE_AI_API_KEY=...
# Optional model overrides
GOOGLE_MODEL_DEFAULT=gemini-3-flash-preview
GOOGLE_MODEL_REASONING=gemini-3-pro-preview
```

### 3) Initialize Supabase
Run the SQL in `supabase/schema.sql` to create tables and enable `pgvector`.

### 4) Start the dev server
```bash
npm run dev
```
Open `http://localhost:3000`.

Login notes:
- Demo login accepts `admin` / `admin`.
- Any email + password length >= 6 also routes to the dashboard.

## API Overview
Engram uses Next.js route handlers in `app/api` for:
- Books and PDF storage/compression
- Highlights and flashcards
- AI generation, evaluation, and Q&A
- Embedding creation and similarity search

## Docker
See `README_DOCKER.md` for Docker Compose instructions.

## Notes
- PDFs are stored compressed in Supabase; embeddings are generated in the background on upload.
- Vector search relies on `pgvector` and the `match_embeddings` RPC defined in the schema.
