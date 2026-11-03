
import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom'
import {
  Send,
  Plus,
  Loader2,
  Bookmark,
  MessageSquare,
  Sparkles,
  Bot,
  Check,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Trash2,
  ArrowDown,
} from 'lucide-react'

import Sidebar from '../components/Sidebar.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import './chat.css'

const modelOptions = ['gemini', 'llama70b', 'llama8b', 'qwen', 'open router']

const modelLabels = {
  gemini: 'Gemini 3.6',
  llama70b: 'GPT-OSS 120B',
  llama8b: 'GPT-OSS 20B',
  qwen: 'Qwen3.6 27B',
  offline: 'OpenRouter Free',
}

const modelDescriptions = {
  gemini: 'Google AI',
  llama70b: 'Large model',
  llama8b: 'Compact model',
  qwen: 'Qwen AI',
  offline: 'Free cloud model',
}

const API = 'https://ai-nexus-backend-wato.onrender.com'
const LIBRARY_KEY = 'ainexus_library_items'
const ACTIVITY_KEY = 'ainexus_activity_log'

export default function Chat() {
  const { token } = useAuth()
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()

  const [sessionId, setSessionId] = useState(null)
  const [sessionTitle, setSessionTitle] = useState('New Chat')
  const [sessions, setSessions] = useState([])
  const [rounds, setRounds] = useState([])
  const [input, setInput] = useState('')
  const [selectedModels, setSelectedModels] = useState(['gemini', 'llama70b'])
  const [loading, setLoading] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(true)
  const [saved, setSaved] = useState(false)

  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }

  useEffect(() => {
    loadSessions()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [rounds])

  // Receive a question from the Home page
  useEffect(() => {
    const prefill = location.state?.prefill

    if (prefill) {
      navigate('/chat', { replace: true, state: {} })
      sendMessage(null, prefill)
    }
  }, [location.state])

  // Open a saved conversation using /chat?session=ID
  useEffect(() => {
    const sid = searchParams.get('session')
    if (sid) openSession(Number(sid))
  }, [searchParams])

  async function loadSessions() {
    try {
      const res = await fetch(`${API}/api/sessions`, {
        headers: authHeaders,
      })

      if (res.ok) {
        setSessions(await res.json())
      }
    } catch (error) {
      console.error('Unable to load chat history:', error)
    }
  }

  async function openSession(id) {
    try {
      const res = await fetch(`${API}/api/sessions/${id}`, {
        headers: authHeaders,
      })

      if (!res.ok) return

      const data = await res.json()

      setSessionId(id)
      setSessionTitle(data.title || 'Chat')
      setSaved(false)

      const rebuilt = []
      let current = null

      for (const message of data.messages || []) {
        if (message.role === 'user') {
          current = {
            id: `${Date.now()}-${rebuilt.length}`,
            prompt: message.content,
            results: {},
          }
          rebuilt.push(current)
        } else if (current) {
          current.results[message.model] = message.content
        }
      }

      setRounds(rebuilt)

      if (window.innerWidth <= 900) {
        setHistoryOpen(false)
      }
    } catch (error) {
      console.error('Unable to open conversation:', error)
    }
  }

  function startNewChat() {
    if (loading) return

    setSessionId(null)
    setSessionTitle('New Chat')
    setRounds([])
    setInput('')
    setSaved(false)

    navigate('/chat', { replace: true, state: {} })
  }

  async function ensureSession() {
    if (sessionId) return sessionId

    const res = await fetch(`${API}/api/sessions`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ title: 'New Chat' }),
    })

    if (!res.ok) {
      throw new Error('Unable to create chat session')
    }

    const data = await res.json()

    setSessionId(data.id)
    loadSessions()

    return data.id
  }

  async function saveMessage(sid, role, model, content) {
    const res = await fetch(`${API}/api/sessions/${sid}/messages`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ role, model, content }),
    })

    if (!res.ok) {
      throw new Error('Unable to save message')
    }
  }

  async function sendMessage(e, overridePrompt) {
    if (e) e.preventDefault()

    const prompt = (overridePrompt ?? input).trim()

    if (!prompt || selectedModels.length === 0 || loading) return

    setInput('')
    setLoading(true)
    setSaved(false)

    const roundId = `${Date.now()}-${Math.random()}`

    const round = {
      id: roundId,
      prompt,
      results: Object.fromEntries(
        selectedModels.map((model) => [model, null])
      ),
    }

    setRounds((prev) => [...prev, round])

    try {
      const sid = await ensureSession()

      await saveMessage(sid, 'user', null, prompt)

      await Promise.all(
        selectedModels.map(async (model) => {
          try {
            
const res = await fetch(`${API}/api/chat`, {
  method: 'POST',
  headers: authHeaders,
  body: JSON.stringify({ prompt, model }),
})

const data = await res.json()

if (!res.ok) {
  throw new Error(
    data.detail || data.error || 'Model request failed'
  )
}

const reply = data.reply || 'No response received.'


            setRounds((prev) =>
              prev.map((item) =>
                item.id === roundId
                  ? {
                      ...item,
                      results: {
                        ...item.results,
                        [model]: reply,
                      },
                    }
                  : item
              )
            )

            await saveMessage(sid, 'assistant', model, reply)
          } catch (error) {
            console.error(`${model} response error:`, error)

            const errorText = 'Unable to get a response from this model.'

            setRounds((prev) =>
              prev.map((item) =>
                item.id === roundId
                  ? {
                      ...item,
                      results: {
                        ...item.results,
                        [model]: errorText,
                      },
                    }
                  : item
              )
            )
          }
        })
      )

      loadSessions()
    } catch (error) {
      console.error('Chat error:', error)
      alert('Unable to send your message. Please try again.')
      setRounds((prev) => prev.filter((item) => item.id !== roundId))
    } finally {
      setLoading(false)
    }
  }

  function toggleModel(model) {
    setSelectedModels((prev) =>
      prev.includes(model)
        ? prev.filter((item) => item !== model)
        : [...prev, model]
    )
  }

  function saveToLibrary() {
    if (!sessionId || rounds.length === 0 || saved) return

    try {
      const library = JSON.parse(
        localStorage.getItem(LIBRARY_KEY) || '[]'
      )

      const alreadySaved = library.find(
        (item) => item.sessionId === sessionId
      )

      if (alreadySaved) {
        setSaved(true)
        alert('This conversation is already in your Library.')
        return
      }

      const firstPrompt = rounds[0]?.prompt || sessionTitle

      const newItem = {
        id: Date.now(),
        sessionId,
        title:
          sessionTitle !== 'New Chat'
            ? sessionTitle
            : firstPrompt.slice(0, 60),
        sub: firstPrompt.slice(0, 80),
        tag: 'CHAT',
        pinned: false,
        updatedAt: new Date().toISOString(),
      }

      localStorage.setItem(
        LIBRARY_KEY,
        JSON.stringify([newItem, ...library])
      )

      const activity = JSON.parse(
        localStorage.getItem(ACTIVITY_KEY) || '[]'
      )

      const entry = {
        id: Date.now(),
        title: 'Saved Conversation',
        sub: `"${newItem.title}"`,
        time: new Date().toISOString(),
      }

      localStorage.setItem(
        ACTIVITY_KEY,
        JSON.stringify([entry, ...activity].slice(0, 20))
      )

      setSaved(true)
      alert('Saved to Library!')
    } catch (error) {
      console.error('Library save error:', error)
      alert('Unable to save this conversation.')
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="chat-layout">
      <Sidebar />

      <div className="chat-workspace">
        {/* Conversation history */}
        {historyOpen && (
          <aside className="chat-history">
            <div className="history-heading">
              <div>
                <span className="history-eyebrow">WORKSPACE</span>
                <h3>Conversations</h3>
              </div>

              <button
                className="history-icon-button"
                onClick={() => setHistoryOpen(false)}
                title="Close history"
              >
                <PanelLeftClose size={18} />
              </button>
            </div>

            <button
              className="new-chat-button"
              onClick={startNewChat}
              disabled={loading}
            >
              <Plus size={17} />
              <span>New conversation</span>
              <span className="new-chat-shortcut">+</span>
            </button>

            <div className="history-section-label">
              <span>RECENT CHATS</span>
              <span>{sessions.length}</span>
            </div>

            <div className="history-list">
              {sessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => openSession(session.id)}
                  className={`history-item ${
                    sessionId === session.id ? 'active' : ''
                  }`}
                >
                  <MessageSquare size={16} />
                  <span>{session.title || 'Untitled conversation'}</span>
                  {sessionId === session.id && (
                    <ChevronRight size={15} />
                  )}
                </button>
              ))}

              {sessions.length === 0 && (
                <div className="history-empty">
                  <MessageSquare size={22} />
                  <p>No conversations yet</p>
                  <span>Your chats will appear here.</span>
                </div>
              )}
            </div>

            <div className="history-bottom">
              <div className="history-tip-icon">
                <Sparkles size={17} />
              </div>
              <div>
                <strong>Think with multiple models</strong>
                <p>Compare different AI perspectives in one place.</p>
              </div>
            </div>
          </aside>
        )}

        {/* Main chat area */}
        <main className="chat-main">
          <header className="chat-topbar">
            <div className="chat-topbar-left">
              {!historyOpen && (
                <button
                  className="history-icon-button"
                  onClick={() => setHistoryOpen(true)}
                  title="Open history"
                >
                  <PanelLeftOpen size={19} />
                </button>
              )}

              <div className="chat-page-icon">
                <Bot size={20} />
              </div>

              <div>
                <h2>AI Workspace</h2>
                <p>
                  {sessionTitle}
                  <span className="chat-status-dot" />
                  Ready to assist
                </p>
              </div>
            </div>

            <div className="chat-topbar-actions">
              <div className="selected-count">
                <span>{selectedModels.length}</span> models selected
              </div>

              <button
                className={`save-chat-button ${saved ? 'is-saved' : ''}`}
                onClick={saveToLibrary}
                disabled={!sessionId || rounds.length === 0}
              >
                {saved ? <Check size={16} /> : <Bookmark size={16} />}
                <span>{saved ? 'Saved' : 'Save chat'}</span>
              </button>
            </div>
          </header>

          {/* Messages */}
          <section className="chat-messages">
            {rounds.length === 0 ? (
              <div className="chat-welcome">
                <div className="welcome-orbit">
                  <div className="welcome-orbit-inner">
                    <Bot size={42} />
                  </div>
                  <span className="orbit-dot orbit-dot-one" />
                  <span className="orbit-dot orbit-dot-two" />
                  <span className="orbit-dot orbit-dot-three" />
                </div>

                <span className="welcome-label">
                  <Sparkles size={14} />
                  YOUR AI WORKSPACE
                </span>

                <h1>
                  One question.
                  <br />
                  <span>Multiple perspectives.</span>
                </h1>

                <p>
                  Ask a question and compare responses from multiple AI
                  models side by side. Find the answer that works best
                  for you.
                </p>

                <div className="suggestion-grid">
                  {[
                    {
                      icon: 'code',
                      title: 'Write code',
                      prompt: 'Explain React hooks with practical examples.',
                    },
                    {
                      icon: 'idea',
                      title: 'Explore ideas',
                      prompt: 'Suggest innovative AI project ideas for students.',
                    },
                    {
                      icon: 'learn',
                      title: 'Learn something',
                      prompt: 'Explain machine learning in simple terms.',
                    },
                  ].map((item) => (
                    <button
                      key={item.title}
                      className="suggestion-card"
                      onClick={() => {
                        setInput(item.prompt)
                        textareaRef.current?.focus()
                      }}
                    >
                      <span className={`suggestion-icon ${item.icon}`}>
                        {item.icon === 'code' ? (
                          <span>{'</>'}</span>
                        ) : item.icon === 'idea' ? (
                          <Sparkles size={18} />
                        ) : (
                          <MessageSquare size={18} />
                        )}
                      </span>
                      <span className="suggestion-content">
                        <strong>{item.title}</strong>
                        <small>{item.prompt}</small>
                      </span>
                      <ChevronRight size={16} />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="conversation-content">
                {rounds.map((round) => (
                  <div className="conversation-round" key={round.id}>
                    <div className="user-message-row">
                      <div className="user-message">
                        <p>{round.prompt}</p>
                      </div>
                    </div>

                    <div
                      className={`model-response-grid ${
                        Object.keys(round.results).length > 1
                          ? 'multi-model'
                          : ''
                      }`}
                    >
                      {Object.entries(round.results).map(
                        ([model, response]) => (
                          <article
                            className="model-response-card"
                            key={model}
                          >
                            <div className="response-card-header">
                              <div className={`model-avatar ${model}`}>
                                <Bot size={18} />
                              </div>

                              <div className="response-model-info">
                                <strong>
                                  {modelLabels[model] || model}
                                </strong>
                                <span>
                                  {modelDescriptions[model] || 'AI model'}
                                </span>
                              </div>

                              <span className="response-indicator">
                                {response === null ? (
                                  <Loader2
                                    size={16}
                                    className="chat-spinner"
                                  />
                                ) : (
                                  <Check size={15} />
                                )}
                              </span>
                            </div>

                            <div className="response-card-body">
                              {response === null ? (
                                <div className="generating-state">
                                  <span className="generating-line" />
                                  <span className="generating-line short" />
                                  <span className="generating-line medium" />
                                  <small>Generating response...</small>
                                </div>
                              ) : (
                                <p>{response}</p>
                              )}
                            </div>
                          </article>
                        )
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </section>

          {/* Composer */}
          <footer className="chat-composer-area">
            <div className="composer-inner">
              <div className="model-selector-heading">
                <div>
                  <Sparkles size={15} />
                  <span>Choose AI models</span>
                </div>
                <span className="model-selection-hint">
                  Select one or more
                </span>
              </div>

              <div className="model-selector">
                {modelOptions.map((model) => {
                  const active = selectedModels.includes(model)

                  return (
                    <button
                      key={model}
                      type="button"
                      onClick={() => toggleModel(model)}
                      className={`model-chip ${active ? 'selected' : ''}`}
                    >
                      <span className={`model-chip-dot ${model}`} />
                      <span>{modelLabels[model]}</span>
                      {active && <Check size={13} />}
                    </button>
                  )
                })}
              </div>

              <form
                className="message-composer"
                onSubmit={sendMessage}
              >
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything... compare answers from your selected models."
                  rows={2}
                  disabled={loading}
                />

                <div className="composer-bottom">
                  <span>
                    <Sparkles size={13} />
                    AI Nexus can make mistakes. Verify important information.
                  </span>

                  <button
                    type="submit"
                    className="send-message-button"
                    disabled={
                      loading ||
                      !input.trim() ||
                      selectedModels.length === 0
                    }
                    title="Send message"
                  >
                    {loading ? (
                      <Loader2 size={18} className="chat-spinner" />
                    ) : (
                      <Send size={18} />
                    )}
                    <span>{loading ? 'Thinking' : 'Send'}</span>
                  </button>
                </div>
              </form>

              {selectedModels.length === 0 && (
                <p className="model-warning">
                  Please select at least one AI model to continue.
                </p>
              )}
            </div>
          </footer>
        </main>
      </div>
    </div>
  )
}
