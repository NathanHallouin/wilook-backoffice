// Product Types
export interface Product {
  id: string
  created_at: string
  updated_at: string
  title: string
  description: string | null
  category: ProductCategory
  type: string
  condition: ProductCondition
  brand: string | null
  provider: string | null
  colors: string[]
  materials: string[]
  details: string[]
  sizes: string[]
  shoe_sizes: string[]
  price: number
  final_price: number | null
  images: string[]
  thumbnail: string | null
}

export type ProductCategory = 'top' | 'bottom' | 'shoes' | 'accessories' | 'set'

export type ProductCondition = 'new' | 'like_new' | 'good' | 'fair'

export interface ProductFilters {
  category?: ProductCategory
  types?: string[]
  brands?: string[]
  colors?: string[]
  materials?: string[]
  details?: string[]
  sizes?: string[]
  shoeSizes?: string[]
  minPrice?: number
  maxPrice?: number
  onSale?: boolean
}

// Look Types
export interface Look {
  id: string
  created_at: string
  updated_at: string
  name: string | null
  designer: string | null
  universe: string | null
  is_public: boolean
  thumbnail: string | null
  left_top: string | null
  left_bottom: string | null
  right_top: string | null
  right_middle: string | null
  right_bottom: string | null
  // Joined products
  left_top_product?: Product | null
  left_bottom_product?: Product | null
  right_top_product?: Product | null
  right_middle_product?: Product | null
  right_bottom_product?: Product | null
  // Customer count
  customers_count?: number
}

export type LookSlot = 'left_top' | 'left_bottom' | 'right_top' | 'right_middle' | 'right_bottom'

export interface LookWithProducts extends Look {
  products: {
    slot: LookSlot
    product: Product
  }[]
}

// Customer Types
export interface Customer {
  email: string
  created_at: string
  updated_at: string
  first_name: string | null
  last_name: string | null
  budget: number | null
  style_preferences: StylePreferences | null
  sizes: CustomerSizes | null
  questionnaire_data: QuestionnaireData | null
}

export interface StylePreferences {
  styles?: string[]
  colors?: string[]
  avoid?: string[]
}

export interface CustomerSizes {
  top?: string
  bottom?: string
  shoes?: string
}

export interface QuestionnaireData {
  [key: string]: unknown
}

export interface CustomerWithStats extends Customer {
  nb_looks: number
  last_look_date: string | null
}

// AI Suggestion Types
/** Source of a suggestion result: the Claude-powered edge function or the local scoring engine. */
export type SuggestionSource = 'ai' | 'local'

/** A catalogue product proposed for a customer, with an explainable match score. */
export interface SuggestedProduct {
  product: Product
  /** Match score, 0–100. Higher is a better fit. */
  score: number
  /** Human-readable justifications ("Couleur préférée : Noir", "Dans le budget", …). */
  reasons: string[]
}

/** A full outfit proposal: one product per look slot, ready to be saved as a Look. */
export interface LookSuggestion {
  /** Chosen product for each of the 5 look slots (a slot may be left empty). */
  slots: Partial<Record<LookSlot, Product>>
  /** Why these pieces work together for this customer. */
  rationale: string
}

/** The complete output of a suggestion run: an overview, ranked products and an outfit. */
export interface AiSuggestionResult {
  source: SuggestionSource
  /** Natural-language overview of the recommendation. */
  summary: string
  products: SuggestedProduct[]
  look: LookSuggestion | null
}

// API Types
export interface PaginationOptions {
  page?: number
  pageSize?: number
}

export interface SortOptions {
  column: string
  ascending?: boolean
}

export interface FetchOptions extends PaginationOptions {
  sort?: SortOptions
}

// UI Types
export interface SelectOption {
  value: string
  label: string
}

export interface SnackbarMessage {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
}
