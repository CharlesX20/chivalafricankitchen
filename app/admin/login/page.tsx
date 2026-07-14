'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, signInAction, signOut, isUserAdmin } from '@/lib/actions/auth'
import { toast } from 'sonner'
import { PhoneInput } from '@/components/auth/PhoneInput'
import { Shield } from 'lucide-react'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Check if already logged in as admin
    checkAdminStatus()
  }, [])

  async function checkAdminStatus() {
    const isAdmin = await isUserAdmin()
    if (isAdmin) {
      router.push('/admin/dashboard')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!email || !phone) {
      setError('Email and phone number are required.')
      setLoading(false)
      return
    }

    // Clean phone - remove non-digits
    const cleanPhone = phone.replace(/\D/g, '')

    const result = await signInAction(email, cleanPhone)

    setLoading(false)

    if (result.success) {
      // Check if user is admin after sign in
      const isAdmin = await isUserAdmin()
      if (isAdmin) {
        toast.success('Welcome admin!')
        router.push('/admin/dashboard')
      } else {
        toast.error('You do not have admin access.')
        await signOut()
        router.push('/')
      }
    } else {
      setError(result.message)
      toast.error(result.message)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 shadow-xl">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gold-gradient">Admin Access</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Sign in with your admin credentials
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 mb-4">
            <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
              placeholder="admin@example.com"
              disabled={loading}
            />
          </div>

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
              Enter your 10-digit phone number (e.g., 123-456-7890)
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gold-gradient text-white py-3 rounded-xl font-medium hover:shadow-gold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In as Admin'}
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Only authorized admins can access this area.
        </p>
      </div>
    </div>
  )
}