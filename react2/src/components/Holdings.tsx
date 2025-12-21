import { useEffect, useState } from 'react';
import type { Account } from '../types/Account';
import type { HoldingItem } from '../types/HoldingItem';
import type { TransactionItem } from '../types/TransactionItem';
import { fetchAccounts } from '../services/holdingsService';
import { fetchHoldingsByAccount } from '../services/holdingsDetailService';
import HoldingsTable from './HoldingsTable';
import AllHoldingsTable from './AllHoldingsTable';
import { fetchTransactionsByAccountAndSymbol, updateTransaction, createTransaction, deleteTransaction } from '../services/transactionsService';
import TransactionList from './TransactionList';
import TransactionEditor from './TransactionEditor';
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
  const [editingTransaction, setEditingTransaction] = useState<TransactionItem | null>(null);
  const [originalTransaction, setOriginalTransaction] = useState<TransactionItem | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deletingError, setDeletingError] = useState<string | null>(null);
  const [showAllHoldings, setShowAllHoldings] = useState(false);
  const [allHoldings, setAllHoldings] = useState<HoldingItem[]>([]);
  const [allHoldingsLoading, setAllHoldingsLoading] = useState(false);
  const [allHoldingsError, setAllHoldingsError] = useState<string | null>(null);
  const [cameFromAllHoldings, setCameFromAllHoldings] = useState(false);

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
        setHoldings([]);
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
      const openEdit = (t: TransactionItem) => {
        setOriginalTransaction(t);
        setEditingTransaction({ ...t });
        setSaveError(null);
      };

      const openNew = () => {
        // Create a new TransactionItem with minimal required fields
        const t: TransactionItem = {
          id: 0,
          date: '',
          type: '',
          quantity: null,
          price: null,
          amount: null,
          fee: null,
          capital_return: null,
          capital_gain: null,
          acb: null,
          symbol: transactionSymbol || '',
          account: selectedAccount.name,
          upload_id: null,
          note: '',
        };
        setOriginalTransaction(null);
        setEditingTransaction(t);
        setSaveError(null);
      };

      const cancelEdit = () => {
        setEditingTransaction(null);
        setOriginalTransaction(null);
        setSaveError(null);
      };

      const isDirty = () => {
        if (!editingTransaction) return false;
        if (!originalTransaction) {
          // new transaction: require date and type to enable save
          return Boolean(editingTransaction.date && editingTransaction.type);
        }
        return JSON.stringify(editingTransaction) !== JSON.stringify(originalTransaction);
      };

      const handleFieldChange = (field: keyof TransactionItem, value: any) => {
        if (!editingTransaction) return;
        setEditingTransaction({ ...editingTransaction, [field]: value });
      };

      const doSave = async () => {
        if (!editingTransaction) return;
        try {
          setSaveLoading(true);
          setSaveError(null);

          const payload: TransactionItem = { ...editingTransaction };

          if (!originalTransaction) {
            // create new
            await createTransaction(payload);
          } else {
            // update existing
            await updateTransaction(payload);
          }

          // refresh list
          const refreshed = await fetchTransactionsByAccountAndSymbol(selectedAccount.name, transactionSymbol as string);
          setTransactions(refreshed);
          // close editor and return to list
          cancelEdit();
        } catch (err) {
          setSaveError(err instanceof Error ? err.message : 'Failed to save transaction');
        } finally {
          setSaveLoading(false);
        }
      };

      const handleDelete = async (id: number) => {
        try {
          setDeletingId(id);
          setDeletingError(null);
          await deleteTransaction(id);
          const refreshed = await fetchTransactionsByAccountAndSymbol(selectedAccount.name, transactionSymbol as string);
          setTransactions(refreshed);
        } catch (err) {
          setDeletingError(err instanceof Error ? err.message : 'Failed to delete transaction');
        } finally {
          setDeletingId(null);
        }
      };

      return (
        <div className="account-list">
          <button className="back-btn" onClick={closeTransactions}>← Back</button>
          <div className="holdings-details">
            <h2>Transactions for {transactionSymbol} — {selectedAccount.name}</h2>
            {transactionsError && <div className="error-msg">{transactionsError}</div>}
            {editingTransaction ? (
              <TransactionEditor
                transaction={editingTransaction}
                onChange={handleFieldChange}
                onSave={doSave}
                onCancel={cancelEdit}
                isSaving={saveLoading}
                isDirty={isDirty()}
                error={saveError}
              />
            ) : (
              <TransactionList
                transactions={transactions}
                loading={transactionsLoading}
                error={deletingError || transactionsError}
                deletingId={deletingId}
                onAdd={openNew}
                onEdit={openEdit}
                onDelete={handleDelete}
              />
            )}
          </div>
        </div>
      );
    }

    const handleBackFromAccount = () => {
      // if we navigated here from the All Holdings view, return there
      setSelectedAccount(null);
      if (cameFromAllHoldings) {
        setShowAllHoldings(true);
        setCameFromAllHoldings(false);
      }
    };

    return (
      <div className="account-list">
        <button className="back-btn" onClick={handleBackFromAccount}>← Back</button>
        <div className="holdings-details">
          <div className="holdings-header">
            <h2>Holdings for {selectedAccount.name}</h2>
            <button
              className={`toggle-btn ${hideZeroAmount ? 'active' : ''}`}
              onClick={() => setHideZeroAmount(!hideZeroAmount)}
              disabled={holdingsLoading}
              title={holdingsLoading ? 'Loading holdings...' : (hideZeroAmount ? 'Hiding zeros' : 'Showing zeros')}
            >
              {hideZeroAmount ? 'Hiding' : 'Showing'} zeros
            </button>
          </div>
          {holdingsError && <div className="error-msg">{holdingsError}</div>}
          {holdingsLoading ? (
            <div className="loading-msg">Loading holdings...</div>
            ) : (
              <HoldingsTable holdings={filteredHoldings} onOpenTransactions={(symbol) => openTransactions(symbol)} />
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2>Holdings</h2>
        <button className="all-holdings-btn" onClick={async () => {
          // open aggregated holdings view (backend supports account=All)
          setShowAllHoldings(true);
          setAllHoldingsLoading(true);
          setAllHoldingsError(null);
          try {
            const data = await fetchHoldingsByAccount('All');
            setAllHoldings(data);
          } catch (err) {
            setAllHoldingsError(err instanceof Error ? err.message : 'Failed to load all holdings');
            setAllHoldings([]);
          } finally {
            setAllHoldingsLoading(false);
          }
        }}>All Holdings</button>
      </div>

      {showAllHoldings ? (
        <div className="holdings-details">
          <button className="back-btn" onClick={() => { setShowAllHoldings(false); setAllHoldings([]); setAllHoldingsError(null); }}>← Back</button>
          <h2>All Holdings</h2>
          {allHoldingsError && <div className="error-msg">{allHoldingsError}</div>}
          {allHoldingsLoading ? (
            <div className="loading-msg">Loading all holdings...</div>
          ) : (
            <AllHoldingsTable
              holdings={allHoldings}
              onOpenAccountHoldings={(acct) => {
                // find the account object and open its holdings
                const found = accounts.find(a => a.name === acct);
                if (found) {
                  setCameFromAllHoldings(true);
                  setShowAllHoldings(false);
                  setSelectedAccount(found);
                }
              }}
            />
          )}
        </div>
      ) : null}
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
