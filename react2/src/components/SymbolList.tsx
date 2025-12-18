import { useEffect, useState } from 'react';
import type { SymbolItem } from '../types/SymbolItem';
import { fetchSymbols } from '../services/symbolService';
import './SymbolList.css';

export function SymbolList() {
  const [symbols, setSymbols] = useState<SymbolItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchSymbols();
        setSymbols(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load symbols');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="symbol-list loading">Loading symbols...</div>;
  if (error) return <div className="symbol-list error">Error: {error}</div>;

  return (
    <div className="symbol-list">
      <h2>Symbols</h2>
      <table>
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Last Price</th>
            <th>Last Price Date</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {symbols.map((s) => (
            <tr key={s.name}>
              <td className="symbol-name">{s.name}</td>
              <td>{s.last_price != null ? s.last_price.toFixed(2) : '-'}</td>
              <td>{s.last_price_date ?? '-'}</td>
              <td className="symbol-desc">{s.description ?? '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default SymbolList;
