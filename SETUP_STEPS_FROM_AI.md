You’re right to flag that—we *do* need to explicitly switch Nest to **Fastify** and then protect routes with a guard (or a global guard). Below is a clean, end-to-end local setup that follows the **official** docs for each tool, fixes the Fastify bit, and shows exactly where `@UseGuards(JwtGuard)` goes.

---

# 0) Prereqs

* Node 18+ and **pnpm**
* Docker Desktop (for local Supabase)
* GitHub (for later CI)

---

# 1) Monorepo skeleton

```bash
mkdir chordline && cd chordline
pnpm init -y
printf '{ "packages": ["apps/*","packages/*"] }\n' > pnpm-workspace.yaml
mkdir -p apps/web apps/api packages/shared
```

---

# 2) Web app (Next.js + Tailwind + Clerk)

## Create Next.js (official CLI)

```bash
cd apps/web
npx create-next-app@latest . --ts --eslint --app
```

(Official create-next-app & install guides.) ([Next.js][1])

## Tailwind (official Next.js guide)

```bash
pnpm add -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Then follow the “Install Tailwind CSS with Next.js” steps to add `content` globs and import the CSS in `app/globals.css`. ([Tailwind CSS][2])

## Clerk (official App Router quickstart)

```bash
pnpm add @clerk/nextjs
```

Wire it up per the quickstart:

* Add `middleware.ts` with `clerkMiddleware()`
* Wrap `app/layout.tsx` with `<ClerkProvider>`
* Use `<SignIn/>`, `<UserButton/>` etc. on pages/routes
  (Exactly as shown in the Clerk App Router quickstart.) ([Clerk][3])

**Env (`apps/web/.env.local`):**

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_API_URL=http://localhost:3001
```

(Clerk docs show where to get keys / put them in `.env`.) ([Clerk][4])

Run the web app:

```bash
pnpm dev
# http://localhost:3000
```

---

# 3) Database (Supabase, official local flow)

**Install & start locally (official CLI):**

```bash
cd ../../
pnpm add -w -D supabase
npx supabase init
npx supabase start
```

This spins up local Postgres/Studio/Auth/Storage in Docker. The official path is `supabase init` → `supabase start`. ([Supabase][5])

> You can use cloud Supabase instead. Either way you’ll use its **Postgres connection string** for Prisma. ([Supabase][6])

---

# 4) API service (NestJS + Fastify + Prisma + Clerk JWT)

## Create Nest app and switch to **Fastify** (official)

```bash
cd apps/api
pnpm dlx @nestjs/cli new . --strict
pnpm add @nestjs/platform-fastify @fastify/cors
```

Use the **FastifyAdapter** in `main.ts` as shown in Nest’s docs. ([NestJS Documentation][7])

**`src/main.ts`**

```ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import cors from '@fastify/cors';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  await app.register(cors, {
    origin: ['http://localhost:3000'],
    allowedHeaders: ['Authorization','Content-Type'],
    methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  });

  app.setGlobalPrefix('v1');

  const config = new DocumentBuilder()
    .setTitle('ChordLine API')
    .setDescription('REST API for ChordLine')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  const doc = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, doc);

  await app.listen(3001, '0.0.0.0');
}
bootstrap();
```

(Fastify adapter & Swagger are per Nest’s official docs.) ([NestJS Documentation][7])

## Prisma (official init + dev migrate)

```bash
pnpm add @prisma/client
pnpm add -D prisma
pnpm dlx prisma init
```

Set `DATABASE_URL` in `apps/api/.env` to your Supabase connection string (local or cloud), then:

```bash
pnpm dlx prisma migrate dev --name init
```

(Prisma migrate dev is the official dev workflow.) ([Prisma][8])

**Example `prisma/schema.prisma`**

```prisma
datasource db { provider = "postgresql"; url = env("DATABASE_URL") }
generator client { provider = "prisma-client-js" }

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  createdAt DateTime @default(now())
}
```

## Clerk token verification in the API (official backend SDK)

Install the backend SDK:

```bash
pnpm add @clerk/backend jsonwebtoken jwks-rsa
```

Create a **JWT guard** that verifies the **Bearer** token using Clerk’s `verifyToken()` (matches Clerk docs for manual verification / backend reference). ([Clerk][9])

**`src/auth/jwt.guard.ts`**

```ts
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { verifyToken } from '@clerk/backend';

@Injectable()
export class JwtGuard implements CanActivate {
  async canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest();
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : undefined;
    if (!token) throw new UnauthorizedException('Missing token');

    try {
      const claims = await verifyToken(token, {
        // These can be omitted if using the default discovery from the token;
        // include if you configured custom audience/templates.
        audience: process.env.CLERK_AUDIENCE, 
        clockSkewInMs: 5000,
      });
      (req as any).user = { sub: claims.sub, email: (claims as any).email, org: (claims as any).org_id };
      return true;
    } catch (e) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
```

(Clerk docs show `verifyToken()` usage & JWKS discovery.) ([Clerk][10])

**Provide the guard & a protected route:**

**`src/app.module.ts`**

```ts
import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
@Module({ imports: [UsersModule] })
export class AppModule {}
```

**`src/users/users.controller.ts`**

```ts
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/jwt.guard';

@Controller('v1/users')
export class UsersController {
  @UseGuards(JwtGuard)
  @Get()
  list() {
    return [{ id: 'u_1', email: 'test@example.com' }];
  }
}
```

**`src/users/users.module.ts`**

```ts
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { JwtGuard } from '../auth/jwt.guard';

@Module({
  controllers: [UsersController],
  providers: [JwtGuard],
})
export class UsersModule {}
```

> Now you *do* have a concrete place to apply `@UseGuards(JwtGuard)`—on any controller/route you want protected. If you prefer, you can also register a **global guard** in `main.ts`, but per-route is clearer while you build.

Run the API:

```bash
pnpm start:dev
# http://localhost:3001/docs and http://localhost:3001/v1/users (needs Bearer token)
```

---

# 5) Calling the API from the Web with a Clerk token

In client components, use Clerk’s hooks to get a token and attach it:

**`apps/web/src/lib/api.ts`**

```ts
import { getToken } from "@clerk/nextjs"; // for server components, use auth()

export async function api<T>(path: string, init?: RequestInit) {
  // In client components use: const { getToken } = useAuth(); await getToken();
  const token = typeof window === 'undefined'
    ? await getToken({ template: "default" })
    : // @ts-ignore getToken is exposed via the Clerk client hook in components
      await (window as any).Clerk?.session?.getToken?.({ template: "default" });

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {})
    },
    cache: "no-store",
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<T>;
}
```

(Clerk quickstart shows how to add the SDK and obtain session tokens in Next.js.) ([Clerk][3])

Example usage in a client page:

```tsx
"use client";
import { useEffect, useState } from "react";
import { useAuth, SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { api } from "@/lib/api";

export default function UsersPage() {
  const { isSignedIn } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  useEffect(() => {
    if (isSignedIn) api<any[]>("/v1/users").then(setUsers).catch(console.error);
  }, [isSignedIn]);
  return (
    <div>
      <SignedOut><SignInButton /></SignedOut>
      <SignedIn>
        <h1>Users</h1>
        <pre>{JSON.stringify(users, null, 2)}</pre>
      </SignedIn>
    </div>
  );
}
```

---

# 6) Local run commands (root)

```bash
# DB (if using local Supabase)
npx supabase start    # prints connection details
# API
pnpm --filter api start:dev
# Web
pnpm --filter web dev
```

(Official Supabase CLI doc: `supabase init` then `supabase start`; `supabase status` shows the local stack details.) ([Supabase][5])

---

## Why this is now correct

* **Fastify** is explicitly installed and used via `FastifyAdapter` in `main.ts`, with CORS registered using the Fastify plugin—**matching Nest’s official guidance**. ([NestJS Documentation][7])
* **Swagger** is configured per Nest’s **OpenAPI recipe**. ([NestJS Documentation][11])
* **Clerk** is integrated the official way on the **web** (App Router quickstart) and the **API** (backend `verifyToken`), with clear env placement. ([Clerk][3])
* **Supabase** is started the canonical way via the **CLI** for local work. ([Supabase][5])
* **Prisma** migrations use the recommended `migrate dev` flow for development. ([Prisma][8])
* `@UseGuards(JwtGuard)` is demonstrated *in place* on a controller; alternatively you can register a **global guard** later if you want everything protected by default.

If you want, I can generate a tiny repo with these exact files so you can `pnpm i && npx supabase start && pnpm -r dev` and be clicking around immediately.

[1]: https://nextjs.org/docs/app/api-reference/cli/create-next-app?utm_source=chatgpt.com "CLI: create-next-app"
[2]: https://tailwindcss.com/docs/guides/nextjs?utm_source=chatgpt.com "Install Tailwind CSS with Next.js"
[3]: https://clerk.com/docs/getting-started/quickstart?utm_source=chatgpt.com "Next.js Quickstart (App Router)"
[4]: https://clerk.com/docs/getting-started/quickstart/pages-router?utm_source=chatgpt.com "Next.js Quickstart (Pages Router)"
[5]: https://supabase.com/docs/guides/local-development/cli/getting-started?utm_source=chatgpt.com "Supabase CLI"
[6]: https://supabase.com/docs/guides/local-development?utm_source=chatgpt.com "Local Development & CLI | Supabase Docs"
[7]: https://docs.nestjs.com/techniques/performance?utm_source=chatgpt.com "Performance (Fastify) | NestJS - A progressive Node.js ..."
[8]: https://www.prisma.io/docs/orm/prisma-migrate/workflows/development-and-production?utm_source=chatgpt.com "Development and production | Prisma Documentation"
[9]: https://clerk.com/docs/guides/sessions/manual-jwt-verification?utm_source=chatgpt.com "Session management: Manual JWT verification"
[10]: https://clerk.com/docs/reference/backend/verify-token?utm_source=chatgpt.com "SDK Reference: verifyToken()"
[11]: https://docs.nestjs.com/recipes/swagger?utm_source=chatgpt.com "OpenAPI (Swagger) | NestJS - A progressive Node.js ..."
