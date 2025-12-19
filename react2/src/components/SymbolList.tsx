import { useEffect, useState } from 'react';
import type { SymbolItem } from '../types/SymbolItem';
import { fetchSymbols, updateSymbol } from '../services/symbolService';
import './SymbolList.css';

export function SymbolList() {
  const [symbols, setSymbols] = useState<SymbolItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState<SymbolItem | null>(null);
  const [editedSymbol, setEditedSymbol] = useState<SymbolItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

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
    const current = editedSymbol || selectedSymbol;
    const hasChanges = editedSymbol !== null && JSON.stringify(editedSymbol) !== JSON.stringify(selectedSymbol);

    const handleChange = (field: keyof SymbolItem, value: string | number | null) => {
      setEditedSymbol({ ...current, [field]: value });
    };

    const handleSave = async () => {
      if (!hasChanges || !editedSymbol) return;
      try {
        setSaving(true);
        setSaveError(null);
        await updateSymbol(selectedSymbol.name, editedSymbol);
        // Update the symbols list and reset edit state
        setSymbols((s) => s.map((sym) => (sym.name === editedSymbol.name ? editedSymbol : sym)));
        setSelectedSymbol(editedSymbol);
        setEditedSymbol(null);
      } catch (err) {
        setSaveError(err instanceof Error ? err.message : 'Failed to save symbol');
      } finally {
        setSaving(false);
      }
    };

    return (
      <div className="symbol-list">
        <button className="back-btn" onClick={() => { setSelectedSymbol(null); setEditedSymbol(null); }}>← Back</button>
        <div className="symbol-details">
          <h2>{current.name}</h2>
          {saveError && <div className="error-msg">{saveError}</div>}
          <div className="details-grid">
            <div className="detail-row">
              <label className="detail-label">Last Price:</label>
              <input
                type="number"
                step="0.01"
                value={current.last_price ?? ''}
                onChange={(e) => handleChange('last_price', e.target.value ? parseFloat(e.target.value) : null)}
                className="detail-input"
              />
            </div>
            <div className="detail-row">
              <label className="detail-label">Last Price Date:</label>
              <input
                type="text"
                value={current.last_price_date ?? ''}
                onChange={(e) => handleChange('last_price_date', e.target.value || null)}
                className="detail-input"
              />
            </div>
            <div className="detail-row">
              <label className="detail-label">Description:</label>
              <input
                type="text"
                value={current.description ?? ''}
                onChange={(e) => handleChange('description', e.target.value || null)}
                className="detail-input"
              />
            </div>
            <div className="detail-row">
              <label className="detail-label">Reviewed Date:</label>
              <input
                type="text"
                value={current.reviewed_date ?? ''}
                onChange={(e) => handleChange('reviewed_date', e.target.value || null)}
                className="detail-input"
              />
            </div>
            <div className="detail-row">
              <label className="detail-label">Review Result:</label>
              <input
                type="text"
                value={current.review_result ?? ''}
                onChange={(e) => handleChange('review_result', e.target.value || null)}
                className="detail-input"
              />
            </div>
            <div className="detail-row">
              <label className="detail-label">Notes:</label>
              <textarea
                rows={6}
                value={current.notes ?? ''}
                onChange={(e) => handleChange('notes', e.target.value || null)}
                className="detail-input detail-textarea"
              />
            </div>
          </div>
          <button
            className={`save-btn ${hasChanges ? 'active' : 'disabled'}`}
            onClick={handleSave}
            disabled={!hasChanges || saving}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
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
