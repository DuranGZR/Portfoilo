"""Bounded anonymous conversations; the public session ID is not an owner credential."""
import asyncio
import hashlib
import secrets
import time
from dataclasses import dataclass, field

from app.config import settings


class ChatError(Exception):
    def __init__(self, code: str, status: int = 503, retry_after: int = 0):
        self.code = code
        self.status = status
        self.retry_after = retry_after
        super().__init__(code)


@dataclass
class Conversation:
    owner: str
    updated: float = field(default_factory=time.monotonic)
    history: list = field(default_factory=list)
    task: asyncio.Task | None = None
    deleted: bool = False


# shortcut: process-local storage, run one worker; use shared storage before adding replicas.
sessions: dict[str, Conversation] = {}


def owner_hash(client_key: str) -> str:
    return hashlib.sha256(client_key.encode()).hexdigest()


def expire_conversations() -> None:
    now = time.monotonic()
    for key, value in list(sessions.items()):
        if now - value.updated >= settings.chat_session_ttl_seconds and value.task is None:
            del sessions[key]


async def cleanup_conversations() -> None:
    while True:
        expire_conversations()
        await asyncio.sleep(15)


def get_conversation(session_id: str | None, client_key: str) -> tuple[str, Conversation]:
    now = time.monotonic()
    expire_conversations()
    owner = owner_hash(client_key)
    if session_id:
        value = sessions.get(session_id)
        if value is None or not secrets.compare_digest(value.owner, owner):
            raise ChatError('session_expired', 409)
        if value.task is not None:
            raise ChatError('conversation_busy', 409, 2)
        value.updated = now
        return session_id, value
    if len(sessions) >= settings.chat_max_sessions:
        raise ChatError('service_busy', 503, 30)
    session_id = secrets.token_urlsafe(32)
    value = Conversation(owner=owner)
    sessions[session_id] = value
    return session_id, value


def delete_conversation(session_id: str, client_key: str) -> None:
    value = sessions.get(session_id)
    if value is not None and not secrets.compare_digest(value.owner, owner_hash(client_key)):
        raise ChatError('session_expired', 409)
    if value is not None:
        value.deleted = True
        if value.task is not None:
            value.task.cancel()
        sessions.pop(session_id, None)
