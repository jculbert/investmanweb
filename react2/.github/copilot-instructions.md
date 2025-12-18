# Investment Manager - AI Agent Instructions

## Project Overview

This is a React + TypeScript + Vite web application for managing and displaying investment accounts. The app fetches account data from a REST API and displays accounts grouped by owner with currency indicators.

**Architecture Pattern:** Frontend (React/Vite) + Backend (Express/Node) with REST API communication.

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite 7
- **Backend:** Express.js with CORS support
- **Build:** TypeScript compiler + Vite
- **Package Manager:** npm

## Project Structure & Key Files

```
src/
  components/AccountList.tsx    # Main table component - fetches & displays accounts
  services/accountService.ts    # API layer - fetchAccounts() function
  types/Account.ts              # TypeScript interface for Account { name, currency }
  App.tsx                       # Root component, renders AccountList
  App.css                       # Header styling (gradient background)
server.js                       # Express backend - serves GET /api/accounts
package.json                    # Scripts: dev, server, dev:all
```

## Critical Workflows & Commands

### Local Development

**Start everything (recommended):**
```bash
npm run dev:all
```
Runs Vite frontend (http://localhost:5173) and Express backend (http://localhost:3001) concurrently.

**Troubleshooting:** If one fails, run separately:
- `npm run dev` - Vite frontend only
- `npm run server` - Express backend only (requires separate terminal)

### Testing & Validation

```bash
npm run lint          # ESLint - checks for code issues
npm run build         # TypeScript + Vite build
npm run preview       # Test production build locally
```

## Project-Specific Conventions

### Data Flow

1. **AccountList component** calls `fetchAccounts()` on mount (useEffect)
2. **accountService** calls `http://localhost:3001/api/accounts`
3. **server.js** returns hardcoded account array
4. Component groups accounts by owner name (first word: "Barb", "Jeff")

### Component Pattern

- Functional components with hooks (useState, useEffect)
- Async data fetching with try/catch error handling
- Loading/error states rendered conditionally
- CSS Modules/inline styling for component styles

### API Design

- REST endpoint: `GET /api/accounts`
- Returns: Array of `{ name: string, currency: string }`
- Error handling: 404/500 responses logged to console
- CORS enabled for localhost:5173

## Integration Points

### Frontend → Backend

- **Service:** `src/services/accountService.ts`
- **Function:** `fetchAccounts()` - uses native `fetch()` API
- **Endpoint:** `http://localhost:3001/api/accounts`
- **Error:** Throws error if response not OK, caught by component

### Backend → Data

- **File:** `server.js` line 7-25
- **Modification:** Edit `accounts` array to change data
- **Restart required:** Yes, server must restart

## Common Tasks

### Adding a New Account

Edit `server.js` accounts array:
```javascript
{ "name": "John RRSP", "currency": "CA" }
```
Restart server with `npm run server`.

### Modifying Table Display

Edit `AccountList.tsx`:
- Column headers: lines 42-49 (thead)
- Row rendering: lines 50-58 (tbody)
- Owner grouping logic: lines 28-36

### Styling Changes

- Header: `src/App.css` (gradient background)
- Table: `src/components/AccountList.css` (comprehensive table styling)
- Color scheme: CA = green (#2e7d32), US = blue (#0066cc)

### Adding New API Endpoint

1. Add route in `server.js` (Express syntax)
2. Create service function in `src/services/accountService.ts`
3. Call from component and handle state

## Known Constraints & Gotchas

1. **Hardcoded API URL:** `http://localhost:3001` in `accountService.ts` - won't work in production
2. **CORS:** Backend has CORS enabled for all origins (dev-only, restrict in production)
3. **Mock Data:** Account data is hardcoded in server.js - replace with database for production
4. **No Persistence:** No data modifications supported (no POST/PUT/DELETE endpoints)

## Debugging Tips

- **App shows "Loading..." forever:** Check that `npm run server` is running
- **CORS errors:** Ensure backend runs on port 3001 and CORS middleware is active
- **TypeScript errors:** Run `npm run build` to see full type issues
- **Stale data:** Browser cache or check Network tab - API always returns fresh data

## Performance Considerations

- Accounts array is small (17 items) - no pagination needed
- Component groups accounts in-memory (fast for this dataset)
- No caching - fetches on every mount
- No optimizations needed unless dataset grows >1000 items

## Testing Strategy

Manual testing workflow:
1. Start app: `npm run dev:all`
2. Open http://localhost:5173
3. Verify accounts display grouped by owner
4. Check currency colors (green/blue)
5. Verify loading/error states (stop server to test)

## Future Enhancement Ideas

- Filter/search by account name or owner
- Sort by currency or account type
- Add account details modal
- Connect to real database
- Authentication/authorization
- Balance/holdings display
- Transaction history
