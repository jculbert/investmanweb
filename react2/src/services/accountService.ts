import type { Account } from '../types/Account';

// Use relative path so Vite proxy handles CORS in dev.
const API_URL = '/api/v1/accounts/';

export async function fetchAccounts(): Promise<Account[]> {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch accounts:', error);
    throw error;
  }
}
