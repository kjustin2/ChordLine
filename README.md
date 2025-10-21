# ChordLine

An app to revolutionize the experience of local live musicians.

## Local Dev

First Time Setup:
npm install -g pnpm
[Ensure Docker Installed and Running](https://docs.docker.com/desktop)
cd apps/web
npm install
cd apps/api
pnpm install

Terminal One (DB):
./supabase.exe start
[View DB](http://127.0.0.1:54323/project/default)

Terminal Two (Frontend):
cd apps/web
npm run dev
[View Frontend](http://localhost:3000/)

Terminal Three (Backend):
cd apps/api
pnpm start:dev
[View Backend](http://localhost:3001/docs)

One Command:
DB
npx supabase start
pnpm --filter api start:dev
pnpm --filter web dev

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
