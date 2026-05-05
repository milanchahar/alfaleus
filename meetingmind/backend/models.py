from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
import datetime
from database import Base

class Meeting(Base):
    __tablename__ = "meetings"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    raw_text = Column(Text)
    summary = Column(Text)
    action_items = Column(JSON)
    decisions = Column(JSON)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    chat_messages = relationship("ChatMessage", back_populates="meeting", cascade="all, delete-orphan")

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(Integer, ForeignKey("meetings.id"))
    role = Column(String) # "user" | "assistant"
    content = Column(Text)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    meeting = relationship("Meeting", back_populates="chat_messages")
