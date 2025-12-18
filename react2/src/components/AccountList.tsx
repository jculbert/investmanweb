import { useEffect, useState } from 'react';
import type { Account } from '../types/Account';
import { fetchAccounts } from '../services/accountService';
import './AccountList.css';

export function AccountList() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) {
    return <div className="account-list loading">Loading accounts...</div>;
  }

  if (error) {
    return <div className="account-list error">Error: {error}</div>;
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
      <h2>Investment Accounts</h2>
      {Object.entries(groupedAccounts).map(([owner, ownerAccounts]) => (
        <div key={owner} className="owner-group">
          <h3>{owner}'s Accounts</h3>
          <table>
            <thead>
              <tr>
                <th>Account Name</th>
                <th>Currency</th>
              </tr>
            </thead>
            <tbody>
              {ownerAccounts.map((account) => (
                <tr key={account.name}>
                  <td>{account.name}</td>
                  <td className={`currency-${account.currency}`}>
                    {account.currency}
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
