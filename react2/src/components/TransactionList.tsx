import type { TransactionItem } from '../types/TransactionItem';

interface Props {
  transactions: TransactionItem[];
  loading: boolean;
  error?: string | null;
  deletingId?: number | null;
  onAdd: () => void;
  onEdit: (t: TransactionItem) => void;
  onDelete: (id: number) => Promise<void> | void;
}

export default function TransactionList({ transactions, loading, error, deletingId, onAdd, onEdit, onDelete }: Props) {
  return (
    <>
      {error && <div className="error-msg">{error}</div>}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
        <button className="toggle-btn" onClick={onAdd}>Add Transaction</button>
      </div>

      {loading ? (
        <div className="loading-msg">Loading transactions...</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Amount</th>
              <th>Note</th>
              <th style={{ width: 36 }}></th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.id}>
                <td>{t.date}</td>
                <td>{t.type}</td>
                <td>{t.quantity != null ? t.quantity.toFixed(2) : '-'}</td>
                <td>{t.price != null ? t.price.toFixed(2) : '-'}</td>
                <td>{t.amount != null ? t.amount.toFixed(2) : '-'}</td>
                <td className="txn-note">{t.note || '-'}</td>
                <td>
                  <button
                    className="details-link"
                    onClick={async () => {
                      const ok = window.confirm(`Delete transaction #${t.id}? This action cannot be undone.`);
                      if (!ok) return;
                      await onDelete(t.id);
                    }}
                    disabled={deletingId === t.id}
                    title="Delete"
                  >
                    <strong>X</strong>
                  </button>
                </td>
                <td>
                  <button className="details-link" onClick={() => onEdit(t)} aria-label={`Open transaction ${t.id} details`}>
                    <strong>-&gt;</strong>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
