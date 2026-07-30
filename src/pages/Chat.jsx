import { useState, useEffect } from 'react'
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar.jsx'
import AmbientBackground from '../components/AmbientBackground.jsx'
import { Send, Plus, Loader2, Bookmark } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

const modelOptions = ['gemini', 'llama70b', 'llama8b', 'qwen', 'offline']
const modelLabels = {
  gemini: 'Gemini 3.6',
  llama70b: 'GPT-OSS 120B',
  llama8b: 'GPT-OSS 20B',
  qwen: 'Qwen3.6 27B',
  offline: 'Llama (Offline)',
}
const API = 'https://ai-nexus-backend-wato.onrender.com'
const LIBRARY_KEconstY = 'ainexus_library_items'
const ACTIVITY_KEY = 'ainexus_activity_log'

export default function Chat() {
  const { token } = useAuth()
  const [searchParams] = useSearchParams()
  const location = useLocation()
const navigate = useNavigate()
  const [sessionId, setSessionId] = useState(null)
  const [sessionTitle, setSessionTitle] = useState('New Chat')
  const [sessions, setSessions] = useState([])
  const [rounds, setRounds] = useState([]) // [{ prompt, results: { model: text|null } }]
  const [input, setInput] = useState('')
  const [selectedModels, setSelectedModels] = useState(['gemini', 'llama70b'])
  const [loading, setLoading] = useState(false)

  const authHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }

  useEffect(() => {
    loadSessions()
  }, [])
  useEffect(() => {
  const prefill = location.state?.prefill
  if (prefill) {
    sendMessage(null, prefill)
    navigate('/chat', { replace: true, state: {} })
  }
}, [location.state])

  // Deep-link: /chat?session=<id> opens that session (used by Saved page "Continue")
  useEffect(() => {
    const sid = searchParams.get('session')
    if (sid) openSession(Number(sid))
  }, [searchParams])

  async function loadSessions() {
    const res = await fetch(`${API}/api/sessions`, { headers: authHeaders })
    if (res.ok) setSessions(await res.json())
  }

  async function openSession(id) {
    const res = await fetch(`${API}/api/sessions/${id}`, { headers: authHeaders })
    if (!res.ok) return
    const data = await res.json()
    setSessionId(id)
    setSessionTitle(data.title || 'Chat')

    const rebuilt = []
    let current = null
    for (const m of data.messages) {
      if (m.role === 'user') {
        current = { prompt: m.content, results: {} }
        rebuilt.push(current)
      } else if (current) {
        current.results[m.model] = m.content
      }
    }
    setRounds(rebuilt)
  }

  function startNewChat() {
    setSessionId(null)
    setSessionTitle('New Chat')
    setRounds([])
  }

  async function ensureSession() {
    if (sessionId) return sessionId
    const res = await fetch(`${API}/api/sessions`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ title: 'New Chat' }),
    })
    const data = await res.json()
    setSessionId(data.id)
    loadSessions()
    return data.id
  }

  async function saveMessage(sid, role, model, content) {
    await fetch(`${API}/api/sessions/${sid}/messages`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ role, model, content }),
    })
  }

async function sendMessage(e, overridePrompt) {
  if (e) e.preventDefault()
  const prompt = overridePrompt ?? input
  if (!prompt.trim() || selectedModels.length === 0) return

  setInput('')
  setLoading(true)

    const sid = await ensureSession()
    await saveMessage(sid, 'user', null, prompt)

    const round = {
  prompt,
  results: Object.fromEntries(selectedModels.map((m) => [m, null]))
}

let roundIndex

setRounds((prev) => {
  roundIndex = prev.length
  return [...prev, round]
})

    await Promise.all(
      selectedModels.map(async (model) => {
        try {
          const res = await fetch(`${API}/api/chat`, {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify({ prompt, model }),
          })
          const data = await res.json()
          setRounds((prev) => {
            const copy = [...prev]
            copy[roundIndex] = { ...copy[roundIndex], results: { ...copy[roundIndex].results, [model]: data.reply } }
            return copy
          })
          await saveMessage(sid, 'assistant', model, data.reply)
        } catch {
          const errText = '⚠️ Error fetching response'
          setRounds((prev) => {
            const copy = [...prev]
            copy[roundIndex] = { ...copy[roundIndex], results: { ...copy[roundIndex].results, [model]: errText } }
            return copy
          })
        }
      })
    )
    setLoading(false)
    loadSessions()
  }

  // Save current session as a Library item (shown on Saved page)
  function saveToLibrary() {
    if (!sessionId || rounds.length === 0) return

    const library = JSON.parse(localStorage.getItem(LIBRARY_KEY) || '[]')
    const alreadySaved = library.find((i) => i.sessionId === sessionId)
    if (alreadySaved) return // avoid duplicates

    const firstPrompt = rounds[0]?.prompt || sessionTitle
    const newItem = {
      id: Date.now(),
      sessionId,
      title: sessionTitle !== 'New Chat' ? sessionTitle : firstPrompt.slice(0, 60),
      sub: firstPrompt.slice(0, 80),
      tag: 'CHAT',
      pinned: false,
      updatedAt: new Date().toISOString(),
    }
    localStorage.setItem(LIBRARY_KEY, JSON.stringify([newItem, ...library]))

    const activity = JSON.parse(localStorage.getItem(ACTIVITY_KEY) || '[]')
    const entry = { id: Date.now(), title: 'Saved Conversation', sub: `"${newItem.title}"`, time: new Date().toISOString() }
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify([entry, ...activity].slice(0, 20)))

    alert('Saved to Library!')
  }

  return (
    <div className="flex h-screen text-body">
      <AmbientBackground />
      <Sidebar />

      <aside className="glass w-64 border-r border-[var(--surface-border)] p-4">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-semibold text-body">History</p>
          <button onClick={startNewChat} className="text-muted hover:text-[var(--text-heading)]">
            <Plus size={16} />
          </button>
        </div>
        <ul className="space-y-1">
          {sessions.map((s) => (
            <li
              key={s.id}
              onClick={() => openSession(s.id)}
              className={`cursor-pointer truncate rounded-lg px-2 py-2 text-sm hover:bg-[var(--track-bg)] hover:text-[var(--text-heading)] ${
                sessionId === s.id ? 'bg-[var(--track-bg)] text-heading' : 'text-muted'
              }`}
            >
              {s.title}
            </li>
          ))}
          {sessions.length === 0 && <p className="text-xs text-faint">No chats yet</p>}
        </ul>
      </aside>

      <main className="flex flex-1 flex-col">
        <header className="glass flex items-center justify-between border-b border-[var(--surface-border)] px-6 py-4">
          <span className="font-semibold text-heading">AI Nexus</span>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted">{selectedModels.length} models selected</span>
            <button
              onClick={saveToLibrary}
              disabled={!sessionId || rounds.length === 0}
              className="btn-ghost flex items-center gap-1 px-3 py-1.5 text-xs disabled:opacity-40"
            >
              <Bookmark size={14} /> Save to Library
            </button>
          </div>
        </header>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
          {rounds.map((round, i) => (
            <div key={i} className="space-y-3">
              <div className="flex justify-end">
                <div className="max-w-lg rounded-2xl bg-gradient-to-r from-primary-500 to-fuchsia-500 px-4 py-3 text-sm text-white shadow-lg shadow-primary-600/30">
                  {round.prompt}
                </div>
              </div>

              <div className={`grid gap-3 ${Object.keys(round.results).length > 1 ? 'md:grid-cols-2' : ''}`}>
                {Object.entries(round.results).map(([model, text]) => (
                  <div key={model} className="glass rounded-2xl p-4">
                    <p className="mb-2 text-xs font-semibold text-primary-400">{modelLabels[model] || model}</p>
                    {text === null || text === undefined ? (
                      <div className="flex items-center gap-2 text-xs text-muted">
                        <Loader2 size={14} className="animate-spin" /> generating...
                      </div>
                    ) : (
                      <p className="text-sm text-body">{text}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="glass border-t border-[var(--surface-border)] p-4">
          <div className="mb-2 flex flex-wrap gap-2 text-xs">
            {modelOptions.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() =>
                  setSelectedModels((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]))
                }
                className={`rounded-full border px-3 py-1 ${
                  selectedModels.includes(m)
                    ? 'border-primary-400/40 bg-primary-500/20 text-primary-300'
                    : 'chip-inactive'
                }`}
              >
                {modelLabels[m]}
              </button>
            ))}
          </div>
          <form onSubmit={sendMessage} className="flex items-center gap-3 rounded-xl border border-[var(--surface-border)] bg-white/5 px-4 py-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask all selected models at once..."
              className="flex-1 bg-transparent text-sm text-heading placeholder-gray-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-gradient-to-r from-primary-500 to-fuchsia-500 p-2 text-white hover:opacity-90 disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}