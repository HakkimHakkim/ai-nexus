
import { useEffect, useRef, useState } from 'react'
import {
  UserRound,
  Mail,
  Phone,
  MapPin,
  BriefcaseBusiness,
  Globe,
  Camera,
  Save,
  Sparkles,
  Activity,
  CalendarDays,
  MessageSquare,
  ImagePlus,
  LoaderCircle,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react'

import Sidebar from '../components/Sidebar.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import './profile.css'

const API = 'https://ai-nexus-backend-wato.onrender.com'

const activity = [
  { title: 'Updated profile picture', sub: '2 hours ago' },
  { title: 'Started React Refactoring', sub: 'Yesterday, 4:12 PM' },
  { title: 'Compared Gemini vs Llama', sub: 'Oct 24, 2023' },
]

const initialForm = {
  name: '',
  phone: '',
  country: '',
  occupation: '',
  website: '',
  bio: '',
}

export default function Profile() {
  const { user } = useAuth()
  const fileInputRef = useRef(null)

  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState(initialForm)
  const [userImage, setUserImage] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState(null)

  const profileImage = userImage
    ? `${API}${userImage}`
    : '/default-avatar.png'

  const token = () => localStorage.getItem('ai-nexus-token')

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch(`${API}/api/me`, {
          headers: {
            Authorization: `Bearer ${token()}`,
          },
        })

        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.detail || data.message || 'Unable to load profile')
        }

        setProfile(data)

        if (data.profile_photo) {
          setUserImage(
            data.profile_photo.startsWith('/')
              ? data.profile_photo
              : `/${data.profile_photo}`
          )
        }

        setForm({
          name: data.name || '',
          phone: data.phone || '',
          country: data.country || '',
          occupation: data.occupation || '',
          website: data.website || '',
          bio: data.bio || '',
        })
      } catch (err) {
        console.error('Profile loading error:', err)
        setMessage({
          type: 'error',
          text: err.message || 'Could not load your profile.',
        })
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

  function updateField(field, value) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }))
  }

  async function saveProfile() {
    setSaving(true)
    setMessage(null)

    try {
      const res = await fetch(`${API}/api/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.detail || data.message || 'Profile update failed')
      }

      setProfile((previous) => ({
        ...previous,
        ...form,
        ...(data && typeof data === 'object' ? data : {}),
      }))

      setMessage({
        type: 'success',
        text: data.message || 'Profile updated successfully.',
      })
    } catch (err) {
      console.error('Profile save error:', err)
      setMessage({
        type: 'error',
        text: err.message || 'Unable to save profile.',
      })
    } finally {
      setSaving(false)
    }
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0]

    if (!file) return

    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please select an image file.' })
      return
    }

    setSelectedFile(file)
    setMessage(null)
  }

  async function uploadPhoto() {
    if (!selectedFile) {
      setMessage({ type: 'error', text: 'Please choose a photo first.' })
      return
    }

    setUploading(true)
    setMessage(null)

    const formData = new FormData()
    formData.append('file', selectedFile)

    try {
      const response = await fetch(`${API}/api/me/upload-photo`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token()}`,
        },
        body: formData,
      })

      const data = await response.json()

      if (!response.ok || !data.image) {
        throw new Error(data.detail || data.message || 'Photo upload failed')
      }

      setUserImage(
        data.image.startsWith('/') ? data.image : `/${data.image}`
      )
      setSelectedFile(null)

      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      setMessage({
        type: 'success',
        text: 'Profile photo updated successfully.',
      })
    } catch (err) {
      console.error('Photo upload error:', err)
      setMessage({
        type: 'error',
        text: err.message || 'Unable to upload photo.',
      })
    } finally {
      setUploading(false)
    }
  }

  const stats = [
    {
      label: 'Total Chats',
      value: profile?.total_chats ?? 0,
      icon: MessageSquare,
    },
    {
      label: 'Comparisons',
      value: 0,
      icon: Activity,
    },
    {
      label: 'Saved Items',
      value: 0,
      icon: FileText,
    },
    {
      label: 'Join Date',
      value: profile?.join_date ?? '-',
      icon: CalendarDays,
    },
  ]

  return (
    <div className="profile-page">
      <Sidebar />

      <main className="profile-main">
        <div className="profile-container">

          <header className="profile-page-header">
            <div>
              <div className="profile-eyebrow">
                <span className="profile-eyebrow-dot" />
                ACCOUNT MANAGEMENT
              </div>
              <h1>My Profile</h1>
              <p>Manage your personal information and account details.</p>
            </div>

            <div className="profile-header-icon">
              <UserRound size={23} />
            </div>
          </header>

          {message && (
            <div className={`profile-message ${message.type}`}>
              {message.type === 'success'
                ? <CheckCircle2 size={18} />
                : <AlertCircle size={18} />}
              <span>{message.text}</span>
              <button
                type="button"
                onClick={() => setMessage(null)}
                aria-label="Dismiss message"
              >
                ×
              </button>
            </div>
          )}

          {loading ? (
            <div className="profile-loading">
              <LoaderCircle className="profile-spinner" size={28} />
              <p>Loading your profile...</p>
            </div>
          ) : (
            <>
              <section className="profile-hero-card">
                <div className="profile-hero-top">
                  <div className="profile-avatar-wrap">
                    <img
                      src={
                        selectedFile
                          ? URL.createObjectURL(selectedFile)
                          : profileImage
                      }
                      alt="Profile"
                      className="profile-avatar"
                      onError={(e) => {
                        e.currentTarget.src = '/default-avatar.png'
                      }}
                    />
                    <button
                      type="button"
                      className="profile-camera-button"
                      onClick={() => fileInputRef.current?.click()}
                      aria-label="Choose profile photo"
                    >
                      <Camera size={17} />
                    </button>
                  </div>

                  <div className="profile-identity">
                    <span className="profile-member-label">
                      <Sparkles size={13} />
                      AI NEXUS MEMBER
                    </span>
                    <h2>{form.name || user?.name || 'Guest User'}</h2>
                    <p>{profile?.email || user?.email || '-'}</p>
                    <div className="profile-status">
                      <span />
                      Account active
                    </div>
                  </div>

                  <div className="profile-photo-actions">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={handleFileChange}
                    />

                    <button
                      type="button"
                      className="profile-secondary-button"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <ImagePlus size={16} />
                      Choose photo
                    </button>

                    <button
                      type="button"
                      className="profile-primary-button"
                      onClick={uploadPhoto}
                      disabled={!selectedFile || uploading}
                    >
                      {uploading
                        ? <LoaderCircle className="profile-spinner" size={16} />
                        : <Camera size={16} />}
                      {uploading ? 'Uploading...' : 'Upload photo'}
                    </button>

                    {selectedFile && (
                      <span className="profile-file-name">
                        {selectedFile.name}
                      </span>
                    )}
                  </div>
                </div>

                <div className="profile-stats-grid">
                  {stats.map((stat) => {
                    const Icon = stat.icon

                    return (
                      <div className="profile-stat" key={stat.label}>
                        <div className="profile-stat-icon">
                          <Icon size={18} />
                        </div>
                        <div>
                          <strong>{stat.value}</strong>
                          <span>{stat.label}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>

              <div className="profile-content-grid">

                <section className="profile-panel profile-personal-panel">
                  <div className="profile-panel-heading">
                    <div>
                      <span className="profile-section-label">YOUR DETAILS</span>
                      <h3>Personal Information</h3>
                      <p>Update the information associated with your account.</p>
                    </div>
                    <div className="profile-panel-icon">
                      <UserRound size={20} />
                    </div>
                  </div>

                  <div className="profile-form-grid">
                    <div className="profile-field">
                      <label htmlFor="profile-name">Full Name</label>
                      <div className="profile-input-wrap">
                        <UserRound size={17} />
                        <input
                          id="profile-name"
                          value={form.name}
                          onChange={(e) => updateField('name', e.target.value)}
                          placeholder="Enter your full name"
                        />
                      </div>
                    </div>

                    <div className="profile-field">
                      <label>Email Address</label>
                      <div className="profile-input-wrap profile-input-disabled">
                        <Mail size={17} />
                        <input
                          value={profile?.email || user?.email || ''}
                          readOnly
                          placeholder="Email address"
                        />
                      </div>
                      <span className="profile-field-hint">Email cannot be changed here.</span>
                    </div>

                    <div className="profile-field">
                      <label htmlFor="profile-phone">Phone Number</label>
                      <div className="profile-input-wrap">
                        <Phone size={17} />
                        <input
                          id="profile-phone"
                          type="tel"
                          value={form.phone}
                          onChange={(e) => updateField('phone', e.target.value)}
                          placeholder="Enter phone number"
                        />
                      </div>
                    </div>

                    <div className="profile-field">
                      <label htmlFor="profile-country">Country</label>
                      <div className="profile-input-wrap">
                        <MapPin size={17} />
                        <input
                          id="profile-country"
                          value={form.country}
                          onChange={(e) => updateField('country', e.target.value)}
                          placeholder="Enter your country"
                        />
                      </div>
                    </div>

                    <div className="profile-field">
                      <label htmlFor="profile-occupation">Occupation</label>
                      <div className="profile-input-wrap">
                        <BriefcaseBusiness size={17} />
                        <input
                          id="profile-occupation"
                          value={form.occupation}
                          onChange={(e) => updateField('occupation', e.target.value)}
                          placeholder="e.g. Developer, Student"
                        />
                      </div>
                    </div>

                    <div className="profile-field">
                      <label htmlFor="profile-website">Website</label>
                      <div className="profile-input-wrap">
                        <Globe size={17} />
                        <input
                          id="profile-website"
                          type="url"
                          value={form.website}
                          onChange={(e) => updateField('website', e.target.value)}
                          placeholder="https://yourwebsite.com"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="profile-field profile-bio-field">
                    <label htmlFor="profile-bio">About You</label>
                    <textarea
                      id="profile-bio"
                      rows={4}
                      maxLength={500}
                      value={form.bio}
                      onChange={(e) => updateField('bio', e.target.value)}
                      placeholder="Tell us a little about yourself..."
                    />
                    <span className="profile-character-count">
                      {form.bio.length}/500
                    </span>
                  </div>

                  <div className="profile-form-footer">
                    <span>Your profile changes are saved to your account.</span>
                    <button
                      type="button"
                      className="profile-primary-button profile-save-button"
                      onClick={saveProfile}
                      disabled={saving}
                    >
                      {saving
                        ? <LoaderCircle className="profile-spinner" size={17} />
                        : <Save size={17} />}
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </section>

                <aside className="profile-side-column">

                  <section className="profile-panel">
                    <div className="profile-panel-heading compact">
                      <div>
                        <span className="profile-section-label">PERSONAL SETUP</span>
                        <h3>AI Preferences</h3>
                      </div>
                      <div className="profile-panel-icon orange">
                        <Sparkles size={19} />
                      </div>
                    </div>

                    <div className="profile-preference-list">
                      <div className="profile-preference-item">
                        <span>Favorite AI Models</span>
                        <strong>Gemini, GPT-OSS</strong>
                      </div>
                      <div className="profile-preference-item">
                        <span>Default Workspace</span>
                        <strong>Personal Sandbox</strong>
                      </div>
                      <div className="profile-preference-item">
                        <span>Preferred Language</span>
                        <strong>English (US)</strong>
                      </div>
                      <div className="profile-preference-item">
                        <span>Prompt Style</span>
                        <strong>Concise &amp; Direct</strong>
                      </div>
                    </div>
                  </section>

                  <section className="profile-panel">
                    <div className="profile-panel-heading compact">
                      <div>
                        <span className="profile-section-label">ACCOUNT LOG</span>
                        <h3>Recent Activity</h3>
                      </div>
                      <div className="profile-panel-icon">
                        <Activity size={19} />
                      </div>
                    </div>

                    <div className="profile-activity-list">
                      {activity.map((item, index) => (
                        <div className="profile-activity-item" key={item.title}>
                          <div className="profile-activity-marker">
                            <span />
                            {index !== activity.length - 1 && (
                              <i />
                            )}
                          </div>
                          <div>
                            <strong>{item.title}</strong>
                            <span>{item.sub}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  <div className="profile-help-card">
                    <div className="profile-help-icon">
                      <Sparkles size={20} />
                    </div>
                    <h3>Make it yours</h3>
                    <p>
                      Keep your profile updated to make your AI Nexus
                      workspace feel more personal.
                    </p>
                  </div>

                </aside>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
