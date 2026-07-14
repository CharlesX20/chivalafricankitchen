'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { RestaurantSettings, UpdateSettingsInput } from '@/lib/types/settings'
import { isUserAdmin } from '@/lib/actions/auth'
import { revalidatePath } from 'next/cache'

// Get all restaurant settings (public)
export async function getRestaurantSettings(): Promise<RestaurantSettings[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('restaurant_settings')
    .select('*')
    .order('day_of_week')

  if (error) {
    console.error('Error fetching restaurant settings:', error)
    return []
  }

  return data || []
}

// Get settings for a specific day
export async function getSettingsForDay(day: string): Promise<RestaurantSettings | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('restaurant_settings')
    .select('*')
    .eq('day_of_week', day)
    .single()

  if (error) {
    return null
  }

  return data
}

// Check if restaurant is currently open
export async function isRestaurantOpen(): Promise<{ open: boolean; nextOpenTime?: string }> {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const now = new Date()
  const dayOfWeek = days[now.getDay()]
  const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0')

  const settings = await getSettingsForDay(dayOfWeek)
  
  if (!settings || settings.is_closed) {
    // Find next open day
    for (let i = 1; i <= 7; i++) {
      const nextDay = new Date(now)
      nextDay.setDate(nextDay.getDate() + i)
      const nextDayName = days[nextDay.getDay()]
      const nextSettings = await getSettingsForDay(nextDayName)
      if (nextSettings && !nextSettings.is_closed) {
        const [hours, minutes] = nextSettings.open_time.split(':')
        nextDay.setHours(parseInt(hours), parseInt(minutes), 0, 0)
        return { 
          open: false, 
          nextOpenTime: nextDay.toISOString()
        }
      }
    }
    return { open: false }
  }

  // Check if current time is within open hours
  if (currentTime >= settings.open_time && currentTime < settings.close_time) {
    return { open: true }
  }

  // Find next open time (today or tomorrow)
  if (currentTime < settings.open_time) {
    const nextOpen = new Date(now)
    const [hours, minutes] = settings.open_time.split(':')
    nextOpen.setHours(parseInt(hours), parseInt(minutes), 0, 0)
    return { 
      open: false, 
      nextOpenTime: nextOpen.toISOString()
    }
  } else {
    // Find next day
    for (let i = 1; i <= 7; i++) {
      const nextDay = new Date(now)
      nextDay.setDate(nextDay.getDate() + i)
      const nextDayName = days[nextDay.getDay()]
      const nextSettings = await getSettingsForDay(nextDayName)
      if (nextSettings && !nextSettings.is_closed) {
        const [hours, minutes] = nextSettings.open_time.split(':')
        nextDay.setHours(parseInt(hours), parseInt(minutes), 0, 0)
        return { 
          open: false, 
          nextOpenTime: nextDay.toISOString()
        }
      }
    }
    return { open: false }
  }
}

// ADMIN: Update restaurant settings
export async function updateRestaurantSettings(input: UpdateSettingsInput) {
  const isAdmin = await isUserAdmin()
  if (!isAdmin) {
    return { error: 'Unauthorized: Admin access required' }
  }

  const adminClient = createAdminClient()
  const { data, error } = await adminClient
    .from('restaurant_settings')
    .update({
      open_time: input.open_time,
      close_time: input.close_time,
      is_closed: input.is_closed || false,
      updated_at: new Date().toISOString(),
    })
    .eq('day_of_week', input.day_of_week)
    .select()
    .single()

  if (error) {
    console.error('Error updating restaurant settings:', error)
    return { error: 'Failed to update settings' }
  }

  revalidatePath('/')
  revalidatePath('/admin/settings')
  return { data, success: true }
}