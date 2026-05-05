from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import meetings, email_gen, chat

Base.metadata.create_all(bind=engine)

app = FastAPI(title="MeetingMind API")

# Configure CORS
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
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
