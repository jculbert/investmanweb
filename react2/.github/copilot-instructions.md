# Investment Manager — AI agent quick guide

## Purpose

Frontend-only React + TypeScript (Vite) app that renders holdings, uploads, symbols and transactions. There is no bundled backend here — the app calls a REST API under `/api/v1/*`. The Vite dev proxy is used in development to forward `/api` requests to a backend service.

## Quick commands

- `npm run dev` — starts Vite dev server (default: http://localhost:5173)
- `npm run build` — runs `tsc -b` then `vite build`
- `npm run lint` — runs `eslint .`
- `npm run preview` — preview production build

See `package.json` scripts for exact behavior.

## Key architecture notes

- Single-page React app. Top-level routing/tab UI: [src/App.tsx](src/App.tsx#L1).
- Main feature area: `Holdings` component coordinates accounts, holdings and transactions: [src/components/Holdings.tsx](src/components/Holdings.tsx#L1).
- Presentation components live under `src/components/` (e.g., `HoldingsTable`, `AllHoldingsTable`, `TransactionList`, `TransactionEditor`, `Uploads`).
- Services in `src/services/` perform all network I/O. Types live in `src/types/` and are authoritative for payload shapes.

## Dev proxy / backend

- Proxy config: [vite.config.ts](vite.config.ts#L1). Dev proxy forwards `/api` to the configured backend (example target currently `http://localhost/investmanbackend`). Update `server.proxy['/api'].target` to your running backend (commonly `http://localhost:3001`).
- Services expect relative URLs such as `/api/v1/holdings/` so auth/CORS are handled by proxy in dev.

## Service conventions (concrete)

- All services use native `fetch`. On non-OK responses they throw an Error (callers use try/catch). Example: `src/services/holdingsService.ts`.
- Endpoints consistently use trailing slashes and DRF-style patterns, e.g.:
	- `GET /api/v1/accounts/` — fetch account list (`fetchAccounts`)
	- `GET /api/v1/holdings/?account=AccountName` — fetch holdings for an account (`fetchHoldingsByAccount`)
	- `POST /api/v1/uploads/` — file upload using `FormData` (`uploadFile` in `uploadsService.ts`)
	- `POST /api/v1/transactions/` and `PUT /api/v1/transactions/{id}/` — create/update transactions (`transactionsService.ts`)
- When changing API shapes: update `src/services/*` first, then update callers and types in `src/types/*`.

## Component patterns and expectations

- Components are functional and hook-based. Local UI state (loading/error flags, editing buffers) is used extensively (see `Holdings.tsx` for examples of optimistic UI flows and edit buffers).
- Error and loading UI are simple strings or small placeholders rendered inline — preserve those shapes when adding features so callers can display messages consistently.
- Pass event handlers down into presentation-only components (e.g., `onOpenTransactions` on `HoldingsTable`).

## Files to open first (practical entry points)

- [src/App.tsx](src/App.tsx#L1) — app shell and tab logic
- [src/components/Holdings.tsx](src/components/Holdings.tsx#L1) — main orchestration for accounts/transactions
- [src/services/holdingsService.ts](src/services/holdingsService.ts#L1) and [src/services/holdingsDetailService.ts](src/services/holdingsDetailService.ts#L1) — network call examples
- [src/services/transactionsService.ts](src/services/transactionsService.ts#L1) — create/update/delete patterns
- [src/services/uploadsService.ts](src/services/uploadsService.ts#L1) — file upload via `FormData`
- [src/types](src/types) — canonical TypeScript interfaces used across components

## Integration notes / gotchas discovered in code

- There is no local backend in this repo. Expect to run or configure a backend that exposes `/api/v1/*` endpoints, or update `vite.config.ts` proxy to a test stub.
- The proxy in `vite.config.ts` currently targets `http://localhost/investmanbackend` and rewrites `/api` to `/api`. Change this to the host/port where your backend is reachable (e.g., `http://localhost:3001`).
- Services throw on non-OK responses. UI components rely on thrown errors to drive error messages; do not change this global behavior without updating all callers.

## When you edit code

- Start with the relevant service in `src/services/` when backend shape changes.
- Update or add types in `src/types/` and then update components that consume them.
- Run `npm run dev` to test UI against your backend (ensure proxy target is correct).

## If you want me to add more

Tell me whether you want any of the following added to this file:
- Minimal backend stub (Express) and dev:all script to run both frontend and backend concurrently.
- Docker-compose example wiring backend + frontend proxy.
- Example tests or a small test harness for service functions.

If anything below is unclear or missing, tell me which area to expand.
