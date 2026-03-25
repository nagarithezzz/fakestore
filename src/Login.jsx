import { useState } from 'react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import { setSession, loginFakeStore, loginLocal, getSession } from './auth'

const card = {
  maxWidth: '360px',
  margin: '0 auto',
  background: '#fff',
  padding: '28px',
  borderRadius: '10px',
  boxShadow: '0 1px 3px rgba(0,0,0,.08)',
}

export default function Login() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (getSession()) return <Navigate to="/" replace />

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const apiSession = await loginFakeStore(username, password)
      setSession(apiSession)
      navigate('/', { replace: true })
    } catch {
      const local = loginLocal(username, password)
      if (local) {
        setSession(local)
        navigate('/', { replace: true })
      } else {
        setError('Invalid username or password.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={card}>
      <h1 style={{ margin: '0 0 20px', fontSize: '1.35rem' }}>Log in</h1>
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
          <span style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>
            Password
          </span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
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
            background: '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'wait' : 'pointer',
            fontWeight: 600,
          }}
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <p style={{ marginTop: '16px', fontSize: '14px' }}>
        <Link to="/register">Register</Link>
      </p>
    </div>
  )
}
