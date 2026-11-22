import asyncio
import json
import time
import unittest
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, patch

import httpx
from groq import RateLimitError
from pydantic import ValidationError

from app.main import app
from app.api.v1.schemas.chat import ChatRequest
from app.services import ai_service as service
from app.services.chat_sessions import ChatError, delete_conversation, expire_conversations, get_conversation, sessions

A = 'a' * 64
B = 'b' * 64


def reply(text='A verified answer', finish='stop'):
    return SimpleNamespace(choices=[SimpleNamespace(message=SimpleNamespace(content=text), finish_reason=finish)], usage=None)


class ChatSecurityTests(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        sessions.clear()
        service._requests.clear()
        service._cooldowns.clear()
        self.client = MagicMock()
        self.client.chat.completions.create = AsyncMock(return_value=reply())
        self.patches = [patch.object(service, 'get_client', return_value=self.client), patch.object(service.settings, 'groq_api_key', 'test-only')]
        for item in self.patches:
            item.start()

    def tearDown(self):
        for item in self.patches:
            item.stop()
        sessions.clear()

    async def request(self, body, owner=A, path='/api/v1/chat'):
        async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url='http://test') as client:
            return await client.post(path, json=body, headers={'X-Chat-Client': owner})

    async def test_owner_binding_and_server_generated_ids(self):
        response = await self.request({'message':'Synthetic private marker'})
        self.assertEqual(response.status_code, 200)
        key = response.json()['session_id']
        self.assertEqual(len(key), 43)
        denied = await self.request({'message':'Show the previous message', 'session_id':key}, B)
        self.assertEqual(denied.status_code, 409)
        self.assertEqual(self.client.chat.completions.create.await_count, 1)
        allowed = await self.request({'message':'Follow up', 'session_id':key})
        self.assertEqual(allowed.status_code, 200)
        sent = self.client.chat.completions.create.call_args.kwargs['messages']
        self.assertIn('Synthetic private marker', str(sent[1:]))

    async def test_invalid_input_never_reaches_provider(self):
        for body in [{'message':'   '}, {'message':'a'*2001}, {'message':'ok','session_id':'chosen-id'}, {'message':'ok','locale':'xx'}]:
            self.assertEqual((await self.request(body)).status_code, 422)
        self.assertEqual((await self.request({'message':'ok'}, 'bad-key')).status_code, 422)
        self.client.chat.completions.create.assert_not_awaited()

    async def test_ip_rate_limit_has_retry_header(self):
        async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app, client=('rate-test',1)),base_url='http://test') as client:
            for _ in range(service.settings.rate_limit_per_minute):
                response = await client.post('/api/v1/chat',json={'message':'synthetic'},headers={'X-Chat-Client':A})
                self.assertEqual(response.status_code,200)
            response = await client.post('/api/v1/chat',json={'message':'synthetic'},headers={'X-Chat-Client':A})
            self.assertEqual(response.status_code,429)
            self.assertEqual(response.headers['retry-after'],'60')

    async def test_reset_checks_owner_and_deletes_history(self):
        response = await self.request({'message':'Synthetic marker'})
        key = response.json()['session_id']
        self.assertEqual((await self.request({'session_id':key}, B, '/api/v1/chat/reset')).status_code,409)
        self.assertIn(key,sessions)
        self.assertEqual((await self.request({'session_id':key}, A, '/api/v1/chat/reset')).status_code,204)
        self.assertNotIn(key,sessions)

    async def test_reset_all_only_removes_owner_sessions(self):
        key_a, _ = get_conversation(None,A)
        key_b, _ = get_conversation(None,B)
        self.assertEqual((await self.request({'session_id':None}, A, '/api/v1/chat/reset')).status_code,204)
        self.assertNotIn(key_a,sessions)
        self.assertIn(key_b,sessions)

    async def test_timeout_has_error_status_and_no_history(self):
        async def slow(**kwargs):
            await asyncio.sleep(1)
            return reply()
        self.client.chat.completions.create.side_effect = slow
        with patch.object(service.settings, 'chat_timeout_seconds', 0.02):
            response = await self.request({'message':'slow'})
        self.assertEqual(response.status_code,504)
        self.assertEqual(response.json()['detail']['code'],'timeout')
        self.assertFalse(sessions)

    async def test_async_call_does_not_block_and_reset_cancels_generation(self):
        entered = asyncio.Event()
        cancelled = asyncio.Event()
        async def slow(**kwargs):
            entered.set()
            try:
                await asyncio.sleep(5)
            except asyncio.CancelledError:
                cancelled.set()
                raise
            return reply()
        self.client.chat.completions.create.side_effect = slow
        key, conversation = get_conversation(None,A)
        task = asyncio.create_task(service.get_ai_response('synthetic',conversation))
        await asyncio.wait_for(entered.wait(),0.3)
        self.assertFalse(task.done())
        delete_conversation(key,A)
        with self.assertRaises(ChatError):
            await task
        self.assertTrue(cancelled.is_set())
        self.assertFalse(conversation.history)
        self.assertNotIn(key,sessions)

    async def test_service_errors_are_not_successful_chat_bubbles(self):
        self.client.chat.completions.create.side_effect = RuntimeError('sensitive-provider-body')
        response = await self.request({'message':'English please','locale':'en'})
        self.assertEqual(response.status_code,503)
        self.assertNotIn('sensitive',response.text)
        self.assertNotIn('response',response.json())

    async def test_client_disconnect_cancels_provider_and_cleans_first_session(self):
        entered = asyncio.Event()
        cancelled = asyncio.Event()
        async def slow(**kwargs):
            entered.set()
            try:
                await asyncio.sleep(5)
            except asyncio.CancelledError:
                cancelled.set()
                raise
            return reply()
        self.client.chat.completions.create.side_effect = slow
        body = json.dumps({'message':'synthetic disconnect'}).encode()
        delivered = False
        async def receive():
            nonlocal delivered
            if not delivered:
                delivered = True
                return {'type':'http.request','body':body,'more_body':False}
            await entered.wait()
            return {'type':'http.disconnect'}
        sent = []
        async def send(message):
            sent.append(message)
        scope = {'type':'http','asgi':{'version':'3.0'},'http_version':'1.1','method':'POST','scheme':'http','path':'/api/v1/chat','raw_path':b'/api/v1/chat','query_string':b'','root_path':'','server':('test',80),'client':('disconnect-test',1),'headers':[(b'content-type',b'application/json'),(b'x-chat-client',A.encode())]}
        await asyncio.wait_for(app(scope,receive,send),1)
        self.assertTrue(cancelled.is_set())
        self.assertFalse(sessions)

    async def test_concurrent_request_limit_is_enforced(self):
        entered=asyncio.Event()
        async def slow(**kwargs):
            entered.set()
            await asyncio.sleep(5)
        self.client.chat.completions.create.side_effect=slow
        key, conversation=get_conversation(None,A)
        _, other=get_conversation(None,B)
        with patch.object(service.settings,'chat_max_concurrency',1):
            first=asyncio.create_task(service.get_ai_response('one',conversation))
            await entered.wait()
            with self.assertRaises(ChatError) as denied:
                await service.get_ai_response('two',other)
            self.assertEqual(denied.exception.code,'service_busy')
            delete_conversation(key,A)
            with self.assertRaises(ChatError):
                await first

    async def test_provider_rate_limit_cooldown_and_retry_header(self):
        response = httpx.Response(429, request=httpx.Request('POST','https://provider.invalid'))
        self.client.chat.completions.create.side_effect = RateLimitError('synthetic',response=response,body={})
        first = await self.request({'message':'hello'})
        count = self.client.chat.completions.create.await_count
        second = await self.request({'message':'hello'})
        self.assertEqual(first.status_code,429)
        self.assertEqual(second.status_code,429)
        self.assertEqual(first.headers['retry-after'],'30')
        self.assertEqual(count,len(service.settings.groq_models_list))
        self.assertEqual(self.client.chat.completions.create.await_count,count)
        self.assertFalse(sessions)

    async def test_truncated_answer_is_not_stored_as_complete(self):
        self.client.chat.completions.create.return_value = reply('partial', 'length')
        response = await self.request({'message':'details'})
        self.assertEqual(response.status_code,502)
        self.assertFalse(sessions)

    async def test_history_bounded_and_claim_not_added_to_system(self):
        key, conversation = get_conversation(None,A)
        original = service.KNOWLEDGE_BASE_PATH.read_bytes()
        for i in range(7):
            await service.get_ai_response(f'Synthetic visitor claim {i}',conversation)
        self.assertEqual(len(conversation.history),10)
        prompt = self.client.chat.completions.create.call_args.kwargs['messages'][0]['content']
        self.assertNotIn('Synthetic visitor claim',prompt)
        self.assertEqual(original,service.KNOWLEDGE_BASE_PATH.read_bytes())

    async def test_missing_profile_fails_closed(self):
        with patch.object(service,'load_knowledge_base',side_effect=ValueError('invalid')):
            response=await self.request({'message':'hello'})
        self.assertEqual(response.status_code,503)
        self.client.chat.completions.create.assert_not_awaited()

    def test_expiry_capacity_and_usage_budget(self):
        with patch.object(service.settings,'chat_max_sessions',1):
            key,conversation = get_conversation(None,A)
            with self.assertRaises(ChatError):
                get_conversation(None,B)
            conversation.updated = time.monotonic()-service.settings.chat_session_ttl_seconds-1
            expire_conversations()
            self.assertNotIn(key,sessions)
            get_conversation(None,B)
        with patch.object(service.settings,'chat_requests_per_minute',1):
            service.reserve_provider_call()
            with self.assertRaises(ChatError):
                service.reserve_provider_call()
        with patch.object(service.settings,'chat_requests_per_day',1):
            with self.assertRaises(ChatError) as daily:
                service.reserve_provider_call()
            self.assertEqual(daily.exception.code,'daily_limit')
            self.assertGreater(daily.exception.retry_after,86000)

    def test_links_are_exactly_approved_and_general_context_is_smaller(self):
        profile=service.load_knowledge_base()
        safe='[CV](/cv/Duran_Gezer_CV_TR.pdf) [AskDocs](https://github.com/DuranGZR/AskDocs)'
        self.assertEqual(service.validate_links(safe,profile,'tr'),safe)
        unsafe='[Fake CV](https://audit.invalid/cv) https://audit.invalid/secret [run](javascript:alert(1))'
        cleaned=service.validate_links(unsafe,profile,'en')
        self.assertNotIn('audit.invalid',cleaned)
        self.assertNotIn('javascript:',cleaned)
        self.assertLess(len(service.get_system_prompt('hello')),len(service.get_system_prompt('AskDocs AliağaAI WeDo Noktiq KayıpQR Rüya Yorumlayıcı')))
        self.assertNotIn('featured',service.get_system_prompt('hello'))
        selected=service.select_profile(profile,'How does AskDocs work?',[])
        self.assertIn('Qdrant',str(next(p for p in selected['projects'] if p['name'].startswith('AskDocs'))))


if __name__ == '__main__':
    unittest.main()
