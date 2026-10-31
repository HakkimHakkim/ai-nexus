
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  BrainCircuit,
  Check,
  ShieldCheck,
  Zap,
  Layers3,
  Sparkles,
  Eye,
  EyeOff,
  Bot,
  Network,
} from 'lucide-react'
import './auth.css'
import { useAuth } from '../context/AuthContext.jsx'

const features = [
  'Access multiple AI models in one place',
  'Compare responses and find better answers',
  'Save conversations for future reference',
  'Enjoy a clean and private workspace',
]

export default function Auth() {
  const [mode, setMode] = useState('signin')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const navigate = useNavigate()
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
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  function switchMode(nextMode) {
    setMode(nextMode)
    setError('')
  }

  return (
    <main className="auth-page">
      <header className="auth-header">
        <Link to="/" className="auth-brand">
          <span className="auth-brand-icon">
            <BrainCircuit size={23} />
          </span>
          <span>AI <strong>Nexus</strong></span>
        </Link>

        <Link to="/" className="auth-back-link">
          <ArrowLeft size={16} />
          <span>Back to website</span>
        </Link>
      </header>

      <div className="auth-layout">
        <section className="auth-intro">
          <div className="auth-eyebrow">
            <Sparkles size={15} />
            <span>YOUR AI WORKSPACE</span>
          </div>

          <h1>
            One workspace.
            <br />
            <span>Many possibilities.</span>
          </h1>

          <p className="auth-description">
            Bring different AI models together. Explore ideas, compare
            responses and get more done with one intelligent workspace.
          </p>

          <div className="auth-visual">
            <div className="auth-visual-grid" />

            <div className="auth-orbit orbit-one" />
            <div className="auth-orbit orbit-two" />

            <div className="auth-ai-core">
              <div className="auth-core-inner">
                <BrainCircuit size={68} strokeWidth={1.35} />
              </div>
            </div>

            <div className="auth-float-card auth-card-top">
              <span className="auth-mini-icon orange">
                <Zap size={17} />
              </span>
              <div>
                <strong>Smart responses</strong>
                <small>Powered by AI</small>
              </div>
            </div>

            <div className="auth-float-card auth-card-bottom">
              <span className="auth-mini-icon blue">
                <Layers3 size={17} />
              </span>
              <div>
                <strong>Multiple models</strong>
                <small>One workspace</small>
              </div>
            </div>

            <div className="auth-node node-one">
              <Bot size={21} />
            </div>
            <div className="auth-node node-two">
              <Network size={20} />
            </div>
            <div className="auth-node node-three">
              <Sparkles size={19} />
            </div>
          </div>

          <div className="auth-feature-list">
            {features.map((feature) => (
              <div key={feature} className="auth-feature">
                <span><Check size={14} /></span>
                {feature}
              </div>
            ))}
          </div>
        </section>

        <section className="auth-form-section">
          <div className="auth-form-card">
            <div className="auth-form-heading">
              <div className="auth-form-icon">
                {mode === 'signin' ? (
                  <ShieldCheck size={24} />
                ) : (
                  <Sparkles size={24} />
                )}
              </div>

              <div className="auth-welcome">
                <span>WELCOME TO AI NEXUS</span>
                <h2>
                  {mode === 'signin' ? 'Welcome back!' : 'Create your account'}
                </h2>
                <p>
                  {mode === 'signin'
                    ? 'Sign in to continue your AI journey.'
                    : 'Start exploring your AI workspace today.'}
                </p>
              </div>
            </div>

            <div className="auth-mode-switch">
              <button
                type="button"
                className={mode === 'signin' ? 'active' : ''}
                onClick={() => switchMode('signin')}
              >
                Sign In
              </button>

              <button
                type="button"
                className={mode === 'signup' ? 'active' : ''}
                onClick={() => switchMode('signup')}
              >
                Create Account
              </button>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              {mode === 'signup' && (
                <div className="auth-field">
                  <label htmlFor="auth-name">Full Name</label>
                  <input
                    id="auth-name"
                    type="text"
                    placeholder="Enter your full name"
                    required
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              )}

              <div className="auth-field">
                <label htmlFor="auth-email">Email Address</label>
                <input
                  id="auth-email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="auth-field">
                <label htmlFor="auth-password">Password</label>
                <div className="auth-password-wrap">
                  <input
                    id="auth-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    required
                    minLength={6}
                    autoComplete={
                      mode === 'signin' ? 'current-password' : 'new-password'
                    }
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />

                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="auth-error" role="alert">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="auth-submit"
              >
                {submitting
                  ? 'Please wait...'
                  : mode === 'signin'
                    ? 'Sign In to AI Nexus'
                    : 'Create My Account'}

                {!submitting && <ArrowRight size={18} />}
              </button>
            </form>

            <div className="auth-switch-text">
              {mode === 'signin' ? (
                <>
                  Don't have an account?{' '}
                  <button type="button" onClick={() => switchMode('signup')}>
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button type="button" onClick={() => switchMode('signin')}>
                    Sign in
                  </button>
                </>
              )}
            </div>

            <div className="auth-secure-note">
              <ShieldCheck size={15} />
              Your workspace is protected and private.
            </div>
          </div>

          <p className="auth-mobile-footer">
            © 2026 AI Nexus. All rights reserved.
          </p>
        </section>
      </div>

      <footer className="auth-footer">
        <span>© 2026 AI Nexus</span>
        <span>Built for smarter AI experiences.</span>
      </footer>
    </main>
  )
}
