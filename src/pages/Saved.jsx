
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar.jsx'
import {
  Search,
  Plus,
  Star,
  Trash2,
  X,
  FolderOpen,
  Clock3,
  Activity,
  MessageSquare,
  ArrowRight,
  Bookmark,
  Tag,
  Pin,
  SearchX,
} from 'lucide-react'
import './saved.css'

const STORAGE_KEY = 'ainexus_library_items'
const ACTIVITY_KEY = 'ainexus_activity_log'

function loadItems() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function loadActivity() {
  try {
    const stored = localStorage.getItem(ACTIVITY_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export default function Saved() {
  const navigate = useNavigate()

  const [items, setItems] = useState([])
  const [activity, setActivity] = useState([])
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [formTitle, setFormTitle] = useState('')
  const [formTag, setFormTag] = useState('')
  const [formSub, setFormSub] = useState('')

  useEffect(() => {
    setItems(loadItems())
    setActivity(loadActivity())
  }, [])

  const persistItems = (updated) => {
    setItems(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }

  const persistActivity = (entry) => {
    const updated = [entry, ...activity].slice(0, 20)
    setActivity(updated)
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify(updated))
  }

  const openModal = () => {
    setFormTitle('')
    setFormTag('')
    setFormSub('')
    setShowModal(true)
  }

  const submitItem = (e) => {
    e.preventDefault()

    if (!formTitle.trim()) return

    const newItem = {
      id: Date.now(),
      title: formTitle.trim(),
      sub: formSub.trim(),
      tag: (formTag.trim() || 'GENERAL').toUpperCase(),
      pinned: false,
      updatedAt: new Date().toISOString(),
    }

    persistItems([newItem, ...items])

    persistActivity({
      id: Date.now(),
      title: 'Saved Conversation',
      sub: `"${newItem.title}"`,
      time: new Date().toISOString(),
    })

    setShowModal(false)
  }

  const togglePin = (id) => {
    const item = items.find((i) => i.id === id)
    if (!item) return

    const updated = items.map((i) =>
      i.id === id ? { ...i, pinned: !i.pinned } : i
    )

    persistItems(updated)

    persistActivity({
      id: Date.now(),
      title: item.pinned ? 'Unpinned Item' : 'Pinned Item',
      sub: `"${item.title}"`,
      time: new Date().toISOString(),
    })
  }

  const deleteItem = (id) => {
    const item = items.find((i) => i.id === id)
    if (!item) return

    const updated = items.filter((i) => i.id !== id)

    persistItems(updated)

    persistActivity({
      id: Date.now(),
      title: 'Deleted Item',
      sub: `"${item.title}"`,
      time: new Date().toISOString(),
    })
  }

  const continueItem = (item) => {
    persistActivity({
      id: Date.now(),
      title: 'Opened Chat',
      sub: `"${item.title}"`,
      time: new Date().toISOString(),
    })

    if (item.sessionId) {
      navigate(`/chat?session=${item.sessionId}`)
    } else {
      console.log('No linked chat session for this item:', item)
    }
  }

  const normalizedQuery = query.trim().toLowerCase()

  const filtered = normalizedQuery
    ? items.filter((item) => {
        const title = (item.title || '').toLowerCase()
        const tag = (item.tag || '').toLowerCase()
        const sub = (item.sub || '').toLowerCase()

        return (
          title.includes(normalizedQuery) ||
          tag.includes(normalizedQuery) ||
          sub.includes(normalizedQuery)
        )
      })
    : items

  const pinned = filtered.filter((item) => item.pinned)

  const recent = [...filtered]
    .sort(
      (a, b) =>
        new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0)
    )
    .slice(0, 6)

  const collections = Object.values(
    items.reduce((acc, item) => {
      const tag = item.tag || 'GENERAL'

      acc[tag] = acc[tag] || { name: tag, count: 0 }
      acc[tag].count += 1

      return acc
    }, {})
  ).sort((a, b) => a.name.localeCompare(b.name))

  const timeAgo = (iso) => {
    if (!iso) return 'Recently'

    const diff = Date.now() - new Date(iso).getTime()

    if (!Number.isFinite(diff)) return 'Recently'
    if (diff < 60000) return 'Just now'

    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`

    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`

    const days = Math.floor(hrs / 24)
    return `${days}d ago`
  }

  return (
    <div className="saved-shell">
      <Sidebar />

      <main className="saved-page">
        <div className="saved-content">

          {/* HEADER */}
          <header className="saved-header">
            <div>
              <div className="saved-breadcrumb">
                <span>Workspace</span>
                <span>/</span>
                <strong>Saved Library</strong>
              </div>

              <p className="saved-overline">YOUR PERSONAL KNOWLEDGE SPACE</p>

              <h1>My AI Library</h1>

              <p className="saved-header-description">
                Revisit your ideas, organize conversations, and continue
                where you left off.
              </p>
            </div>

            <div className="saved-header-actions">
              <button
                type="button"
                className={`saved-icon-btn ${searchOpen ? 'active' : ''}`}
                onClick={() => {
                  setSearchOpen((prev) => !prev)
                  setQuery('')
                }}
                aria-label="Toggle search"
                title="Search library"
              >
                {searchOpen ? <X size={18} /> : <Search size={18} />}
              </button>

              <button
                type="button"
                className="saved-add-btn"
                onClick={openModal}
              >
                <Plus size={17} />
                New Favorite
              </button>
            </div>
          </header>

          {/* LIBRARY STATS */}
          <section className="saved-stats-grid">
            <div className="saved-stat-card">
              <div className="saved-stat-icon blue">
                <Bookmark size={19} />
              </div>
              <div>
                <span>Total Saved</span>
                <strong>{items.length}</strong>
              </div>
            </div>

            <div className="saved-stat-card">
              <div className="saved-stat-icon orange">
                <Star size={19} />
              </div>
              <div>
                <span>Pinned Items</span>
                <strong>{items.filter((item) => item.pinned).length}</strong>
              </div>
            </div>

            <div className="saved-stat-card">
              <div className="saved-stat-icon green">
                <FolderOpen size={19} />
              </div>
              <div>
                <span>Collections</span>
                <strong>{collections.length}</strong>
              </div>
            </div>
          </section>

          {/* SEARCH */}
          {searchOpen && (
            <div className="saved-search-panel">
              <Search size={18} />

              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by title, description or tag..."
                aria-label="Search saved conversations"
              />

              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          )}

          {/* PINNED */}
          <section className="saved-section">
            <div className="saved-section-heading">
              <div>
                <p className="saved-overline">YOUR BEST IDEAS</p>
                <h2>
                  <Star size={19} />
                  Pinned Masterpieces
                </h2>
              </div>

              <span className="saved-section-count">
                {pinned.length} pinned
              </span>
            </div>

            {pinned.length > 0 ? (
              <div className="saved-pinned-grid">
                {pinned.map((item) => (
                  <article className="saved-pinned-card" key={item.id}>
                    <div className="saved-pinned-top">
                      <span className="saved-tag">
                        <Tag size={11} />
                        {item.tag || 'GENERAL'}
                      </span>

                      <span className="saved-pin-label">
                        <Pin size={12} />
                        Pinned
                      </span>
                    </div>

                    <h3>{item.title}</h3>

                    <p className="saved-pinned-description">
                      {item.sub || 'No description added.'}
                    </p>

                    <div className="saved-pinned-footer">
                      <span>
                        <Clock3 size={12} />
                        {timeAgo(item.updatedAt)}
                      </span>

                      <div>
                        <button
                          type="button"
                          onClick={() => togglePin(item.id)}
                          title="Unpin"
                          aria-label={`Unpin ${item.title}`}
                        >
                          <Star size={16} fill="currentColor" />
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteItem(item.id)}
                          title="Delete"
                          aria-label={`Delete ${item.title}`}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="saved-inline-empty">
                <Star size={20} />
                <div>
                  <strong>No pinned conversations</strong>
                  <span>Pin your important conversations to find them quickly.</span>
                </div>
              </div>
            )}
          </section>

          {/* COLLECTIONS */}
          <section className="saved-section">
            <div className="saved-section-heading">
              <div>
                <p className="saved-overline">ORGANIZED KNOWLEDGE</p>
                <h2>
                  <FolderOpen size={19} />
                  Collections
                </h2>
              </div>

              <span className="saved-section-count">
                {collections.length} categories
              </span>
            </div>

            {collections.length > 0 ? (
              <div className="saved-collections-grid">
                {collections.map((collection) => (
                  <button
                    type="button"
                    key={collection.name}
                    className={`saved-collection-card ${
                      query.toLowerCase() === collection.name.toLowerCase()
                        ? 'active'
                        : ''
                    }`}
                    onClick={() => {
                      setSearchOpen(true)
                      setQuery(collection.name)
                    }}
                  >
                    <div className="saved-collection-icon">
                      <FolderOpen size={20} />
                    </div>

                    <div>
                      <strong>{collection.name}</strong>
                      <span>
                        {collection.count}{' '}
                        {collection.count === 1 ? 'conversation' : 'conversations'}
                      </span>
                    </div>

                    <ArrowRight size={16} />
                  </button>
                ))}
              </div>
            ) : (
              <div className="saved-inline-empty">
                <FolderOpen size={20} />
                <div>
                  <strong>No collections yet</strong>
                  <span>Save conversations with tags to create collections.</span>
                </div>
              </div>
            )}
          </section>

          {/* RECENT + ACTIVITY */}
          <section className="saved-bottom-grid">

            <div className="saved-recent-section">
              <div className="saved-section-heading">
                <div>
                  <p className="saved-overline">PICK UP WHERE YOU LEFT OFF</p>
                  <h2>
                    <MessageSquare size={19} />
                    Recent Conversations
                  </h2>
                </div>

                <span className="saved-section-count">
                  {filtered.length} found
                </span>
              </div>

              <div className="saved-recent-list">
                {recent.length === 0 ? (
                  <div className="saved-large-empty">
                    <SearchX size={25} />
                    <strong>
                      {normalizedQuery
                        ? 'No matching conversations'
                        : 'Your library is empty'}
                    </strong>
                    <span>
                      {normalizedQuery
                        ? 'Try another search term.'
                        : 'Save a conversation to see it here.'}
                    </span>

                    {!normalizedQuery && (
                      <button type="button" onClick={openModal}>
                        <Plus size={15} />
                        Create favorite
                      </button>
                    )}
                  </div>
                ) : (
                  recent.map((item) => (
                    <article className="saved-recent-card" key={item.id}>
                      <div className="saved-recent-icon">
                        <MessageSquare size={18} />
                      </div>

                      <div className="saved-recent-info">
                        <div className="saved-recent-meta">
                          <span className="saved-tag">
                            {item.tag || 'GENERAL'}
                          </span>
                          <span>
                            <Clock3 size={11} />
                            {timeAgo(item.updatedAt)}
                          </span>
                        </div>

                        <strong>{item.title}</strong>

                        {item.sub && <p>{item.sub}</p>}
                      </div>

                      <div className="saved-recent-actions">
                        <button
                          type="button"
                          onClick={() => togglePin(item.id)}
                          className={item.pinned ? 'is-pinned' : ''}
                          title={item.pinned ? 'Unpin' : 'Pin'}
                          aria-label={`Toggle pin for ${item.title}`}
                        >
                          <Star
                            size={16}
                            fill={item.pinned ? 'currentColor' : 'none'}
                          />
                        </button>

                        <button
                          type="button"
                          className="saved-continue-btn"
                          onClick={() => continueItem(item)}
                        >
                          Continue
                          <ArrowRight size={14} />
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteItem(item.id)}
                          className="saved-delete-btn"
                          title="Delete"
                          aria-label={`Delete ${item.title}`}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </div>

            <aside className="saved-activity-section">
              <div className="saved-section-heading">
                <div>
                  <p className="saved-overline">WORKSPACE HISTORY</p>
                  <h2>
                    <Activity size={19} />
                    Activity
                  </h2>
                </div>
              </div>

              <div className="saved-activity-card">
                {activity.length === 0 ? (
                  <div className="saved-activity-empty">
                    <Activity size={23} />
                    <strong>No activity yet</strong>
                    <span>Your recent actions will appear here.</span>
                  </div>
                ) : (
                  activity.slice(0, 5).map((entry, index) => (
                    <div className="saved-activity-item" key={entry.id}>
                      <div className="saved-activity-marker">
                        <span />
                        {index !== Math.min(activity.length, 5) - 1 && <i />}
                      </div>

                      <div>
                        <strong>{entry.title}</strong>
                        <p>{entry.sub}</p>
                        {entry.time && (
                          <small>{timeAgo(entry.time)}</small>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </aside>
          </section>

          {/* FOOTER */}
          <footer className="saved-footer">
            <span>AI Nexus © 2026</span>
            <span>Your ideas, organized in one place.</span>
          </footer>
        </div>
      </main>

      {/* NEW FAVORITE MODAL */}
      {showModal && (
        <div
          className="saved-modal-backdrop"
          onClick={() => setShowModal(false)}
        >
          <form
            className="saved-modal"
            onClick={(e) => e.stopPropagation()}
            onSubmit={submitItem}
          >
            <div className="saved-modal-header">
              <div>
                <span className="saved-modal-icon">
                  <Bookmark size={19} />
                </span>
                <h2>New Favorite</h2>
                <p>Add a conversation to your personal library.</p>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                aria-label="Close modal"
              >
                <X size={19} />
              </button>
            </div>

            <label htmlFor="saved-title">Conversation title</label>
            <input
              id="saved-title"
              autoFocus
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="e.g. Machine Learning Notes"
              required
            />

            <label htmlFor="saved-tag">Category / Tag</label>
            <input
              id="saved-tag"
              value={formTag}
              onChange={(e) => setFormTag(e.target.value)}
              placeholder="e.g. RESEARCH, CODING"
            />

            <label htmlFor="saved-description">Short description</label>
            <textarea
              id="saved-description"
              value={formSub}
              onChange={(e) => setFormSub(e.target.value)}
              placeholder="What is this conversation about?"
              rows={3}
            />

            <div className="saved-modal-actions">
              <button
                type="button"
                className="saved-cancel-btn"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="saved-add-btn"
                disabled={!formTitle.trim()}
              >
                <Plus size={16} />
                Save to Library
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
