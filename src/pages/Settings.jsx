
import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import {
  Check,
  Cpu,
  Bell,
  SlidersHorizontal,
  Save,
  Sparkles,
  MessageSquare,
  ShieldCheck,
  RotateCcw,
  AlertCircle,
} from 'lucide-react'
import './settings.css'

const API = 'https://ai-nexus-backend-wato.onrender.com'

const modelChoices = [
  {
    id: 'gemini',
    label: 'Gemini 3.6',
    description: 'Google AI model',
    short: 'G',
  },
  {
    id: 'llama70b',
    label: 'GPT-OSS 120B',
    description: 'Advanced reasoning',
    short: '120',
  },
  {
    id: 'llama8b',
    label: 'GPT-OSS 20B',
    description: 'Lightweight responses',
    short: '20',
  },
  {
    id: 'qwen',
    label: 'Qwen3.6 27B',
    description: 'General-purpose AI',
    short: 'Q',
  },
  {
    id: 'offline',
    label: 'Llama (Offline)',
    description: 'Local model option',
    short: 'L',
  },
]

const responseLengths = [
  {
    id: 'concise',
    label: 'Concise',
    description: 'Short and direct',
  },
  {
    id: 'standard',
    label: 'Standard',
    description: 'Balanced answers',
  },
  {
    id: 'detailed',
    label: 'Detailed',
    description: 'More explanation',
  },
]

function Toggle({ checked, onChange, disabled = false }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`settings-toggle ${checked ? 'enabled' : ''}`}
    >
      <span />
    </button>
  )
}

function SettingCard({ icon: Icon, title, description, children }) {
  return (
    <section className="settings-card">
      <div className="settings-card-heading">
        <div className="settings-card-icon">
          <Icon size={19} />
        </div>

        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </div>

      <div className="settings-card-content">
        {children}
      </div>
    </section>
  )
}

function ToggleRow({ title, description, checked, onChange, disabled }) {
  return (
    <div className="settings-toggle-row">
      <div className="settings-toggle-copy">
        <strong>{title}</strong>
        {description && <span>{description}</span>}
      </div>

      <Toggle
        checked={Boolean(checked)}
        onChange={onChange}
        disabled={disabled}
      />
    </div>
  )
}

export default function Settings() {
  const { token } = useAuth()

  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [savingField, setSavingField] = useState(null)
  const [savedField, setSavedField] = useState(null)
  const [error, setError] = useState('')

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }

  useEffect(() => {
    let active = true

    async function loadSettings() {
      setLoading(true)
      setError('')

      try {
        const response = await fetch(`${API}/api/settings`, {
          headers: authHeaders,
        })

        if (!response.ok) {
          throw new Error('Unable to load your settings.')
        }

        const data = await response.json()

        if (active) {
          setSettings(data)
        }
      } catch (err) {
        if (active) {
          setError(err.message || 'Something went wrong.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    if (token) {
      loadSettings()
    } else {
      setLoading(false)
      setError('Please log in to access your settings.')
    }

    return () => {
      active = false
    }
  }, [token])

  async function update(field, value) {
    if (!settings || savingField) return

    const previousValue = settings[field]

    setSettings((current) => ({
      ...current,
      [field]: value,
    }))

    setSavingField(field)
    setSavedField(null)
    setError('')

    try {
      const response = await fetch(`${API}/api/settings`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ [field]: value }),
      })

      if (!response.ok) {
        throw new Error('Could not save this setting. Please try again.')
      }

      setSavedField(field)
    } catch (err) {
      setSettings((current) => ({
        ...current,
        [field]: previousValue,
      }))

      setError(err.message || 'Failed to save settings.')
    } finally {
      setSavingField(null)
    }
  }

  const isSaving = Boolean(savingField)

  if (loading) {
    return (
      <div className="settings-shell">
        <Sidebar />
        <main className="settings-page">
          <div className="settings-loading">
            <div className="settings-loader" />
            <p>Loading your workspace preferences...</p>
          </div>
        </main>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="settings-shell">
        <Sidebar />
        <main className="settings-page">
          <div className="settings-error-page">
            <AlertCircle size={28} />
            <h2>Settings unavailable</h2>
            <p>{error || 'We could not load your preferences.'}</p>

            <button
              type="button"
              className="settings-retry-btn"
              onClick={() => window.location.reload()}
            >
              <RotateCcw size={15} />
              Try again
            </button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="settings-shell">
      <Sidebar />

      <main className="settings-page">
        <div className="settings-content">

          {/* HEADER */}
          <header className="settings-header">
            <div className="settings-header-copy">
              <div className="settings-breadcrumb">
                <span>Workspace</span>
                <span>/</span>
                <strong>Settings</strong>
              </div>

              <p className="settings-overline">
                PERSONALIZE YOUR EXPERIENCE
              </p>

              <h1>Settings</h1>

              <p>
                Configure how AI Nexus works for you.
                Manage your AI preferences and notifications.
              </p>
            </div>

            <div className={`settings-save-status ${
              isSaving ? 'saving' : savedField ? 'success' : ''
            }`}>
              {isSaving ? (
                <>
                  <span className="settings-status-dot" />
                  Saving changes...
                </>
              ) : savedField ? (
                <>
                  <Check size={15} />
                  Changes saved
                </>
              ) : (
                <>
                  <ShieldCheck size={16} />
                  Settings synced
                </>
              )}
            </div>
          </header>

          {/* ERROR MESSAGE */}
          {error && (
            <div className="settings-error-banner">
              <AlertCircle size={17} />
              <span>{error}</span>
              <button type="button" onClick={() => setError('')}>
                Dismiss
              </button>
            </div>
          )}

          {/* MAIN SETTINGS */}
          <div className="settings-layout">

            <div className="settings-main-column">

              {/* AI PREFERENCES */}
              <SettingCard
                icon={Cpu}
                title="AI Preferences"
                description="Choose how your AI assistant responds."
              >
                <div className="settings-field">
                  <div className="settings-field-heading">
                    <strong>Default AI Model</strong>
                    <span>Select the model used for new conversations.</span>
                  </div>

                  <div className="settings-model-grid">
                    {modelChoices.map((model) => (
                      <button
                        type="button"
                        key={model.id}
                        disabled={isSaving}
                        onClick={() => update('default_model', model.id)}
                        className={`settings-model-option ${
                          settings.default_model === model.id
                            ? 'selected'
                            : ''
                        }`}
                      >
                        <span className="settings-model-symbol">
                          {model.short}
                        </span>

                        <span className="settings-model-info">
                          <strong>{model.label}</strong>
                          <small>{model.description}</small>
                        </span>

                        <span className="settings-model-check">
                          {settings.default_model === model.id && (
                            <Check size={15} />
                          )}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="settings-divider" />

                <ToggleRow
                  title="Auto Save Conversations"
                  description="Automatically save your conversations to your library."
                  checked={settings.auto_save}
                  onChange={(value) => update('auto_save', value)}
                  disabled={isSaving}
                />

                <div className="settings-divider" />

                <div className="settings-field settings-response-field">
                  <div className="settings-field-heading">
                    <strong>Preferred Response Length</strong>
                    <span>Choose the level of detail you prefer.</span>
                  </div>

                  <div className="settings-response-options">
                    {responseLengths.map((option) => (
                      <button
                        type="button"
                        key={option.id}
                        disabled={isSaving}
                        onClick={() => update('response_length', option.id)}
                        className={`settings-response-option ${
                          settings.response_length === option.id
                            ? 'selected'
                            : ''
                        }`}
                      >
                        <span className="settings-response-check">
                          {settings.response_length === option.id && (
                            <Check size={13} />
                          )}
                        </span>

                        <strong>{option.label}</strong>
                        <small>{option.description}</small>
                      </button>
                    ))}
                  </div>
                </div>
              </SettingCard>

              {/* NOTIFICATIONS */}
              <SettingCard
                icon={Bell}
                title="Notifications"
                description="Control which updates you want to receive."
              >
                <ToggleRow
                  title="Email Notifications"
                  description="Receive important updates through email."
                  checked={settings.email_notifications}
                  onChange={(value) => update('email_notifications', value)}
                  disabled={isSaving}
                />

                <div className="settings-divider" />

                <ToggleRow
                  title="Desktop Alerts"
                  description="Show notifications on your desktop."
                  checked={settings.desktop_alerts}
                  onChange={(value) => update('desktop_alerts', value)}
                  disabled={isSaving}
                />

                <div className="settings-divider" />

                <ToggleRow
                  title="Comparison Complete"
                  description="Get notified when model comparisons finish."
                  checked={settings.comparison_complete_alerts}
                  onChange={(value) =>
                    update('comparison_complete_alerts', value)
                  }
                  disabled={isSaving}
                />
              </SettingCard>
            </div>

            {/* SIDE PANEL */}
            <aside className="settings-side-column">
              <div className="settings-info-card">
                <div className="settings-info-icon">
                  <Sparkles size={21} />
                </div>

                <p className="settings-overline">YOUR AI WORKSPACE</p>
                <h2>Make AI Nexus work your way.</h2>
                <p>
                  Your preferences help shape the way your assistant
                  responds and how you stay updated.
                </p>
              </div>

              <div className="settings-summary-card">
                <div className="settings-summary-heading">
                  <SlidersHorizontal size={17} />
                  <strong>Current Preferences</strong>
                </div>

                <div className="settings-summary-row">
                  <span>Default model</span>
                  <strong>
                    {modelChoices.find(
                      (model) => model.id === settings.default_model
                    )?.label || settings.default_model}
                  </strong>
                </div>

                <div className="settings-summary-row">
                  <span>Response length</span>
                  <strong className="capitalize">
                    {settings.response_length}
                  </strong>
                </div>

                <div className="settings-summary-row">
                  <span>Auto save</span>
                  <strong>{settings.auto_save ? 'Enabled' : 'Disabled'}</strong>
                </div>

                <div className="settings-summary-row">
                  <span>Notifications</span>
                  <strong>
                    {[
                      settings.email_notifications,
                      settings.desktop_alerts,
                      settings.comparison_complete_alerts,
                    ].filter(Boolean).length} / 3 enabled
                  </strong>
                </div>
              </div>

              <div className="settings-help-card">
                <MessageSquare size={18} />
                <div>
                  <strong>Changes are automatic</strong>
                  <p>
                    Each preference is saved as soon as you change it.
                    No separate save button is required.
                  </p>
                </div>
              </div>
            </aside>
          </div>

          <footer className="settings-footer">
            <span>AI Nexus © 2026</span>
            <span>Personalized AI workspace</span>
          </footer>
        </div>
      </main>
    </div>
  )
}
