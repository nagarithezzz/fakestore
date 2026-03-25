const API = 'https://fakestoreapi.com'

export async function fetchProducts() {
  const res = await fetch(`${API}/products`)
  if (!res.ok) throw new Error('Could not load products')
  return res.json()
}

export async function fetchProduct(id) {
  const res = await fetch(`${API}/products/${id}`)
  if (!res.ok) throw new Error('Product not found')
  return res.json()
}

export async function tryFetchProduct(id) {
  const res = await fetch(`${API}/products/${id}`)
  if (!res.ok) return null
  return res.json()
}

export async function fetchCategories() {
  const res = await fetch(`${API}/products/categories`)
  if (!res.ok) throw new Error('Could not load categories')
  return res.json()
}
