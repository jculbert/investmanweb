# Investment Manager

A React + TypeScript + Vite application for managing and viewing investment accounts across different owners and currencies.

## Features

- Display investment accounts grouped by owner
- Support for multiple currencies (CA, US)
- REST API integration for account data
- Responsive design with modern UI
- TypeScript support for type safety

## Project Structure

```
src/
├── components/          # React components
│   └── AccountList.tsx # Main account display component
├── services/           # API services
│   └── accountService.ts # Account data fetching
├── types/             # TypeScript type definitions
│   └── Account.ts     # Account interface
├── App.tsx            # Main app component
├── App.css            # App styles
└── main.tsx           # Entry point

server.js              # Express mock API server
```

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

```bash
npm install
```

### Running the Application

You have two options:

**Option 1: Run frontend and backend together**
```bash
npm run dev:all
```

**Option 2: Run them separately**

Terminal 1 (Frontend - Vite dev server):
```bash
npm run dev
```

Terminal 2 (Backend - Express API):
```bash
npm run server
```

The frontend will be available at `http://localhost:5173`
The backend will be available at `http://localhost:3001`

## Available Scripts

- `npm run dev` - Start Vite development server
- `npm run server` - Start Express backend server
- `npm run dev:all` - Run both frontend and backend concurrently
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## API Endpoints

### GET /api/accounts

Returns an array of all investment accounts.

**Response:**
```json
[
  { "name": "Barb LIRA", "currency": "CA" },
  { "name": "Barb LIRA US", "currency": "US" },
  ...
]
```

### GET /health

Health check endpoint.

## Architecture

### Frontend

- **React 19**: UI framework
- **Vite**: Fast build tool and dev server
- **TypeScript**: Type safety
- **Fetch API**: REST communication

### Backend

- **Express**: Simple HTTP server
- **CORS**: Cross-origin resource sharing

## Component Details

### AccountList Component

Fetches accounts from the API and displays them in a table format, grouped by account owner. Includes:
- Loading state
- Error handling
- Responsive styling
- Color-coded currency indicators

## Development Workflow

1. Start both servers: `npm run dev:all`
2. Open browser to `http://localhost:5173`
3. Make changes to React components - HMR will update automatically
4. API changes require manual restart of server

## Building for Production

```bash
npm run build
npm run preview
```

      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
