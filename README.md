# لیدیار (LeadYar)

Telegram Mini App MVP for AI-assisted lead generation, follow-up, and sales workflow.

## Stack
- Next.js 16 (App Router)
- React 19
- TypeScript
- Node.js 24 LTS
- Static export for GitHub Pages

## Local development
```bash
npm install
npm run dev
```
Open http://localhost:3000.

## Quality checks
```bash
npm run typecheck
npm test
npm run build
```

## Environment
Copy `.env.example` to `.env.local` when needed. Never commit Telegram bot tokens or API secrets.

## CI/CD
`.github/workflows/ci-pages.yml` runs type checking, automated tests, production build, a static smoke test, and deploys the `main` branch to GitHub Pages.
