# Quick Start Guide

## What Was Created

A complete React + Express investment account management application with:
- ✅ React 19 frontend with TypeScript
- ✅ Express backend with account API
- ✅ Responsive UI with account grouping by owner
- ✅ Currency indicators (CA = green, US = blue)
- ✅ All dependencies installed and configured
- ✅ Build verified and working

## Project Status

- **Build:** ✅ Successful (no errors)
- **Backend:** ✅ Running on http://localhost:3001
- **API Test:** ✅ Returns 17 accounts
- **Documentation:** ✅ Complete (README.md + copilot-instructions.md)

## To Start Development

### Quick Start (Both frontend + backend):
```bash
npm run dev:all
```

Then open: **http://localhost:5173**

### Manual Start (if needed):

Terminal 1:
```bash
npm run dev
```

Terminal 2 (separate terminal):
```bash
npm run server
```

## Key Files to Know

| File | Purpose |
|------|---------|
| `src/components/AccountList.tsx` | Main table component - displays accounts |
| `src/services/accountService.ts` | Fetches data from API |
| `server.js` | Express backend - serves account data |
| `.github/copilot-instructions.md` | AI agent guidelines for this project |

## Common Commands

```bash
npm run dev           # Frontend only (Vite)
npm run server        # Backend only (Express)
npm run dev:all       # Both frontend + backend
npm run build         # Build for production
npm run lint          # Check code quality
npm run preview       # Preview production build
```

## What Next?

1. Run `npm run dev:all` to start the app
2. Open http://localhost:5173 in your browser
3. You should see accounts grouped by owner (Barb, Jeff)
4. Modify account data in `server.js` lines 7-25 and restart

## Useful Links

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001/api/accounts
- React Docs: https://react.dev
- Vite Docs: https://vite.dev
- Express Docs: https://expressjs.com
