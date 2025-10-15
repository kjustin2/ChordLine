# ChordLine

An app to revolutionize the experience of local live musicians.

## Local Dev

Terminal One (DB):
[Ensure Docker Installed and Running](https://docs.docker.com/desktop)
npx supabase init (one time)
npx supabase start
[View DB](http://127.0.0.1:54323/project/default)

Terminal Two (Frontend):
cd apps/web
npm install (one time)
npm run dev
[View Frontend](http://localhost:3000/)

Terminal Three (Backend):
cd apps/api
pnpm start:dev
[View Backend](http://localhost:3001/docs)

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
