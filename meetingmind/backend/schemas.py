from pydantic import BaseModel
from typing import List, Optional, Any
from datetime import datetime

class ActionItem(BaseModel):
    description: str
    assignee: str
    deadline: Optional[str] = None

class MeetingCreate(BaseModel):
    text: str

class MeetingResponse(BaseModel):
    id: int
    title: str
    summary: str
    action_items: List[ActionItem]
    decisions: List[str]
    created_at: datetime

    class Config:
        from_attributes = True

class MeetingListResponse(BaseModel):
    id: int
    title: str
    created_at: datetime
    summary: str
    action_items_count: int = 0

    class Config:
        from_attributes = True

class ChatMessageCreate(BaseModel):
    message: str

class ChatMessageResponse(BaseModel):
    id: int
    role: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True

class EmailResponse(BaseModel):
    subject: str
    body: str

class ApiResponse(BaseModel):
    success: bool
    data: Optional[Any] = None
    error: Optional[str] = None
