import type { HoldingItem } from '../types/HoldingItem';

const API_URL = '/api/v1/holdings/';

export async function fetchHoldingsByAccount(accountName: string): Promise<HoldingItem[]> {
  try {
    const url = `${API_URL}?account=${encodeURIComponent(accountName)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch holdings:', err);
    throw err;
  }
}
