const SESSION_KEY = 'fs_session'
const LOCAL_USERS_KEY = 'fs_local_users'

const API = 'https://fakestoreapi.com'

export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function setSession(data) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(data))
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY)
}

function getLocalUsers() {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveLocalUsers(users) {
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users))
}

export function registerLocalUser({ username, email, password }) {
  const users = getLocalUsers()
  if (users.some((u) => u.username === username)) {
    return { ok: false, error: 'Username already taken.' }
  }
  if (users.some((u) => u.email === email)) {
    return { ok: false, error: 'Email already registered.' }
  }
  users.push({ username, email, password })
  saveLocalUsers(users)
  return { ok: true }
}

export function loginLocal(username, password) {
  const users = getLocalUsers()
  const u = users.find(
    (x) => x.username === username && x.password === password,
  )
  if (!u) return null
  return {
    token: `local-${btoa(username)}`,
    username: u.username,
    email: u.email,
    source: 'local',
  }
}

export async function loginFakeStore(username, password) {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || 'Login failed')
  }
  const data = await res.json()
  return {
    token: data.token,
    username,
    email: null,
    source: 'api',
  }
}

export async function createFakeStoreUser(payload) {
  const res = await fetch(`${API}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return res.ok
}
