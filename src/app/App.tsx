import { Sparkles } from 'lucide-react'

export function App() {
  return (
    <main className="app-shell">
      <section className="welcome-panel" aria-labelledby="welcome-title">
        <div className="brand-mark" aria-hidden="true">
          <Sparkles size={22} strokeWidth={1.8} />
        </div>
        <p className="eyebrow">The Gentle Page Studio</p>
        <h1 id="welcome-title">A thoughtful publishing workspace is taking shape.</h1>
        <p className="intro">
          Commit 1 establishes the project foundation: architecture, tooling, quality checks,
          testing, and a clean place for every future feature.
        </p>
        <div className="status-row" role="status">
          <span className="status-dot" />
          Core foundation ready
        </div>
      </section>
    </main>
  )
}
