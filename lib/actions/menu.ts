'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { MenuItem, CreateMenuItemInput, UpdateMenuItemInput } from '@/lib/types/menu'
import { isUserAdmin } from '@/lib/actions/auth'
import { revalidatePath } from 'next/cache'

// ============================================
// PUBLIC: Get all menu items (including unavailable)
// ============================================
export async function getMenuItems(): Promise<MenuItem[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching menu items:', error)
    return []
  }

  return data || []
}

// ============================================
// PUBLIC: Get featured menu items
// ============================================
export async function getFeaturedItems(): Promise<MenuItem[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('Error fetching featured items:', error)
    return []
  }

  return data || []
}

// ============================================
// PUBLIC: Get menu items by category
// ============================================
export async function getMenuItemsByCategory(category: string): Promise<MenuItem[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('category', category)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching menu items by category:', error)
    return []
  }

  return data || []
}

// ============================================
// PUBLIC: Get all categories
// ============================================
export async function getCategories(): Promise<string[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('menu_items')
    .select('category')
    .order('category')

  if (error) {
    console.error('Error fetching categories:', error)
    return []
  }

  const categories = [...new Set(data.map(item => item.category))]
  return categories
}

// ============================================
// ADMIN: Get all menu items (for admin panel)
// ============================================
export async function getMenuItemsAdmin(): Promise<MenuItem[]> {
  // Check if user is admin
  const isAdmin = await isUserAdmin()
  if (!isAdmin) {
    return []
  }

  const adminClient = createAdminClient()
  const { data, error } = await adminClient
    .from('menu_items')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching menu items for admin:', error)
    return []
  }

  return data || []
}

// ============================================
// ADMIN: Create menu item
// ============================================
export async function createMenuItem(input: CreateMenuItemInput) {
  // Check if user is admin
  const isAdmin = await isUserAdmin()
  if (!isAdmin) {
    return { error: 'Unauthorized: Admin access required' }
  }

  const adminClient = createAdminClient()
  const { data, error } = await adminClient
    .from('menu_items')
    .insert({
      name: input.name,
      description: input.description || null,
      price: input.price,
      category: input.category,
      is_featured: input.is_featured || false,
      image_url: input.image_url || null,
      is_available: input.is_available !== undefined ? input.is_available : true,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating menu item:', error)
    return { error: 'Failed to create menu item' }
  }

  revalidatePath('/menu')
  revalidatePath('/admin/menu')
  revalidatePath('/')
  return { data, success: true }
}

// ============================================
// ADMIN: Update menu item
// ============================================
export async function updateMenuItem(input: UpdateMenuItemInput) {
  // Check if user is admin
  const isAdmin = await isUserAdmin()
  if (!isAdmin) {
    return { error: 'Unauthorized: Admin access required' }
  }

  const adminClient = createAdminClient()
  const updateData: any = {}
  
  if (input.name !== undefined) updateData.name = input.name
  if (input.description !== undefined) updateData.description = input.description
  if (input.price !== undefined) updateData.price = input.price
  if (input.category !== undefined) updateData.category = input.category
  if (input.is_featured !== undefined) updateData.is_featured = input.is_featured
  if (input.image_url !== undefined) {
    updateData.image_url = input.image_url === null ? null : input.image_url
  }
  if (input.is_available !== undefined) {
    updateData.is_available = input.is_available
  }

  const { data, error } = await adminClient
    .from('menu_items')
    .update(updateData)
    .eq('id', input.id)
    .select()
    .single()

  if (error) {
    console.error('Error updating menu item:', error)
    return { error: 'Failed to update menu item' }
  }

  revalidatePath('/menu')
  revalidatePath('/admin/menu')
  revalidatePath('/')
  return { data, success: true }
}

// ============================================
// ADMIN: Delete menu item
// ============================================
export async function deleteMenuItem(id: string) {
  // Check if user is admin
  const isAdmin = await isUserAdmin()
  if (!isAdmin) {
    return { error: 'Unauthorized: Admin access required' }
  }

  const adminClient = createAdminClient()
  
  // Get the menu item to find the image URL
  const { data: menuItem } = await adminClient
    .from('menu_items')
    .select('image_url')
    .eq('id', id)
    .single()

  // Delete the menu item
  const { error } = await adminClient
    .from('menu_items')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting menu item:', error)
    return { error: 'Failed to delete menu item' }
  }

  // Delete the image from storage if it exists
  if (menuItem?.image_url) {
    try {
      const fileName = menuItem.image_url.split('/').pop()
      if (fileName) {
        await adminClient.storage
          .from('food-images')
          .remove([fileName])
      }
    } catch (error) {
      console.error('Error deleting image:', error)
    }
  }

  revalidatePath('/menu')
  revalidatePath('/admin/menu')
  revalidatePath('/')
  return { success: true }
}

// ============================================
// ADMIN: Toggle featured status
// ============================================
export async function toggleFeatured(id: string, isFeatured: boolean) {
  // Check if user is admin
  const isAdmin = await isUserAdmin()
  if (!isAdmin) {
    return { error: 'Unauthorized: Admin access required' }
  }

  const adminClient = createAdminClient()
  const { data, error } = await adminClient
    .from('menu_items')
    .update({ is_featured: isFeatured })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error toggling featured:', error)
    return { error: 'Failed to update featured status' }
  }

  revalidatePath('/menu')
  revalidatePath('/admin/menu')
  revalidatePath('/')
  return { data, success: true }
}