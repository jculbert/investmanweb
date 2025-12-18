import { useState } from 'react'
import { AccountList } from './components/AccountList'
import SymbolList from './components/SymbolList'
import './App.css'

type Page = 'accounts' | 'symbols'

function App() {
  const [page, setPage] = useState<Page>('accounts')

  return (
    <div className="app-container">
      <aside className="app-nav">
        <div className="nav-title">Investments</div>
        <nav>
          <button className={`nav-btn ${page === 'accounts' ? 'active' : ''}`} onClick={() => setPage('accounts')}>
            Accounts
          </button>
          <button className={`nav-btn ${page === 'symbols' ? 'active' : ''}`} onClick={() => setPage('symbols')}>
            Symbols
          </button>
        </nav>
      </aside>

      <div className="app-main">
        <header className="app-header">
          <h1>Investment Manager</h1>
        </header>

        <main>
          {page === 'accounts' ? <AccountList /> : <SymbolList />}
        </main>
      </div>
    </div>
  )
}

export default App
