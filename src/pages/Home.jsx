
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Plus,
  MessageSquare,
  GitCompareArrows,
  FolderOpen,
  Clock3,
  Sparkles,
  BrainCircuit,
  Code2,
  FileText,
  Search,
  Languages,
  Mail,
  Lightbulb,
  Activity,
  ChevronRight,
  Zap,
} from 'lucide-react'

import Sidebar from '../components/Sidebar.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import './home.css'

const favoriteModels = [
  { name: 'Gemini 3.6', provider: 'Google', symbol: 'G', color: 'gemini' },
  { name: 'GPT-OSS 120B', provider: 'Open-weight', symbol: 'O', color: 'openai' },
  { name: 'GPT-OSS 20B', provider: 'Open-weight', symbol: 'O', color: 'openai' },
  { name: 'Qwen3.6 27B', provider: 'Qwen', symbol: 'Q', color: 'qwen' },
  { name: 'Llama Offline', provider: 'Local model', symbol: 'L', color: 'llama' },
]

const LIBRARY_KEY = 'ainexus_library_items'
const ACTIVITY_KEY = 'ainexus_activity_log'

const suggestions = [
  { label: 'Research', icon: Search, prompt: 'Help me research ' },
  { label: 'Coding', icon: Code2, prompt: 'Help me write code for ' },
  { label: 'Resume Analysis', icon: FileText, prompt: 'Analyze my resume and suggest improvements.' },
  { label: 'Email Writing', icon: Mail, prompt: 'Help me write a professional email about ' },
  { label: 'Summarize', icon: Lightbulb, prompt: 'Summarize the following: ' },
  { label: 'Translate', icon: Languages, prompt: 'Translate this into English: ' },
]

export default function Home() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [projects, setProjects] = useState([])
  const [activity, setActivity] = useState([])
  const [askInput, setAskInput] = useState('')

  useEffect(() => {
    try {
      const items = JSON.parse(localStorage.getItem(LIBRARY_KEY) || '[]')
      const sorted = [...items].sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
      )
      setProjects(sorted.slice(0, 3))

      const log = JSON.parse(localStorage.getItem(ACTIVITY_KEY) || '[]')
      setActivity(log.slice(0, 5))
    } catch (err) {
      console.error('Could not load dashboard data:', err)
      setProjects([])
      setActivity([])
    }
  }, [])

  const timeAgo = (iso) => {
    const diff = Date.now() - new Date(iso).getTime()

    if (!Number.isFinite(diff)) return 'Recently updated'

    const mins = Math.max(0, Math.floor(diff / 60000))
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`

    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`

    return `${Math.floor(hrs / 24)}d ago`
  }

  const handleAsk = () => {
    if (!askInput.trim()) return
    navigate('/chat', { state: { prefill: askInput.trim() } })
  }

  const handleSuggestion = (prompt) => {
    setAskInput(prompt)
    document.getElementById('home-ask-input')?.focus()
  }

  const firstName = user?.name?.trim()?.split(/\s+/)[0] || 'there'

  return (
    <div className="home-shell">
      <Sidebar />

      <main className="home-page">
        <div className="home-content">
          <header className="home-topbar">
            <div>
              <div className="home-breadcrumb">
                <span>Workspace</span>
                <ChevronRight size={13} />
                <strong>Overview</strong>
              </div>
              <p className="home-date-label">YOUR PERSONAL AI WORKSPACE</p>
            </div>

            <Link to="/profile" className="home-profile-link" title="View profile">
              <span className="home-avatar">
                {firstName.charAt(0).toUpperCase()}
              </span>
              <span className="home-profile-name">{firstName}</span>
            </Link>
          </header>

          <section className="home-welcome">
            <div className="home-welcome-copy">
              <span className="home-greeting">
                <Sparkles size={14} />
                YOUR AI WORKSPACE IS READY
              </span>

              <h1>
                Welcome back, {firstName}!
                <br />
                <span>What will you create today?</span>
              </h1>

              <p>
                Explore ideas, solve problems and get things done with
                multiple AI models in one place.
              </p>

              <div className="home-welcome-actions">
                <Link to="/chat" className="home-primary-btn">
                  <Plus size={17} />
                  Start a new chat
                  <ArrowRight size={16} />
                </Link>

                <Link to="/compare" className="home-secondary-btn">
                  <GitCompareArrows size={16} />
                  Compare models
                </Link>
              </div>
            </div>

            <div className="home-welcome-art" aria-hidden="true">
              <div className="home-art-ring ring-a" />
              <div className="home-art-ring ring-b" />

              <div className="home-art-core">
                <BrainCircuit size={63} strokeWidth={1.4} />
              </div>

              <div className="home-art-chip chip-a">
                <Zap size={16} />
                <span>AI Power</span>
              </div>

              <div className="home-art-chip chip-b">
                <MessageSquare size={16} />
                <span>Smart Chat</span>
              </div>

              <span className="home-art-dot dot-a" />
              <span className="home-art-dot dot-b" />
            </div>
          </section>

          <section className="home-ask-card">
            <div className="home-section-heading">
              <div className="home-heading-icon">
                <Sparkles size={19} />
              </div>
              <div>
                <h2>Ask AI Nexus</h2>
                <p>Start with a question. Explore what AI can do.</p>
              </div>
            </div>

            <div className="home-ask-box">
              <input
                id="home-ask-input"
                value={askInput}
                onChange={(e) => setAskInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
                placeholder="Ask anything... What would you like to explore?"
                aria-label="Ask AI Nexus"
              />

              <button
                onClick={handleAsk}
                disabled={!askInput.trim()}
                aria-label="Send question"
              >
                <ArrowRight size={19} />
              </button>
            </div>

            <div className="home-suggestions">
              {suggestions.map(({ label, icon: Icon, prompt }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => handleSuggestion(prompt)}
                >
                  <Icon size={14} />
                  {label}
                </button>
              ))}
            </div>
          </section>

          <section className="home-model-section">
            <div className="home-section-title-row">
              <div>
                <p className="home-overline">YOUR AI TOOLKIT</p>
                <h2>Explore AI Models</h2>
                <p className="home-section-subtitle">
                  Different models. Different strengths. One workspace.
                </p>
              </div>

              <Link to="/chat" className="home-text-link">
                Open Chat <ArrowRight size={15} />
              </Link>
            </div>

            <div className="home-model-grid">
              {favoriteModels.map((model) => (
                <Link to="/chat" className="home-model-card" key={model.name}>
                  <div className={`home-model-symbol ${model.color}`}>
                    {model.symbol}
                  </div>

                  <div className="home-model-info">
                    <strong>{model.name}</strong>
                    <span>{model.provider}</span>
                  </div>

                  <ArrowRight className="home-model-arrow" size={17} />
                </Link>
              ))}
            </div>
          </section>

          <section className="home-bottom-grid">
            <div className="home-library-section">
              <div className="home-section-title-row">
                <div>
                  <p className="home-overline">PICK UP WHERE YOU LEFT OFF</p>
                  <h2>Continue Working</h2>
                </div>

                <Link to="/saved" className="home-text-link">
                  View all <ArrowRight size={15} />
                </Link>
              </div>

              <div className="home-project-list">
                {projects.length === 0 && (
                  <div className="home-empty-state">
                    <FolderOpen size={25} />
                    <strong>No saved conversations yet</strong>
                    <span>Your saved chats will appear here.</span>
                    <Link to="/chat">Start your first chat</Link>
                  </div>
                )}

                {projects.map((p) => (
                  <Link
                    to={p.sessionId ? `/chat?session=${p.sessionId}` : '/saved'}
                    key={p.id}
                    className="home-project-card"
                  >
                    <div className="home-project-icon">
                      <MessageSquare size={18} />
                    </div>

                    <div className="home-project-info">
                      <strong>{p.title}</strong>
                      <p>{p.sub}</p>
                      <span>
                        <Clock3 size={12} />
                        Updated {timeAgo(p.updatedAt)}
                      </span>
                    </div>

                    <ChevronRight size={17} className="home-project-arrow" />
                  </Link>
                ))}

                <Link to="/chat" className="home-create-card">
                  <span><Plus size={19} /></span>
                  <div>
                    <strong>Create something new</strong>
                    <small>Start a fresh AI conversation</small>
                  </div>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            <div className="home-activity-section">
              <div className="home-section-title-row">
                <div>
                  <p className="home-overline">YOUR WORKSPACE</p>
                  <h2>Recent Activity</h2>
                </div>
                <div className="home-activity-icon">
                  <Activity size={18} />
                </div>
              </div>

              <div className="home-activity-card">
                {activity.length === 0 && (
                  <div className="home-activity-empty">
                    <Activity size={24} />
                    <p>No activity yet.</p>
                    <span>Your recent actions will show up here.</span>
                  </div>
                )}

                {activity.map((a, index) => (
                  <div className="home-activity-item" key={a.id}>
                    <div className="home-activity-marker">
                      <span />
                      {index !== activity.length - 1 && (
                        <i />
                      )}
                    </div>

                    <div className="home-activity-info">
                      <strong>{a.title}</strong>
                      <p>{a.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <footer className="home-footer">
            <span>AI Nexus © 2026</span>
            <span>One workspace. Multiple possibilities.</span>
          </footer>
        </div>
      </main>
    </div>
  )
}
