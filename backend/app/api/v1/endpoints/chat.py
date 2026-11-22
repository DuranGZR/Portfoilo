"""Public chat with separate anonymous owner credentials and bounded sessions."""
import asyncio
from contextlib import suppress
from typing import Annotated

from fastapi import APIRouter, Header, HTTPException, Request, Response

from app.api.v1.schemas.chat import ChatRequest, ChatResetRequest, ChatResponse, ChatSuggestion, ChatSuggestionsResponse
from app.core.security import limiter
from app.services.ai_service import get_ai_response
from app.services.chat_sessions import ChatError, delete_conversation, get_conversation, owner_hash, sessions
from app.config import settings

router = APIRouter()
ClientKey = Annotated[str, Header(alias='X-Chat-Client', pattern=r'^[a-f0-9]{64}$')]


def http_error(error: ChatError) -> HTTPException:
    return HTTPException(error.status, detail={'code': error.code}, headers={'Retry-After': str(error.retry_after)} if error.retry_after else None)


@router.post('', response_model=ChatResponse)
@limiter.limit(f'{settings.rate_limit_per_minute}/minute')
async def chat(request: Request, chat_data: ChatRequest, client_key: ClientKey, response: Response):
    response.headers['Cache-Control'] = 'no-store'
    session_id = None
    try:
        session_id, conversation = get_conversation(chat_data.session_id, client_key)
        async def disconnected():
            while not await request.is_disconnected():
                await asyncio.sleep(0.1)
        generation = asyncio.create_task(get_ai_response(chat_data.message, conversation, chat_data.locale))
        disconnect = asyncio.create_task(disconnected())
        try:
            done, _ = await asyncio.wait([generation, disconnect], return_when=asyncio.FIRST_COMPLETED)
            if generation not in done:
                generation.cancel()
                raise ChatError('cancelled', 409)
            answer = await generation
        finally:
            disconnect.cancel()
            if not generation.done():
                generation.cancel()
            with suppress(asyncio.CancelledError):
                await disconnect
            with suppress(asyncio.CancelledError, ChatError):
                await generation
        return ChatResponse(response=answer, session_id=session_id)
    except ChatError as error:
        if chat_data.session_id is None and session_id:
            delete_conversation(session_id, client_key)
        raise http_error(error) from None


@router.post('/reset', status_code=204)
@limiter.limit('30/minute')
async def reset(request: Request, chat_data: ChatResetRequest, client_key: ClientKey):
    try:
        if chat_data.session_id:
            delete_conversation(chat_data.session_id, client_key)
        else:
            for session_id, conversation in list(sessions.items()):
                if conversation.owner == owner_hash(client_key):
                    delete_conversation(session_id, client_key)
    except ChatError as error:
        raise http_error(error) from None
    return Response(status_code=204, headers={'Cache-Control': 'no-store'})


@router.get('/suggestions', response_model=ChatSuggestionsResponse)
async def get_suggestions(locale: str = 'tr'):
    questions = [('Güncel projeleri neler?', 'What are his current projects?', 'projects'), ('AskDocs nasıl çalışıyor?', 'How does AskDocs work?', 'projects'), ('CV ve iletişim bağlantıları neler?', 'Where can I find his CV and contact links?', 'about')]
    return ChatSuggestionsResponse(suggestions=[ChatSuggestion(question=en if locale == 'en' else tr, category=category) for tr, en, category in questions])
