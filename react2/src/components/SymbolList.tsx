import { useEffect, useState } from 'react';
import type { SymbolItem } from '../types/SymbolItem';
import { fetchSymbols } from '../services/symbolService';
import './SymbolList.css';

export function SymbolList() {
  const [symbols, setSymbols] = useState<SymbolItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState<SymbolItem | null>(null);

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

  // Show details view if a symbol is selected
  if (selectedSymbol) {
    return (
      <div className="symbol-list">
        <button className="back-btn" onClick={() => setSelectedSymbol(null)}>← Back</button>
        <div className="symbol-details">
          <h2>{selectedSymbol.name}</h2>
          <div className="details-grid">
            <div className="detail-row">
              <span className="detail-label">Last Price:</span>
              <span className="detail-value">{selectedSymbol.last_price != null ? selectedSymbol.last_price.toFixed(2) : '-'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Last Price Date:</span>
              <span className="detail-value">{selectedSymbol.last_price_date ?? '-'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Description:</span>
              <span className="detail-value">{selectedSymbol.description ?? '-'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Reviewed Date:</span>
              <span className="detail-value">{selectedSymbol.reviewed_date ?? '-'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Review Result:</span>
              <span className="detail-value">{selectedSymbol.review_result ?? '-'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Notes:</span>
              <span className="detail-value">{selectedSymbol.notes ?? '-'}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {symbols.map((s) => (
            <tr key={s.name}>
              <td className="symbol-name">{s.name}</td>
              <td>{s.last_price != null ? s.last_price.toFixed(2) : '-'}</td>
              <td>{s.last_price_date ?? '-'}</td>
              <td className="symbol-desc">{s.description ?? '-'}</td>
              <td>
                <button className="details-link" onClick={() => setSelectedSymbol(s)}>
                  Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default SymbolList;
