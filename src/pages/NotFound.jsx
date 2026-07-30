import { Link } from 'react-router-dom'
import { Sun, Moon } from 'lucide-react'
import AmbientBackground from '../components/AmbientBackground.jsx'
import { useTheme } from '../context/ThemeContext.jsx'

export default function NotFound() {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="flex min-h-screen flex-col text-body">
      <AmbientBackground />
      <header className="glass flex items-center justify-between border-b border-[var(--surface-border)] px-8 py-4">
        <span className="font-semibold text-heading">AI Nexus</span>
        <button
          onClick={toggleTheme}
          title="Toggle theme"
          className="rounded-lg p-2 text-muted transition hover:bg-[var(--track-bg)] hover:text-[var(--text-heading)]"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </header>

      <main className="flex flex-1 items-center justify-center px-4">
        <div className="glass w-full max-w-md rounded-2xl p-10 text-center">
          <p className="bg-gradient-to-r from-primary-400 to-fuchsia-400 bg-clip-text text-5xl font-extrabold text-transparent">
            404
          </p>
          <h1 className="mt-2 text-lg font-semibold text-heading">
            Oops! This page drifted into another dimension.
          </h1>
          <p className="mt-2 text-sm text-muted">
            The page you're looking for doesn't exist, has been moved, or the link is incorrect.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Link to="/home" className="btn-primary">Back to Home</Link>
            <Link to="/chat" className="btn-ghost">Start New Chat</Link>
            <Link to="/compare" className="btn-ghost">Compare Models</Link>
          </div>
        </div>
      </main>

      <footer className="glass border-t border-[var(--surface-border)] px-8 py-4 text-center text-xs text-faint">
        © 2026 AI Nexus. Designed for Artificial Clarity. · Privacy Policy · Terms of Service · Legal
      </footer>
    </div>
  )
}
