import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)
const API = 'https://ai-nexus-backend-wato.onrender.com'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('ai-nexus-token'))
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('ai-nexus-user')
    return stored ? JSON.parse(stored) : null
  })

  function persist(token, user) {
    localStorage.setItem('ai-nexus-token', token)
    localStorage.setItem('ai-nexus-user', JSON.stringify(user))
    setToken(token)
    setUser(user)
  }

  async function signup(name, email, password) {
    const res = await fetch(`${API}/api/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.detail || 'Signup failed')
    persist(data.token, { name: data.name, email: data.email })
  }

  async function login(email, password) {
    const res = await fetch(`${API}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.detail || 'Login failed')
    persist(data.token, { name: data.name, email: data.email })
  }

  function logout() {
    localStorage.removeItem('ai-nexus-token')
    localStorage.removeItem('ai-nexus-user')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ token, user, signup, login, logout, isAuthed: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
