import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import meetings, email_gen, chat

Base.metadata.create_all(bind=engine)

app = FastAPI(title="MeetingMind API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(meetings.router)
app.include_router(email_gen.router)
app.include_router(chat.router)

@app.get("/api/health")
def health_check():
    return {"status": "ok"}
