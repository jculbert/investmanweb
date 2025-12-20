import { useEffect, useState } from 'react';
import type { Account } from '../types/Account';
import type { HoldingItem } from '../types/HoldingItem';
import type { TransactionItem } from '../types/TransactionItem';
import { fetchAccounts } from '../services/holdingsService';
import { fetchHoldingsByAccount } from '../services/holdingsDetailService';
import { fetchTransactionsByAccountAndSymbol } from '../services/transactionsService';
import './Holdings.css';

export function Holdings() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [holdings, setHoldings] = useState<HoldingItem[]>([]);
  const [holdingsLoading, setHoldingsLoading] = useState(false);
  const [holdingsError, setHoldingsError] = useState<string | null>(null);
  const [hideZeroAmount, setHideZeroAmount] = useState(true);
  const [viewingTransactions, setViewingTransactions] = useState(false);
  const [transactionSymbol, setTransactionSymbol] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [transactionsError, setTransactionsError] = useState<string | null>(null);

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        setLoading(true);
        const data = await fetchAccounts();
        setAccounts(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load accounts');
      } finally {
        setLoading(false);
      }
    };

    loadAccounts();
  }, []);

  // Load holdings when account is selected
  useEffect(() => {
    if (!selectedAccount) return;
    const load = async () => {
      try {
        setHoldingsLoading(true);
        const data = await fetchHoldingsByAccount(selectedAccount.name);
        setHoldings(data);
        setHoldingsError(null);
      } catch (err) {
        setHoldingsError(err instanceof Error ? err.message : 'Failed to load holdings');
      } finally {
        setHoldingsLoading(false);
      }
    };
    load();
  }, [selectedAccount]);

  if (loading) {
    return <div className="account-list loading">Loading accounts...</div>;
  }

  if (error) {
    return <div className="account-list error">Error: {error}</div>;
  }

  // Show holdings details if account is selected
  if (selectedAccount) {
    const filteredHoldings = hideZeroAmount
      ? holdings.filter((h) => h.amount !== 0.0)
      : holdings;

    const openTransactions = async (symbol: string) => {
      setTransactionSymbol(symbol);
      setViewingTransactions(true);
      try {
        setTransactionsLoading(true);
        setTransactionsError(null);
        const data = await fetchTransactionsByAccountAndSymbol(selectedAccount.name, symbol);
        setTransactions(data);
      } catch (err) {
        setTransactionsError(err instanceof Error ? err.message : 'Failed to load transactions');
        setTransactions([]);
      } finally {
        setTransactionsLoading(false);
      }
    };

    const closeTransactions = () => {
      setViewingTransactions(false);
      setTransactionSymbol(null);
      setTransactions([]);
      setTransactionsError(null);
    };

    // If we're viewing transactions for a holding, render that view
    if (viewingTransactions && transactionSymbol) {
      return (
        <div className="account-list">
          <button className="back-btn" onClick={closeTransactions}>← Back</button>
          <div className="holdings-details">
            <h2>Transactions for {transactionSymbol} — {selectedAccount.name}</h2>
            {transactionsError && <div className="error-msg">{transactionsError}</div>}
            {transactionsLoading ? (
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
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="account-list">
        <button className="back-btn" onClick={() => setSelectedAccount(null)}>← Back</button>
        <div className="holdings-details">
          <div className="holdings-header">
            <h2>Holdings for {selectedAccount.name}</h2>
            <button 
              className={`toggle-btn ${hideZeroAmount ? 'active' : ''}`}
              onClick={() => setHideZeroAmount(!hideZeroAmount)}
            >
              {hideZeroAmount ? 'Hiding' : 'Showing'} zeros
            </button>
          </div>
          {holdingsError && <div className="error-msg">{holdingsError}</div>}
          {holdingsLoading ? (
            <div className="loading-msg">Loading holdings...</div>
          ) : (
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
                {filteredHoldings.map((h) => (
                  <tr key={h.symbol.name}>
                    <td className="symbol-name">{h.symbol.name}</td>
                    <td>{h.quantity.toFixed(2)}</td>
                    <td>{h.amount.toFixed(2)}</td>
                    <td>{h.us_amount != null ? h.us_amount.toFixed(2) : '-'}</td>
                    <td>
                      <button className="details-link" onClick={() => openTransactions(h.symbol.name)}>
                        Transactions
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  }

  // Group accounts by owner
  const groupedAccounts = accounts.reduce(
    (acc, account) => {
      const owner = account.name.split(' ')[0];
      if (!acc[owner]) {
        acc[owner] = [];
      }
      acc[owner].push(account);
      return acc;
    },
    {} as Record<string, Account[]>
  );

  return (
    <div className="account-list">
      <h2>Holdings</h2>
      {Object.entries(groupedAccounts).map(([owner, ownerAccounts]) => (
        <div key={owner} className="owner-group">
          <h3>{owner}'s Accounts</h3>
          <table>
            <thead>
              <tr>
                <th>Account Name</th>
                <th>Currency</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {ownerAccounts.map((account) => (
                <tr key={account.name}>
                  <td>{account.name}</td>
                  <td className={`currency-${account.currency}`}>
                    {account.currency}
                  </td>
                  <td>
                    <button className="details-link" onClick={() => setSelectedAccount(account)}>
                      Holdings
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
