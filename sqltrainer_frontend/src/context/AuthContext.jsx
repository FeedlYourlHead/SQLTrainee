import { createContext, useContext, useEffect, useState } from 'react'
import { clearAccessToken } from '../api/client'
import { login as apiLogin, register as apiRegister, restoreSession } from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    restoreSession().then((u) => {
      setUser(u)
      setLoading(false)
    })
  }, [])

  const login = async (username, password) => {
    await apiLogin(username, password)
    const u = await restoreSession()
    setUser(u)
  }

  const register = async (username, email, password) => {
    await apiRegister(username, email, password)
    await login(username, password)
  }

  const logout = () => {
    clearAccessToken()
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
