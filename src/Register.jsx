import { useState } from 'react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import {
  registerLocalUser,
  createFakeStoreUser,
  setSession,
  loginFakeStore,
  getSession,
} from './auth'

const card = {
  maxWidth: '360px',
  margin: '0 auto',
  background: '#fff',
  padding: '28px',
  borderRadius: '10px',
  boxShadow: '0 1px 3px rgba(0,0,0,.08)',
}

export default function Register() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (getSession()) return <Navigate to="/" replace />

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const r = registerLocalUser({ username, email, password })
      if (!r.ok) {
        setError(r.error)
        return
      }
      await createFakeStoreUser({
        email,
        username,
        password,
        name: { firstname: username, lastname: 'User' },
        address: {
          city: '—',
          street: '—',
          number: 1,
          zipcode: '00000',
          geolocation: { lat: '0', long: '0' },
        },
        phone: '—',
      })
      try {
        const session = await loginFakeStore(username, password)
        setSession(session)
        navigate('/', { replace: true })
      } catch {
        setSession({
          token: `local-${btoa(username)}`,
          username,
          email,
          source: 'local',
        })
        navigate('/', { replace: true })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={card}>
      <h1 style={{ margin: '0 0 20px', fontSize: '1.35rem' }}>Register</h1>
      <form onSubmit={onSubmit}>
        <label style={{ display: 'block', marginBottom: '14px' }}>
          <span style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>
            Username
          </span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
            }}
          />
        </label>
        <label style={{ display: 'block', marginBottom: '14px' }}>
          <span style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
            }}
          />
        </label>
        <label style={{ display: 'block', marginBottom: '14px' }}>
          <span style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>
            Password
          </span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={4}
            autoComplete="new-password"
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
            }}
          />
        </label>
        {error && (
          <p style={{ color: '#b91c1c', fontSize: '14px', margin: '0 0 12px' }}>{error}</p>
        )}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px',
            background: '#059669',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'wait' : 'pointer',
            fontWeight: 600,
          }}
        >
          {loading ? 'Creating…' : 'Create account'}
        </button>
      </form>
      <p style={{ marginTop: '16px', fontSize: '14px' }}>
        <Link to="/login">Log in</Link>
      </p>
    </div>
  )
}
