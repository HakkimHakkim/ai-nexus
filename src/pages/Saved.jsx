import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar.jsx'
import AmbientBackground from '../components/AmbientBackground.jsx'
import { Search, Plus, Star } from 'lucide-react'

const STORAGE_KEY = 'ainexus_library_items'
const ACTIVITY_KEY = 'ainexus_activity_log'

function loadItems() {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored ? JSON.parse(stored) : []
}

function loadActivity() {
  const stored = localStorage.getItem(ACTIVITY_KEY)
  return stored ? JSON.parse(stored) : []
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

  const submitItem = () => {
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
    persistActivity({ id: Date.now(), title: 'Saved Conversation', sub: `"${newItem.title}"`, time: new Date().toISOString() })
    setShowModal(false)
  }

  const togglePin = (id) => {
    const item = items.find((i) => i.id === id)
    const updated = items.map((i) => (i.id === id ? { ...i, pinned: !i.pinned } : i))
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
    const updated = items.filter((i) => i.id !== id)
    persistItems(updated)
    persistActivity({ id: Date.now(), title: 'Deleted Item', sub: `"${item.title}"`, time: new Date().toISOString() })
  }

  const continueItem = (item) => {
    persistActivity({ id: Date.now(), title: 'Opened Chat', sub: `"${item.title}"`, time: new Date().toISOString() })
    if (item.sessionId) {
      navigate(`/chat?session=${item.sessionId}`)
    } else {
      console.log('No linked chat session for this item:', item)
    }
  }

  const filtered = query.trim()
    ? items.filter(
        (i) =>
          i.title.toLowerCase().includes(query.toLowerCase()) ||
          i.tag.toLowerCase().includes(query.toLowerCase())
      )
    : items

  const pinned = filtered.filter((i) => i.pinned)
  const recent = [...filtered].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 6)

  const collections = Object.values(
    items.reduce((acc, i) => {
      acc[i.tag] = acc[i.tag] || { name: i.tag, count: 0 }
      acc[i.tag].count += 1
      return acc
    }, {})
  )

  const timeAgo = (iso) => {
    const diff = Date.now() - new Date(iso).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  return (
    <div className="flex min-h-screen text-body">
      <AmbientBackground />
      <Sidebar />
      <main className="flex-1 px-10 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-heading">My AI Library</h1>
            <p className="text-sm text-muted">Revisit, organize, and continue your conversations.</p>
          </div>
          <div className="flex gap-2">
       
           
          </div>
        </div>

        {searchOpen && (
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title or tag..."
            className="mb-6 w-full rounded-xl border surface px-3 py-2 text-sm text-body"
          />
        )}

        <p className="mb-3 text-sm font-semibold text-body">Pinned Masterpieces</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {pinned.map((p) => (
            <div key={p.id} className="glass rounded-2xl p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="rounded-full border surface px-2 py-0.5 text-[10px] text-muted">{p.tag}</span>
                <div className="flex items-center gap-2">
                  <Star
                    size={14}
                    className="cursor-pointer text-yellow-400"
                    onClick={() => togglePin(p.id)}
                    fill="currentColor"
                  />
                  <button onClick={() => deleteItem(p.id)} className="text-xs text-red-400 hover:underline">
                    Delete
                  </button>
                </div>
              </div>
              <p className="text-sm font-medium text-heading">{p.title}</p>
              <p className="mt-3 text-xs text-faint">Updated {timeAgo(p.updatedAt)}</p>
            </div>
          ))}
          <button onClick={openModal} className="flex items-center justify-center rounded-2xl border surface border-dashed p-4 text-sm text-muted hover:bg-[var(--track-bg)]">
            <Plus size={16} className="mr-1" /> New Favorite
          </button>
        </div>

        <p className="mb-3 mt-8 text-sm font-semibold text-body">Collections</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {collections.length === 0 && <p className="text-xs text-faint">No collections yet.</p>}
          {collections.map((c) => (
            <div key={c.name} className="glass rounded-xl p-4 text-center">
              <p className="text-sm font-medium text-body">{c.name}</p>
              <p className="text-xs text-faint">{c.count} conversations</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <p className="mb-3 text-sm font-semibold text-body">Recent Conversations</p>
            <div className="space-y-3">
              {recent.length === 0 && <p className="text-xs text-faint">No saved conversations yet.</p>}
              {recent.map((r) => (
                <div key={r.id} className="glass flex items-center justify-between rounded-xl p-4">
                  <div>
                    <span className="mb-1 inline-block rounded-full border surface px-2 py-0.5 text-[10px] text-muted">{r.tag}</span>
                    <p className="text-sm font-medium text-heading">{r.title}</p>
                    <p className="text-xs text-faint">{r.sub}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => togglePin(r.id)} className="btn-ghost px-3 py-1.5 text-xs">
                      <Star size={14} fill={r.pinned ? 'currentColor' : 'none'} />
                    </button>
                    <button onClick={() => continueItem(r)} className="btn-ghost px-3 py-1.5 text-xs">Continue</button>
                    <button onClick={() => deleteItem(r.id)} className="text-xs text-red-400 hover:underline">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-body">Activity</p>
            <div className="glass space-y-3 rounded-xl p-4">
              {activity.length === 0 && <p className="text-xs text-faint">No activity yet.</p>}
              {activity.slice(0, 5).map((a) => (
                <div key={a.id}>
                  <p className="text-sm text-body">{a.title}</p>
                  <p className="text-xs text-faint">{a.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {showModal && (
          <div
            onClick={() => setShowModal(false)}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50,
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="glass rounded-2xl p-6"
              style={{ width: '360px' }}
            >
              <p className="mb-4 text-sm font-semibold text-heading">New Conversation</p>
              <input
                autoFocus
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Title"
                className="mb-3 w-full rounded-lg border surface px-3 py-2 text-sm text-body"
              />
              <input
                value={formTag}
                onChange={(e) => setFormTag(e.target.value)}
                placeholder="Tag (e.g. RESEARCH, CODING)"
                className="mb-3 w-full rounded-lg border surface px-3 py-2 text-sm text-body"
              />
              <input
                value={formSub}
                onChange={(e) => setFormSub(e.target.value)}
                placeholder="Short description"
                className="mb-4 w-full rounded-lg border surface px-3 py-2 text-sm text-body"
              />
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowModal(false)} className="btn-ghost px-3 py-1.5 text-xs">Cancel</button>
                <button onClick={submitItem} className="btn-primary px-3 py-1.5 text-xs">Save</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}