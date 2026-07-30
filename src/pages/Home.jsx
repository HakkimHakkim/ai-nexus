import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar.jsx'
import AmbientBackground from '../components/AmbientBackground.jsx'
import { ArrowRight, Plus } from 'lucide-react'

const favoriteModels = ['Gemini 3.6 Pro', 'GPT-OSS-1208', 'GPT-OSS-20B', 'Qween3.6 27B', 'Llama(offline)']

const LIBRARY_KEY = 'ainexus_library_items'
const ACTIVITY_KEY = 'ainexus_activity_log'

export default function Home() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [activity, setActivity] = useState([])
  const [askInput, setAskInput] = useState('')

  useEffect(() => {
    const items = JSON.parse(localStorage.getItem(LIBRARY_KEY) || '[]')
    const sorted = [...items].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    setProjects(sorted.slice(0, 3))

    const log = JSON.parse(localStorage.getItem(ACTIVITY_KEY) || '[]')
    setActivity(log.slice(0, 5))
  }, [])

  const timeAgo = (iso) => {
    const diff = Date.now() - new Date(iso).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  const handleAsk = () => {
    if (!askInput.trim()) return
    navigate('/chat', { state: { prefill: askInput } })
  }

  return (
    <div className="flex min-h-screen text-body">
      <AmbientBackground />
      <Sidebar />
      <main className="flex-1 px-10 py-8">
        <h1 className="text-2xl font-bold text-heading">Welcome Back 👋</h1>
        <p className="mt-1 text-muted">What would you like to create today?</p>

        <div className="glass mt-6 rounded-2xl p-6 shadow-xl shadow-black/10">
          <p className="mb-2 text-sm font-medium text-body">Ask AI Nexus</p>
          <div className="flex items-center gap-3 rounded-xl border surface px-4 py-3">
            <input
              value={askInput}
              onChange={(e) => setAskInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
              placeholder="What do you want to explore today?"
              className="flex-1 bg-transparent text-sm text-body placeholder-gray-500 focus:outline-none"
            />
            <button onClick={handleAsk} className="rounded-full bg-gradient-to-r from-primary-500 to-fuchsia-500 p-2 text-heading hover:opacity-90">
              <ArrowRight size={16} />
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted">
            {['Research', 'Coding', 'Resume Analysis', 'Email Writing', 'Summarize', 'Translate'].map((t) => (
              <span key={t} className="rounded-full border surface px-3 py-1">
                {t}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-4 flex gap-3">
          <Link to="/chat" className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Start New Chat
          </Link>
          <Link to="/compare" className="btn-ghost">
            Compare AI Models
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <p className="mb-3 text-sm font-semibold text-body">Favorite AI Models</p>
            <div className="flex flex-wrap gap-2">
              {favoriteModels.map((m) => (
                <span key={m} className="glass rounded-full px-4 py-1.5 text-sm text-body">
                  {m}
                </span>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm font-semibold text-body">Continue Working</p>
              <Link to="/saved" className="text-xs text-primary-400 hover:underline">
                View All
              </Link>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {projects.length === 0 && (
                <p className="text-xs text-faint">No saved conversations yet.</p>
              )}
              {projects.map((p) => (
                <Link
                  to={p.sessionId ? `/chat?session=${p.sessionId}` : '/saved'}
                  key={p.id}
                  className="glass rounded-xl p-4 hover:bg-[var(--track-bg)]"
                >
                  <p className="text-sm font-medium text-heading">{p.title}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-muted">{p.sub}</p>
                  <p className="mt-3 text-xs text-faint">Updated {timeAgo(p.updatedAt)}</p>
                </Link>
              ))}
              <Link
                to="/chat"
                className="flex items-center justify-center rounded-xl border surface border-dashed p-4 text-sm text-muted hover:bg-[var(--track-bg)]"
              >
                <Plus size={16} className="mr-1" /> Create New Project
              </Link>
            </div>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-body">Recent Activity</p>
            <div className="glass space-y-3 rounded-xl p-4">
              {activity.length === 0 && <p className="text-xs text-faint">No activity yet.</p>}
              {activity.map((a) => (
                <div key={a.id} className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary-400 shadow shadow-primary-400/60" />
                  <div>
                    <p className="text-sm text-body">{a.title}</p>
                    <p className="text-xs text-faint">{a.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}