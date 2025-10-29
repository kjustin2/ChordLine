# Transition Plan: From Paid Services to Free GitHub Pages + IndexedDB

**Date Created:** October 28, 2025  
**Purpose:** Document current state and create a comprehensive plan to transition from Vercel/Render/Clerk/Supabase to a completely free development setup using GitHub Pages and IndexedDB.

---

## Table of Contents
1. [Current State Documentation](#current-state-documentation)
2. [Reasons for Transition](#reasons-for-transition)
3. [Target Architecture](#target-architecture)
4. [Migration Plan](#migration-plan)
5. [Implementation Steps](#implementation-steps)
6. [Rollback Plan](#rollback-plan)
7. [Future Re-integration Path](#future-re-integration-path)

---

## Current State Documentation

### Tech Stack (As of October 2025)

#### Hosting & Infrastructure
- **Web Hosting:** Vercel
  - URL: https://vercel.com/justin-kramers-projects-d02423f4/chord-line-web/settings/environment-variables
  - Current Status: Active (Hobby plan, not paused)
  
- **Backend Hosting:** Render
  - URL: https://dashboard.render.com/web/srv-d40n85ngi27c73ek48kg/deploys/dep-d40nt6gdl3ps73d685eg
  - Current Status: Active (temporarily using for cost assessment)

- **Database:** Supabase
  - URL: https://supabase.com/dashboard/project/lswbxreiunnuxmkqocto/database/schemas
  - Type: PostgreSQL
  - Local Dev: Docker-based via Supabase CLI
  - Ports: DB (54322), API (54321), Studio (54323)

- **Authentication:** Clerk
  - URL: https://dashboard.clerk.com/apps/app_3454QGSXgUVMulGaSoQLFjllTU3/instances/ins_3454QEBqZR9oLBPWoEm88yiINwb/jwt-templates
  - Type: Managed auth service with JWT tokens
  - Integration: Middleware on Next.js, JWT verification on NestJS

#### Application Architecture

**Monorepo Structure:**
```
ChordLine/
├── apps/
│   ├── web/          # Next.js 15.5.5 frontend
│   └── api/          # NestJS backend with Fastify
├── packages/
│   └── shared/       # (placeholder)
└── supabase/         # Local Supabase config
```

**Frontend (apps/web):**
- Framework: Next.js 15.5.5 (App Router with Turbopack)
- UI: Tailwind CSS 4.1.14
- Authentication: @clerk/nextjs 6.33.4
- Key Files:
  - `middleware.ts` - Clerk authentication middleware
  - `app/layout.tsx` - Root layout with ClerkProvider
  - `lib/useApi.ts` - Custom hook for authenticated API calls
  - `lib/api.ts` - API helper function
  - `app/pages/usersPage.tsx` - Example page using Clerk auth

**Backend (apps/api):**
- Framework: NestJS 11.0.1 with Fastify adapter
- ORM: Prisma 6.17.1
- Database: PostgreSQL (via Supabase)
- Authentication: @clerk/backend 2.18.0 with JWT verification
- API Docs: Swagger UI at `/docs`
- Port: 3001
- Key Files:
  - `src/main.ts` - Fastify setup with CORS and Swagger
  - `src/auth/jwt.guard.ts` - JWT verification guard
  - `src/users/users.controller.ts` - Example protected endpoint
  - `prisma/schema.prisma` - Database schema

**Package Manager:** pnpm 10.12.4

**Current Data Model:**
```prisma
// apps/api/prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
  output   = "../generated/prisma"
}

// Currently minimal - ready for expansion
```

### Environment Variables Required (Current)

**Web (.env.local):**
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**API (.env):**
```
DATABASE_URL=postgresql://...  # Supabase connection
CLERK_JWT_KEY=...              # Clerk JWT verification key
AUTHORIZED_CLERK_PARTY=...     # Authorized Clerk domain
```

### Current Development Workflow

**Local Development:**
```bash
# Terminal 1: Database
npx supabase start

# Terminal 2: Backend API
cd apps/api
pnpm start:dev
# http://localhost:3001/docs

# Terminal 3: Frontend
cd apps/web
npm run dev
# http://localhost:3000
```

**Build Commands:**
```bash
pnpm --filter web run build
pnpm --filter api exec prisma generate
pnpm --filter api run build
```

### Current Authentication Flow

1. User visits Next.js app
2. Clerk middleware intercepts request
3. Clerk provides authentication UI (SignIn/SignUp)
4. After auth, Clerk issues JWT token
5. Frontend uses `useApi` hook to get token via `getToken()`
6. Token sent in `Authorization: Bearer <token>` header
7. Backend `JwtGuard` verifies token using Clerk SDK
8. Protected routes accessible after verification

### Current Database Operations

- Prisma generates client to `apps/api/generated/prisma`
- Migrations managed via `prisma migrate dev`
- Local Supabase provides full PostgreSQL instance
- Studio UI available at http://127.0.0.1:54323/project/default

### Dependencies to Remove/Replace

**Web (apps/web/package.json):**
- `@clerk/nextjs: ^6.33.4` → Remove (replace with custom auth)

**API (apps/api/package.json):**
- `@clerk/backend: ^2.18.0` → Remove
- `@prisma/client: ^6.17.1` → Remove
- `prisma: ^6.17.1` → Remove
- `supabase: ^2.51.0` → Remove
- Database-related scripts in package.json

**Root (package.json):**
- `supabase: ^2.51.0` → Remove

---

## Reasons for Transition

### Cost Optimization
- **Current:** Multiple paid services with potential scaling costs
  - Vercel: Free tier but with limits
  - Render: Paid after free tier
  - Clerk: Free up to 10k MAU, then paid
  - Supabase: Free tier with database size/request limits

- **Target:** $0 hosting and development costs
  - GitHub Pages: Completely free for public repos
  - IndexedDB: Built into browsers, no backend needed
  - GitHub Actions: Free for public repos (CI/CD)

### Faster Iteration
- Eliminate external service dependencies during early development
- No network latency for data operations
- No deployment waiting times
- Instant local testing

### Simplicity
- Single repo, single deployment target
- No API server to maintain
- No database migrations to manage
- No auth service configuration

### Future Flexibility
- Can always re-integrate services later when:
  - User base grows beyond browser storage limits
  - Need for real-time collaboration
  - Mobile app development begins
  - Team collaboration requires centralized data

---

## Target Architecture

### High-Level Overview

```
┌─────────────────────────────────────────┐
│         GitHub Pages (Static)           │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │     Next.js Static Export         │ │
│  │  (HTML/CSS/JS only, no server)    │ │
│  └───────────────────────────────────┘ │
│                 ↓                       │
│  ┌───────────────────────────────────┐ │
│  │    Client-Side State Management   │ │
│  │   (React Context / Zustand)       │ │
│  └───────────────────────────────────┘ │
│                 ↓                       │
│  ┌───────────────────────────────────┐ │
│  │      IndexedDB (Browser DB)       │ │
│  │   - User data                     │ │
│  │   - Application state             │ │
│  │   - Offline-first                 │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### Technology Decisions

#### 1. **Frontend Framework:** Next.js (Static Export)
- **Keep:** Next.js for development experience
- **Change:** Use `output: 'export'` in next.config.ts
- **Why:** 
  - Familiar development workflow
  - Excellent build tooling
  - Static export creates HTML/CSS/JS only
  - React ecosystem for state management

#### 2. **Authentication:** Simple Client-Side Auth
- **Remove:** Clerk
- **Replace:** 
  - Option A: Simple email/password stored in IndexedDB (no verification)
  - Option B: GitHub OAuth (free, built into GitHub Pages)
  - Option C: No auth initially - just local data
- **Recommendation:** Start with Option C, add Option B later if needed

#### 3. **Database:** IndexedDB
- **Remove:** PostgreSQL/Supabase/Prisma
- **Replace:** IndexedDB with a wrapper library
- **Options:**
  - `Dexie.js` - Modern wrapper for IndexedDB (Recommended)
  - `idb` - Minimal wrapper by Google Chrome team
  - `PouchDB` - CouchDB-inspired with sync capabilities (future-proof)
- **Recommendation:** Dexie.js for excellent TypeScript support

#### 4. **State Management:** Zustand or React Context
- **Add:** Client-side state management
- **Options:**
  - Zustand (lightweight, simple)
  - Jotai (atomic state)
  - React Context (built-in, no dependencies)
- **Recommendation:** Zustand for simplicity

#### 5. **Hosting:** GitHub Pages
- **Setup:**
  - Enable GitHub Pages on repository
  - Deploy to `gh-pages` branch or `/docs` folder
  - Use GitHub Actions for automated deployment
- **URL Pattern:** `https://kjustin2.github.io/ChordLine/`
- **Custom Domain:** Optional, can add later

#### 6. **API Server:** None
- **Remove:** Entire `apps/api` folder (archive for later)
- **Replace:** All business logic moves to client-side
- **Note:** This is a temporary measure for iteration

---

## Migration Plan

### Phase 1: Archive Current Setup ✅
**Goal:** Preserve all current work for future restoration

**Steps:**
1. Create `archive/` directory at root
2. Copy current implementation:
   ```
   archive/
   ├── api/              # Full apps/api folder
   ├── web-clerk/        # Clerk-specific files
   ├── supabase/         # Supabase config
   ├── docs/             # Current documentation
   │   ├── README.md
   │   ├── SETUP_STEPS_FROM_AI.md
   │   └── DEV_PRIORITIES.md
   └── restoration-guide.md
   ```
3. Document all environment variables in `archive/env-template.txt`
4. Export Supabase schema: `npx supabase db dump -f archive/schema.sql`
5. Create restoration checklist in `archive/restoration-guide.md`
6. Commit as: "Archive current paid-services implementation"

### Phase 2: Remove Backend Dependencies 🔧
**Goal:** Clean up backend and paid service dependencies

**Steps:**
1. Remove `apps/api` folder (already archived)
2. Update root `pnpm-workspace.yaml`:
   ```yaml
   packages:
     - 'apps/web'
     # Removed: apps/api
   ```
3. Update root `package.json`:
   - Remove `supabase` from devDependencies
4. Remove `supabase/` directory
5. Update `.gitignore` to ignore archive (optional)
6. Commit as: "Remove backend API and database dependencies"

### Phase 3: Configure Next.js for Static Export 📦
**Goal:** Transform Next.js app to static site

**Steps:**
1. Update `apps/web/next.config.ts`:
   ```typescript
   import type { NextConfig } from "next";

   const nextConfig: NextConfig = {
     output: 'export',
     images: {
       unoptimized: true, // Required for static export
     },
     basePath: process.env.NODE_ENV === 'production' ? '/ChordLine' : '',
   };

   export default nextConfig;
   ```

2. Remove server-side features:
   - No `middleware.ts` (Clerk middleware won't work)
   - No API routes (if any exist)
   - No `getServerSideProps` or `getStaticProps` with revalidate
   - All components must be client-side or truly static

3. Update `apps/web/package.json` scripts:
   ```json
   {
     "scripts": {
       "dev": "next dev --turbopack",
       "build": "next build",
       "export": "next build",
       "start": "npx serve@latest out",
       "lint": "eslint"
     }
   }
   ```

4. Test local export:
   ```bash
   cd apps/web
   npm run build
   npx serve out
   # Should serve static site on localhost
   ```

5. Commit as: "Configure Next.js for static export"

### Phase 4: Remove Clerk Authentication 🔐
**Goal:** Remove Clerk and prepare for simple client-side auth

**Steps:**
1. Remove Clerk from `apps/web/package.json`:
   ```bash
   cd apps/web
   npm uninstall @clerk/nextjs
   ```

2. Delete/archive Clerk-specific files:
   - `apps/web/middleware.ts` (move to archive first)

3. Update `apps/web/app/layout.tsx`:
   ```tsx
   import { type Metadata } from 'next'
   import { Geist, Geist_Mono } from 'next/font/google'
   import './globals.css'

   const geistSans = Geist({
     variable: '--font-geist-sans',
     subsets: ['latin'],
   })

   const geistMono = Geist_Mono({
     variable: '--font-geist-mono',
     subsets: ['latin'],
   })

   export const metadata: Metadata = {
     title: 'ChordLine - Local Live Musicians',
     description: 'Revolutionizing the experience of local live musicians',
   }

   export default function RootLayout({
     children,
   }: Readonly<{
     children: React.ReactNode
   }>) {
     return (
       <html lang="en">
         <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
           {children}
         </body>
       </html>
     )
   }
   ```

4. Remove/update auth-dependent files:
   - Delete `apps/web/lib/useApi.ts` (API calls no longer needed)
   - Delete `apps/web/lib/api.ts`
   - Update `apps/web/app/pages/usersPage.tsx` (remove Clerk imports)

5. Commit as: "Remove Clerk authentication"

### Phase 5: Implement IndexedDB Storage 💾
**Goal:** Set up browser-based data persistence

**Steps:**
1. Install Dexie.js:
   ```bash
   cd apps/web
   npm install dexie
   npm install -D @types/dexie
   ```

2. Create database schema: `apps/web/lib/db.ts`
   ```typescript
   import Dexie, { type Table } from 'dexie';

   // Define your database schema
   export interface User {
     id?: number;
     email: string;
     name: string;
     createdAt: Date;
   }

   export interface Song {
     id?: number;
     title: string;
     artist: string;
     key?: string;
     tempo?: number;
     createdAt: Date;
     updatedAt: Date;
   }

   export interface Setlist {
     id?: number;
     name: string;
     songs: number[]; // Song IDs
     createdAt: Date;
     updatedAt: Date;
   }

   export class ChordLineDB extends Dexie {
     users!: Table<User>;
     songs!: Table<Song>;
     setlists!: Table<Setlist>;

     constructor() {
       super('ChordLineDB');
       this.version(1).stores({
         users: '++id, email',
         songs: '++id, title, artist',
         setlists: '++id, name',
       });
     }
   }

   export const db = new ChordLineDB();
   ```

3. Create CRUD utilities: `apps/web/lib/storage.ts`
   ```typescript
   import { db } from './db';
   import type { User, Song, Setlist } from './db';

   // User operations
   export const userStorage = {
     create: async (user: Omit<User, 'id'>) => {
       return await db.users.add(user);
     },
     getAll: async () => {
       return await db.users.toArray();
     },
     getById: async (id: number) => {
       return await db.users.get(id);
     },
     update: async (id: number, updates: Partial<User>) => {
       return await db.users.update(id, updates);
     },
     delete: async (id: number) => {
       return await db.users.delete(id);
     },
   };

   // Song operations
   export const songStorage = {
     create: async (song: Omit<Song, 'id'>) => {
       return await db.songs.add(song);
     },
     getAll: async () => {
       return await db.songs.toArray();
     },
     getById: async (id: number) => {
       return await db.songs.get(id);
     },
     search: async (query: string) => {
       return await db.songs
         .filter(song => 
           song.title.toLowerCase().includes(query.toLowerCase()) ||
           song.artist.toLowerCase().includes(query.toLowerCase())
         )
         .toArray();
     },
     update: async (id: number, updates: Partial<Song>) => {
       return await db.songs.update(id, { ...updates, updatedAt: new Date() });
     },
     delete: async (id: number) => {
       return await db.songs.delete(id);
     },
   };

   // Setlist operations
   export const setlistStorage = {
     create: async (setlist: Omit<Setlist, 'id'>) => {
       return await db.setlists.add(setlist);
     },
     getAll: async () => {
       return await db.setlists.toArray();
     },
     getById: async (id: number) => {
       return await db.setlists.get(id);
     },
     update: async (id: number, updates: Partial<Setlist>) => {
       return await db.setlists.update(id, { ...updates, updatedAt: new Date() });
     },
     delete: async (id: number) => {
       return await db.setlists.delete(id);
     },
   };

   // Utility to clear all data (useful for development)
   export const clearAllData = async () => {
     await db.users.clear();
     await db.songs.clear();
     await db.setlists.clear();
   };
   ```

4. Test IndexedDB:
   - Create a simple test page
   - Verify data persists after page reload
   - Test in Chrome DevTools > Application > IndexedDB

5. Commit as: "Add IndexedDB storage layer with Dexie.js"

### Phase 6: Implement State Management 🎯
**Goal:** Add Zustand for global state

**Steps:**
1. Install Zustand:
   ```bash
   cd apps/web
   npm install zustand
   ```

2. Create store: `apps/web/lib/store.ts`
   ```typescript
   import { create } from 'zustand';
   import { devtools, persist } from 'zustand/middleware';
   import type { User, Song, Setlist } from './db';

   interface AppState {
     // User state
     currentUser: User | null;
     setCurrentUser: (user: User | null) => void;
     
     // Songs state
     songs: Song[];
     setSongs: (songs: Song[]) => void;
     addSong: (song: Song) => void;
     updateSong: (id: number, updates: Partial<Song>) => void;
     deleteSong: (id: number) => void;
     
     // Setlists state
     setlists: Setlist[];
     setSetlists: (setlists: Setlist[]) => void;
     addSetlist: (setlist: Setlist) => void;
     updateSetlist: (id: number, updates: Partial<Setlist>) => void;
     deleteSetlist: (id: number) => void;
     
     // UI state
     isLoading: boolean;
     setIsLoading: (loading: boolean) => void;
   }

   export const useAppStore = create<AppState>()(
     devtools(
       persist(
         (set) => ({
           // User state
           currentUser: null,
           setCurrentUser: (user) => set({ currentUser: user }),
           
           // Songs state
           songs: [],
           setSongs: (songs) => set({ songs }),
           addSong: (song) => set((state) => ({ songs: [...state.songs, song] })),
           updateSong: (id, updates) => set((state) => ({
             songs: state.songs.map(s => s.id === id ? { ...s, ...updates } : s)
           })),
           deleteSong: (id) => set((state) => ({
             songs: state.songs.filter(s => s.id !== id)
           })),
           
           // Setlists state
           setlists: [],
           setSetlists: (setlists) => set({ setlists }),
           addSetlist: (setlist) => set((state) => ({ 
             setlists: [...state.setlists, setlist] 
           })),
           updateSetlist: (id, updates) => set((state) => ({
             setlists: state.setlists.map(sl => sl.id === id ? { ...sl, ...updates } : sl)
           })),
           deleteSetlist: (id) => set((state) => ({
             setlists: state.setlists.filter(sl => sl.id !== id)
           })),
           
           // UI state
           isLoading: false,
           setIsLoading: (loading) => set({ isLoading: loading }),
         }),
         {
           name: 'chordline-storage',
           // Only persist certain fields
           partialize: (state) => ({
             currentUser: state.currentUser,
           }),
         }
       )
     )
   );
   ```

3. Create sync helper: `apps/web/lib/sync.ts`
   ```typescript
   import { useEffect } from 'react';
   import { useAppStore } from './store';
   import { songStorage, setlistStorage } from './storage';

   // Hook to sync IndexedDB with Zustand on app load
   export function useInitialSync() {
     const setSongs = useAppStore(state => state.setSongs);
     const setSetlists = useAppStore(state => state.setSetlists);
     const setIsLoading = useAppStore(state => state.setIsLoading);

     useEffect(() => {
       const loadData = async () => {
         setIsLoading(true);
         try {
           const [songs, setlists] = await Promise.all([
             songStorage.getAll(),
             setlistStorage.getAll(),
           ]);
           setSongs(songs);
           setSetlists(setlists);
         } catch (error) {
           console.error('Failed to load data:', error);
         } finally {
           setIsLoading(false);
         }
       };

       loadData();
     }, [setSongs, setSetlists, setIsLoading]);
   }
   ```

4. Update layout to use store: `apps/web/app/layout.tsx`
   ```tsx
   'use client';
   import { useInitialSync } from '@/lib/sync';
   // ... other imports

   export default function RootLayout({ children }) {
     useInitialSync(); // Load data on app start
     
     return (
       <html lang="en">
         <body>
           {children}
         </body>
       </html>
     );
   }
   ```

5. Commit as: "Add Zustand state management with IndexedDB sync"

### Phase 7: Build Example Features 🎸
**Goal:** Demonstrate the new stack with working features

**Steps:**
1. Create a Songs page: `apps/web/app/songs/page.tsx`
2. Create a Setlists page: `apps/web/app/setlists/page.tsx`
3. Create basic navigation
4. Add CRUD operations for songs and setlists
5. Test all functionality locally

6. Commit as: "Add example song and setlist management features"

### Phase 8: GitHub Pages Deployment 🚀
**Goal:** Deploy static site to GitHub Pages

**Steps:**
1. Create GitHub Actions workflow: `.github/workflows/deploy.yml`
   ```yaml
   name: Deploy to GitHub Pages

   on:
     push:
       branches: [ main ]
     workflow_dispatch:

   permissions:
     contents: read
     pages: write
     id-token: write

   concurrency:
     group: "pages"
     cancel-in-progress: false

   jobs:
     build:
       runs-on: ubuntu-latest
       steps:
         - name: Checkout
           uses: actions/checkout@v4
         
         - name: Setup Node
           uses: actions/setup-node@v4
           with:
             node-version: '20'
         
         - name: Setup pnpm
           uses: pnpm/action-setup@v2
           with:
             version: 10.12.4
         
         - name: Install dependencies
           run: |
             cd apps/web
             npm install
         
         - name: Build
           run: |
             cd apps/web
             npm run build
         
         - name: Upload artifact
           uses: actions/upload-pages-artifact@v3
           with:
             path: ./apps/web/out

     deploy:
       environment:
         name: github-pages
         url: ${{ steps.deployment.outputs.page_url }}
       runs-on: ubuntu-latest
       needs: build
       steps:
         - name: Deploy to GitHub Pages
           id: deployment
           uses: actions/deploy-pages@v4
   ```

2. Enable GitHub Pages in repository settings:
   - Go to Settings > Pages
   - Source: GitHub Actions

3. Push to main branch to trigger deployment

4. Verify deployment at `https://kjustin2.github.io/ChordLine/`

5. Commit as: "Add GitHub Pages deployment workflow"

### Phase 9: Documentation Update 📚
**Goal:** Update all documentation for new stack

**Steps:**
1. Update `README.md`:
   - Remove references to Vercel, Render, Clerk, Supabase
   - Add new local development instructions
   - Add deployment instructions
   - Update tech stack section

2. Create `FREE_STACK_GUIDE.md`:
   - Document the IndexedDB schema
   - Explain state management patterns
   - Provide examples of common operations
   - Add troubleshooting section

3. Update `DEV_PRIORITIES.md` for new architecture

4. Commit as: "Update documentation for free stack"

---

## Implementation Steps

### Quick Reference Checklist

- [ ] **Phase 1:** Archive current setup
  - [ ] Create `archive/` directory structure
  - [ ] Copy apps/api, Clerk files, supabase config
  - [ ] Document environment variables
  - [ ] Export database schema
  - [ ] Create restoration guide
  - [ ] Commit archive

- [ ] **Phase 2:** Remove backend dependencies
  - [ ] Delete `apps/api` folder
  - [ ] Update `pnpm-workspace.yaml`
  - [ ] Remove supabase from root package.json
  - [ ] Delete `supabase/` directory
  - [ ] Commit cleanup

- [ ] **Phase 3:** Configure Next.js static export
  - [ ] Update `next.config.ts` with export settings
  - [ ] Update package.json scripts
  - [ ] Test local build and serve
  - [ ] Commit configuration

- [ ] **Phase 4:** Remove Clerk
  - [ ] Uninstall @clerk/nextjs
  - [ ] Delete middleware.ts
  - [ ] Update app/layout.tsx
  - [ ] Remove lib/useApi.ts and lib/api.ts
  - [ ] Update usersPage.tsx
  - [ ] Commit Clerk removal

- [ ] **Phase 5:** Implement IndexedDB
  - [ ] Install Dexie.js
  - [ ] Create lib/db.ts with schema
  - [ ] Create lib/storage.ts with CRUD operations
  - [ ] Test in browser DevTools
  - [ ] Commit IndexedDB implementation

- [ ] **Phase 6:** Add state management
  - [ ] Install Zustand
  - [ ] Create lib/store.ts
  - [ ] Create lib/sync.ts
  - [ ] Update layout to sync on load
  - [ ] Commit state management

- [ ] **Phase 7:** Build example features
  - [ ] Create songs page with CRUD
  - [ ] Create setlists page with CRUD
  - [ ] Add navigation
  - [ ] Test all features
  - [ ] Commit features

- [ ] **Phase 8:** Deploy to GitHub Pages
  - [ ] Create GitHub Actions workflow
  - [ ] Enable Pages in repo settings
  - [ ] Push and verify deployment
  - [ ] Test live site
  - [ ] Commit workflow

- [ ] **Phase 9:** Update documentation
  - [ ] Update README.md
  - [ ] Create FREE_STACK_GUIDE.md
  - [ ] Update DEV_PRIORITIES.md
  - [ ] Commit documentation

---

## Rollback Plan

### If Migration Needs to be Reversed

**Quick Restore (from archive/):**

1. **Restore Backend:**
   ```bash
   cp -r archive/api apps/api
   cp -r archive/supabase supabase
   ```

2. **Restore Web (Clerk files):**
   ```bash
   cp archive/web-clerk/middleware.ts apps/web/
   cp archive/web-clerk/layout.tsx apps/web/app/
   cp -r archive/web-clerk/lib apps/web/
   ```

3. **Reinstall Dependencies:**
   ```bash
   # Root
   pnpm install

   # Web
   cd apps/web
   npm install @clerk/nextjs

   # API
   cd ../api
   pnpm install
   ```

4. **Restore Configuration:**
   ```bash
   # Copy environment variables from archive/env-template.txt
   # Restore next.config.ts from archive
   ```

5. **Restore Database:**
   ```bash
   npx supabase start
   npx supabase db reset
   # Import schema from archive/schema.sql if needed
   ```

6. **Verify Services:**
   - Vercel: Redeploy from dashboard
   - Render: Redeploy from dashboard
   - Clerk: Should still have active account
   - Supabase: Should still have active project

**Detailed Restoration Guide:**
See `archive/restoration-guide.md` (to be created in Phase 1)

---

## Future Re-integration Path

### When to Re-introduce Paid Services

**Indicators that you need backend services:**

1. **User Count:**
   - 100+ active users (localStorage limits)
   - Need for user accounts and cross-device sync

2. **Data Complexity:**
   - Relational queries become too complex for IndexedDB
   - Need for full-text search
   - Need for data analytics

3. **Features:**
   - Real-time collaboration
   - Social features (following, sharing)
   - Mobile app (requires backend API)
   - Email notifications
   - Payment processing

4. **Performance:**
   - Client-side operations too slow
   - Need for server-side rendering
   - Need for edge caching

### Re-integration Strategy

**Phase 1: Add Backend API (Keep GitHub Pages)**
- Restore NestJS API from archive
- Deploy to Render or Railway
- Keep frontend on GitHub Pages
- Add API calls alongside IndexedDB (hybrid mode)

**Phase 2: Add Database**
- Restore Prisma and Supabase
- Migrate IndexedDB data to PostgreSQL
- Implement sync strategy

**Phase 3: Add Authentication**
- Restore Clerk or consider alternatives:
  - Supabase Auth (integrated with database)
  - NextAuth.js (more control)
  - Auth0 (enterprise features)

**Phase 4: Move to Vercel (Optional)**
- Re-enable server-side features
- Use Vercel Edge functions
- Implement ISR (Incremental Static Regeneration)

### Gradual Migration Pattern

```typescript
// Example: Hybrid approach (IndexedDB + API)
async function getSongs() {
  // Try API first (if user is online and has account)
  if (navigator.onLine && currentUser?.hasAccount) {
    try {
      const songs = await api.songs.getAll();
      // Sync to IndexedDB for offline access
      await songStorage.bulkUpdate(songs);
      return songs;
    } catch (error) {
      console.warn('API failed, falling back to IndexedDB');
    }
  }
  
  // Fallback to IndexedDB (offline or no account)
  return await songStorage.getAll();
}
```

### Architecture Evolution Roadmap

```
Current (Paid) → Free Stack → Hybrid → Full Stack
     ↓               ↓           ↓           ↓
  All Paid      GitHub Pages   Free +     All Paid
  Services      + IndexedDB    Optional   Services
                                Paid       Scaled
```

---

## Considerations & Trade-offs

### Limitations of Free Stack

**Data Storage:**
- IndexedDB quota: ~50MB to 1GB+ depending on browser
- No backup/restore built-in (user must export)
- Lost if user clears browser data

**Collaboration:**
- No real-time updates
- No sharing between users
- Each user's data is siloed

**Device Sync:**
- No cross-device synchronization
- Each device has separate data

**Performance:**
- All processing on client
- Limited by user's device capabilities
- Large datasets may slow down

**Features Not Possible:**
- Server-side rendering for SEO
- Email notifications
- Scheduled tasks/cron jobs
- File uploads to cloud
- Third-party integrations requiring secrets

### Advantages of Free Stack

**Cost:**
- $0 hosting forever
- No usage limits to worry about
- No surprise bills

**Performance:**
- Instant operations (no network latency)
- Offline-first by default
- Fast page loads (static HTML)

**Privacy:**
- User data never leaves their device
- No server logs
- No data breaches possible

**Development:**
- Faster iteration (no deployment wait)
- Simple debugging (all client-side)
- No backend maintenance

**Scaling:**
- No database connection limits
- No API rate limits
- Each user has their own "database"

---

## Success Criteria

### Migration is Complete When:

- [ ] No dependencies on Clerk, Supabase, or Render
- [ ] Application runs entirely in browser
- [ ] Data persists in IndexedDB across sessions
- [ ] Deployed successfully to GitHub Pages
- [ ] All documentation updated
- [ ] Original setup archived and restoration tested
- [ ] Example features working (songs, setlists CRUD)
- [ ] Local development simple: `npm install && npm run dev`
- [ ] Production build simple: `npm run build`

### Application Should:

- [ ] Load in under 2 seconds on GitHub Pages
- [ ] Work offline after first load
- [ ] Persist data across browser sessions
- [ ] Handle 1000+ songs without performance issues
- [ ] Work on mobile browsers
- [ ] Be easily extensible for new features

---

## Timeline Estimate

**Conservative Estimate:**
- Phase 1-2: 2 hours (Archive and cleanup)
- Phase 3-4: 3 hours (Next.js config and Clerk removal)
- Phase 5-6: 4 hours (IndexedDB and state management)
- Phase 7: 4 hours (Build example features)
- Phase 8: 2 hours (GitHub Pages deployment)
- Phase 9: 1 hour (Documentation)

**Total: ~16 hours** (2 full work days)

**Aggressive Estimate:** 8-10 hours if no issues

---

## Questions to Answer Before Starting

1. **Data Migration:**
   - Is there any existing production data in Supabase that needs to be preserved?
   - Do you need an export feature for users to backup their IndexedDB data?

2. **Authentication:**
   - Do you need any authentication in the free version, or just local-only data?
   - Should we implement simple password protection (client-side only)?

3. **GitHub Pages:**
   - Should the repo be public (required for free GitHub Pages)?
   - Do you want a custom domain or is `*.github.io` acceptable?

4. **Features:**
   - What are the core features needed for initial iteration?
   - Should we implement data export/import from the start?

5. **Future:**
   - When do you estimate needing backend services again?
   - What's the target user count before scaling up?

---

## Related Documentation

- Current: `README.md` - Local development with paid services
- Current: `SETUP_STEPS_FROM_AI.md` - Full setup guide with paid services
- Current: `DEV_PRIORITIES.md` - Development priorities
- New: `archive/restoration-guide.md` - How to restore paid services (to be created)
- New: `FREE_STACK_GUIDE.md` - Guide for IndexedDB and free stack (to be created)

---

## Additional Resources

### IndexedDB & Dexie.js
- [Dexie.js Documentation](https://dexie.org/)
- [IndexedDB Browser Support](https://caniuse.com/indexeddb)
- [Working with IndexedDB (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB)

### GitHub Pages
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Deploying Next.js to GitHub Pages](https://github.com/vercel/next.js/tree/canary/examples/github-pages)

### Next.js Static Export
- [Static Exports Documentation](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)

### Zustand
- [Zustand Documentation](https://github.com/pmndrs/zustand)

---

**Document Version:** 1.0  
**Last Updated:** October 28, 2025  
**Author:** AI Assistant (Claude)  
**Status:** Ready for Review
