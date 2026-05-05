from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import models, schemas
from database import get_db
from services.llm_service import chat_with_meeting

router = APIRouter(
    prefix="/api/meetings",
    tags=["chat"],
)

@router.post("/{meeting_id}/chat")
def chat_endpoint(meeting_id: int, chat_request: schemas.ChatMessageCreate, db: Session = Depends(get_db)):
    try:
        meeting = db.query(models.Meeting).filter(models.Meeting.id == meeting_id).first()
        if not meeting:
            return {"success": False, "error": "Meeting not found."}

        # Save user message
        user_msg = models.ChatMessage(meeting_id=meeting_id, role="user", content=chat_request.message)
        db.add(user_msg)
        db.commit()
        db.refresh(user_msg)

        # Retrieve chat history
        chat_history = db.query(models.ChatMessage).filter(models.ChatMessage.meeting_id == meeting_id).order_by(models.ChatMessage.created_at.asc()).all()
        # Exclude the newly added user message from the history sent as context (since it's passed separately as new_message)
        # Actually it's fine to just pass all except the last, or let the service handle it.
        # Let's adjust history:
        history_for_llm = chat_history[:-1]

        # Call LLM
        reply_text = chat_with_meeting(meeting, history_for_llm, chat_request.message)

        # Save assistant message
        assistant_msg = models.ChatMessage(meeting_id=meeting_id, role="assistant", content=reply_text)
        db.add(assistant_msg)
        db.commit()
        db.refresh(assistant_msg)

        return {"success": True, "data": {"reply": reply_text}}
        
    except Exception as e:
        return {"success": False, "error": str(e)}

@router.get("/{meeting_id}/chat")
def get_chat_history(meeting_id: int, db: Session = Depends(get_db)):
    try:
        chat_history = db.query(models.ChatMessage).filter(models.ChatMessage.meeting_id == meeting_id).order_by(models.ChatMessage.created_at.asc()).all()
        return {"success": True, "data": [schemas.ChatMessageResponse.model_validate(c) for c in chat_history]}
    except Exception as e:
        return {"success": False, "error": str(e)}
