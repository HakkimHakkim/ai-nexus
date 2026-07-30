import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Home, MessageSquare, GitCompare, Bookmark, Settings, User, LogOut, Sun, Moon } from 'lucide-react'
import { useTheme } from '../context/ThemeContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'

const items = [
  { to: '/home', icon: Home, label: 'Home' },
  { to: '/chat', icon: MessageSquare, label: 'Chat' },
  { to: '/compare', icon: GitCompare, label: 'Compare' },
  { to: '/saved', icon: Bookmark, label: 'Saved' },
  { to: '/settings', icon: Settings, label: 'Settings' },
  { to: '/profile', icon: User, label: 'Profile' },
]

export default function Sidebar() {
  const { pathname } = useLocation()
  const { theme, toggleTheme } = useTheme()
  const { logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <aside className="glass flex h-screen w-16 flex-col items-center justify-between border-r border-[var(--surface-border)] py-4">
      <div className="flex flex-col items-center gap-6">
        <Link to="/home" className="text-xl">🔷</Link>
        <nav className="flex flex-col gap-4">
          {items.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              title={label}
              className={`rounded-lg p-2 transition ${
                pathname === to
                  ? 'bg-gradient-to-br from-primary-500 to-fuchsia-500 text-white shadow-lg shadow-primary-600/40'
                  : 'text-muted hover:bg-[var(--track-bg)] hover:text-[var(--text-body)]'
              }`}
            >
              <Icon size={18} />
            </Link>
          ))}
        </nav>
      </div>

      <div className="flex flex-col items-center gap-4">
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          className="rounded-lg p-2 text-muted transition hover:bg-[var(--track-bg)] hover:text-[var(--text-body)]"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button
          onClick={handleLogout}
          title="Log out"
          className="rounded-lg p-2 text-muted transition hover:bg-[var(--track-bg)] hover:text-red-400"
        >
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  )
}
