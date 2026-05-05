from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import json

from models import Meeting
from schemas import MeetingResponse, MeetingListResponse
from database import get_db
from services.llm_service import analyze_meeting
from services.parser import parse_text, parse_vtt
import models
import schemas

router = APIRouter(
    prefix="/api/meetings",
    tags=["meetings"],
)

@router.post("/analyze")
async def analyze_meeting_endpoint(
    text: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    try:
        content = ""
        if file:
            # Check file size up to 5MB
            file_bytes = await file.read()
            if len(file_bytes) > 5 * 1024 * 1024:
                return {"success": False, "error": "File size exceeds 5MB limit."}
            
            decoded = file_bytes.decode("utf-8")
            if file.filename.endswith(".vtt"):
                content = parse_vtt(decoded)
            else:
                content = parse_text(decoded)
        elif text:
            content = parse_text(text)
        else:
            return {"success": False, "error": "Must provide either text or file."}

        if not content:
            return {"success": False, "error": "No text content found to analyze."}

        # Call LLM
        analysis_data = analyze_meeting(content)

        # Create Meeting in DB
        db_meeting = models.Meeting(
            title=analysis_data.get("title", "Untitled Meeting"),
            raw_text=content,
            summary=analysis_data.get("summary", ""),
            action_items=analysis_data.get("action_items", []),
            decisions=analysis_data.get("decisions", [])
        )
        db.add(db_meeting)
        db.commit()
        db.refresh(db_meeting)

        return {"success": True, "data": schemas.MeetingResponse.model_validate(db_meeting)}

    except json.JSONDecodeError:
        return {"success": False, "error": "Failed to parse JSON response from LLM."}
    except Exception as e:
        return {"success": False, "error": str(e)}

@router.get("")
def list_meetings(db: Session = Depends(get_db)):
    try:
        meetings = db.query(models.Meeting).order_by(models.Meeting.created_at.desc()).all()
        result = []
        for m in meetings:
            data = schemas.MeetingListResponse.model_validate(m)
            data.action_items_count = len(m.action_items) if m.action_items else 0
            result.append(data)
        return {"success": True, "data": result}
    except Exception as e:
        return {"success": False, "error": str(e)}

@router.get("/{meeting_id}")
def get_meeting(meeting_id: int, db: Session = Depends(get_db)):
    try:
        meeting = db.query(models.Meeting).filter(models.Meeting.id == meeting_id).first()
        if not meeting:
            return {"success": False, "error": "Meeting not found."}
        return {"success": True, "data": schemas.MeetingResponse.model_validate(meeting)}
    except Exception as e:
        return {"success": False, "error": str(e)}

@router.delete("/{meeting_id}")
def delete_meeting(meeting_id: int, db: Session = Depends(get_db)):
    try:
        meeting = db.query(models.Meeting).filter(models.Meeting.id == meeting_id).first()
        if not meeting:
            return {"success": False, "error": "Meeting not found."}
        db.delete(meeting)
        db.commit()
        return {"success": True, "data": None}
    except Exception as e:
        return {"success": False, "error": str(e)}

from fastapi.responses import PlainTextResponse

@router.get("/{meeting_id}/export/markdown")
def export_markdown(meeting_id: int, db: Session = Depends(get_db)):
    meeting = db.query(models.Meeting).filter(models.Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    action_items_str = ""
    for ai in meeting.action_items:
        ai_desc = ai.get('description', '')
        ai_assig = ai.get('assignee', '')
        ai_dead = ai.get('deadline') or 'N/A'
        action_items_str += f"| {ai_desc} | {ai_assig} | {ai_dead} |\n"

    decisions_str = ""
    for d in meeting.decisions:
        decisions_str += f"- {d}\n"

    md_content = f"""# Meeting: {meeting.title}
**Date:** {meeting.created_at.strftime("%Y-%m-%d %H:%M:%S")}

## Summary
{meeting.summary}

## Action Items
| Task | Assignee | Deadline |
|------|----------|----------|
{action_items_str}
## Key Decisions
{decisions_str}
## Follow-up Email Subject
Not yet generated
"""
    return PlainTextResponse(
        md_content, 
        headers={"Content-Disposition": f"attachment; filename=meeting_{meeting.id}.md"}
    )
