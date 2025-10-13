# ChordLine

An app to revolutionize the experience of local live musicians.

## Local Testing

### Setup

Run from WSL -

cd chordline supabase start
npm run dev

## Generation Initial Command

Using Vite + TanStack + TailwindCSS

npx gitpick TanStack/router/tree/main/examples/react/start-supabase-basic start-supabase-basic
cd chordline
npm install
npm run dev

Sources

- <https://tanstack.com/start/latest/docs/framework/react/quick-start>
- <https://github.com/TanStack/router/tree/main/examples/react/start-supabase-basic>

## Tools Used

- TanStack
- ShadCN UI
- React
- Supabase DB + Supabase Edge Functions
- Hono
- Vite
- TailwindCSS

## Learnings

- Do not use a LLM to startup a project, use the tool's docs.
- You can use a LLM to pick the frameworks, but then use their pages for startup procedures.

## Common Errors

### Error: Cannot find module @rollup/rollup-win32-x64-msvc

Fixes locally but fails github pages: npm install @rollup/rollup-win32-x64-msvc

Run npm install @rollup/rollup-win32-x64-msvc locally but then remove from package.json
