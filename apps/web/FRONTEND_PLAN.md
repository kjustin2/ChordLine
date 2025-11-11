# ChordLine Web Redesign Plan

## Objectives
- Deliver a mobile-first dashboard that surfaces the same band-management pillars exposed by the API (users, bands, venues, events, setlists, song ideas, earnings).
- Keep the experience lightweight, resilient to missing Clerk state, and ready for progressive enhancement.
- Provide a foundation for integration testing (Playwright) that exercises authenticated navigation without creating real remote resources.

## Navigation & Layout
- **Shell**: Replace the starter hero with a responsive application shell featuring a sticky top bar (brand, account menu) and an adaptive navigation rail.
  - Mobile ≤768px: compress navigation into a bottom tab bar with icons + labels.
  - Desktop ≥769px: render a left rail with sections: Overview, Events, Setlists, Song Ideas, Venues, Earnings, Settings.
- **Main content**: Use scrollable main column with section cards. Each section should gracefully degrade when backend data is empty.
- **Theme**: Tailwind + shadcn-inspired cards, using neutral background, elevated cards, accent color pulled from Tailwind `indigo` scale for action buttons.

## Data Surface Areas
- **Overview dashboard** (default `/`):
  - Current user profile summary (`GET /v1/users/me`).
  - Primary band list with quick actions (create band, view details).
  - Upcoming events list (nearest three results of `GET /v1/bands/:id/events`).
  - Recent song ideas and outstanding earnings snapshots.
- **Events view**: grouped by band, sorted by start date, includes venue chip.
- **Setlists view**: list of setlists with song counts and quick link to attached events.
- **Song ideas view**: Kanban-like status columns (`DRAFT`, `SHARED`, `ARCHIVED`) but rendered as stacked accordions for mobile.
- **Venues view**: table/card hybrid listing location metadata.
- **Earnings view**: total summary and detailed list with splits.

## Data Access Strategy
- Centralize API calls in a new `apps/web/lib/apiClient.ts` exporting typed helpers per domain (e.g., `fetchBands`, `createBand`).
- Fetch data client-side after Clerk auth becomes available; show skeleton loaders while pending.
- Cache band id in context (`BandContext`) to avoid repeated selection prompts across sections.
- Provide optimistic UI for creations (band, venue, idea) while ensuring errors roll back gracefully.

## State Management & Hooks
- Introduce `useBands` hook that manages list + active band selection.
- Additional hooks: `useEvents`, `useSetlists`, `useSongIdeas`, `useVenues`, `useEarnings`. Each handles loading, error, refetch, and derived summaries.
- Reuse `useApi` for authenticated fetches; extend it with `apiAuthedJson` to auto-handle JSON response + error boundaries.
- Implement `<RequireAuth>` component that encapsulates `SignedIn`/`SignedOut` branch with a uniform call-to-action.

## Component Inventory
- `components/layout/AppShell.tsx`: orchestrates header, nav, content.
- `components/layout/BottomNav.tsx` + `SideNav.tsx`: responsive navigation.
- `components/common/Card.tsx`, `DataState.tsx` (loading/empty/error states), `Badge`, `Chip` components for reusability.
- Domain components: `BandsPanel`, `EventsPanel`, `SetlistsPanel`, `SongIdeasPanel`, `VenuesPanel`, `EarningsPanel`.
- Form dialogs (modal sheets on mobile) leveraging `react-hook-form` for create operations (Band, Venue, Song Idea, Setlist).

## Accessibility & Responsiveness
- Support keyboard navigation across nav items, modals focus-trapped.
- Ensure color contrast (minimum AA) for text + icon buttons.
- Cards collapse into accordions on small screens; use CSS grid for desktop multi-column layout.
- Provide aria-live regions for async operation toasts (success/error).

## Testing Strategy
- Add Playwright project under `apps/web` with tests covering:
  1. Auth gate renders sign-in prompt when Clerk session missing (use MSW-style mock or bypass by injecting test token).
  2. Authenticated dashboard smoke test: stub API responses via Playwright routing and validate that Overview renders expected counts.
  3. Interaction test for creating a band: intercept `POST /v1/bands`, return fixture, confirm UI updates.
  4. Navigation test: ensure switching tabs updates visible panel.
- Tests run headless (`--headed=false`) and rely on network mocking to avoid hitting real Clerk or backend.

## Tooling & Productivity
- Add `pnpm --filter web run dev` and `pnpm --filter web run test:e2e` tasks documented in README.
- Provide MSW handlers (node + browser) for Playwright to reuse fixtures.
- Update Copilot instructions with new workflow summary (App shell, Playwright, in-memory API mocks).

## Rollout Steps
1. Build layout + navigation scaffolding.
2. Implement domain panels incrementally, starting with overview (user + band data), then events, setlists, song ideas, venues, earnings.
3. Wire create actions (band, venue, idea) with optimistic updates.
4. Layer in reusable loading/empty/error states.
5. Configure Playwright with fixtures + network mocks using `setup` file.
6. Document integration testing commands and environment expectations in README and Copilot instructions.
