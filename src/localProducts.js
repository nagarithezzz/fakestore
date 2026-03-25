const KEY = 'fs_local_products'

function empty() {
  return []
}

function safeParse(raw) {
  try {
    const data = JSON.parse(raw)
    return Array.isArray(data) ? data : empty()
  } catch {
    return empty()
  }
}

export function getLocalProducts() {
  const raw = localStorage.getItem(KEY)
  return raw ? safeParse(raw) : empty()
}

function saveLocalProducts(products) {
  localStorage.setItem(KEY, JSON.stringify(products))
}

export function addLocalProduct({ title, price, category, image, description }) {
  const products = getLocalProducts()
  const id = -Date.now()
  const product = {
    id,
    title: String(title || '').trim(),
    price: Number(price) || 0,
    description: String(description || '').trim(),
    category: String(category || '').trim() || 'other',
    image: String(image || '').trim() || 'https://via.placeholder.com/300?text=Product',
    rating: { rate: 0, count: 0 },
    __local: true,
  }
  products.unshift(product)
  saveLocalProducts(products)
  return product
}

export function getLocalProductById(id) {
  const n = Number(id)
  if (!Number.isFinite(n)) return null
  return getLocalProducts().find((p) => p.id === n) || null
}

export function removeLocalProduct(id) {
  const n = Number(id)
  if (!Number.isFinite(n)) return getLocalProducts()
  const products = getLocalProducts().filter((p) => p.id !== n)
  saveLocalProducts(products)
  return products
}

