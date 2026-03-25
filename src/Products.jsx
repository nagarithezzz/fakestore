import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { fetchProducts } from './api'
import { useCart } from './CartContext.jsx'
import { addLocalProduct, getLocalProducts } from './localProducts'

const money = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

const cardStyle = {
  background: '#fff',
  borderRadius: '10px',
  boxShadow: '0 1px 3px rgba(0,0,0,.08)',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
}

export default function Products() {
  const { add } = useCart()
  const [apiProducts, setApiProducts] = useState([])
  const [localProducts, setLocalProducts] = useState(() => getLocalProducts())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [category, setCategory] = useState('all')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({
    title: '',
    price: '',
    category: '',
    image: '',
    description: '',
  })

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchProducts()
      .then((data) => {
        if (!cancelled) setApiProducts(data)
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load products.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const products = useMemo(() => {
    return [...localProducts, ...apiProducts]
  }, [localProducts, apiProducts])

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category))
    return ['all', ...[...set].sort()]
  }, [products])

  const filtered =
    category === 'all' ? products : products.filter((p) => p.category === category)

  if (loading) {
    return <p style={{ textAlign: 'center', color: '#6b7280' }}>Loading…</p>
  }
  if (error) {
    return <p style={{ color: '#b91c1c' }}>{error}</p>
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '20px',
        }}
      >
        <h1 style={{ margin: 0, fontSize: '1.35rem', flex: '1 1 auto' }}>Products</h1>
        <button
          type="button"
          onClick={() => setShowAdd((s) => !s)}
          style={{
            padding: '8px 10px',
            borderRadius: '6px',
            border: '1px solid #d1d5db',
            background: '#fff',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '14px',
          }}
        >
          {showAdd ? 'Close' : 'Add'}
        </button>
        <label style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          Category
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #d1d5db' }}
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === 'all' ? 'All' : c}
              </option>
            ))}
          </select>
        </label>
      </div>

      {showAdd && (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const created = addLocalProduct({
              title: form.title,
              price: form.price,
              category: form.category,
              image: form.image,
              description: form.description,
            })
            setLocalProducts(getLocalProducts())
            setShowAdd(false)
            setForm({ title: '', price: '', category: '', image: '', description: '' })
            if (category !== 'all' && created.category !== category) setCategory('all')
          }}
          style={{
            background: '#fff',
            borderRadius: '10px',
            boxShadow: '0 1px 3px rgba(0,0,0,.08)',
            padding: '16px',
            marginBottom: '20px',
            display: 'grid',
            gap: '10px',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }} className="add-grid">
            <style>{`
              @media (max-width: 520px) { .add-grid { grid-template-columns: 1fr !important; } }
            `}</style>
            <input
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              required
              style={{ padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
            />
            <input
              placeholder="Price"
              inputMode="decimal"
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              required
              style={{ padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
            />
          </div>
          <input
            placeholder="Category"
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            style={{ padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
          />
          <input
            placeholder="Image URL (optional)"
            value={form.image}
            onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
            style={{ padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
          />
          <textarea
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            rows={3}
            style={{ padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', resize: 'vertical' }}
          />
          <button
            type="submit"
            style={{
              padding: '10px',
              background: '#059669',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 700,
            }}
          >
            Save
          </button>
        </form>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '20px',
        }}
      >
        {filtered.map((p) => (
          <article key={p.id} style={cardStyle}>
            <Link
              to={`/products/${p.id}`}
              style={{ textDecoration: 'none', color: 'inherit', flex: 1, display: 'flex', flexDirection: 'column' }}
            >
              <div
                style={{
                  height: '180px',
                  background: '#f9fafb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '16px',
                }}
              >
                <img
                  src={p.image}
                  alt=""
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                />
              </div>
              <div style={{ padding: '14px', flex: 1 }}>
                <h2 style={{ margin: '0 0 8px', fontSize: '0.95rem', fontWeight: 600, lineHeight: 1.35 }}>
                  {p.title}
                </h2>
                <p style={{ margin: 0, fontWeight: 700, color: '#059669' }}>{money(p.price)}</p>
              </div>
            </Link>
            <div style={{ padding: '0 14px 14px' }}>
              <button
                type="button"
                onClick={() => add(p, 1)}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '14px',
                }}
              >
                Add to cart
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
