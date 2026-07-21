import { Suspense } from 'react'
import CartContent from './CartContent'

export const dynamic = 'force-dynamic'

export default function CartPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center pt-20">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
    </div>}>
      <CartContent />
    </Suspense>
  )
}