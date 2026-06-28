# Repository Guide

This repo runs a Cloudflare Worker that mirrors LTA DataMall train-service
alerts to Mastodon. Treat the docs in `docs/` as the source of truth for how to
change the system.

## Start Here

- Read `README.md` for setup, deployment, and the current project structure.
- Read `docs/architecture.md` before changing the Worker flow, KV schema,
  external clients, or alert de-duplication behavior.
- Read `docs/quality.md` before changing tests, validation, or release checks.
- Use `docs/exec-plans/active/` for multi-step work that changes behavior or
  infrastructure. Move completed plans to `docs/exec-plans/completed/`.

## Commands

- `npm install` installs dependencies.
- `npm run dev` starts Wrangler with scheduled-event support.
- `npm run dev:invoke` triggers the local scheduled handler.
- `npm run typegen` regenerates Cloudflare Worker environment types.
- `npm run check` runs the local validation gate.

## Change Rules

- Keep secrets out of git. Use `.dev.vars` locally and Wrangler secrets in
  production.
- Preserve idempotency: repeated polls must not repost the same alert.
- Do not change the persisted KV shape without documenting the migration in an
  active execution plan.
- Keep DataMall response handling tolerant of missing `AffectedSegments`.
- Prefer small, reviewable changes with docs updated in the same patch.

## Commits

- Use Conventional Commits style for commit subjects, such as `docs: add agent
  guide` or `fix: avoid duplicate alert posts`.
- Agents must include a `Co-Authored-By` trailer in commits they create.
