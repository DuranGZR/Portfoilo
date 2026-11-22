# Portfolio frontend

Next.js 16 / React 19 website with Turkish and English content, an ASCII hero, a floating AI mascot and a 3D resume.

See the [root README](../README.md) for local setup and validation, and the [backend guide](../backend/README.md#ai-chat-operation) for the assistant API contract.

```powershell
npm ci
npm run dev
```

Production validation:

```powershell
npx tsc --noEmit
npm run build
npm audit
```

Keep API keys in the backend environment. Only public configuration such as `NEXT_PUBLIC_API_URL` belongs in the frontend environment.
