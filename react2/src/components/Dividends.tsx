import { useEffect, useMemo, useState } from 'react';
import type { DividendItem } from '../types/DividendItem';
import { fetchDividendsSummary } from '../services/dividendsService';
import './Dividends.css';

const DEFAULT_START = '2025-10-01';
const DEFAULT_END = '2025-12-31';

function toCompactDate(dateValue: string): string {
  return dateValue.replace(/-/g, '');
}

function formatAmount(value: number | null): string {
  if (value === null) return '-';
  return value.toFixed(2);
}

export default function Dividends() {
  const [startDate, setStartDate] = useState<string>(DEFAULT_START);
  const [endDate, setEndDate] = useState<string>(DEFAULT_END);
  const [dividends, setDividends] = useState<DividendItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCompact = useMemo(() => (startDate ? toCompactDate(startDate) : ''), [startDate]);
  const endCompact = useMemo(() => (endDate ? toCompactDate(endDate) : ''), [endDate]);

  useEffect(() => {
    if (!startCompact || !endCompact) {
      setDividends([]);
      setError('Select both start and end dates.');
      return;
    }

    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchDividendsSummary(startCompact, endCompact);
        setDividends(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dividends');
        setDividends([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [startCompact, endCompact]);

  return (
    <div className="dividends-view">
      <h2>Dividends</h2>
      <div className="dividends-controls">
        <label className="date-control">
          <span>Start date</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>
        <label className="date-control">
          <span>End date</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </label>
      </div>

      {loading ? (
        <div className="loading-msg">Loading dividends...</div>
      ) : error ? (
        <div className="error-msg">Error: {error}</div>
      ) : (
        <table className="dividends-table">
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Amount</th>
              <th>US Amount</th>
            </tr>
          </thead>
          <tbody>
            {dividends.length === 0 ? (
              <tr>
                <td colSpan={3} className="empty-cell">No dividends found.</td>
              </tr>
            ) : (
              dividends.map((row) => (
                <tr key={row.symbol}>
                  <td className="symbol-cell">{row.symbol}</td>
                  <td>{formatAmount(row.amount)}</td>
                  <td>{formatAmount(row.us_amount)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
