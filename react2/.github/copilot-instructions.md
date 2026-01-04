# Investment Manager - AI Agent Instructions

## Project Overview

This is a React + TypeScript + Vite web application for managing and displaying investment accounts. The app fetches account data from a REST API and displays accounts grouped by owner with currency indicators.

**Architecture Pattern:** Frontend (React/Vite) + Backend (Express/Node) with REST API communication.
# Investment Manager — AI agent quick guide

This repo is a frontend React + TypeScript app (Vite) that renders holdings, uploads, symbols and transactions. There is no bundled backend in this workspace; services call a backend under `/api/v1/*` and the Vite dev proxy is expected to forward those requests.

Keep guidance concise and actionable for code edits, feature work, or debugging.

Key commands

- Start dev server: `npm run dev` (Vite, default: http://localhost:5173)
- Build: `npm run build` (runs `tsc -b` then `vite build`)
- Lint: `npm run lint`
- Preview production build: `npm run preview`

API & proxy expectations

- Services use relative endpoints like `/api/v1/holdings/` and `/api/v1/uploads/` (see `src/services/*`).
- Configure or run a backend that exposes the `/api/v1/*` endpoints. Dev proxy is in `vite.config.ts` under `server.proxy` — update `target` to point at your backend host.

Primary files & patterns (what to open first)

- Entry + app layout: [src/App.tsx](src/App.tsx#L1)
- Main feature: `src/components/Holdings.tsx` — orchestrates accounts, holdings, transactions and uses services.
- Table components: `src/components/HoldingsTable.tsx`, `src/components/AllHoldingsTable.tsx` (presentation only)
- Transactions editor/list: `src/components/TransactionEditor.tsx`, `src/components/TransactionList.tsx`
- Uploads UI: `src/components/Uploads.tsx`, `src/components/UploadDetails.tsx`
- Services: `src/services/*.ts` — `holdingsService.ts`, `holdingsDetailService.ts`, `transactionsService.ts`, `symbolService.ts`, `uploadsService.ts`.
- Types: `src/types/*.ts` define the shape of `HoldingItem`, `TransactionItem`, `Upload`, `SymbolItem`, `Account`.

Service conventions (important)

- All service functions use native `fetch` and throw an Error when `response.ok` is false. Callers expect rejected promises and handle errors with try/catch.
- API URLs are relative (e.g. `const API_URL = '/api/v1/holdings/'`) so tests/dev rely on Vite proxy or a mounted backend.
- CRUD endpoints follow Django/DRF-style trailing-slash patterns (e.g. `GET /api/v1/uploads/`, `PUT /api/v1/uploads/{id}/`).

Component conventions

- Functional components with React hooks (`useState`, `useEffect`) and local UI state.
- Loading / error strings are rendered inline — preserve or reuse existing `loading` and `error` state shapes when adding features.
- Pass handler callbacks down to presentation components (e.g., `onOpenTransactions` on `HoldingsTable`).

When adding features or backend changes

- Update `src/services/*` first with the exact endpoint and response shape.
- Adjust `vite.config.ts` proxy during local development to point to your backend host.
- Preserve type definitions in `src/types/*` and update callers when changing shapes.

Quick examples

- To fetch holdings for an account: use `fetchHoldingsByAccount(accountName)` (see `src/services/holdingsDetailService.ts`).
- To update a transaction: use `updateTransaction(transaction)` which PUTs to `/api/v1/transactions/{id}/`.

Notes & gotchas

- There is no `dev:all` script or included Express server here — earlier templates referenced an Express backend; check repo deps but assume backend runs separately.
- Proxy target in `vite.config.ts` may point to an internal host; update it to `http://localhost:3001` (or your backend) for local testing.

If anything in this guide is unclear or you'd like me to include more examples (e.g., a small backend stub or a docker-compose for the API), tell me which part to expand.
- CSS Modules/inline styling for component styles
