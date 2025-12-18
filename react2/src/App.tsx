import { useState } from 'react'
import { AccountList } from './components/AccountList'
import SymbolList from './components/SymbolList'
import './App.css'

type TabKey = 'accounts' | 'symbols'
type Tab = { id: string; key: TabKey; title: string }

function App() {
  const [tabs, setTabs] = useState<Tab[]>([{ id: 'tab-accounts', key: 'accounts', title: 'Accounts' }])
  const [activeId, setActiveId] = useState<string>('tab-accounts')

  function openTab(key: TabKey) {
    const existing = tabs.find((t) => t.key === key)
    if (existing) {
      setActiveId(existing.id)
      return
    }
    const id = `tab-${key}-${Date.now()}`
    const title = key === 'accounts' ? 'Accounts' : 'Symbols'
    const newTab: Tab = { id, key, title }
    setTabs((s) => [...s, newTab])
    setActiveId(id)
  }

  function closeTab(id: string) {
    // Never close the last tab (keep at least one)
    if (tabs.length === 1) return
    setTabs((s) => s.filter((t) => t.id !== id))
    if (activeId === id) {
      // If closing active tab, activate previous tab or first tab
      const idx = tabs.findIndex((t) => t.id === id)
      const prev = tabs[idx - 1] || tabs[0]
      setActiveId(prev.id)
    }
  }

  const activeTab = tabs.find((t) => t.id === activeId) || tabs[0]

  return (
    <div className="app-container">
      <aside className="app-nav">
        <div className="nav-title">Investments</div>
        <nav>
          <button className="nav-btn" onClick={() => openTab('accounts')}>
            Open Accounts
          </button>
          <button className="nav-btn" onClick={() => openTab('symbols')}>
            Open Symbols
          </button>
        </nav>
      </aside>

      <div className="app-main">
        <header className="app-header">
          <h1>Investment Manager</h1>
        </header>

        <div className="tab-bar">
          {tabs.map((t) => (
            <div key={t.id} className={`tab ${t.id === activeId ? 'active' : ''}`} onClick={() => setActiveId(t.id)}>
              <span className="tab-title">{t.title}</span>
              <button className="tab-close" onClick={(e) => { e.stopPropagation(); closeTab(t.id); }} aria-label={`Close ${t.title}`}>×</button>
            </div>
          ))}
        </div>

        <main>
          {activeTab.key === 'accounts' && <AccountList />}
          {activeTab.key === 'symbols' && <SymbolList />}
        </main>
      </div>
    </div>
  )
}

export default App
