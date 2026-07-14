'use client'

import { useState, useEffect } from 'react'
import { X, Mail, Phone, Shield, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { PhoneInput } from './PhoneInput'
import { CodeInput } from './CodeInput'
import { 
  sendVerificationCodeAction, 
  verifyCodeAction, 
  signInAction,
  resendVerificationCodeAction 
} from '@/lib/actions/auth'

type AuthStep = 'credentials' | 'verify'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onAuthSuccess?: () => void
}

export function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const [step, setStep] = useState<AuthStep>('credentials')
  const [isSignUp, setIsSignUp] = useState(true)
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [needsVerificationEmail, setNeedsVerificationEmail] = useState<string | null>(null)

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      resetState()
    }
  }, [isOpen])

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(prev => prev - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const resetState = () => {
    setStep('credentials')
    setEmail('')
    setPhone('')
    setCode('')
    setError(null)
    setLoading(false)
    setNeedsVerificationEmail(null)
  }

  const handleSendCode = async () => {
    if (!email || !phone) {
      setError('Email and phone number are required.')
      return
    }

    setLoading(true)
    setError(null)

    const result = await sendVerificationCodeAction(email, phone)

    setLoading(false)

    if (result.success) {
      toast.success(result.message)
      setStep('verify')
      setResendCooldown(60)
    } else {
      setError(result.message)
      toast.error(result.message)
    }
  }

  const handleVerifyCode = async () => {
    if (!code || code.length !== 6) {
      setError('Please enter the 6-digit verification code.')
      return
    }

    setLoading(true)
    setError(null)

    const result = await verifyCodeAction({ email, code })

    setLoading(false)

    if (result.success) {
      toast.success(result.message)
      onClose()
      if (onAuthSuccess) onAuthSuccess()
    } else {
      setError(result.message)
      toast.error(result.message)
    }
  }

  const handleSignIn = async () => {
    if (!email || !phone) {
      setError('Email and phone number are required.')
      return
    }

    setLoading(true)
    setError(null)

    const result = await signInAction(email, phone)

    setLoading(false)

    if (result.success) {
      toast.success(result.message)
      onClose()
      if (onAuthSuccess) onAuthSuccess()
    } else {
      setError(result.message)
      toast.error(result.message)
      
      // If needs verification, go to verify step with email
      if (result.data?.needsVerification) {
        setNeedsVerificationEmail(result.data.email || email)
        setStep('verify')
        setResendCooldown(60)
      }
    }
  }

  const handleResendCode = async () => {
    if (resendCooldown > 0) return

    setLoading(true)
    setError(null)

    // Use the stored email or the current email
    const targetEmail = needsVerificationEmail || email

    const result = await resendVerificationCodeAction(targetEmail)

    setLoading(false)

    if (result.success) {
      toast.success(result.message)
      setResendCooldown(60)
    } else {
      setError(result.message)
      toast.error(result.message)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (step === 'verify') {
      await handleVerifyCode()
    } else if (isSignUp) {
      await handleSendCode()
    } else {
      await handleSignIn()
    }
  }

  const handleToggleMode = () => {
    setIsSignUp(!isSignUp)
    setError(null)
    setEmail('')
    setPhone('') // Clear phone on toggle
    setCode('')
    setStep('credentials')
    setNeedsVerificationEmail(null)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-background rounded-2xl p-6 sm:p-8 max-w-md w-full relative shadow-2xl border border-border max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-full hover:bg-secondary"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Back Button - Only on verify step */}
        {step === 'verify' && (
          <button
            onClick={() => {
              setStep('credentials')
              setError(null)
            }}
            className="absolute top-3 left-3 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-full hover:bg-secondary"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}

        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              {step === 'verify' ? (
                <Shield className="w-7 h-7 text-primary" />
              ) : (
                <Mail className="w-7 h-7 text-primary" />
              )}
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gold-gradient">
            {step === 'verify' ? 'Enter Verification Code' : isSignUp ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {step === 'verify' 
              ? `We sent a 6-digit code to ${needsVerificationEmail || email}`
              : isSignUp 
                ? 'Sign up to place orders and track deliveries' 
                : 'Sign in to your account to continue'}
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 mb-4">
            <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {step === 'verify' ? (
            <>
              <CodeInput
                value={code}
                onChange={(val) => {
                  setCode(val)
                  setError(null)
                }}
                onComplete={handleVerifyCode}
                error={error || undefined}
                disabled={loading}
              />

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resendCooldown > 0 || loading}
                  className="text-sm text-primary hover:underline transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resendCooldown > 0 
                    ? `Resend code in ${resendCooldown}s` 
                    : 'Resend verification code'}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="w-full bg-gold-gradient text-white py-3 rounded-xl font-medium hover:shadow-gold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Verify & Sign In'}
              </button>
            </>
          ) : (
            <>
              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium mb-1.5 text-foreground">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-border rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  placeholder="you@example.com"
                  disabled={loading}
                />
              </div>

              {/* Phone Input with +1 Canada */}
              <div>
                <label className="block text-sm font-medium mb-1.5 text-foreground">
                  Phone Number
                </label>
                <PhoneInput
                  value={phone}
                  onChange={setPhone}
                  error={error || undefined}
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter your 10-digit phone number
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gold-gradient text-white py-3 rounded-xl font-medium hover:shadow-gold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading 
                  ? 'Processing...' 
                  : isSignUp 
                    ? 'Sign Up' 
                    : 'Sign In'}
              </button>
            </>
          )}
        </form>

        {/* Toggle Sign Up/Sign In - Only on credentials step */}
        {step === 'credentials' && (
          <p className="text-center text-sm text-muted-foreground mt-4">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            <button
              type="button"
              onClick={handleToggleMode}
              className="text-primary hover:underline ml-1 font-medium"
              disabled={loading}
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        )}

        {/* Footer Text */}
        <p className="text-center text-xs text-muted-foreground mt-4">
          {step === 'verify' 
            ? 'The code expires in 30 minutes' 
            : isSignUp 
              ? 'We\'ll send a verification code to your email' 
              : 'Enter your credentials to sign in'}
        </p>
      </div>
    </div>
  )
}