import { Link } from 'react-router-dom'
import { useCart } from './CartContext.jsx'

const money = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

export default function CartPage() {
  const { cart, setQty, remove, subtotal } = useCart()
  const { items } = cart

  if (items.length === 0) {
    return (
      <div
        style={{
          maxWidth: '480px',
          margin: '0 auto',
          textAlign: 'center',
          background: '#fff',
          padding: '40px 28px',
          borderRadius: '10px',
          boxShadow: '0 1px 3px rgba(0,0,0,.08)',
        }}
      >
        <h1 style={{ margin: '0 0 12px', fontSize: '1.25rem' }}>Cart is empty</h1>
        <Link to="/products" style={{ fontWeight: 600 }}>
          Products
        </Link>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto' }}>
      <h1 style={{ margin: '0 0 20px', fontSize: '1.35rem' }}>Cart</h1>
      <ul
        style={{
          listStyle: 'none',
          margin: 0,
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        {items.map((line) => {
          const lineTotal = line.price * line.quantity
          return (
            <li
              key={line.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '80px 1fr auto',
                gap: '16px',
                alignItems: 'center',
                background: '#fff',
                padding: '14px',
                borderRadius: '10px',
                boxShadow: '0 1px 3px rgba(0,0,0,.08)',
              }}
              className="cart-row"
            >
              <style>{`
                @media (max-width: 520px) {
                  .cart-row { grid-template-columns: 64px 1fr !important; }
                  .cart-row .cart-row-actions { grid-column: 1 / -1; justify-self: stretch; }
                }
              `}</style>
              <Link to={`/products/${line.id}`}>
                <img
                  src={line.image}
                  alt=""
                  style={{ width: '80px', height: '80px', objectFit: 'contain' }}
                />
              </Link>
              <div>
                <Link
                  to={`/products/${line.id}`}
                  style={{ color: '#111', fontWeight: 600, textDecoration: 'none', fontSize: '15px' }}
                >
                  {line.title}
                </Link>
                <p style={{ margin: '6px 0 0', fontSize: '14px', color: '#6b7280' }}>
                  {money(line.price)}
                </p>
              </div>
              <div
                className="cart-row-actions"
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    onClick={() => setQty(line.id, line.quantity - 1)}
                    style={{
                      width: '32px',
                      height: '32px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      background: '#fff',
                      cursor: 'pointer',
                    }}
                  >
                    −
                  </button>
                  <span style={{ minWidth: '28px', textAlign: 'center', fontWeight: 600 }}>
                    {line.quantity}
                  </span>
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    onClick={() => setQty(line.id, line.quantity + 1)}
                    style={{
                      width: '32px',
                      height: '32px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      background: '#fff',
                      cursor: 'pointer',
                    }}
                  >
                    +
                  </button>
                </div>
                <p style={{ margin: 0, fontWeight: 700 }}>{money(lineTotal)}</p>
                <button
                  type="button"
                  onClick={() => remove(line.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#b91c1c',
                    cursor: 'pointer',
                    fontSize: '13px',
                    padding: 0,
                  }}
                >
                  Remove
                </button>
              </div>
            </li>
          )
        })}
      </ul>
      <div
        style={{
          marginTop: '24px',
          padding: '20px',
          background: '#fff',
          borderRadius: '10px',
          boxShadow: '0 1px 3px rgba(0,0,0,.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>Total</span>
        <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#059669' }}>{money(subtotal)}</span>
      </div>
      <p style={{ marginTop: '16px' }}>
        <Link to="/products">Products</Link>
      </p>
    </div>
  )
}
