import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar.jsx'
import AmbientBackground from '../components/AmbientBackground.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { Check } from 'lucide-react'

const API = 'https://ai-nexus-backend-wato.onrender.com'
const modelChoices = [
  { id: 'gemini', label: 'Gemini 3.6' },
  { id: 'llama70b', label: 'GPT-OSS 120B' },
  { id: 'llama8b', label: 'GPT-OSS 20B' },
  { id: 'qwen', label: 'Qwen3.6 27B' },
  { id: 'offline', label: 'Llama (Offline)' },
]

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`h-5 w-9 rounded-full transition ${
        checked ? 'bg-gradient-to-r from-primary-500 to-fuchsia-500' : 'track'
      }`}
    >
      <span className={`block h-4 w-4 translate-x-0.5 rounded-full bg-white transition ${checked ? 'translate-x-4' : ''}`} />
    </button>
  )
}

function Card({ title, children }) {
  return (
    <div className="glass rounded-2xl p-5">
      <p className="mb-4 text-sm font-semibold text-heading">{title}</p>
      {children}
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div className="mb-3">
      <label className="mb-1 block text-xs text-muted">{label}</label>
      {children}
    </div>
  )
}

export default function Settings() {
  const { token } = useAuth()
  const [settings, setSettings] = useState(null)
  const [saved, setSaved] = useState(false)
  const authHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }

  useEffect(() => {
    fetch(`${API}/api/settings`, { headers: authHeaders })
      .then((r) => r.json())
      .then(setSettings)
  }, [])

  async function update(field, value) {
    const next = { ...settings, [field]: value }
    setSettings(next)
    const res = await fetch(`${API}/api/settings`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({ [field]: value }),
    })
    if (res.ok) {
      setSaved(true)
      setTimeout(() => setSaved(false), 1500)
    }
  }

  if (!settings) {
    return (
      <div className="flex min-h-screen text-body">
        <AmbientBackground />
        <Sidebar />
        <main className="flex flex-1 items-center justify-center">
          <p className="text-muted">Loading settings...</p>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen text-body">
      <AmbientBackground />
      <Sidebar />
      <main className="flex-1 px-10 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-bold text-heading">Settings</h1>
          {saved && (
            <span className="flex items-center gap-1 text-xs text-primary-400">
              <Check size={14} /> Saved
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card title="AI Preferences">
            <Field label="Default AI Model">
              <select
                className="glass-input"
                value={settings.default_model}
                onChange={(e) => update('default_model', e.target.value)}
              >
                {modelChoices.map((m) => (
                  <option key={m.id} value={m.id}>{m.label}</option>
                ))}
              </select>
            </Field>

            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs text-muted">Auto Save Conversations</span>
              <Toggle checked={settings.auto_save} onChange={(v) => update('auto_save', v)} />
            </div>

            <div>
              <p className="mb-1 text-xs text-muted">Preferred Response Length</p>
              <div className="flex gap-2 text-xs">
                {['concise', 'standard', 'detailed'].map((v) => (
                  <button
                    key={v}
                    onClick={() => update('response_length', v)}
                    className={settings.response_length === v ? 'btn-primary px-3 py-1.5 capitalize' : 'btn-ghost px-3 py-1.5 capitalize'}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          <Card title="Notifications">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs text-muted">Email Notifications</span>
              <Toggle checked={settings.email_notifications} onChange={(v) => update('email_notifications', v)} />
            </div>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs text-muted">Desktop Alerts</span>
              <Toggle checked={settings.desktop_alerts} onChange={(v) => update('desktop_alerts', v)} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted">Comparison Complete</span>
              <Toggle checked={settings.comparison_complete_alerts} onChange={(v) => update('comparison_complete_alerts', v)} />
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}