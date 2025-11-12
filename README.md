# ChordLine

ChordLine streamlines gig logistics by pairing a NestJS API with a responsive Next.js dashboard. The repository is organised as a pnpm workspace with shared runtime types exposed via `@chordline/types`.

## Local Development

### Prerequisites
- Node.js 20+
- pnpm 10.12 (install globally with `npm install -g pnpm`)
- Docker Desktop running if you plan to use the Supabase emulator

### Bootstrap
1. Install workspace dependencies from the repo root:
	```bash
	pnpm install
	```
2. Build shared types so both apps can resolve `@chordline/types`:
	```bash
	pnpm --filter @chordline/types run build
	```

### Run the stack
Use three terminals (Git Bash or WSL on Windows is recommended):

1. Supabase emulator
	```bash
	npx supabase start
	# or ./supabase.exe start on Windows
	```
2. API (Nest + Fastify)
	```bash
	pnpm --filter api run start:dev
	```
3. Web (Next.js App Router)
	```bash
	pnpm --filter web exec -- next dev
	# or pnpm --filter web run dev
	```

Key URLs
- Web: http://localhost:3000
- API Swagger: http://localhost:3001/docs
- Supabase Studio: http://127.0.0.1:54323

### Testing
- API headless e2e suite (uses the in-memory Prisma service):
  ```bash
  pnpm --filter api run test:e2e
  ```
- Frontend lint (Next.js):
  ```bash
  pnpm --filter web run lint
  ```
- Frontend dashboard e2e (Playwright with mocked API + auth):
	```bash
	pnpm --filter web run test:e2e
	```

	The first run may prompt Playwright to install browsers: accept the prompt or run `pnpm --filter web exec -- playwright install` ahead of time.

The API tests rely on `apps/api/test/utils/in-memory-prisma.service.ts`, which mirrors Prisma behaviour in memory so CI and local runs do not require Docker or Supabase.

## Frontend Architecture
- `apps/web/app/layout.tsx` wires Clerk auth and wraps the tree with `BandProvider` to expose the signed-in user's band list.
- `apps/web/app/page.tsx` renders the dashboard inside `AppShell`, a responsive shell with desktop side navigation and a mobile bottom nav.
- Shared REST helpers live in `apps/web/lib/apiClient.ts`; panels call helpers such as `eventsApi.listForBand` instead of duplicating fetch paths.
- UI primitives (`Button`, `Card`, `DataState`) live in `apps/web/components/common` to keep sections lean.
- Enumerations come from `@chordline/types`. For example, `SONG_IDEA_STATUSES` drives the song ideas workflow.

## Backend Notes
- The NestJS API sits in `apps/api`. Use `pnpm --filter api run start:dev` for development or `pnpm --filter api run build:prod` for production builds.
- Prisma schema lives at `apps/api/prisma/schema.prisma`. Regenerate the client with `pnpm --filter api run prisma:generate` after schema changes.
- Supabase emulator lives under `supabase/`; stop/start the service if ports 54321–54324 are busy.

## Deployment Commands
- Web (Vercel):
  ```bash
  pnpm --filter web run build
  ```
- API (Render):
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
