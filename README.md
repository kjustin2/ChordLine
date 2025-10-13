# ChordLine

An app to revolutionize the experience of local live musicians.

## Local Development

### Setup

```bash
cd chordline

supabase start  # Start local Supabase
npm run dev
```

## Generation Initial Command

npx gitpick TanStack/router/tree/main/examples/react/start-supabase-basic start-supabase-basic
cd chordline
npm install
npm run dev

Sources

- <https://tanstack.com/start/latest/docs/framework/react/quick-start>
- <https://github.com/TanStack/router/tree/main/examples/react/start-supabase-basic>
- <https://supabase.com/docs/guides/local-development/cli/getting-started?queryGroups=platform&platform=windows>
- <https://docs.deno.com/runtime/getting_started/installation/>

## Tools

- TanStack Start
- Vite
- TailwindCSS
- GitHub Pages
- Supabase
- ShadCN
- Hono
- Deno

## Learnings

- Do not use a LLM to startup a project, use the tool's docs.
- You can use a LLM to pick the frameworks, but then use their pages for startup procedures.

## Common Errors

### Error: Cannot find module @rollup/rollup-win32-x64-msvc

Run: npm install @rollup/rollup-win32-x64-msvc
