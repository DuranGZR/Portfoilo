"""
AI Chat Pydantic Schemas
"""
from datetime import datetime
from typing import List, Literal, Optional

from pydantic import BaseModel, Field, field_validator


class ChatMessage(BaseModel):
    """A single chat message."""
    
    role: str = Field(..., description="Message role: 'user' or 'assistant'")
    content: str = Field(..., description="Message content")
    timestamp: Optional[datetime] = None


class ChatRequest(BaseModel):
    """Schema for chat request."""
    
    message: str = Field(..., min_length=1, max_length=2000, description="User message")
    session_id: Optional[str] = Field(None, pattern=r'^[A-Za-z0-9_-]{43}$')
    locale: Literal['tr', 'en'] = 'tr'

    @field_validator('message')
    @classmethod
    def trim_message(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError('Message must not be blank')
        return value


class ChatResetRequest(BaseModel):
    session_id: Optional[str] = Field(None, pattern=r'^[A-Za-z0-9_-]{43}$')


class ChatResponse(BaseModel):
    """Schema for chat response."""
    
    response: str = Field(..., description="AI assistant response")
    session_id: str = Field(..., description="Session ID for follow-up messages")


class ChatSuggestion(BaseModel):
    """Suggested question for the chat."""
    
    question: str
    category: str


class ChatSuggestionsResponse(BaseModel):
    """Schema for chat suggestions response."""
    
    suggestions: List[ChatSuggestion]
