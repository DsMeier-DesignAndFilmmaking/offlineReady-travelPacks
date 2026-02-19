# Offline Ready Travel Packs

Offline-first Vite + React app scaffold for city-specific travel packs that can launch offline from home screen on first open.

## Quick start

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Build includes config guardrails to prevent duplicate file format drift.

## Project docs

- `docs/ARCHITECTURE.md`
- `docs/CONTENT_STRATEGY.md`
- `docs/FILE_GOVERNANCE.md`
- `docs/SOURCES.md`

## Core routes

- `/` online city catalog
- `/city/:slug` city pack detail and offline save controls
- `/launch` offline home-screen entry route
