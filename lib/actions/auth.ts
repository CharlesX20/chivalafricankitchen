'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { Profile, AuthFormData, VerifyCodeData, AuthResponse } from '@/lib/types/auth'
import { sendVerificationCode, sendWelcomeEmail } from '@/lib/email'
import { cookies } from 'next/headers'
import { randomBytes } from 'crypto'

// ============================================
// HELPERS
// ============================================

function generateCode(): string {
  return Math.floor(100000 + Math.random()  * 900000).toString()
}

function generateSessionToken(): string {
  return randomBytes(32).toString('hex')
}

function getCodeExpiry(): Date {
  const date = new Date()
  date.setMinutes(date.getMinutes() + 30) // 30 minutes
  return date
}

function getSessionExpiry(): Date {
  const date = new Date()
  date.setDate(date.getDate() + 60) // 60 days
  return date
}

function validatePhone(phone: string): boolean {
  // Must be exactly 10 digits after the country code
  const cleanPhone = phone.replace(/\D/g, '')
  return cleanPhone.length === 10
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// ============================================
// CHECK RATE LIMIT (3 per hour per email)
// ============================================

async function checkRateLimit(email: string): Promise<{ allowed: boolean; message?: string }> {
  const adminClient = createAdminClient()
  
  // Count verification requests in the last hour
  const oneHourAgo = new Date()
  oneHourAgo.setHours(oneHourAgo.getHours() - 1)
  
  const { count, error } = await adminClient
    .from('verification_codes')
    .select('*', { count: 'exact', head: true })
    .eq('email', email)
    .gte('created_at', oneHourAgo.toISOString())

  if (error) {
    console.error('Rate limit check error:', error)
    return { allowed: false, message: 'Unable to check rate limit. Please try again.' }
  }

  if (count && count >= 3) {
    return { 
      allowed: false, 
      message: 'Too many verification requests. Please wait an hour and try again.' 
    }
  }

  return { allowed: true }
}

// ============================================
// SEND VERIFICATION CODE - Create Profile First
// ============================================

export async function sendVerificationCodeAction(email: string, phone: string): Promise<AuthResponse> {
  // Validate inputs
  if (!email || !phone) {
    return { success: false, message: 'Email and phone number are required.' }
  }

  if (!validateEmail(email)) {
    return { success: false, message: 'Please enter a valid email address.' }
  }

  if (!validatePhone(phone)) {
    return { success: false, message: 'Please enter a valid 10-digit phone number.' }
  }

  try {
    const adminClient = createAdminClient()

    // Check rate limit
    const rateLimit = await checkRateLimit(email)
    if (!rateLimit.allowed) {
      return { success: false, message: rateLimit.message! }
    }

    // Check if profile exists
    let { data: existingProfile } = await adminClient
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single()

    // If profile exists and is already verified
    if (existingProfile && existingProfile.is_verified) {
      return { 
        success: false, 
        message: 'This email is already verified. Please sign in.' 
      }
    }

    // If profile exists but not verified, update phone
    if (existingProfile && !existingProfile.is_verified) {
      const { error: updateError } = await adminClient
        .from('profiles')
        .update({ phone: phone })
        .eq('id', existingProfile.id)

      if (updateError) {
        console.error('Error updating profile phone:', updateError)
      }
    }

    // If no profile exists, CREATE IT FIRST (is_verified = false)
    if (!existingProfile) {
      const { data: newProfile, error: createError } = await adminClient
        .from('profiles')
        .insert({
          email: email,
          phone: phone,
          is_verified: false,
        })
        .select()
        .single()

      if (createError) {
        console.error('Error creating profile:', createError)
        return { success: false, message: 'Failed to create account.' }
      }

      existingProfile = newProfile
    }

    // Generate 6-digit code
    const code = generateCode()
    const expiresAt = getCodeExpiry()

    // Delete any existing codes for this email
    await adminClient
      .from('verification_codes')
      .delete()
      .eq('email', email)

    // Insert new verification code with phone
    const { error: insertError } = await adminClient
      .from('verification_codes')
      .insert({
        email,
        code,
        phone: phone,
        expires_at: expiresAt.toISOString(),
        max_attempts: 3,
      })

    if (insertError) {
      console.error('Error inserting verification code:', insertError)
      return { success: false, message: 'Failed to generate verification code.' }
    }

    // Send email
    const emailResult = await sendVerificationCode(email, code)
    if (!emailResult.success) {
      console.error('Email send error:', emailResult.error)
      return { 
        success: false, 
        message: 'Failed to send verification email. Please try again.' 
      }
    }

    return { 
      success: true, 
      message: 'Verification code sent to your email!',
      data: { profile: existingProfile }
    }

  } catch (error) {
    console.error('Send verification code error:', error)
    return { success: false, message: 'Something went wrong. Please try again.' }
  }
}

// ============================================
// VERIFY CODE - Update is_verified to true
// ============================================

export async function verifyCodeAction(data: VerifyCodeData): Promise<AuthResponse> {
  const { email, code } = data

  if (!email || !code) {
    return { success: false, message: 'Email and code are required.' }
  }

  if (code.length !== 6 || !/^\d{6}$/.test(code)) {
    return { success: false, message: 'Please enter a valid 6-digit code.' }
  }

  try {
    const adminClient = createAdminClient()

    // Find the verification code
    const { data: verificationData, error: findError } = await adminClient
      .from('verification_codes')
      .select('*')
      .eq('email', email)
      .eq('code', code)
      .single()

    if (findError || !verificationData) {
      return { success: false, message: 'Invalid verification code.' }
    }

    // Check if expired
    const now = new Date()
    const expiresAt = new Date(verificationData.expires_at)
    if (now > expiresAt) {
      return { 
        success: false, 
        message: 'Verification code has expired. Please request a new one.' 
      }
    }

    // Check attempts
    if (verificationData.attempts >= verificationData.max_attempts) {
      return { 
        success: false, 
        message: 'Too many failed attempts. Please request a new code.' 
      }
    }

    // Update attempts
    const { error: updateError } = await adminClient
      .from('verification_codes')
      .update({ attempts: verificationData.attempts + 1 })
      .eq('id', verificationData.id)

    if (updateError) {
      console.error('Error updating attempts:', updateError)
    }

    // Get phone from verification data
    const phone = verificationData.phone || ''

    // Check if profile exists
    let { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single()

    // If no profile (shouldn't happen, but just in case)
    if (!profile) {
      const { data: newProfile, error: createError } = await adminClient
        .from('profiles')
        .insert({
          email,
          phone: phone,
          is_verified: true,
          verified_at: now.toISOString(),
        })
        .select()
        .single()

      if (createError) {
        console.error('Error creating profile:', createError)
        return { success: false, message: 'Failed to create account.' }
      }

      profile = newProfile

      // Send welcome email
      await sendWelcomeEmail(email)

    } else {
      // Update existing profile to verified
      const { error: verifyError } = await adminClient
        .from('profiles')
        .update({
          is_verified: true,
          verified_at: now.toISOString(),
          phone: phone, // Update phone if changed
        })
        .eq('id', profile.id)

      if (verifyError) {
        console.error('Error verifying profile:', verifyError)
        return { success: false, message: 'Failed to verify account.' }
      }

      // Send welcome email if not already sent
      if (!profile.verified_at) {
        await sendWelcomeEmail(email)
      }
    }

    // Delete the verification code (used)
    await adminClient
      .from('verification_codes')
      .delete()
      .eq('id', verificationData.id)

    // Create session
    const sessionToken = generateSessionToken()
    const sessionExpiresAt = getSessionExpiry()

    const { error: sessionError } = await adminClient
      .from('sessions')
      .insert({
        profile_id: profile.id,
        session_token: sessionToken,
        expires_at: sessionExpiresAt.toISOString(),
      })

    if (sessionError) {
      console.error('Error creating session:', sessionError)
      return { success: false, message: 'Failed to create session.' }
    }

    // Set session cookie (60 days)
    const cookieStore = await cookies()
    cookieStore.set('chival_session', sessionToken, {
      expires: sessionExpiresAt,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    })

    return { 
      success: true, 
      message: 'Successfully verified! You are now logged in.',
      data: { profile }
    }

  } catch (error) {
    console.error('Verification error:', error)
    return { success: false, message: 'Something went wrong. Please try again.' }
  }
}

// ============================================
// SIGN IN - Check is_verified
// ============================================

export async function signInAction(email: string, phone: string): Promise<AuthResponse> {
  // Validate inputs
  if (!email || !phone) {
    return { success: false, message: 'Email and phone number are required.' }
  }

  if (!validateEmail(email)) {
    return { success: false, message: 'Please enter a valid email address.' }
  }

  if (!validatePhone(phone)) {
    return { success: false, message: 'Please enter a valid 10-digit phone number.' }
  }

  try {
    const adminClient = createAdminClient()

    // Check if profile exists and is verified
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('*')
      .eq('email', email)
      .eq('phone', phone)
      .single()

    if (profileError || !profile) {
      return { 
        success: false, 
        message: 'No account found with this email and phone number.' 
      }
    }

    // If not verified, send verification code and return needsVerification
    if (!profile.is_verified) {
      // Send verification code (profile already exists)
      const sendResult = await sendVerificationCodeAction(email, phone)
      if (!sendResult.success) {
        return { 
          success: false, 
          message: 'Account exists but is not verified. Failed to send verification code.' 
        }
      }
      return { 
        success: false, 
        message: 'Account is not verified. A verification code has been sent to your email.', 
        data: { needsVerification: true, email: email }
      }
    }

    // User is verified - create session
    const sessionToken = generateSessionToken()
    const sessionExpiresAt = getSessionExpiry()

    // Delete any existing sessions for this profile
    await adminClient
      .from('sessions')
      .delete()
      .eq('profile_id', profile.id)

    const { error: sessionError } = await adminClient
      .from('sessions')
      .insert({
        profile_id: profile.id,
        session_token: sessionToken,
        expires_at: sessionExpiresAt.toISOString(),
      })

    if (sessionError) {
      console.error('Error creating session:', sessionError)
      return { success: false, message: 'Failed to create session.' }
    }

    // Set session cookie (60 days)
    const cookieStore = await cookies()
    cookieStore.set('chival_session', sessionToken, {
      expires: sessionExpiresAt,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    })

    return { 
      success: true, 
      message: 'Welcome back!',
      data: { profile }
    }

  } catch (error) {
    console.error('Sign in error:', error)
    return { success: false, message: 'Something went wrong. Please try again.' }
  }
}

// ============================================
// GET CURRENT USER (from session cookie)
// ============================================

export async function getCurrentUser(): Promise<Profile | null> {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('chival_session')?.value

    if (!sessionToken) {
      return null
    }

    const adminClient = createAdminClient()

    // Find session
    const { data: session, error: sessionError } = await adminClient
      .from('sessions')
      .select('*')
      .eq('session_token', sessionToken)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (sessionError || !session) {
      // Delete invalid session
      await adminClient
        .from('sessions')
        .delete()
        .eq('session_token', sessionToken)
      
      const cookieStore = await cookies()
      cookieStore.delete('chival_session')
      return null
    }

    // Get profile
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('*')
      .eq('id', session.profile_id)
      .single()

    if (profileError || !profile) {
      return null
    }

    return profile

  } catch (error) {
    console.error('Get current user error:', error)
    return null
  }
}

// ============================================
// SIGN OUT
// ============================================

export async function signOut(): Promise<AuthResponse> {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('chival_session')?.value

    if (sessionToken) {
      const adminClient = createAdminClient()
      await adminClient
        .from('sessions')
        .delete()
        .eq('session_token', sessionToken)
    }

    cookieStore.delete('chival_session')

    return { success: true, message: 'Signed out successfully.' }

  } catch (error) {
    console.error('Sign out error:', error)
    return { success: false, message: 'Failed to sign out.' }
  }
}

// ============================================
// CHECK IF USER IS ADMIN
// ============================================

export async function isUserAdmin(): Promise<boolean> {
  try {
    const user = await getCurrentUser()
    if (!user) return false

    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || []
    return adminEmails.includes(user.email)

  } catch (error) {
    console.error('Is admin check error:', error)
    return false
  }
}

// ============================================
// RESEND VERIFICATION CODE
// ============================================

export async function resendVerificationCodeAction(email: string): Promise<AuthResponse> {
  if (!email || !validateEmail(email)) {
    return { success: false, message: 'Please enter a valid email address.' }
  }

  try {
    const adminClient = createAdminClient()

    // Check if profile exists
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single()

    if (profileError || !profile) {
      return { success: false, message: 'No account found with this email.' }
    }

    // Check if already verified
    if (profile.is_verified) {
      return { success: false, message: 'This account is already verified. Please sign in.' }
    }

    // Send new verification code using the phone from profile
    const phone = profile.phone || ''
    if (!phone) {
      return { success: false, message: 'No phone number found for this account.' }
    }

    return await sendVerificationCodeAction(email, phone)

  } catch (error) {
    console.error('Resend verification error:', error)
    return { success: false, message: 'Failed to resend verification code.' }
  }
}

// ============================================
// GET SESSION (for middleware)
// ============================================

export async function getSession() {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('chival_session')?.value

    if (!sessionToken) {
      return null
    }

    const adminClient = createAdminClient()

    const { data: session, error: sessionError } = await adminClient
      .from('sessions')
      .select('*')
      .eq('session_token', sessionToken)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (sessionError || !session) {
      return null
    }

    return session

  } catch (error) {
    console.error('Get session error:', error)
    return null
  }
}