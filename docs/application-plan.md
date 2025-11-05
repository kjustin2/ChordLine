# ChordLine MVP Application Plan

## 1. Vision & Guiding Principles
- Deliver a mobile-friendly "band operating system" that streamlines logistics, finances, creativity, and discovery for local musicians.
- Differentiate via AI-assisted coaching, collaborative setlist and song idea workflows, and thoughtful integrations (Spotify, OpenWeatherMap, Google Places) gated behind feature flags until production-ready.
- Build on existing stack (Next.js App Router, Tailwind/shadcn UI, NestJS + Fastify, Prisma, Clerk) with a shared types-first approach to keep front and back end aligned.
- Optimize for efficient data access and predictable performance using current best practices from Next.js (server components, caching directives) and NestJS (CacheModule, provider overrides, request-scoped guards).

## 2. Personas & Jobs-To-Be-Done
- **Band Leader**: coordinate members, manage gigs, balance payouts, keep setlists current, manage achievements for motivation.
- **Band Member**: view schedule, track personal earnings, collaborate on song ideas, log achievements and skill milestones.
- **Solo Artist / Prospective Member**: discover bands and events, showcase skills through onboarding questionnaire, collect achievements.
- **Fan / Community Member**: browse public events (limited MVP surface), celebrate band achievements.

## 3. Competitive Scan & Differentiators
- **Baseline offerings** (BandHelper, Setlist Helper, Gigwell): calendars, setlists, finance tracking, messaging, EPK tools.
- **ChordLine differentiators**: contextual AI coaching (practice routines, booking tips), collaborative song idea board, lightweight achievements page for gamified progress, mock-friendly integration layer, responsive PWA-first design.
- **Key metrics**: event adoption rate per band, AI assistant usage, achievement completions, invite-to-onboard conversion, mocked integration toggle usage.

## 4. Feature Roadmap

### Phase 0 (MVP Launch)
- **Authentication & Onboarding**
  - Clerk-based login/signup.
  - Instrument/style questionnaire for band and solo users.
- **Band Hub**
  - Create/manage bands, role-based permissions, invitation workflow.
  - Notifications for invites, event changes, achievement unlocks (in-app to start).
- **Calendar & Availability**
  - CRUD for events (shows, rehearsals) with status, location, notes.
  - RSVP/availability, mobile-first agenda view.
- **Financial Tracking**
  - Record gig earnings, expenses, per-member splits.
  - Dashboard summarizing payouts over time.
- **Setlist Manager**
  - Venue-specific setlists, drag-and-drop ordering, song metadata and notes.
- **Song Ideas Workspace**
  - Quick capture (offline-first), tagging, share to band, optional AI suggestions via OpenRouter.
- **Discovery Feed**
  - Public events listing for solo users with filters by style/location (mocked data initially).
- **AI Assistant**
  - Prompt-tuned advisor using OpenRouter free tier, persistent threads per band.
  - Budget safeguards, caching of prior responses.
- **Achievements Page**
  - Band and individual achievements (e.g., "First Sold-Out Show", "Five New Song Ideas"), progress indicators, shareable cards.
  - Triggered from tracked events/earnings/setlists.
- **Mobile-First UI**
  - Tailwind responsive layouts, drawer navigation, offline note caching for song ideas.
- **Mocked Integrations**
  - Abstract clients for Spotify, OpenWeatherMap, Google Places returning deterministic mocks when `INTEGRATIONS_MODE=mock`.

### Phase 1 (Post-MVP Hardening)
- Public landing pages and invite acceptance flows.
- Band resource library (stage plots, set documents).
- Discovery upgrades with RSVP, follow bands, integration toggle for real data.
- Notification center with email digests.
- Admin tooling: setlist cloning, recurring event templates, bulk payouts.
- Observability enhancements (structured logs, metrics dashboard, AI cost tracking).
- Privacy controls for achievements and public profiles.

### Later Backlog
- Production integrations (Spotify OAuth, weather alerts, venue search).
- Advanced analytics (audience insights, earning forecasts).
- Automation (auto-generated setlists, rehearsal reminders).
- Queue-based integration workers, event sourcing for audit trails.
- Comprehensive automated testing suite and Playwright E2E coverage.

## 5. Architecture & System Design
- **Front End (apps/web)**
  - Next.js App Router with server components.
  - Apply recommended caching directives: default `force-cache` for shared data, `revalidate` for event/achievement lists, `no-store` for personalized dashboards.
  - Use Suspense for sequential data fetching (e.g., band -> events -> achievements).
  - Client components only where interactivity required (drag-and-drop setlists, AI chat, achievements badges).
  - Mobile navigation using shadcn primitives, bottom tab on small screens.
- **Back End (apps/api)**
  - NestJS with Fastify adapter.
  - Module grouping: Auth, Bands, Events, Finance, Sets, Ideas, Achievements, Integrations, Notifications.
  - Prisma for data access; transaction wrappers for multi-write operations (e.g., event + earnings + achievements unlock).
  - Nest CacheModule configured per-feature; TTL overriding via `@CacheTTL`, `@CacheKey`. Plan future Redis store while defaulting to in-memory.
  - Guards leveraging Clerk JWTs, role-based policies.
- **Shared Types (packages/types)**
  - DTOs and runtime validators (Zod/class-validator) exported for both front and back ends.
  - Versioned change control to avoid breaking API consumers.
- **Integration Layer**
  - Service clients per integration with adapter interface, rate limiting, exponential backoff (future), currently returning mocks.
  - Feature flags for enabling real integrations later.
- **Caching & Data Efficiency**
  - React `cache`/`preload` helpers for repeated fetches.
  - Prisma query optimization with indexes on `BandMember`, `Event` (band/date), `Earning` (band/user/date), `AchievementProgress`.
  - NestJS CacheInterceptor applied to read-heavy routes (e.g., discovery feed) with invalidation on write events.

## 6. Data Model (Initial Prisma Entities)
- `User`: core profile, Clerk ID linkage, instrument/style metadata.
- `Band`: name, description, genre, createdBy, status.
- `BandMember`: userId, bandId, role (leader/member), status, joinDate.
- `Invitation`: token, email, invitedBy, bandId, expiresAt, status.
- `ExternalAccount`: bandId/userId, provider, tokens (encrypted), status.
- `Event`: bandId, type (show/rehearsal/meeting), venueId (nullable), location metadata, start/end, notes, status.
- `EventRole`: eventId, memberId, role, compensation, confirmed flag.
- `Setlist`: eventId, title, notes, visibility.
- `SetlistSong`: setlistId, songTitle, key, order, notes.
- `SongIdea`: bandId, authorId, title, body, tags, status, sharedAt.
- `Earning`: bandId, eventId (nullable), totalAmount, currency, recordedBy.
- `EarningSplit`: earningId, memberId, amount, status (pending/paid), paidAt.
- `AchievementDefinition`: scope (band/user), triggerType, thresholds, icon.
- `AchievementProgress`: definitionId, subjectId, progress, unlockedAt, metadata.
- `Notification`: recipientId, type, payload, readAt.
- `Venue` (future via Google Places) and `IntegrationSyncLog` for audit.

## 7. AI Strategy
- Prompt library stored in DB with versioning.
- Request proxy service on API to call OpenRouter; include budget caps and caching.
- Conversation history persisted per user context, trimmed for token limits.
- Safety filters and guardrails (rate limiting, allowlist of actions).

## 8. Local Development & Mocking
- Environment bootstrap: `pnpm install`, `pnpm --filter @chordline/types run build`, Supabase local (optional), API `pnpm --filter api run start:dev`, Web `pnpm --filter web exec -- next dev`.
- Mock integrations via MSW (web) and injectable providers (Nest) using mock factories.
- Seed database with sample bands, events, achievements.
- Document manual QA flows (achievement unlock, AI assistant usage, event creation, earnings split).

## 9. Testing & Release Strategy
- **MVP**: manual testing only, documented scenarios; lint/type checks in CI.
- Define plan for introducing Playwright and API unit tests post-MVP.
- Deploy web to Vercel, API to Render; maintain environment variable parity (Clerk keys, API URL, OpenRouter key).
- Feature flags for achievements spotlight, integrations mode, AI assistant availability.

## 10. Security, Privacy, & Compliance
- Enforce authorization checks at resolver/service layer.
- Hash invitation tokens, encrypt sensitive integration tokens.
- Implement rate limiting (Nest Throttler) on AI endpoints and invitations.
- Audit trail via `AchievementProgress`, `Earning` updates, and future webhook events.

## 11. Accessibility & UX Considerations
- Semantic HTML, keyboard navigation, proper focus management.
- Achievements page uses accessible progress indicators and aria labels.
- Provide text alternatives for icons/badges, high-contrast themes via Tailwind.

## 12. Observability & Operations
- Structured logging (pino + fastify) with request IDs.
- Basic metrics: API request count, cache hit rate, AI cost usage (logged per request).
- Error boundaries and logging for client components; server error reporting via Sentry (future).

## 13. Implementation Next Steps
1. Finalize Prisma schema changes including achievements entities.
2. Scaffold NestJS modules and DTOs for bands, events, finances, ideas, achievements.
3. Implement Clerk auth integration end-to-end.
4. Build foundational UI shells (layout, navigation, band dashboard, achievements page).
5. Add mock integration services and environment toggles.
6. Wire AI assistant backend route and frontend chat component.
7. Populate achievements triggers during event/earning/setlist workflows.
8. Prepare deployment scripts and environment configurations for Vercel and Render.

---
This plan reflects current system understanding (November 2025). Revisit after MVP release to reassess priorities, integrations, and testing coverage.
