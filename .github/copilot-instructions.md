# ChordLine Copilot Instructions

This file captures the minimum operational knowledge an AI coding agent (or new dev) needs to be productive in this repo. Keep it short, concrete and up-to-date when workflows or hosting change.

- Workspace: pnpm monorepo. Key folders: `apps/web` (Next.js App Router, Clerk), `apps/api` (NestJS on Fastify, Prisma), `packages/types` (shared TS runtime types).
- Node & tooling: repo pins `pnpm@10.12` in `package.json`. Target Node 20+ for Nest 11 / Next 15 compatibility.

Windows-specific notes
- Use Git Bash or WSL as your shell when running the local dev flow on Windows. Docker Desktop must be running before starting the Supabase emulator (`npx supabase start` or `./supabase.exe start`). The emulator uses ports in the 54321–54324 range; stop/start often to avoid conflicts.
- Next dev on Windows: Turbopack has known watcher issues; run the web dev server separately when needed:

```bash
pnpm --filter web exec -- next dev
```

Bootstrap & daily dev
- One-time: `pnpm install`, then build shared types:

```bash
pnpm --filter @chordline/types run build
```

- Quick dev (recommended: three terminals):
	- Supabase: `npx supabase start` (or `./supabase.exe start` on Windows)
	- API: `pnpm --filter api run start:dev`
	- Web: `pnpm --filter web exec -- next dev` (or `pnpm --filter web run dev`)

High-level architecture & dataflow
- Frontend (`apps/web`) is a Next.js App Router app using Clerk for auth. Data fetching lives in `apps/web/lib/apiClient.ts`, which wraps the authenticated fetcher from `useApi` and depends on `NEXT_PUBLIC_API_URL` being set to the API base.
- Backend (`apps/api`) is NestJS running on Fastify (see `apps/api/src/main.ts`). The Nest app exposes Swagger at `/docs` and uses a `/v1` prefix pattern in controllers (example: `apps/api/src/users/users.controller.ts`).
- Shared types in `packages/types` provide runtime typings (e.g., `User`) and must be built (TS -> `dist`) before other packages import them.

Auth & integration points
- Clerk: frontend uses `@clerk/nextjs` and `clerkMiddleware` in `apps/web/middleware.ts`. Backend verifies Clerk JWTs via `@clerk/backend.verifyToken` in `apps/api/src/auth/jwt.guard.ts`. Keep `CLERK_JWT_KEY` and `AUTHORIZED_CLERK_PARTY` synchronized between Render/Vercel and your local `.env`.
- Supabase: local emulator under `supabase/` with `config.toml`. Studio is available at the default shown in README (`http://127.0.0.1:54323`). Seeds live under `supabase/seed.sql`.
- Prisma: schema at `apps/api/prisma/schema.prisma`; generator outputs to `apps/api/generated/prisma`. Run `pnpm --filter api run prisma:generate` after schema changes.

Platform & deploy notes
- Vercel (web): `pnpm --filter web run build`. Use `vercel env pull` to sync envs locally (Dev environment variables → `.env`). See: https://vercel.com/docs/environment-variables
- Render (api): Render provides `PORT` at runtime. Use the repo's build command for prod: `pnpm install && pnpm --filter api run build:prod` then `pnpm --filter api run start:prod`. See Render docs for environment variables & secrets.

Project-specific patterns & conventions
- API namespace: use `/v1` for controllers (see `apps/api/src/users/users.controller.ts`).
- Types-first: add or change DTOs / entities in `packages/types/src/*` and run `pnpm --filter @chordline/types run build` before compiling other packages. Shared enums expose constants (e.g., `SONG_IDEA_STATUSES`).
- Auth pattern: frontend obtains a Clerk token via `useApi.ts` and routes requests through helpers in `apps/web/lib/apiClient.ts`.

Tooling quick references (what we use and where to look)
- Next.js (App Router, v15): `apps/web/*` — middleware in `apps/web/middleware.ts`, layout in `apps/web/app/layout.tsx`, pages under `apps/web/app/`.
	Docs: https://nextjs.org/docs
- NestJS + Fastify: `apps/api/src/main.ts` registers Fastify and CORS; controllers live under `apps/api/src/*`.
	Docs: https://docs.nestjs.com and https://www.fastify.io/docs/latest/
- Clerk: frontend + server JWT verification in `apps/api/src/auth/jwt.guard.ts`.
	Docs: https://clerk.com/docs
- Supabase (local emulator): `supabase/config.toml` controls ports; seeds in `supabase/seed.sql`.
	Docs: https://supabase.com/docs/guides/local-development/cli
- Prisma: schema -> `apps/api/prisma/schema.prisma`, client generated into `apps/api/generated/prisma`.
	Docs: https://www.prisma.io/docs
- pnpm (monorepo): use `pnpm --filter <pkg> run <script>` or `pnpm -w -r run <script>` for workspace-wide tasks.
	Docs: https://pnpm.io/
- ShadCN + Tailwind: UI primitives and Tailwind tokens used in `apps/web`; styles in `apps/web/app/globals.css`.
	ShadCN UI: https://ui.shadcn.com/
	Tailwind: https://tailwindcss.com/
- Playwright: README lists Playwright for testing. Typical commands (if Playwright config present) are `npx playwright test` or `pnpm playwright test`.
	Docs: https://playwright.dev/

Quick commands (Windows/Git Bash)
```bash
# install + build shared types
pnpm install
pnpm --filter @chordline/types run build

# start local stack (three terminals)
npx supabase start            # or ./supabase.exe start on Windows
pnpm --filter api run start:dev
pnpm --filter web exec -- next dev
```

Key files to inspect when making changes
- API boot & config: `apps/api/src/main.ts`
- Auth: `apps/api/src/auth/jwt.guard.ts` (server), `apps/web/lib/useApi.ts` (client)
- Shared types: `packages/types/src/*` and compiled `packages/types/dist`
- Supabase: `supabase/config.toml`, `supabase/seed.sql`

If something’s missing
- Tell me which workflow to expand (CI, Playwright specifics, or Render/ Vercel step-by-step) and I’ll add a short how-to with exact commands and file references.

---
Last updated: include date in commit message when changing this file.
# ChordLine Copilot Instructions
- **Workspace layout:** pnpm workspace with `apps/api` (Nest + Fastify), `apps/web` (Next.js App Router), and shared types in `packages/types`.
- **Tooling versions:** Root `package.json` pins pnpm 10.12; expect Node 20+ to satisfy Nest 11 and Next 15 requirements.
- **Windows dev setup:** Run commands from Git Bash or WSL; ensure Docker Desktop is running before any Supabase CLI calls (`npx supabase start` or `./supabase.exe start`) or the containers will fail to spin up on Windows.
- **Bootstrap flow:** `pnpm install` once, then build shared types via `pnpm --filter @chordline/types run build` before touching TS in either app—both import from `packages/types/dist`.
- **One-line dev:** `pnpm dev` launches Next + Nest together; if Turbopack file watching misbehaves on Windows, fall back to `pnpm --filter web exec -- next dev` in its own terminal.
- **Supabase emulator:** Lives under `supabase/`; it seeds data from `supabase/seed.sql` and expects `.env` values supplied by the CLI. Stop/start frequently to avoid port conflicts on Windows (54321–54324).
- **API overview:** `apps/api/src/main.ts` boots Fastify, applies CORS for `https://chord-line-web.vercel.app` + `http://localhost:3000`, loads dotenv, and listens on `process.env.PORT || 3001` (Render injects `PORT`).
- **Auth guard:** `apps/api/src/auth/jwt.guard.ts` uses `@clerk/backend` `verifyToken`; keep `CLERK_JWT_KEY` and `AUTHORIZED_CLERK_PARTY` in Render/`.env` aligned with your Clerk dashboard so `req.user` stays populated.
- **Routing pattern:** `UsersController` serves `/v1/users`; mirror the `/v1` prefix for future modules and always type responses with `@chordline/types` exports.
- **Prisma workflow:** Schema at `apps/api/prisma/schema.prisma`, generated client in `apps/api/generated/prisma`. Run `pnpm --filter api run prisma:generate` after schema edits and before committing prod builds.
- **Testing status:** `apps/api/test/app.e2e-spec.ts` covers the band workflow using the in-memory Prisma service; run it with `pnpm --filter api run test:e2e` (no containers required).
- **Web shell:** `apps/web/app/layout.tsx` wraps pages with `ClerkProvider` and `BandProvider`, while `AppShell` under `apps/web/components/layout` renders responsive navigation.
- **Client data flow:** `apps/web/lib/apiClient.ts` centralises REST helpers that wrap `useApi()`; the helpers require `process.env.NEXT_PUBLIC_API_URL` to be set.
- **Reference screen:** `apps/web/app/page.tsx` composes the dashboard sections (`OverviewSection`, `EventsSection`, etc.) inside `AppShell`.
- **Clerk middleware:** `apps/web/middleware.ts` applies `clerkMiddleware` to all Next routes except static assets; new API routes must accept Clerk headers (`Authorization`, `Clerk-...`).
- **Environment sync:** Minimum secrets are `NEXT_PUBLIC_API_URL` (web), `CLERK_JWT_KEY`, `AUTHORIZED_CLERK_PARTY`, and `DATABASE_URL`. Use `vercel env pull` to sync Vercel envs locally (per Vercel docs) and mirror the same keys in Render's dashboard.
- **Render deployment:** Build command `pnpm install && pnpm --filter api run build:prod`; start command `pnpm --filter api run start:prod`. Render auto-sets `PORT`, so never hard-code it in Nest.
- **Vercel deployment:** `pnpm --filter web run build` matches CI. Point `NEXT_PUBLIC_API_URL` at the Render base URL and configure Preview/Production env vars via the Vercel dashboard or CLI.
- **Clerk coordination:** Production Clerk instance must list both the Vercel domain and Render API URL as authorized parties; update Clerk JWT templates before rotating keys.
- **Supabase priorities:** `DEV_PRIORITIES.md` emphasizes local mocks + free-tier hosting—favor solutions that keep Supabase emulator usable and low-cost cloud usage.
- **CI parity:** Before PRs, run `pnpm --filter @chordline/types run build`, `pnpm --filter web run build`, and `pnpm install && pnpm --filter api run build:prod` to catch Render/Vercel parity issues early.
