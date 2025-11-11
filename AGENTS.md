# Repository Guidelines

## Project Structure & Module Organization
Next.js routes live in `app/` (public dashboard, crop drill-downs, admin, API). Components sit in `components/`, shared utilities in `lib/`, server actions in `action/query` and `action/mutation`, and PhilSA-derived GeoJSON summaries reside in `data/`. Types belong in `types/`, global styles in `app/globals.css`, and assets stay in `public/`.

## Type Definitions
All reusable domain/data contracts must be declared inside `types/` using domain-specific `.d.ts` modules (e.g., `types/user.d.ts`, `types/crop.d.ts`). Components, actions, and utilities should import from these files instead of redefining shared shapes inline. Component-only props/interfaces can stay colocated, but anything reused across modules moves under `types/`.

## Reusable Functions
Utility or formatting helpers that are shared between modules must live under `lib/` in descriptive files (e.g., `lib/date.ts`, `lib/format.ts`). Components and actions should import these helpers instead of copying logic inline; only component-specific handlers stay colocated.

## Request Headers
When calling Better Auth server APIs (or any server-side helpers that expect session context), prefer `headers: await headers()` to forward the current request headers wholesale unless a call requires a narrower header set. This keeps requests aligned with Next.js streaming semantics and avoids dropped auth/session state.

## Action Layer Rules
Every API call, Better Auth operation, or database transaction must live in the `action/` folder. Reads belong in `action/query`, writes/mutations in `action/mutation`. UI components, hooks, or route handlers should import these server actions instead of talking to `fetch`, Drizzle, or external SDKs directly. Keep each action focused (one responsibility, clear naming) and colocate related types alongside the action for easy reuse.

## Rendering & Suspense
Maximize Partial Pre-Rendering (PPR) in the app directory: keep route components async, stream UI with `Suspense`, and provide lightweight skeletons/spinners wherever data loads asynchronously (dashboards, tables, cards, maps). If a section can hydrate independently, wrap it in `Suspense` with an explicit fallback component in `components/{feature}/skeleton.tsx` or inline fragments to keep above-the-fold paint fast.

## Data & Imagery Workflow
PhilSA converts Sentinel‑2 scenes into cloud-masked NDVI, soil-moisture, and yield indicators before handing off barangay aggregates. Commit lightweight CSV/JSON exports (e.g., `corn_areas.json`, `summary.json`) and note capture dates and preprocessing steps in each PR.

## PostGIS Ingestion
Any crop extent or indicator not yet defined inside `data/` must be ingested into PostGIS first. Enable spatial functions once per database with `psql $DATABASE_URL -c "CREATE EXTENSION IF NOT EXISTS postgis;"`, then load new drops via `ogr2ogr -f PostgreSQL PG:"$DATABASE_URL" data/corn.geojson -nln crops.corn_fields -nlt MULTIPOLYGON -overwrite` or `shp2pgsql -I -s 4326 data/onion.shp crops.onion_fields | psql $DATABASE_URL`. After import, mirror the dataset through Drizzle models or export refreshed JSON that `lib/crop-data.ts` consumes.

## Build, Test, and Development Commands
- `npm run dev` – Serve the dashboard on `http://localhost:3000`.
- `npm run build` / `npm run start` – Create and verify the production bundle.
- `npm run lint` – ESLint + Next rules; required pre-commit.
- `npm run auth:generate` → `npm run db:push` – Regenerate Better Auth handlers and push schema updates.
- `npm run db:studio` – Inspect Postgres/PostGIS tables during imports.

## Coding Style & Naming Conventions
Stick to strict TypeScript, 2-space indentation, PascalCase components/hooks, camelCase helpers, and `verbNoun` server actions. Use the `@/*` alias and resolve lint with `npm run lint` (or `npx eslint file --fix`) before pushing.

## UI Components
Prefer the existing Shadcn UI primitives (`@/components/ui/*`) when building or extending interface elements. Only introduce bespoke patterns when a Shadcn component cannot cover the use case, and align new pieces with the same design tokens/spacing system.

## Testing Guidelines
Automated tests are pending; rely on linting plus manual verification in `npm run dev`. When Jest/Vitest/Playwright arrive, colocate `*.test.tsx`, mock Drizzle/PostGIS calls, and cover empty layers, NDVI alerts, and auth gating.

## Commit & Pull Request Guidelines
Use `<type>: <imperative summary>` (e.g., `feat: add onion moisture alert`), keep commits atomic, and mention issue IDs plus migrations/import scripts. PRs should attach screenshots/GIFs, list Sentinel‑2 capture details, confirm `npm run lint` + schema steps, and link any SQL used for PostGIS loads.

## Security & Configuration Tips
Duplicate `.env.example`, populate `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `DATABASE_URL`, and admin seed values through a secrets manager, and keep `.env` ignored. Regenerate auth/Drizzle artifacts after schema changes, clear local caches containing satellite data, and avoid storing production credentials in shell history.
