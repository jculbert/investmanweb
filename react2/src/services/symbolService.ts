import type { SymbolItem } from '../types/SymbolItem';

// Use a relative path so the dev server can proxy requests and avoid CORS.
const API_URL = '/api/v1/symbols/';

export async function fetchSymbols(): Promise<SymbolItem[]> {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch symbols:', err);
    throw err;
  }
}
