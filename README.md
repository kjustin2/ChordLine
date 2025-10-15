# ChordLine

An app to revolutionize the experience of local live musicians.

## Local Dev

Terminal One (DB):
[Ensure Docker Installed and Running](https://docs.docker.com/desktop)
npx supabase init (one time)
npx supabase start

Terminal Two (Frontend):
cd apps/web
npm install (one time)
npm run dev

Terminal Three (Backend):
cd apps/api
pnpm start:dev

## Tech Stack

Web Hosting: Vercel
Backend Hosting: Render
Database: Supabase
Auth: Clerk

Web Framework: NextJS + Nest + Fastify
Web UI: ShadCN + Tailwind

Testing: Playwright
Package Manager: pnpm
ORM: Prisma
