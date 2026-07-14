export interface MenuItem {
  id: string
  name: string
  description: string | null
  price: number
  category: string
  is_featured: boolean
  image_url: string | null
  is_available: boolean
  created_at: string
  updated_at: string
}

export interface CreateMenuItemInput {
  name: string
  description?: string
  price: number
  category: string
  is_featured?: boolean
  image_url?: string | null  // Allow null
  is_available?: boolean
}

export interface UpdateMenuItemInput extends Partial<CreateMenuItemInput> {
  id: string
}