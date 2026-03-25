import { Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getSession, clearSession } from './auth'
import { CartProvider, useCart } from './CartContext.jsx'
import Login from './Login.jsx'
import Register from './Register.jsx'
import Home from './Home.jsx'
import Products from './Products.jsx'
import ProductDetail from './ProductDetail.jsx'
import CartPage from './CartPage.jsx'

function Layout({ children }) {
  const session = getSession()
  const navigate = useNavigate()
  const { itemCount } = useCart()

  function logout() {
    clearSession()
    navigate('/login', { replace: true })
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header
        style={{
          background: '#fff',
          borderBottom: '1px solid #e5e7eb',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <Link to="/" style={{ textDecoration: 'none', color: '#111', fontWeight: 600 }}>
          Shop
        </Link>
        <nav style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          {session ? (
            <>
              <Link to="/products">Products</Link>
              <Link to="/cart" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                Cart
                {itemCount > 0 && (
                  <span
                    style={{
                      background: '#2563eb',
                      color: '#fff',
                      fontSize: '12px',
                      fontWeight: 700,
                      minWidth: '20px',
                      height: '20px',
                      borderRadius: '999px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0 6px',
                    }}
                  >
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </Link>
              <span style={{ fontSize: '14px', color: '#6b7280' }}>{session.username}</span>
              <button
                type="button"
                onClick={logout}
                style={{
                  padding: '6px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  background: '#fff',
                  cursor: 'pointer',
                }}
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Log in</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </nav>
      </header>
      <main style={{ flex: 1, padding: '24px 20px' }}>{children}</main>
    </div>
  )
}

function Protected({ children }) {
  const [ready, setReady] = useState(false)
  const session = getSession()

  useEffect(() => {
    setReady(true)
  }, [])

  if (!ready) return null
  if (!session) return <Navigate to="/login" replace />
  return children
}

function AppRoutes() {
  return (
    <Layout>
      <Routes>
        <Route
          path="/"
          element={
            <Protected>
              <Home />
            </Protected>
          }
        />
        <Route
          path="/products"
          element={
            <Protected>
              <Products />
            </Protected>
          }
        />
        <Route
          path="/products/:id"
          element={
            <Protected>
              <ProductDetail />
            </Protected>
          }
        />
        <Route
          path="/cart"
          element={
            <Protected>
              <CartPage />
            </Protected>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}

export default function App() {
  return (
    <CartProvider>
      <AppRoutes />
    </CartProvider>
  )
}
