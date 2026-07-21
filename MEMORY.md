# CodeArea Project Memory

Last compacted: 2026-07-21

This file is a concise handoff for agents working in this checkout. Read `AGENTS.md`
first because its rules are authoritative, then use this file for current context,
decisions, risks, and verified commands. Never copy secrets from `.env` into this
file.

## Current checkout

- The active branch is `development`.
- At the time of this snapshot, `development` is three commits ahead of
  `origin/development`:
  - `80af235` — separate development and production setup documentation.
  - `ee5436d` — move the application to Supabase.
  - `03e374b` — simplify Supabase development setup.
- Always inspect the live status and diff before editing; preserve unrelated or
  user-owned work already present in the checkout.
- Do not commit or push unless the user explicitly asks.

## Architecture status

The committed branch and the canonical project guide currently disagree. Do not
silently choose one architecture during implementation; show the conflict to the
user when a change depends on it.

| Area | Current `development` implementation | Canonical direction in `AGENTS.md` and prior decisions |
| --- | --- | --- |
| Application | One full-stack Next.js process | Next.js web process in a self-hosted Compose stack |
| Database | Hosted Supabase PostgreSQL with pgvector | Local PostgreSQL with pgvector |
| Authentication | Supabase Auth with SSR cookies | Application-owned PostgreSQL sessions in HttpOnly cookies |
| Index worker | Started inside `instrumentation.ts` | Independent Postgres-backed worker service |
| Root Compose | `web` only | `postgres`, `web`, and `worker` |

Stable choices on both sides of the conflict:

- Keep one full-stack Next.js application rather than restoring Express or FastAPI.
- Use `Problem` and immutable `Problem Revision` terminology.
- Problems are authored as Markdown; do not restore PDF or bucket ingestion.
- Piston is the only execution adapter and runs separately through `PISTON_URL`.
- Ollama runs separately through `OLLAMA_URL`; the root chatbot adapter calls it
  directly.
- Keep hidden tests, canonical solutions, and staff notes out of learner responses
  and AI Tutor context.

## Current technology

- Next.js 16.2, React 19, TypeScript, Tailwind CSS 4, and DaisyUI.
- The UI has light, dark, and system theme preferences implemented through
  `components/theme`, root CSS design tokens, and `data-theme` on the document.
- Drizzle ORM and versioned PostgreSQL migrations under `drizzle/`.
- Supabase PostgreSQL, pgvector, and Supabase Auth on the current branch.
- Markdown and `gray-matter` for Problem content.
- Piston for code execution.
- Ollama with typed SSE AI Tutor events and pgvector retrieval.
- Zod for runtime validation; Vitest, ESLint, and TypeScript for checks.
- `utils/executor` is vendored; `utils/chatbot` is a Git submodule with its own
  lifecycle.

## Module boundaries

- `app/api`: thin HTTP and SSE adapters only.
- `server/auth`: authentication and application-profile behavior.
- `server/problems`: drafts, immutable revisions, publishing, and learner-safe
  projections.
- `server/executor`: Piston adapter and language/version allowlist.
- `server/chatbot`: retrieval, Ollama adapter, indexing, and typed Tutor events.
- `server/db`: Drizzle schema and lazy database client.
- Publishing and index-job creation must remain atomic and idempotent.

Before writing Next.js code, read the relevant installed guide in
`node_modules/next/dist/docs/`; this repository uses a version with breaking API and
file-convention changes.

## Development workflow

Use Node.js 22 or newer even though the root package currently declares the looser
`>=18` engine. Installed Next.js requires Node.js `>=20.9.0`.

```bash
git submodule update --init --recursive
cp .env.example .env
cp utils/chatbot/.env.example utils/chatbot/.env
npm ci
npm run dev
```

The current `npm run dev` runs database migrations and deterministic seeds before
starting Next.js. It therefore mutates the configured database. Review pending
migrations and back up populated databases first.

`scripts/load-env.ts` loads `.env*` for migration and seed scripts through
`@next/env`. An exported shell variable overrides `.env`; clear a stale
`DATABASE_URL` before diagnosing credentials:

```bash
unset DATABASE_URL
npm run dev
```

Environment files are ignored and are not shared between Git worktrees. Configure
each worktree separately. Never expose the database password, Supabase credentials,
or utility hosts in logs or documentation.

## Administrator provisioning

There is no default administrator password. To promote an account:

1. Register or log in once so its application profile exists in `users`.
2. Set `ADMIN_EMAIL` in `.env` to the exact registered email.
3. Run `npm run db:seed`.
4. Log out and back in to refresh the role shown by the application.

The seed only promotes an existing matching profile; running it before the profile
exists has no effect.

## Known review findings

- `drizzle/0004_rainy_whizzer.sql` adds `users.auth_user_id` as `NOT NULL`
  without backfilling existing rows, then drops password/session data. It is unsafe
  for a populated database and needs a staged mapping migration before use.
- `instrumentation.ts` starts the index worker once per Next.js server instance.
  This couples worker lifecycle and scaling to the web runtime and conflicts with
  the documented independent worker.
- `app/api/users/[id]/change-password/route.ts` performs ownership authorization in
  the Route Handler instead of the domain module.
- `server/auth/module.ts` maps Supabase failures by matching provider message text;
  stable provider error codes are safer.

## Verification baseline

The following passed on 2026-07-21 before the current commit group:

- `npm run check`: passed; 10 Vitest tests passed and the production build passed.
- ESLint produced seven warnings and no errors.
- `git diff --check`: passed.
- Root, executor, and chatbot Compose configuration validation passed.

Re-run verification after any change:

```bash
npm run check
git diff --check
docker compose config --quiet
docker compose -f utils/executor/docker-compose.yaml config --quiet
docker compose -f utils/chatbot/docker-compose.yml config --quiet
```
