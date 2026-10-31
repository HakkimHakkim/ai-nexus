
import { useState } from 'react'
import Sidebar from '../components/Sidebar.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import {
  Loader2,
  Send,
  Star,
  Zap,
  GitCompareArrows,
  Clock3,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react'
import './compare.css'

const modelOptions = ['gemini', 'llama70b', 'llama8b', 'qwen', 'offline']

const modelLabels = {
  gemini: 'Gemini 3.6',
  llama70b: 'GPT-OSS 120B',
  llama8b: 'GPT-OSS 20B',
  qwen: 'Qwen3.6 27B',
  offline: 'Llama Offline',
}

const modelProviders = {
  gemini: 'Google',
  llama70b: 'Open-weight',
  llama8b: 'Open-weight',
  qwen: 'Qwen',
  offline: 'Local model',
}

const modelSymbols = {
  gemini: 'G',
  llama70b: 'O',
  llama8b: 'O',
  qwen: 'Q',
  offline: 'L',
}

export default function Compare() {
  const [prompt, setPrompt] = useState('')
  const [selectedModels, setSelectedModels] = useState(['gemini', 'llama70b'])
  const [results, setResults] = useState({})
  const [loading, setLoading] = useState(false)

  const { token } = useAuth()

  function toggleModel(model) {
    setSelectedModels((prev) =>
      prev.includes(model)
        ? prev.filter((item) => item !== model)
        : [...prev, model]
    )
  }

  async function runComparison(e) {
    e.preventDefault()

    if (!prompt.trim() || selectedModels.length === 0 || loading) return

    setLoading(true)

    const initial = Object.fromEntries(
      selectedModels.map((model) => [
        model,
        { text: null, time: null, words: 0 },
      ])
    )

    setResults(initial)

    await Promise.all(
      selectedModels.map(async (model) => {
        const start = performance.now()

        try {
          const response = await fetch(
            'https://ai-nexus-backend-wato.onrender.com/api/chat',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ prompt: prompt.trim(), model }),
            }
          )

          const data = await response.json()

          if (!response.ok) {
            throw new Error(data.detail || data.message || 'Request failed')
          }

          if (typeof data.reply !== 'string') {
            throw new Error('Invalid response from model')
          }

          const time = (performance.now() - start) / 1000

          setResults((prev) => ({
            ...prev,
            [model]: {
              text: data.reply,
              time,
              words: data.reply.trim()
                ? data.reply.trim().split(/\s+/).length
                : 0,
            },
          }))
        } catch (error) {
          setResults((prev) => ({
            ...prev,
            [model]: {
              text: error.message || 'Error fetching response',
              time: null,
              words: 0,
              error: true,
            },
          }))
        }
      })
    )

    setLoading(false)
  }

  const resultEntries = Object.entries(results)

  const finished = resultEntries.filter(
    ([, result]) => result.time !== null && result.text !== null
  )

  const allDone =
    resultEntries.length > 0 &&
    resultEntries.every(([, result]) => result.text !== null)

  const times = finished.map(([, result]) => result.time)
  const fastest = times.length ? Math.min(...times) : 0
  const slowest = times.length ? Math.max(...times) : 0

  function starsFor(time) {
    if (slowest === fastest) return 5

    const ratio = 1 - (time - fastest) / (slowest - fastest)

    return Math.max(1, Math.round(1 + ratio * 4))
  }

  function performanceWidth(time) {
    if (slowest === fastest) return 100

    return Math.max(
      8,
      100 - ((time - fastest) / (slowest - fastest)) * 92
    )
  }

  return (
    <div className="compare-shell">
      <Sidebar />

      <main className="compare-page">
        <div className="compare-content">

          {/* HEADER */}
          <header className="compare-header">
            <div>
              <div className="compare-breadcrumb">
                <span>Workspace</span>
                <span>/</span>
                <strong>Compare Models</strong>
              </div>

              <p className="compare-overline">AI MODEL LABORATORY</p>

              <h1>Comparison Studio</h1>

              <p className="compare-header-description">
                One prompt. Multiple AI models. Discover the differences
                in their responses and performance.
              </p>
            </div>

            <div className="compare-header-icon">
              <GitCompareArrows size={27} />
            </div>
          </header>

          {/* MODEL SELECTOR */}
          <section className="compare-selector-card">
            <div className="compare-section-heading">
              <div className="compare-heading-icon">
                <Sparkles size={19} />
              </div>

              <div>
                <h2>Select AI Models</h2>
                <p>
                  Choose the models you want to compare.
                </p>
              </div>

              <span className="compare-selected-count">
                {selectedModels.length} selected
              </span>
            </div>

            <div className="compare-model-grid">
              {modelOptions.map((model) => {
                const isSelected = selectedModels.includes(model)

                return (
                  <button
                    key={model}
                    type="button"
                    onClick={() => toggleModel(model)}
                    className={`compare-model-option ${model} ${
                      isSelected ? 'selected' : ''
                    }`}
                    aria-pressed={isSelected}
                  >
                    <span className="compare-model-symbol">
                      {modelSymbols[model]}
                    </span>

                    <span className="compare-model-details">
                      <strong>{modelLabels[model]}</strong>
                      <small>{modelProviders[model]}</small>
                    </span>

                    <span className="compare-model-check">
                      {isSelected && <CheckCircle2 size={17} />}
                    </span>
                  </button>
                )
              })}
            </div>

            <p className="compare-selection-hint">
              Select at least one model to start your comparison.
            </p>
          </section>

          {/* PROMPT */}
          <form className="compare-prompt-card" onSubmit={runComparison}>
            <div className="compare-section-heading">
              <div className="compare-heading-icon orange">
                <MessageSquare size={19} />
              </div>

              <div>
                <h2>Your Comparison Prompt</h2>
                <p>
                  Ask the same question to every selected model.
                </p>
              </div>
            </div>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Example: Explain machine learning with a practical real-world example..."
              rows={4}
              disabled={loading}
            />

            <div className="compare-prompt-footer">
              <span>
                {prompt.trim().length} characters
              </span>

              <button
                type="submit"
                disabled={
                  loading ||
                  !prompt.trim() ||
                  selectedModels.length === 0
                }
                className="compare-run-btn"
              >
                {loading ? (
                  <>
                    <Loader2 size={17} className="compare-spin" />
                    Comparing...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Run Comparison
                  </>
                )}
              </button>
            </div>
          </form>

          {/* PERFORMANCE SUMMARY */}
          {allDone && finished.length > 0 && (
            <section className="compare-performance">
              <div className="compare-section-heading">
                <div className="compare-heading-icon orange">
                  <Zap size={19} />
                </div>

                <div>
                  <h2>Performance Summary</h2>
                  <p>
                    Compare response speed across successful results.
                  </p>
                </div>
              </div>

              <div className="compare-performance-list">
                {finished
                  .slice()
                  .sort((a, b) => a[1].time - b[1].time)
                  .map(([model, result]) => {
                    const stars = starsFor(result.time)
                    const isFastest = result.time === fastest

                    return (
                      <div className="compare-performance-item" key={model}>
                        <div className="compare-performance-top">
                          <div className="compare-performance-name">
                            <strong>{modelLabels[model]}</strong>

                            {isFastest && (
                              <span className="compare-fastest-tag">
                                <Zap size={11} />
                                Fastest
                              </span>
                            )}
                          </div>

                          <div className="compare-performance-stats">
                            <span>
                              <Clock3 size={12} />
                              {result.time.toFixed(2)}s
                            </span>

                            <span>{result.words} words</span>

                            <span className="compare-stars">
                              {Array.from({ length: 5 }).map((_, index) => (
                                <Star
                                  key={index}
                                  size={12}
                                  className={
                                    index < stars
                                      ? 'active'
                                      : ''
                                  }
                                />
                              ))}
                            </span>
                          </div>
                        </div>

                        <div className="compare-progress-track">
                          <div
                            className="compare-progress-fill"
                            style={{
                              width: `${performanceWidth(result.time)}%`,
                            }}
                          />
                        </div>
                      </div>
                    )
                  })}
              </div>

              {finished.length !== resultEntries.length && (
                <p className="compare-partial-note">
                  Some models returned errors and were excluded from
                  the performance ranking.
                </p>
              )}
            </section>
          )}

          {/* RESULTS */}
          {resultEntries.length > 0 && (
            <section className="compare-results-section">
              <div className="compare-results-heading">
                <div>
                  <p className="compare-overline">MODEL OUTPUTS</p>
                  <h2>Side-by-side Responses</h2>
                </div>

                <span>
                  {finished.length}/{resultEntries.length} completed
                </span>
              </div>

              <div className="compare-results-grid">
                {resultEntries.map(([model, result]) => (
                  <article
                    key={model}
                    className={`compare-result-card ${model}`}
                  >
                    <div className="compare-result-header">
                      <div className="compare-result-model">
                        <span className="compare-model-symbol">
                          {modelSymbols[model]}
                        </span>

                        <div>
                          <strong>{modelLabels[model]}</strong>
                          <small>{modelProviders[model]}</small>
                        </div>
                      </div>

                      {result.text === null ? (
                        <span className="compare-status loading">
                          <Loader2 size={13} className="compare-spin" />
                          Generating
                        </span>
                      ) : result.error ? (
                        <span className="compare-status error">
                          <AlertCircle size={13} />
                          Error
                        </span>
                      ) : (
                        <span className="compare-status success">
                          <CheckCircle2 size={13} />
                          Completed
                        </span>
                      )}
                    </div>

                    <div className="compare-result-body">
                      {result.text === null ? (
                        <div className="compare-generating">
                          <Loader2 size={20} className="compare-spin" />
                          <span>Generating response...</span>
                        </div>
                      ) : result.error ? (
                        <p className="compare-error-text">
                          {result.text}
                        </p>
                      ) : (
                        <p>{result.text}</p>
                      )}
                    </div>

                    {result.time !== null && (
                      <div className="compare-result-footer">
                        <span>
                          <Clock3 size={12} />
                          {result.time.toFixed(2)}s
                        </span>

                        <span>{result.words} words</span>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* INITIAL EMPTY STATE */}
          {resultEntries.length === 0 && (
            <div className="compare-empty-state">
              <div className="compare-empty-icon">
                <GitCompareArrows size={29} />
              </div>

              <h3>Ready to compare?</h3>

              <p>
                Select your AI models, enter a prompt, and see how
                different models approach the same question.
              </p>
            </div>
          )}

          <footer className="compare-footer">
            <span>AI Nexus © 2026</span>
            <span>Compare intelligence. Discover possibilities.</span>
          </footer>

        </div>
      </main>
    </div>
  )
}
