import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { tryFetchProduct } from './api'
import { useCart } from './CartContext.jsx'
import { getLocalProductById, removeLocalProduct } from './localProducts'

const money = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

export default function ProductDetail() {
  const { id } = useParams()
  const { add } = useCart()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [qty, setQty] = useState(1)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    ;(async () => {
      const local = getLocalProductById(id)
      if (local) return local
      return await tryFetchProduct(id)
    })()
      .then((data) => {
        if (!cancelled && data) setProduct(data)
        if (!cancelled && !data) setError('Product not found.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) {
    return <p style={{ color: '#6b7280' }}>Loading…</p>
  }
  if (error || !product) {
    return (
      <p>
        {error}{' '}
        <Link to="/products">Products</Link>
      </p>
    )
  }

  return (
    <div
      style={{
        maxWidth: '900px',
        margin: '0 auto',
        background: '#fff',
        borderRadius: '10px',
        boxShadow: '0 1px 3px rgba(0,0,0,.08)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.2fr)',
          gap: '24px',
          padding: '24px',
        }}
        className="product-detail-grid"
      >
        <style>{`
          @media (max-width: 640px) {
            .product-detail-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
        <div
          style={{
            background: '#f9fafb',
            borderRadius: '8px',
            padding: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '280px',
          }}
        >
          <img
            src={product.image}
            alt=""
            style={{ maxWidth: '100%', maxHeight: '320px', objectFit: 'contain' }}
          />
        </div>
        <div>
          <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#6b7280', textTransform: 'capitalize' }}>
            {product.category}
          </p>
          <h1 style={{ margin: '0 0 12px', fontSize: '1.5rem', lineHeight: 1.3 }}>{product.title}</h1>
          <p style={{ margin: '0 0 8px', fontSize: '1.5rem', fontWeight: 700, color: '#059669' }}>
            {money(product.price)}
          </p>
          {product.rating && (
            <p style={{ margin: '0 0 16px', fontSize: '14px', color: '#6b7280' }}>
              ★ {product.rating.rate}
            </p>
          )}
          <p style={{ margin: '0 0 20px', color: '#374151', fontSize: '15px', lineHeight: 1.6 }}>
            {product.description}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
              Qty
              <input
                type="number"
                min={1}
                max={99}
                value={qty}
                onChange={(e) => setQty(Math.max(1, Math.min(99, Number(e.target.value) || 1)))}
                style={{ width: '64px', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db' }}
              />
            </label>
            <button
              type="button"
              onClick={() => {
                add(product, qty)
                setQty(1)
              }}
              style={{
                padding: '10px 20px',
                background: '#2563eb',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Add to cart
            </button>
            {product.__local && (
              <button
                type="button"
                onClick={() => {
                  removeLocalProduct(product.id)
                  setError('Product removed.')
                  setProduct(null)
                }}
                style={{
                  padding: '10px 14px',
                  background: '#fff',
                  color: '#b91c1c',
                  border: '1px solid #fecaca',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 700,
                }}
              >
                Delete
              </button>
            )}
            <Link to="/products" style={{ fontSize: '14px' }}>
              Back
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
