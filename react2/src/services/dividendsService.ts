import type { DividendItem, SymbolDividendsResponse } from '../types/DividendItem';

const API_BASE_URL = '/api/v1/dividends/';

type DividendsQuery = {
  summary: boolean;
  startdate: string;
  enddate: string;
};

function buildQuery(params: DividendsQuery): string {
  const search = new URLSearchParams({
    summary: String(params.summary),
    startdate: params.startdate,
    enddate: params.enddate,
  });
  return search.toString();
}

export async function fetchDividendsSummary(startdate: string, enddate: string): Promise<DividendItem[]> {
  try {
    const url = `${API_BASE_URL}?${buildQuery({ summary: true, startdate, enddate })}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch dividends summary:', error);
    throw error;
  }
}

export async function fetchDividendsBySymbol(symbol: string): Promise<SymbolDividendsResponse> {
  try {
    const query = new URLSearchParams({ symbol });
    const url = `${API_BASE_URL}?${query.toString()}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch dividends for symbol:', error);
    throw error;
  }
}
