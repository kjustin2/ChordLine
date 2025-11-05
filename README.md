# ChordLine

An app to revolutionize the experience of local live musicians.

## Local Dev

First time setup

1. Install pnpm (if you don't already):

```bash
npm install -g pnpm
```

2. Install workspace dependencies from the repo root (this will install and link workspace packages):

```bash
pnpm install
```

3. Ensure Docker is installed and running if you plan to use the Supabase local emulator:

[Ensure Docker Installed and Running](https://docs.docker.com/desktop)

4. Build shared types (the repo includes a `@chordline/types` package that must be built for TypeScript path resolution):

```bash
pnpm --filter @chordline/types run build
```

One-line dev (quick)

Start DB (Supabase), backend and frontend in separate terminals (recommended):

Terminal 1 — DB (Supabase emulator):
```bash
npx supabase start
# or on Windows: ./supabase.exe start
```

Terminal 2 — Backend (Nest, watch mode):
```bash
pnpm --filter api run start:dev
```

Terminal 3 — Frontend (Next.js dev)
```bash
# On Windows you may prefer the non-Turbopack dev server to avoid filesystem race issues:
pnpm --filter web exec -- next dev
# or use the package script (may include --turbopack):
pnpm --filter web run dev
```

Quick verification URLs

- Frontend: http://localhost:3000/
- Backend docs (Swagger): http://localhost:3001/docs
- Supabase UI (local): http://127.0.0.1:54323/project/default

Build & deploy (production-style)

Use these commands in CI or on your machine to reproduce the Vercel / Render builds:

- Vercel (web only):
```bash
pnpm --filter web run build
pnpm install
```

- Render (api):
```bash
pnpm install && pnpm --filter api run build:prod
pnpm --filter api run start:prod
```

## Tech Stack

Web Hosting: Vercel
https://vercel.com/justin-kramers-projects-d02423f4/chord-line-web/settings/environment-variables

Backend Hosting: Render
https://dashboard.render.com/web/srv-d40n85ngi27c73ek48kg/deploys/dep-d40nt6gdl3ps73d685eg

Database: Supabase
https://supabase.com/dashboard/project/lswbxreiunnuxmkqocto/database/schemas

Auth: Clerk
https://dashboard.clerk.com/apps/app_3454QGSXgUVMulGaSoQLFjllTU3/instances/ins_3454QEBqZR9oLBPWoEm88yiINwb/jwt-templates

Web Framework: NextJS + Nest + Fastify
Web UI: ShadCN + Tailwind

Testing: Playwright
Package Manager: pnpm
ORM: Prisma