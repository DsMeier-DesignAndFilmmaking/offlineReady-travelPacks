# File Governance Rules

## Canonical File Formats

- Build config: `vite.config.ts`
- App bootstrap: `src/main.tsx`
- Service worker source: `src/sw.ts`
- TypeScript app config: `tsconfig.app.json`

## Prohibited Duplicates

- Do not add `vite.config.js`, `vite.config.mjs`, or `vite.config.cjs`.
- Do not add `src/main.js` or `src/main.jsx`.
- Do not add `src/sw.js` or `public/sw.js` when `src/sw.ts` is canonical.

## Enforcement

- `npm run guardrails` executes `scripts/enforce-single-config-format.mjs`.
- `npm run build` runs guardrails before TypeScript and Vite build steps.
- CI should fail immediately on guardrail violations.

## Team Rule

When introducing new project-level config files, define one canonical extension and explicitly block alternates in the guardrail script in the same PR.
