import type { TransactionItem } from '../types/TransactionItem';

// Use relative path so Vite proxy handles CORS in dev.
const API_BASE_URL = '/api/v1/transactions/';

export async function fetchTransactionsByAccountAndSymbol(
  accountName: string,
  symbolName: string
): Promise<TransactionItem[]> {
  try {
    const url = `${API_BASE_URL}?account=${encodeURIComponent(accountName)}&symbol=${encodeURIComponent(symbolName)}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch transactions:', error);
    throw error;
  }
}
