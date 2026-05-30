import { api, setAccessToken } from './client'

export async function login(username, password) {
  const data = await api.post('/auth/login/', { username, password })
  setAccessToken(data.access)
  localStorage.setItem('access_token', data.access)
  localStorage.setItem('refresh_token', data.refresh)
  return data
}

export async function register(username, email, password) {
  return api.post('/auth/register/', { username, email, password })
}

export async function refreshToken(refresh) {
  const data = await api.post('/auth/refresh/', { refresh })
  setAccessToken(data.access)
  localStorage.setItem('access_token', data.access)
  return data
}

export async function getMe() {
  return api.get('/users/me/')
}

export async function restoreSession() {
  const access = localStorage.getItem('access_token')
  const refresh = localStorage.getItem('refresh_token')

  if (!access || !refresh) return null

  setAccessToken(access)

  try {
    const user = await getMe()
    return user
  } catch {
    try {
      await refreshToken(refresh)
      const user = await getMe()
      return user
    } catch {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      return null
    }
  }
}
