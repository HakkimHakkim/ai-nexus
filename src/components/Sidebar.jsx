
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Home,
  MessageSquare,
  GitCompare,
  Bookmark,
  Settings,
  User,
  LogOut,
  Sun,
  Moon,
  BrainCircuit,
  Sparkles,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react'

import { useTheme } from '../context/ThemeContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import './sidebar.css'

const items = [
  { to: '/home', icon: Home, label: 'Overview' },
  { to: '/chat', icon: MessageSquare, label: 'AI Chat' },
  { to: '/compare', icon: GitCompare, label: 'Compare Models' },
  { to: '/saved', icon: Bookmark, label: 'Saved Library' },
]

const secondaryItems = [
  { to: '/settings', icon: Settings, label: 'Settings' },
  { to: '/profile', icon: User, label: 'My Profile' },
]

export default function Sidebar() {
  const { pathname } = useLocation()
  const { theme, toggleTheme } = useTheme()
  const { logout, user } = useAuth()
  const navigate = useNavigate()

  const [isOpen, setIsOpen] = useState(false)

  function handleLogout() {
    logout()
    setIsOpen(false)
    navigate('/')
  }

  const firstName = user?.name?.trim()?.split(/\s+/)[0] || 'User'

  const isActive = (path) => {
    if (path === '/home') return pathname === '/home'
    return pathname === path || pathname.startsWith(`${path}/`)
  }

  const closeSidebar = () => setIsOpen(false)

  return (
    <>
      <button
        type="button"
        className="sidebar-menu-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close navigation' : 'Open navigation'}
        aria-expanded={isOpen}
      >
        {isOpen ? <X size={21} /> : <Menu size={22} />}
      </button>

      {isOpen && (
        <button
          type="button"
          className="sidebar-backdrop"
          onClick={closeSidebar}
          aria-label="Close navigation"
        />
      )}

      <aside className={`app-sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <Link
          to="/home"
          className="sidebar-brand"
          onClick={closeSidebar}
        >
          <span className="sidebar-brand-icon">
            <BrainCircuit size={23} />
          </span>
          <span className="sidebar-brand-name">
            AI <strong>Nexus</strong>
          </span>
        </Link>

        <div className="sidebar-workspace">
          <span className="sidebar-workspace-dot" />
          <span>PERSONAL WORKSPACE</span>
        </div>

        <nav className="sidebar-navigation" aria-label="Main navigation">
          <p className="sidebar-label">MENU</p>

          {items.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              title={label}
              onClick={closeSidebar}
              aria-current={isActive(to) ? 'page' : undefined}
              className={`sidebar-link ${isActive(to) ? 'active' : ''}`}
            >
              <Icon size={19} strokeWidth={1.9} />
              <span>{label}</span>
              {isActive(to) && (
                <ChevronRight size={15} className="sidebar-active-arrow" />
              )}
            </Link>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <p className="sidebar-label">PREFERENCES</p>

          {secondaryItems.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              title={label}
              onClick={closeSidebar}
              aria-current={isActive(to) ? 'page' : undefined}
              className={`sidebar-link ${isActive(to) ? 'active' : ''}`}
            >
              <Icon size={19} strokeWidth={1.9} />
              <span>{label}</span>
              {isActive(to) && (
                <ChevronRight size={15} className="sidebar-active-arrow" />
              )}
            </Link>
          ))}

          <button
            type="button"
            onClick={toggleTheme}
            className="sidebar-link sidebar-action"
            title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
            <span>{theme === 'dark' ? 'Light Theme' : 'Dark Theme'}</span>
          </button>

          <div className="sidebar-user">
            <div className="sidebar-user-avatar">
              {firstName.charAt(0).toUpperCase()}
            </div>

            <div className="sidebar-user-info">
              <strong>{firstName}</strong>
              <span>AI Nexus Member</span>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              title="Log out"
              aria-label="Log out"
              className="sidebar-logout"
            >
              <LogOut size={18} />
            </button>
          </div>

          <div className="sidebar-version">
            <Sparkles size={13} />
            <span>AI Nexus · 2026</span>
          </div>
        </div>
      </aside>
    </>
  )
}
