# Contributing

This project is intentionally small, but we still follow production-minded practices.

## Development Setup

```bash
cp .env.example .env.local
pnpm install
pnpm check
pnpm dev
```

## Workflow

- Create focused branches for each task
- Keep changes scoped to one concern (feature, fix, docs, refactor)
- Update docs when behavior or setup changes
- Run `pnpm check` before committing
- Run `pnpm lint` when changing application code

## Commit Message Style

Use clear, conventional prefixes:

- `feat:` new user-facing functionality
- `fix:` bug fixes or reliability improvements
- `docs:` documentation-only changes
- `refactor:` internal restructuring without behavior change
- `chore:` maintenance/tooling updates

Examples:

- `fix: allow local dev auth without Google OAuth env vars`
- `docs: add setup and health-check workflow`

## Pull Requests

- Explain what changed and why
- Include setup/env notes if relevant
- Call out any follow-up work or known limitations
