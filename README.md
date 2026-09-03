# LeadYar — لیدیار

Telegram Mini App MVP for AI-assisted lead generation, daily sales actions, pipeline tracking, and sales coaching.

## Stack

- Next.js 16 / React 19 / TypeScript
- Telegram Mini Apps WebApp bridge
- Server-side Telegram `initData` HMAC validation
- OpenAI Responses API integration (optional until key is configured)
- Upstash Redis REST persistence adapter (optional; browser storage is the demo fallback)
- GitHub Actions on Ubuntu 24.04 + Node.js 24
- Vercel deployment target

## Local development

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open `http://localhost:3000` for browser demo mode.

## Production environment

```text
TELEGRAM_BOT_TOKEN=...
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=...
ALLOW_DEMO_MODE=false
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-5.6-sol
KV_REST_API_URL=...
KV_REST_API_TOKEN=...
```

Never expose `TELEGRAM_BOT_TOKEN`, `OPENAI_API_KEY`, or the Redis token in `NEXT_PUBLIC_*` variables.

## API routes

- `POST /api/auth/telegram` — validates Telegram Mini App init data
- `GET|POST /api/business` — loads/saves the user's business profile
- `POST /api/leads` — returns 10 leads; uses OpenAI web search when configured
- `POST /api/ai/coach` — Persian sales coaching
- `GET /api/health` — deployment/configuration health

## CI

GitHub Actions runs:

1. dependency installation
2. TypeScript validation
3. automated tests
4. production build
5. live smoke test of `/` and `/api/health`

## Telegram BotFather

After production deployment, set the Mini App URL to the production HTTPS URL (for example `https://leadyaar.vercel.app`) in BotFather and configure the bot/menu button to launch the Mini App.
