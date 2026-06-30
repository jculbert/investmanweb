import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Account } from '../types/Account';
import type { HoldingItem } from '../types/HoldingItem';
import type { TransactionItem } from '../types/TransactionItem';
import { fetchAccounts } from '../services/holdingsService';
import { fetchHoldingsByAccount } from '../services/holdingsDetailService';
import HoldingsTable from './HoldingsTable';
import AllHoldingsTable from './AllHoldingsTable';
import {
  fetchTransactionsByAccountAndSymbol,
  updateTransaction,
  createTransaction,
  deleteTransaction,
} from '../services/transactionsService';
import TransactionList from './TransactionList';
import TransactionEditor from './TransactionEditor';
import './Holdings.css';

type AsyncDataState<T> = {
  data: T;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  setData: React.Dispatch<React.SetStateAction<T>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
};

function useAsyncData<T>(loader: () => Promise<T>, initialData: T, deps: readonly any[]) {
  const [data, setData] = useState<T>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await loader();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { data, loading, error, reload, setData, setError } as AsyncDataState<T>;
}

function useAccounts() {
  return useAsyncData<Account[]>(fetchAccounts, [], []);
}

function useHoldings(accountName: string | null) {
  const loader = useCallback(async () => {
    if (!accountName) return [];
    return fetchHoldingsByAccount(accountName);
  }, [accountName]);

  const holdingsState = useAsyncData<HoldingItem[]>(loader, [], [loader]);

  useEffect(() => {
    if (!accountName) {
      holdingsState.setData([]);
      holdingsState.setError(null);
    }
  }, [accountName, holdingsState]);

  return holdingsState;
}

function useTransactions(accountName: string | null, symbol: string | null) {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTransactions = useCallback(async () => {
    if (!accountName || !symbol) {
      setTransactions([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await fetchTransactionsByAccountAndSymbol(accountName, symbol);
      setTransactions(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load transactions');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [accountName, symbol]);

  useEffect(() => {
    void loadTransactions();
  }, [loadTransactions]);

  return { transactions, loading, error, setTransactions, setError, loadTransactions };
}

function createEmptyTransaction(symbol: string, accountName: string): TransactionItem {
  return {
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
    symbol,
    account: accountName,
    upload_id: null,
    note: '',
  };
}

function isTransactionDirty(
  editingTransaction: TransactionItem | null,
  originalTransaction: TransactionItem | null,
) {
  if (!editingTransaction) return false;
  if (!originalTransaction) {
    return Boolean(editingTransaction.date && editingTransaction.type);
  }

  return JSON.stringify(editingTransaction) !== JSON.stringify(originalTransaction);
}

export function Holdings() {
  const accountsState = useAccounts();
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const holdingsState = useHoldings(selectedAccount?.name ?? null);
  const [hideZeroAmount, setHideZeroAmount] = useState(true);
  const [viewingTransactions, setViewingTransactions] = useState(false);
  const [transactionSymbol, setTransactionSymbol] = useState<string | null>(null);
  const transactionsState = useTransactions(
    viewingTransactions ? selectedAccount?.name ?? null : null,
    viewingTransactions ? transactionSymbol : null,
  );
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

  const filteredHoldings = useMemo(
    () => (hideZeroAmount ? holdingsState.data.filter((h) => h.amount !== 0.0) : holdingsState.data),
    [hideZeroAmount, holdingsState.data],
  );

  const groupedAccounts = useMemo(
    () =>
      accountsState.data.reduce((acc, account) => {
        const owner = account.name.split(' ')[0];
        if (!acc[owner]) {
          acc[owner] = [];
        }
        acc[owner].push(account);
        return acc;
      }, {} as Record<string, Account[]>),
    [accountsState.data],
  );

  const openTransactions = useCallback((symbol: string) => {
    setTransactionSymbol(symbol);
    setViewingTransactions(true);
    setEditingTransaction(null);
  }, []);

  const closeTransactions = useCallback(() => {
    setViewingTransactions(false);
    setTransactionSymbol(null);
    transactionsState.setTransactions([]);
    transactionsState.setError(null);
    setEditingTransaction(null);
    setOriginalTransaction(null);
    setSaveError(null);
  }, [transactionsState]);

  const handleBackFromAccount = useCallback(() => {
    setSelectedAccount(null);
    setViewingTransactions(false);
    setTransactionSymbol(null);
    setEditingTransaction(null);
    setOriginalTransaction(null);
    setSaveError(null);
    setDeletingId(null);
    setDeletingError(null);

    if (cameFromAllHoldings) {
      setShowAllHoldings(true);
      setCameFromAllHoldings(false);
    }
  }, [cameFromAllHoldings]);

  const loadAllHoldings = useCallback(async () => {
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
  }, []);

  const openAccountFromAllHoldings = useCallback(
    (accountName: string) => {
      const found = accountsState.data.find((account) => account.name === accountName);
      if (!found) return;

      setCameFromAllHoldings(true);
      setShowAllHoldings(false);
      setSelectedAccount(found);
    },
    [accountsState.data],
  );

  const openEdit = useCallback((transaction: TransactionItem) => {
    setOriginalTransaction(transaction);
    setEditingTransaction({ ...transaction });
    setSaveError(null);
  }, []);

  const openNew = useCallback(() => {
    if (!selectedAccount || !transactionSymbol) return;
    setOriginalTransaction(null);
    setEditingTransaction(createEmptyTransaction(transactionSymbol, selectedAccount.name));
    setSaveError(null);
  }, [selectedAccount, transactionSymbol]);

  const cancelEdit = useCallback(() => {
    setEditingTransaction(null);
    setOriginalTransaction(null);
    setSaveError(null);
  }, []);

  const handleFieldChange = useCallback((field: keyof TransactionItem, value: any) => {
    setEditingTransaction((prev) => (prev ? { ...prev, [field]: value } : prev));
  }, []);

  const doSave = useCallback(async () => {
    if (!editingTransaction || !selectedAccount || !transactionSymbol) return;

    try {
      setSaveLoading(true);
      setSaveError(null);

      if (!originalTransaction) {
        await createTransaction(editingTransaction);
      } else {
        await updateTransaction(editingTransaction);
      }

      await transactionsState.loadTransactions();
      cancelEdit();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save transaction');
    } finally {
      setSaveLoading(false);
    }
  }, [editingTransaction, originalTransaction, selectedAccount, transactionSymbol, transactionsState, cancelEdit]);

  const handleDelete = useCallback(
    async (id: number) => {
      try {
        setDeletingId(id);
        setDeletingError(null);
        await deleteTransaction(id);
        await transactionsState.loadTransactions();
      } catch (err) {
        setDeletingError(err instanceof Error ? err.message : 'Failed to delete transaction');
      } finally {
        setDeletingId(null);
      }
    },
    [transactionsState],
  );

  if (accountsState.loading) {
    return <div className="account-list loading">Loading accounts...</div>;
  }

  if (accountsState.error) {
    return <div className="account-list error">Error: {accountsState.error}</div>;
  }

  if (selectedAccount) {
    if (viewingTransactions && transactionSymbol) {
      const isDirty = isTransactionDirty(editingTransaction, originalTransaction);

      return (
        <div className="account-list">
          <button className="back-btn" onClick={closeTransactions}>← Back</button>
          <div className="holdings-details">
            <h2>Transactions for {transactionSymbol} — {selectedAccount.name}</h2>
            {transactionsState.error && <div className="error-msg">{transactionsState.error}</div>}
            {editingTransaction ? (
              <TransactionEditor
                transaction={editingTransaction}
                onChange={handleFieldChange}
                onSave={doSave}
                onCancel={cancelEdit}
                isSaving={saveLoading}
                isDirty={isDirty}
                error={saveError}
              />
            ) : (
              <TransactionList
                transactions={transactionsState.transactions}
                loading={transactionsState.loading}
                error={deletingError || transactionsState.error}
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

    return (
      <div className="account-list">
        <button className="back-btn" onClick={handleBackFromAccount}>← Back</button>
        <div className="holdings-details">
          <div className="holdings-header">
            <h2>Holdings for {selectedAccount.name}</h2>
            <button
              className={`toggle-btn ${hideZeroAmount ? 'active' : ''}`}
              onClick={() => setHideZeroAmount((value) => !value)}
              disabled={holdingsState.loading}
              title={holdingsState.loading ? 'Loading holdings...' : hideZeroAmount ? 'Hiding zeros' : 'Showing zeros'}
            >
              {hideZeroAmount ? 'Hiding' : 'Showing'} zeros
            </button>
          </div>
          {holdingsState.error && <div className="error-msg">{holdingsState.error}</div>}
          {holdingsState.loading ? (
            <div className="loading-msg">Loading holdings...</div>
          ) : (
            <HoldingsTable holdings={filteredHoldings} onOpenTransactions={openTransactions} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="account-list">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2>Holdings</h2>
        <button className="all-holdings-btn" onClick={loadAllHoldings}>All Holdings</button>
      </div>

      {showAllHoldings ? (
        <div className="holdings-details">
          <button className="back-btn" onClick={() => {
            setShowAllHoldings(false);
            setAllHoldings([]);
            setAllHoldingsError(null);
          }}>
            ← Back
          </button>
          <h2>All Holdings</h2>
          {allHoldingsError && <div className="error-msg">{allHoldingsError}</div>}
          {allHoldingsLoading ? (
            <div className="loading-msg">Loading all holdings...</div>
          ) : (
            <AllHoldingsTable holdings={allHoldings} onOpenAccountHoldings={openAccountFromAllHoldings} />
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
                  <td className={`currency-${account.currency}`}>{account.currency}</td>
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
