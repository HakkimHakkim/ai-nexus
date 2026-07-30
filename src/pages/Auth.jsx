import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Sun, Moon } from 'lucide-react'
import AmbientBackground from '../components/AmbientBackground.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'

const models = ['Gemini', 'Llama', 'Qwen', 'Offline']
const features = ['Multi-Model AI', 'Fast Comparison', 'Privacy First', 'Beautiful Workspace']

export default function Auth() {
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const { login, signup } = useAuth()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      if (mode === 'signin') {
        await login(email, password)
      } else {
        await signup(name, email, password)
      }
      navigate('/home')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen text-body">
      <AmbientBackground />

      <header className="glass flex items-center justify-between border-b border-[var(--surface-border)] px-8 py-4">
        <div className="flex items-center gap-2 font-semibold text-heading">
          <span className="text-primary-400">◆</span> AI Nexus
        </div>
        <button
          onClick={toggleTheme}
          title="Toggle theme"
          className="rounded-lg p-2 text-muted transition hover:bg-[var(--track-bg)] hover:text-[var(--text-heading)]"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </header>

      <main className="mx-auto grid max-w-5xl grid-cols-1 items-center gap-16 px-8 py-20 md:grid-cols-2">
        <section>
          <div className="mb-6 h-14 w-14 rounded-xl bg-gradient-to-br from-primary-500 to-fuchsia-500 shadow-lg shadow-primary-600/40" />
          <h1 className="text-4xl font-bold leading-tight text-heading">
            Welcome to{' '}
            <span className="bg-gradient-to-r from-primary-400 to-fuchsia-400 bg-clip-text text-transparent">
              AI Nexus
            </span>
          </h1>
          <p className="mt-4 text-muted">
            One workspace. Multiple AI models. Smarter decisions. Experience the next generation
            of artificial intelligence interaction.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {models.map((m) => (
              <span key={m} className="glass rounded-full px-4 py-1.5 text-sm text-body">
                {m}
              </span>
            ))}
          </div>

          <ul className="mt-8 grid grid-cols-2 gap-y-2 text-sm text-body">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-2">
                <span className="text-primary-400">✓</span> {f}
              </li>
            ))}
          </ul>
        </section>

        <section className="glass rounded-2xl p-8 shadow-2xl shadow-black/20">
          <h2 className="text-xl font-semibold text-heading">
            {mode === 'signin' ? 'Sign In' : 'Create Account'}
          </h2>
          <p className="mt-1 text-sm text-muted">
            {mode === 'signin' ? 'Log back into your AI headquarters.' : 'Join AI Nexus, free forever.'}
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="mb-1 block text-sm text-muted">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="glass-input"
                />
              </div>
            )}
            <div>
              <label className="mb-1 block text-sm text-muted">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="glass-input"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="glass-input"
              />
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <button type="submit" disabled={submitting} className="btn-primary w-full disabled:opacity-50">
              {submitting ? 'Please wait...' : mode === 'signin' ? 'Sign In to Dashboard' : 'Create Account'}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-muted">
            {mode === 'signin' ? (
              <>
                Don't have an account?{' '}
                <button onClick={() => { setMode('signup'); setError('') }} className="text-primary-400 hover:underline">
                  Create Account
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button onClick={() => { setMode('signin'); setError('') }} className="text-primary-400 hover:underline">
                  Sign In
                </button>
              </>
            )}
          </p>
        </section>
      </main>

      <footer className="glass border-t border-[var(--surface-border)] px-8 py-6 text-center text-xs text-faint">
        © 2026 AI Nexus. All rights reserved. · Privacy Policy · Terms of Service · Help Center
      </footer>
    </div>
  )
}
