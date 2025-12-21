import type { HoldingItem } from '../types/HoldingItem';

interface Props {
  holdings: HoldingItem[];
  onOpenAccountHoldings: (accountName: string) => void;
}

export default function AllHoldingsTable({ holdings, onOpenAccountHoldings }: Props) {
  return (
    <table>
      <thead>
        <tr>
          <th>Symbol</th>
          <th>Quantity</th>
          <th>Amount</th>
          <th>US Amount</th>
          <th>Accounts</th>
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
              {h.accounts && h.accounts.length > 0 ? (
                h.accounts.map((acct) => (
                  <button key={acct} className="account-link" onClick={() => onOpenAccountHoldings(acct)}>
                    {acct}
                  </button>
                ))
              ) : (
                '-' 
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
