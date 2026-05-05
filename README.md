# MeetingMind 🧠

MeetingMind is an AI-powered meeting assistant that helps you process transcripts, extract action items, and generate follow-up emails using LLMs (Llama 3 via Groq).

## Features
- **Transcript Analysis**: Extract summaries, action items, and key decisions from text or `.vtt` files.
- **AI Chat**: Ask questions about your meeting context.
- **Follow-up Emails**: Automatically draft professional emails.
- **Markdown Export**: Download your meeting notes for documentation.

## Project Structure
- `meetingmind/backend`: FastAPI server with SQLAlchemy and Groq integration.
- `meetingmind/frontend`: React (Vite) application with Framer Motion and Lucide icons.

## Setup

### Backend
1. `cd meetingmind/backend`
2. Create a virtual environment: `python -m venv venv`
3. Activate it: `source venv/bin/activate`
4. Install dependencies: `pip install -r requirements.txt`
5. Create a `.env` file with your `GROK_API_KEY`.
6. Run: `uvicorn main:app --reload`

### Frontend
1. `cd meetingmind/frontend`
2. Install dependencies: `npm install`
3. Run: `npm run dev`

## Tech Stack
- **Backend**: FastAPI, SQLAlchemy, SQLite, OpenAI/Groq API.
- **Frontend**: React, Vite, Framer Motion, Axios, Lucide React.
