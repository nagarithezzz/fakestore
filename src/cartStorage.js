const CART_KEY = 'fs_cart'

function emptyCart() {
  return { items: [] }
}

export function getCart() {
  try {
    const raw = localStorage.getItem(CART_KEY)
    if (!raw) return emptyCart()
    const data = JSON.parse(raw)
    if (!data.items || !Array.isArray(data.items)) return emptyCart()
    return data
  } catch {
    return emptyCart()
  }
}

export function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart))
}

export function addToCart(product, qty = 1) {
  const cart = getCart()
  const i = cart.items.findIndex((x) => x.id === product.id)
  if (i >= 0) {
    cart.items[i].quantity += qty
  } else {
    cart.items.push({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      category: product.category,
      quantity: qty,
    })
  }
  saveCart(cart)
  return cart
}

export function setLineQuantity(productId, quantity) {
  const cart = getCart()
  const i = cart.items.findIndex((x) => x.id === productId)
  if (i < 0) return cart
  if (quantity <= 0) {
    cart.items.splice(i, 1)
  } else {
    cart.items[i].quantity = quantity
  }
  saveCart(cart)
  return cart
}

export function removeLine(productId) {
  const cart = getCart()
  cart.items = cart.items.filter((x) => x.id !== productId)
  saveCart(cart)
  return cart
}

export function getCartItemCount() {
  return getCart().items.reduce((n, x) => n + x.quantity, 0)
}

export function getCartSubtotal() {
  return getCart().items.reduce((sum, x) => sum + x.price * x.quantity, 0)
}
