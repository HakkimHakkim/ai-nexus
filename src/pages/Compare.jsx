import { useState } from 'react'
import Sidebar from '../components/Sidebar.jsx'
import AmbientBackground from '../components/AmbientBackground.jsx'
import { Loader2, Send, Star, Zap } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

const modelOptions = ['gemini', 'llama70b', 'llama8b', 'qwen', 'offline']
const modelLabels = {
  gemini: 'Gemini 3.6',
  llama70b: 'GPT-OSS 120B',
  llama8b: 'GPT-OSS 20B',
  qwen: 'Qwen3.6 27B',
  offline: 'Llama (Offline)',
}

export default function Compare() {
  const [prompt, setPrompt] = useState('')
  const [selectedModels, setSelectedModels] = useState(['gemini', 'llama70b'])
  const [results, setResults] = useState({}) // { model: { text, time } }
  const [loading, setLoading] = useState(false)
  const { token } = useAuth()

  function toggleModel(m) {
    setSelectedModels((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]
    )
  }

  async function runComparison(e) {
    e.preventDefault()
    if (!prompt.trim() || selectedModels.length === 0) return

    setLoading(true)
    const initial = Object.fromEntries(selectedModels.map((m) => [m, { text: null, time: null }]))
    setResults(initial)

    await Promise.all(
      selectedModels.map(async (model) => {
        const start = performance.now()
        try {
          const res = await fetch('http://localhost:8000/api/chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ prompt, model }),
          })
          const data = await res.json()
          const time = (performance.now() - start) / 1000
          setResults((prev) => ({ ...prev, [model]: { text: data.reply, time, words: data.reply.split(/\s+/).length } }))
        } catch {
          setResults((prev) => ({ ...prev, [model]: { text: '⚠️ Error fetching response', time: null, words: 0 } }))
        }
      })
    )
    setLoading(false)
  }

  const finished = Object.entries(results).filter(([, r]) => r.time !== null && r.text !== null)
  const allDone = finished.length > 0 && finished.length === Object.keys(results).length
  const times = finished.map(([, r]) => r.time)
  const fastest = times.length ? Math.min(...times) : 0
  const slowest = times.length ? Math.max(...times) : 0

  // star rating: faster relative to the group = more stars (5 = fastest, scaled down)
  function starsFor(time) {
    if (slowest === fastest) return 5
    const ratio = 1 - (time - fastest) / (slowest - fastest) // 1 = fastest, 0 = slowest
    return Math.max(1, Math.round(1 + ratio * 4))
  }

  return (
    <div className="flex min-h-screen text-body">
      <AmbientBackground />
      <Sidebar />
      <main className="flex-1 px-10 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-heading">Comparison Studio</h1>
            <p className="text-sm text-muted">Ask one prompt, compare speed &amp; efficiency side by side.</p>
          </div>
        </div>

        <form onSubmit={runComparison} className="glass rounded-2xl p-5">
          <div className="mb-3 flex flex-wrap gap-2 text-xs">
            {modelOptions.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => toggleModel(m)}
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
          <div className="flex items-center gap-3 rounded-xl border border-[var(--surface-border)] bg-white/5 px-4 py-2">
            <input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask something to compare model performance..."
              className="flex-1 bg-transparent text-sm text-heading placeholder-gray-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-gradient-to-r from-primary-500 to-fuchsia-500 p-2 text-white hover:opacity-90 disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </div>
        </form>

        {/* Performance summary: bars + stars */}
        {allDone && (
          <div className="glass mt-4 rounded-2xl p-5">
            <p className="mb-4 flex items-center gap-2 text-sm font-semibold text-heading">
              <Zap size={16} className="text-primary-400" /> Performance Summary
            </p>
            <div className="space-y-4">
              {finished
                .slice()
                .sort((a, b) => a[1].time - b[1].time)
                .map(([model, r]) => {
                  const pct = slowest === fastest ? 100 : Math.max(8, 100 - ((r.time - fastest) / (slowest - fastest)) * 92)
                  const stars = starsFor(r.time)
                  return (
                    <div key={model}>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="font-medium text-body">
                          {modelLabels[model]} {r.time === fastest && <span className="ml-1 text-primary-400">⚡ fastest</span>}
                        </span>
                        <span className="flex items-center gap-2 text-faint">
                          {r.time.toFixed(1)}s · {r.words} words
                          <span className="flex">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                size={12}
                                className={i < stars ? 'fill-yellow-400 text-yellow-400' : 'text-white/20'}
                              />
                            ))}
                          </span>
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full track">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-primary-500 to-fuchsia-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        )}

        {Object.keys(results).length > 0 && (
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            {Object.entries(results).map(([model, r]) => (
              <div key={model} className="glass rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-heading">{modelLabels[model]}</p>
                  {r.time && <p className="text-xs text-faint">{r.time.toFixed(1)}s</p>}
                </div>
                {r.text === null ? (
                  <div className="mt-3 flex items-center gap-2 text-xs text-muted">
                    <Loader2 size={14} className="animate-spin" /> generating...
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-body">{r.text}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
