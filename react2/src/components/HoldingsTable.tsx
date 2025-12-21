import type { HoldingItem } from '../types/HoldingItem';

interface Props {
  holdings: HoldingItem[];
  onOpenTransactions: (symbol: string) => void;
}

export default function HoldingsTable({ holdings, onOpenTransactions }: Props) {
  return (
    <table>
      <thead>
        <tr>
          <th>Symbol</th>
          <th>Quantity</th>
          <th>Amount</th>
          <th>US Amount</th>
          <th>Transactions</th>
        </tr>
      </thead>
      <tbody>
        {holdings.map((h) => (
          <tr key={h.symbol.name}>
            <td className="symbol-name">{h.symbol.name}</td>
            <td>{h.quantity.toFixed(2)}</td>
            <td>{h.amount.toFixed(2)}</td>
            <td>{h.us_amount != null ? h.us_amount.toFixed(2) : '-'}</td>
            <td>
              <button className="details-link" onClick={() => onOpenTransactions(h.symbol.name)}>
                Transactions
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
