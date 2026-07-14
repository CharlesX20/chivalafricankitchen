export interface Profile {
  id: string
  email: string
  phone: string
  full_name?: string
  is_verified: boolean
  verified_at?: string
  is_admin: boolean
  created_at: string
  updated_at: string
}

export interface VerificationCode {
  id: string
  email: string
  code: string
  attempts: number
  max_attempts: number
  expires_at: string
  created_at: string
}

export interface Session {
  id: string
  profile_id: string
  session_token: string
  expires_at: string
  created_at: string
}

export interface AuthFormData {
  email: string
  phone: string
}

export interface VerifyCodeData {
  email: string
  code: string
}

export interface AuthResponse {
  success: boolean
  message: string
  data?: any
}