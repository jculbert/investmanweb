import type { TransactionItem } from '../types/TransactionItem';
import './Holdings.css';

interface Props {
  transaction: TransactionItem;
  onChange: (field: keyof TransactionItem, value: any) => void;
  onSave: () => Promise<void> | void;
  onCancel: () => void;
  isSaving: boolean;
  isDirty: boolean;
  error?: string | null;
}

export default function TransactionEditor({ transaction, onChange, onSave, onCancel, isSaving, isDirty, error }: Props) {
  return (
    <div className="symbol-details">
      <h3>Transaction #{transaction.id}</h3>
      {error && <div className="error-msg">{error}</div>}
      <div className="details-grid">
        <div className="detail-row">
          <label>Date</label>
          <input value={transaction.date ?? ''} onChange={(e) => onChange('date', e.target.value)} />
        </div>
        <div className="detail-row">
          <label>Type</label>
          <input value={transaction.type ?? ''} onChange={(e) => onChange('type', e.target.value)} />
        </div>
        <div className="detail-row">
          <label>Quantity</label>
          <input type="number" step="any" value={transaction.quantity ?? ''} onChange={(e) => onChange('quantity', e.target.value === '' ? null : parseFloat(e.target.value))} />
        </div>
        <div className="detail-row">
          <label>Price</label>
          <input type="number" step="any" value={transaction.price ?? ''} onChange={(e) => onChange('price', e.target.value === '' ? null : parseFloat(e.target.value))} />
        </div>
        <div className="detail-row">
          <label>Amount</label>
          <input type="number" step="any" value={transaction.amount ?? ''} onChange={(e) => onChange('amount', e.target.value === '' ? null : parseFloat(e.target.value))} />
        </div>
        <div className="detail-row">
          <label>Fee</label>
          <input type="number" step="any" value={transaction.fee ?? ''} onChange={(e) => onChange('fee', e.target.value === '' ? null : parseFloat(e.target.value))} />
        </div>
        <div className="detail-row">
          <label>Capital Return</label>
          <input type="number" step="any" value={transaction.capital_return ?? ''} onChange={(e) => onChange('capital_return', e.target.value === '' ? null : parseFloat(e.target.value))} />
        </div>
        <div className="detail-row">
          <label>Capital Gain</label>
          <input type="number" step="any" value={transaction.capital_gain ?? ''} onChange={(e) => onChange('capital_gain', e.target.value === '' ? null : parseFloat(e.target.value))} />
        </div>
        <div className="detail-row">
          <label>ACB</label>
          <input type="number" step="any" value={transaction.acb ?? ''} onChange={(e) => onChange('acb', e.target.value === '' ? null : parseFloat(e.target.value))} />
        </div>
        <div className="detail-row">
          <label>Note</label>
          <textarea rows={6} value={transaction.note ?? ''} onChange={(e) => onChange('note', e.target.value)} />
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <button className="back-btn" onClick={onCancel} disabled={isSaving}>Back</button>
        <button className="toggle-btn" onClick={() => void onSave()} disabled={!isDirty || isSaving} style={{ marginLeft: 8 }}>
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
}
