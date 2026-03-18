# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Start both frontend and backend together
npm run dev

# Start frontend only (Vite on port 5173)
npm run dev:frontend

# Start backend only (Flask on port 5001)
npm run dev:server

# Type-check and build for production
npm run build

# Lint
npm run lint

# Python venv setup (one-time)
python -m venv server/.venv
source server/.venv/bin/activate
pip install -r server/requirements.txt
```

## Architecture

Full-stack app: React 19 + TypeScript frontend served by Vite, with a Flask (Python) REST API backend.

- **Frontend** (`src/`): React 19, TypeScript, Vite 8. Entry point is `src/main.tsx` → `src/App.tsx`.
- **Backend** (`server/`): Flask app in `server/app.py`. Python venv lives at `server/.venv/`. API routes are prefixed with `/api/`.
- **Dev proxy**: Vite proxies all `/api/*` requests to `http://localhost:5001` (configured in `vite.config.ts`). Flask runs on port 5001 (port 5000 is taken by macOS AirPlay).
- **Process orchestration**: `npm run dev` uses `concurrently` to run Vite and Flask in one terminal.

## UI Rules

All UI must use **shadcn-ui**. Do not create custom components when a shadcn-ui component exists.

## Spec-Driven Workflow

Feature specs live in `_specs/`. Use the `/spec` slash command to generate a new spec from a short idea — it creates a branch (`claude/feature/<slug>`) and a spec file from the template at `_specs/template.md`. The spec should be used in Plan mode before implementation.

Key spec files:
- `_specs/tech_spec.md` — current technology stack
- `_specs/temp_assumptions.md` — temporary assumptions for current iteration
