// Database Tables
export const TABLES = {
  PRODUCTS: 'products',
  LOOKS: 'looks',
  PROFILES: 'profiles',
  LOOKS_PROFILES: 'looks_profiles',
} as const

// Database Views
export const VIEWS = {
  BRANDS: 'brands',
  PROVIDERS: 'providers',
  DESIGNERS: 'designers',
  UNIVERS: 'univers',
} as const

// RPC Functions
export const RPC_FUNCTIONS = {
  GET_ALL_LOOKS: 'get_all_looks',
  GET_UNUSED_LOOKS: 'get_unused_looks',
  GET_NB_LOOKS_USERS: 'get_nb_looks_users',
  GET_CUSTOMERS_WITH_STATS: 'get_customers_with_stats',
} as const

// Storage Buckets
export const STORAGE_BUCKETS = {
  PRODUCTS_IMAGES: 'products-images',
  LOOKS_IMAGES: 'looks-images',
  PUBLIC_LOOKS: 'public-looks',
} as const

// Product Categories
export const PRODUCT_CATEGORIES = {
  TOP: 'top',
  BOTTOM: 'bottom',
  SHOES: 'shoes',
  ACCESSORIES: 'accessories',
  SET: 'set',
} as const

export const PRODUCT_CATEGORY_LABELS: Record<string, string> = {
  top: 'Haut',
  bottom: 'Bas',
  shoes: 'Chaussures',
  accessories: 'Accessoires',
  set: 'Ensemble',
}

// Product Conditions
export const PRODUCT_CONDITIONS = {
  NEW: 'new',
  LIKE_NEW: 'like_new',
  GOOD: 'good',
  FAIR: 'fair',
} as const

export const PRODUCT_CONDITION_LABELS: Record<string, string> = {
  new: 'Neuf',
  like_new: 'Comme neuf',
  good: 'Bon état',
  fair: 'État correct',
}

// Look Slots
export const LOOK_SLOTS = {
  LEFT_TOP: 'left_top',
  LEFT_BOTTOM: 'left_bottom',
  RIGHT_TOP: 'right_top',
  RIGHT_MIDDLE: 'right_middle',
  RIGHT_BOTTOM: 'right_bottom',
} as const

// Image Configuration
export const IMAGE_CONFIG = {
  MAX_HEIGHT: 1200,
  WEBP_QUALITY: 0.85,
  THUMBNAIL_SIZE: 300,
  MAX_FILE_SIZE_MB: 5,
} as const

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const

// Routes
export const ROUTES = {
  HOME: '/',
  PRODUCTS: '/products',
  PRODUCTS_EDIT: '/products/edit',
  LOOKS: '/looks',
  LOOKS_EDIT: '/looks/edit',
  USERS: '/users',
  USER: '/user/:email',
} as const
