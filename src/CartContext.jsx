import { createContext, useContext, useMemo, useState, useCallback } from 'react'
import * as cartStorage from './cartStorage'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [version, setVersion] = useState(0)
  const bump = useCallback(() => setVersion((v) => v + 1), [])

  const value = useMemo(() => {
    void version
    return {
      cart: cartStorage.getCart(),
      itemCount: cartStorage.getCartItemCount(),
      subtotal: cartStorage.getCartSubtotal(),
      add(product, qty = 1) {
        cartStorage.addToCart(product, qty)
        bump()
      },
      setQty(productId, qty) {
        cartStorage.setLineQuantity(productId, qty)
        bump()
      },
      remove(productId) {
        cartStorage.removeLine(productId)
        bump()
      },
    }
  }, [version, bump])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart needs CartProvider')
  return ctx
}
