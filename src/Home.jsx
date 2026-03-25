import { Link } from 'react-router-dom'
import { getSession } from './auth'

const btn = {
  display: 'inline-block',
  padding: '10px 18px',
  borderRadius: '6px',
  fontWeight: 600,
  textDecoration: 'none',
  marginRight: '12px',
  marginBottom: '8px',
}

export default function Home() {
  const session = getSession()

  return (
    <div
      style={{
        maxWidth: '420px',
        margin: '0 auto',
        background: '#fff',
        padding: '28px',
        borderRadius: '10px',
        boxShadow: '0 1px 3px rgba(0,0,0,.08)',
      }}
    >
      <p style={{ margin: '0 0 20px', fontSize: '1.1rem' }}>
        Hi, <strong>{session?.username}</strong>
      </p>
      <div>
        <Link to="/products" style={{ ...btn, background: '#2563eb', color: '#fff' }}>
          Products
        </Link>
        <Link
          to="/cart"
          style={{ ...btn, background: '#f3f4f6', color: '#111', border: '1px solid #e5e7eb' }}
        >
          Cart
        </Link>
      </div>
    </div>
  )
}
