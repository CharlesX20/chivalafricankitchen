'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { isUserAdmin } from '@/lib/actions/auth'

export async function uploadFoodImage(formData: FormData) {
  // Check if user is admin using custom auth
  const isAdmin = await isUserAdmin()
  if (!isAdmin) {
    return { error: 'Unauthorized: Admin access required' }
  }

  const file = formData.get('file') as File
  if (!file) {
    return { error: 'No file provided' }
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    return { error: 'Invalid file type. Please upload JPEG, PNG, WEBP, or GIF.' }
  }

  if (file.size > 5 * 1024 * 1024) {
    return { error: 'File size too large. Maximum 5MB.' }
  }

  const adminClient = createAdminClient()
  
  const timestamp = Date.now()
  const ext = file.name.split('.').pop()
  const fileName = `${timestamp}-${Math.random().toString(36).substring(2, 7)}.${ext}`

  const { data, error } = await adminClient.storage
    .from('food-images')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    console.error('Error uploading image:', error)
    return { error: 'Failed to upload image' }
  }

  const { data: urlData } = adminClient.storage
    .from('food-images')
    .getPublicUrl(fileName)

  return { 
    success: true, 
    url: urlData.publicUrl,
    fileName: fileName
  }
}