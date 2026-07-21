<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# CodeArea project guide

## Project memory

Read `MEMORY.md` before making changes. It records the compact current-state
handoff, unresolved architecture conflict, development workflow, and known risks.
`AGENTS.md` remains authoritative when the two files differ.

## Canonical modules

- `server/problems`: Markdown drafts, immutable Problem Revisions, publishing, and learner-safe projections.
- `server/executor`: execution seam; Piston is the only adapter.
- `server/chatbot`: AI Tutor retrieval, Ollama adapter, indexing worker, and typed SSE events.
- `utils/executor`: independently deployed Windows Piston utility.
- `utils/chatbot`: independently deployed Windows Ollama utility.

Use `Problem` and `Problem Revision` in new interfaces. Do not introduce legacy `question`, PDF ingestion, browser-configurable service URLs, hidden tests, canonical solutions, or staff notes into chatbot context.

## Initialize and verify

```bash
cp .env.example .env
git submodule update --init --recursive
cp utils/chatbot/.env.example utils/chatbot/.env
npm ci
npm run check
docker compose config --quiet
docker compose -f utils/executor/docker-compose.yaml config --quiet
docker compose -f utils/chatbot/docker-compose.yml config --quiet
```

The application stack is `postgres`, `web`, and `worker`. `utils/executor` is vendored so it can be maintained with CodeArea; `utils/chatbot` remains an independently versioned submodule. Both have separate lifecycles and must not be added back to the root Compose project. The root chatbot adapter calls the Ollama API directly through `OLLAMA_URL`.

## Change discipline

- Keep Route Handlers as thin HTTP adapters over server modules.
- Authentication uses PostgreSQL-backed HttpOnly cookies; never restore browser bearer tokens.
- Publishing and index-job creation stay atomic and idempotent.
- Run `npm run check` and `git diff --check` before handoff.
- Do not commit or push unless the user explicitly asks.
