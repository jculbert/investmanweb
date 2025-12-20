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

export async function updateTransaction(transaction: TransactionItem): Promise<TransactionItem> {
  try {
    // Assuming the API supports PUT to /api/v1/transactions/{id}/
    const url = `${API_BASE_URL}${encodeURIComponent(String(transaction.id))}/`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transaction),
    });
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to update transaction:', error);
    throw error;
  }
}

export async function createTransaction(transaction: TransactionItem): Promise<TransactionItem> {
  try {
    const url = API_BASE_URL; // POST to base endpoint
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transaction),
    });
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to create transaction:', error);
    throw error;
  }
}
