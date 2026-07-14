'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { isUserAdmin, signOut } from '@/lib/actions/auth'
import { LayoutDashboard, UtensilsCrossed, Package, LogOut, Clock } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    checkAdminAccess()
  }, [])

  async function checkAdminAccess() {
    const isAdmin = await isUserAdmin()
    if (!isAdmin) {
      router.push('/admin/login')
    }
    setLoading(false)
  }

  const handleSignOut = async () => {
    await signOut()
    toast.success('Signed out successfully')
    router.push('/admin/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    )
  }

  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/menu', label: 'Menu', icon: UtensilsCrossed },
    { href: '/admin/orders', label: 'Orders', icon: Package },
    { href: '/admin/settings', label: 'Hours', icon: Clock },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Navigation - Bottom */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 md:hidden">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-3 py-1 text-xs ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            )
          })}
          <button
            onClick={handleSignOut}
            className="flex flex-col items-center gap-1 px-3 py-1 text-xs text-muted-foreground"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </nav>

      {/* Desktop Navigation - Left */}
      <div className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 bg-card border-r border-border flex-col p-6">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gold-gradient">CHIVAL Admin</h2>
          <p className="text-xs text-muted-foreground mt-1">Dashboard</p>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-secondary'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-muted-foreground hover:bg-secondary transition-colors w-full mt-auto"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="md:ml-64 pb-20 md:pb-0">
        <div className="p-4 md:p-8">{children}</div>
      </div>
    </div>
  )
}