from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import models
from database import get_db
from services.llm_service import generate_follow_up_email

router = APIRouter(
    prefix="/api/meetings",
    tags=["email_gen"],
)

@router.post("/{meeting_id}/email")
def generate_email_endpoint(meeting_id: int, db: Session = Depends(get_db)):
    try:
        meeting = db.query(models.Meeting).filter(models.Meeting.id == meeting_id).first()
        if not meeting:
            return {"success": False, "error": "Meeting not found."}
            
        action_items_str = ""
        for idx, ai in enumerate(meeting.action_items, 1):
            desc = ai.get('description', '')
            assignee = ai.get('assignee', 'Unassigned')
            deadline = f" (Due: {ai.get('deadline')})" if ai.get('deadline') else ""
            action_items_str += f"{idx}. {desc} - Assigned to: {assignee}{deadline}\n"
            
        decisions_str = ""
        for idx, d in enumerate(meeting.decisions, 1):
            decisions_str += f"{idx}. {d}\n"
            
        email_data = generate_follow_up_email(meeting.summary, action_items_str, decisions_str)
        return {"success": True, "data": email_data}
        
    except Exception as e:
        return {"success": False, "error": str(e)}
