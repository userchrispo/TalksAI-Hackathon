# TALKS AI

Frontend demo for an auto-shop cash-flow copilot built with React and Vite.

## Local setup

1. Create a `.env` file in the project root.
2. Add your Groq key:

```env
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=openai/gpt-oss-20b
```

The app also tolerates a `.env` file that contains only the raw Groq key on a single line, but the format above is preferred.

3. Start the app:

```bash
npm run dev
```

The assistant calls a local `/api/chat` route handled by the Vite server, so your Groq key stays server-side during local development and preview.

## Backend notes

- `GET /api/health` returns whether the Groq key is configured and which model is active.
- `POST /api/chat` validates input, limits request body size, and times out slow Groq requests instead of hanging forever.
- For a deployed static site, move the same handler logic from `server/groqProxy.mjs` into a real serverless or backend route.
