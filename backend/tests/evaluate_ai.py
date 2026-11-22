"""Explicit live evaluation: python tests/evaluate_ai.py --live (uses provider quota)."""
import argparse
import asyncio
import json
import secrets
import time
from pathlib import Path

import httpx


async def main(base_url: str):
    root = Path(__file__).resolve().parents[2]
    cases = json.loads(Path(__file__).with_name('ai_eval_cases.json').read_text(encoding='utf-8'))
    results = []
    sessions = {}
    async with httpx.AsyncClient(base_url=base_url, headers={'X-Chat-Client':secrets.token_hex(32)}, timeout=26) as client:
        try:
            for case in cases:
                group = case.get('group', case['id'])
                body = {'message':case['message'], 'locale':case['locale'], 'session_id':sessions.get(group)}
                started = time.perf_counter()
                response = await client.post('/api/v1/chat',json=body)
                retries = 0
                if response.status_code == 429:
                    await asyncio.sleep(min(31, max(1, int(response.headers.get('Retry-After','30')))))
                    response = await client.post('/api/v1/chat',json=body)
                    retries = 1
                data = response.json()
                if response.is_success:
                    sessions[group] = data['session_id']
                record = {'case':case['id'], 'expected':case['expected'], 'status':response.status_code, 'response':data.get('response',data.get('detail')), 'seconds':round(time.perf_counter()-started,2), 'rate_limit_retries':retries, 'review':'manual review required' if response.is_success else 'inconclusive: service error'}
                results.append(record)
                (root/'output'/'ai-evaluation-current.json').write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf-8')
                print(json.dumps(record,ensure_ascii=False),flush=True)
        finally:
            await client.post('/api/v1/chat/reset',json={'session_id':None})


if __name__ == '__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--live',action='store_true',required=True)
    parser.add_argument('--base-url',default='http://127.0.0.1:8000')
    args=parser.parse_args()
    asyncio.run(main(args.base_url))
