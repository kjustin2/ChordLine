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

Temporarily Render for now to figure out experience
and costs. Not pausing Vercel since they don't charge for
overusage on hobby plan.

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


## Build Commands

pnpm --filter web run build
pnpm --filter api exec prisma generate
pnpm --filter api run build