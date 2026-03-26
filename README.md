# MEDIAAI — Creator Intelligence Platform

MEDIAAI is an AI-powered creator intelligence agent that analyzes public content performance, ingests uploaded context, and generates strategy, content calendars, scripts, and repurposed assets. Built as a production-style MVP for content creators and founder-led brands.

## Features

- **YouTube Ingestion** — Paste a channel URL to import videos with full metadata and performance metrics (including most popular videos by view count)
- **Instagram Import** — Upload CSV/JSON exports from scraper tools (Apify, etc.) to import Instagram posts
- **Knowledge Base** — Upload PDFs, transcripts, notes, and brand docs to build a RAG-powered knowledge layer
- **Analytics Engine** — Automatic scoring, hook classification, topic clustering, format analysis, and performance ranking across all content
- **Strategy Generation** — AI-generated content strategy based on creator profile, analytics, and knowledge context
- **Weekly Planner** — AI-generated 7-day content calendar with topics, hooks, scripts, and rationale
- **AI Strategist Chat** — Interactive chat agent grounded in creator data, analytics, and uploaded knowledge (RAG)
- **Repurpose Viral Shorts** — Automatically selects top-performing videos, downloads them, generates AI repurposing plans with title overlays and optional AI voiceover
- **Dashboard & Analytics** — Visual performance dashboard with KPIs, top content, topic analysis, and platform filtering

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, TypeScript, Vite, shadcn/ui, Tailwind CSS |
| Backend | Express.js, TypeScript |
| Database | PostgreSQL with pgvector |
| AI | OpenAI GPT-4o, text-embedding-3-small, TTS |
| ORM | Drizzle ORM |
| Media | yt-dlp, ffmpeg |

## Prerequisites

- **Node.js** 18+
- **PostgreSQL** 14+ with the `pgvector` extension
- **OpenAI API Key**
- **YouTube Data API Key** (from Google Cloud Console)
- **yt-dlp** (for video downloading): `brew install yt-dlp`
- **ffmpeg** (for video processing): `brew install ffmpeg`

## Setup

### 1. Clone the repo

```bash
git clone https://github.com/Aymane-Arfaoui/MEDIAAI.git
cd MEDIAAI
```

### 2. Set up PostgreSQL

```bash
# Create the database
createdb mediaai

# Enable pgvector extension
psql mediaai -c "CREATE EXTENSION IF NOT EXISTS vector;"
```

### 3. Configure the backend

```bash
cd server
npm install
```

Create `server/.env`:

```env
DATABASE_URL=postgresql://YOUR_USER@localhost:5432/mediaai
OPENAI_API_KEY=sk-your-openai-key
YOUTUBE_API_KEY=your-youtube-data-api-key
PORT=3001
```

Push the database schema and seed the creator profile:

```bash
npm run db:push
npm run db:seed
```

### 4. Configure the frontend

```bash
cd ../vite-version
npm install
```

Create `vite-version/.env`:

```env
VITE_API_URL=http://localhost:3001/api
```

### 5. Start both servers

In two separate terminals:

```bash
# Terminal 1 — Backend
cd server
npm run dev

# Terminal 2 — Frontend
cd vite-version
npm run dev
```

The app will be running at **http://localhost:5173**

## How to Use (Demo Walkthrough)

### Step 1: Ingest YouTube Content

1. Open the app at `http://localhost:5173`
2. Click **"Add YouTube"** in the top header bar
3. Paste a YouTube channel URL, e.g.:
   ```
   https://www.youtube.com/@KristinaSubbotinaEsq
   ```
4. Click **Submit** — this fetches both recent and most popular videos from the channel

### Step 2: Import Instagram Data (Optional)

1. Click **"Add Instagram"** in the top header bar
2. Upload a CSV or JSON file with Instagram post data
3. Expected fields: `url`, `caption`, `timestamp`, `likes`, `comments`, `views`

### Step 3: Run Analytics

1. Navigate to **Analytics** in the sidebar
2. Click **"Run Analytics"** to score and classify all ingested content
3. View top-performing content, hook patterns, topic clusters, and platform breakdown

### Step 4: Upload Knowledge Documents (Optional)

1. Go to **Knowledge Base** in the sidebar
2. Upload PDFs, text files, or transcripts
3. These are chunked, embedded, and used for RAG-powered generation

### Step 5: Generate Strategy

1. Navigate to **Strategy** in the sidebar
2. Click **Generate Strategy** — AI produces content pillars, messaging angles, audience pain points, and tone guidance based on analytics + knowledge

### Step 6: Generate Weekly Plan

1. Navigate to **Planner** in the sidebar
2. Click **Generate Plan** — AI creates a 7-day content calendar with platform, topic, title, hook, script outline, and rationale for each day

### Step 7: Chat with AI Strategist

1. Navigate to **AI Strategist** in the sidebar
2. Ask questions or give instructions like:
   - "Give me 5 contrarian hooks about fundraising"
   - "Rewrite day 3 to focus on due diligence"
   - "Make the tone more founder-friendly"
3. Responses are grounded in creator profile, analytics, and uploaded knowledge

### Step 8: Repurpose Viral Shorts

1. Navigate to **Repurpose** in the sidebar
2. Click **"Select Top 2 Viral Shorts"** — AI picks the best-performing YouTube Shorts
3. Click **"Analyze Videos"** — AI explains why each video performed well
4. Click **"Generate Plans"** — AI produces repurposed titles, hooks, scripts, overlays, CTAs, and captions
5. Click **"Repurpose with Overlay"** — Downloads the video and renders it with text overlays (viewable inline)
6. Click **"Add AI Voiceover"** — Generates TTS audio mixed with the video

## Database Management

```bash
# Reset database and re-seed creator profile (for fresh demos)
cd server
npm run db:reset

# Just seed the creator profile (empty DB)
npm run db:seed

# Push schema changes
npm run db:push
```

## Project Structure

```
MEDIAAI/
├── server/                          # Backend API
│   ├── src/
│   │   ├── index.ts                 # Express server entry point
│   │   ├── db/
│   │   │   ├── schema.ts            # Drizzle ORM schema (9 tables)
│   │   │   ├── connection.ts        # PostgreSQL connection
│   │   │   ├── seed.ts              # Seed creator profile
│   │   │   └── reset.ts             # Reset DB for demos
│   │   ├── routes/                  # API route handlers
│   │   │   ├── ingest/              # YouTube, Instagram, Upload
│   │   │   ├── analytics.ts
│   │   │   ├── strategy.ts
│   │   │   ├── planner.ts
│   │   │   ├── chat.ts
│   │   │   ├── rag.ts
│   │   │   ├── repurpose.ts
│   │   │   └── ...
│   │   ├── services/                # Business logic
│   │   │   ├── ingestion/           # YouTube API, Instagram CSV, uploads
│   │   │   ├── analytics/           # Scoring, classification, summaries
│   │   │   ├── rag/                 # Chunking, embedding, retrieval, compose
│   │   │   ├── ai/                  # Strategy, planner, chat, prompts
│   │   │   └── repurpose/           # Video selection, download, analysis, render, voiceover
│   │   └── types/                   # TypeScript interfaces
│   └── .env.example
│
└── vite-version/                    # Frontend
    ├── src/
    │   ├── app/                     # Page components
    │   │   ├── overview/
    │   │   ├── analytics/
    │   │   ├── dashboard-analytics/
    │   │   ├── knowledge/
    │   │   ├── strategy/
    │   │   ├── planner/
    │   │   ├── agent/
    │   │   ├── repurpose/
    │   │   └── landing/
    │   ├── components/              # Shared UI components (shadcn/ui)
    │   ├── lib/
    │   │   ├── api-client/          # Backend API client
    │   │   └── context/             # App context (auto-fetches creator ID)
    │   └── config/routes.tsx        # Route definitions
    └── .env.example
```

## Architecture

```
YouTube API ──┐                    ┌── Strategy Gen ──── Strategy Page
Instagram CSV ├── Normalize ── DB ─┤── Planner Gen ──── Planner Page
Doc Uploads ──┘       │            ├── Chat Agent ───── AI Strategist
                      │            └── Repurpose ────── Repurpose Page
                      ▼
              Analytics Engine ──── Analytics + Dashboard
                      │
              RAG (pgvector) ────── Knowledge-grounded generation
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ingest/youtube` | Ingest YouTube channel videos |
| POST | `/api/ingest/instagram-import` | Import Instagram CSV/JSON |
| POST | `/api/ingest/upload` | Upload knowledge documents |
| POST | `/api/analytics/run` | Run analytics on all content |
| POST | `/api/strategy/generate` | Generate content strategy |
| POST | `/api/planner/generate` | Generate 7-day content plan |
| POST | `/api/chat` | Send message to AI strategist |
| POST | `/api/rag/query` | Query knowledge base |
| POST | `/api/repurpose/select-top-videos` | Select top viral shorts |
| POST | `/api/repurpose/download` | Download a video |
| POST | `/api/repurpose/analyze` | Analyze why a video performed well |
| POST | `/api/repurpose/generate` | Generate repurpose plan |
| POST | `/api/repurpose/render` | Render video with overlays |
| POST | `/api/repurpose/voiceover` | Generate AI voiceover |
| GET | `/api/creators` | List creator profiles |
| GET | `/api/analytics/:creatorId` | Get analytics summaries |
| GET | `/api/knowledge/:creatorId/documents` | List knowledge documents |

## License

MIT
