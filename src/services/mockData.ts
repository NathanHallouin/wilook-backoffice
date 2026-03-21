import type { Product, Look, CustomerWithStats } from '@/types'

// Initial mock data
const mockProducts: Product[] = [
  {
    id: '1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    title: 'T-shirt Basic Noir',
    description: 'T-shirt en coton bio',
    category: 'top',
    type: 'T-shirt',
    condition: 'new',
    brand: 'Basics',
    provider: 'FashionCo',
    colors: ['Noir'],
    materials: ['Coton'],
    details: ['Col rond'],
    sizes: ['S', 'M', 'L', 'XL'],
    shoe_sizes: [],
    price: 29.99,
    final_price: null,
    images: [],
    thumbnail: null,
  },
  {
    id: '2',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    title: 'Jean Slim Bleu',
    description: 'Jean slim fit en denim',
    category: 'bottom',
    type: 'Jean',
    condition: 'new',
    brand: 'DenimBrand',
    provider: 'JeansCo',
    colors: ['Bleu'],
    materials: ['Denim', 'Coton'],
    details: ['Slim fit', '5 poches'],
    sizes: ['38', '40', '42', '44'],
    shoe_sizes: [],
    price: 89.99,
    final_price: 69.99,
    images: [],
    thumbnail: null,
  },
  {
    id: '3',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    title: 'Sneakers Blanches',
    description: 'Sneakers en cuir blanc',
    category: 'shoes',
    type: 'Sneakers',
    condition: 'new',
    brand: 'SportStyle',
    provider: 'ShoesCo',
    colors: ['Blanc'],
    materials: ['Cuir'],
    details: ['Semelle caoutchouc'],
    sizes: [],
    shoe_sizes: ['40', '41', '42', '43', '44'],
    price: 129.99,
    final_price: null,
    images: [],
    thumbnail: null,
  },
]

const mockLooks: Look[] = [
  {
    id: '1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    name: 'Casual Friday',
    designer: 'Marie',
    universe: 'Casual',
    is_public: true,
    thumbnail: null,
    left_top: '1',
    left_bottom: '2',
    right_top: null,
    right_middle: null,
    right_bottom: '3',
    customers_count: 2,
  },
]

const mockCustomers: CustomerWithStats[] = [
  {
    email: 'john@example.com',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    first_name: 'John',
    last_name: 'Doe',
    budget: 500,
    style_preferences: { styles: ['Casual', 'Sport'], colors: ['Noir', 'Bleu'] },
    sizes: { top: 'M', bottom: '40', shoes: '42' },
    questionnaire_data: null,
    nb_looks: 1,
    last_look_date: new Date().toISOString(),
  },
  {
    email: 'jane@example.com',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    first_name: 'Jane',
    last_name: 'Smith',
    budget: 800,
    style_preferences: { styles: ['Chic', 'Business'], colors: ['Beige', 'Blanc'] },
    sizes: { top: 'S', bottom: '36', shoes: '38' },
    questionnaire_data: null,
    nb_looks: 3,
    last_look_date: new Date().toISOString(),
  },
]

// LocalStorage keys
const STORAGE_KEYS = {
  PRODUCTS: 'mock_products',
  LOOKS: 'mock_looks',
  CUSTOMERS: 'mock_customers',
}

// Helper to get/set localStorage
function getStoredData<T>(key: string, defaultData: T[]): T[] {
  try {
    const stored = localStorage.getItem(key)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch {
    // Ignore parse errors
  }
  localStorage.setItem(key, JSON.stringify(defaultData))
  return defaultData
}

function setStoredData<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data))
}

// Mock database class
class MockDatabase {
  getProducts(): Product[] {
    return getStoredData(STORAGE_KEYS.PRODUCTS, mockProducts)
  }

  setProducts(products: Product[]): void {
    setStoredData(STORAGE_KEYS.PRODUCTS, products)
  }

  getLooks(): Look[] {
    return getStoredData(STORAGE_KEYS.LOOKS, mockLooks)
  }

  setLooks(looks: Look[]): void {
    setStoredData(STORAGE_KEYS.LOOKS, looks)
  }

  getCustomers(): CustomerWithStats[] {
    return getStoredData(STORAGE_KEYS.CUSTOMERS, mockCustomers)
  }

  setCustomers(customers: CustomerWithStats[]): void {
    setStoredData(STORAGE_KEYS.CUSTOMERS, customers)
  }

  // Products CRUD
  addProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Product {
    const products = this.getProducts()
    const newProduct: Product = {
      ...product,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    products.push(newProduct)
    this.setProducts(products)
    return newProduct
  }

  updateProduct(id: string, updates: Partial<Product>): Product | null {
    const products = this.getProducts()
    const index = products.findIndex(p => p.id === id)
    if (index === -1) return null
    products[index] = { ...products[index], ...updates, updated_at: new Date().toISOString() }
    this.setProducts(products)
    return products[index]
  }

  deleteProduct(id: string): boolean {
    const products = this.getProducts()
    const filtered = products.filter(p => p.id !== id)
    if (filtered.length === products.length) return false
    this.setProducts(filtered)
    return true
  }

  // Looks CRUD
  addLook(look: Partial<Look>): Look {
    const looks = this.getLooks()
    const newLook: Look = {
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      name: look.name || null,
      designer: look.designer || null,
      universe: look.universe || null,
      is_public: look.is_public || false,
      thumbnail: look.thumbnail || null,
      left_top: look.left_top || null,
      left_bottom: look.left_bottom || null,
      right_top: look.right_top || null,
      right_middle: look.right_middle || null,
      right_bottom: look.right_bottom || null,
      customers_count: 0,
    }
    looks.push(newLook)
    this.setLooks(looks)
    return newLook
  }

  updateLook(id: string, updates: Partial<Look>): Look | null {
    const looks = this.getLooks()
    const index = looks.findIndex(l => l.id === id)
    if (index === -1) return null
    looks[index] = { ...looks[index], ...updates, updated_at: new Date().toISOString() }
    this.setLooks(looks)
    return looks[index]
  }

  deleteLook(id: string): boolean {
    const looks = this.getLooks()
    const filtered = looks.filter(l => l.id !== id)
    if (filtered.length === looks.length) return false
    this.setLooks(filtered)
    return true
  }
}

export const mockDb = new MockDatabase()
