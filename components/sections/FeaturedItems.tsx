'use client'

import { useEffect, useState } from 'react'
import { getFeaturedItems } from '@/lib/actions/menu'
import { MenuItem } from '@/lib/types/menu'
import { MenuCard } from '@/components/MenuCard'
import { MenuDetailModal } from '@/components/MenuDetailModal'

export function FeaturedItems() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState<any[]>([])
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    loadFeatured()
    loadCart()

    // Listen for cart updates
    const handleCartUpdate = () => loadCart()
    window.addEventListener('cartUpdated', handleCartUpdate)
    return () => window.removeEventListener('cartUpdated', handleCartUpdate)
  }, [])

  async function loadFeatured() {
    setLoading(true)
    const data = await getFeaturedItems()
    console.log('Featured items loaded:', data.length, data) // Debug log
    setItems(data)
    setLoading(false)
  }

  function loadCart() {
    try {
      const cartData = JSON.parse(localStorage.getItem('cart') || '[]')
      setCart(cartData)
    } catch {
      setCart([])
    }
  }

  const getQuantity = (itemId: string) => {
    const item = cart.find((i: any) => i.id === itemId)
    return item ? item.quantity : 0
  }

  const addToCart = (item: MenuItem) => {
    const existing = cart.find((i: any) => i.id === item.id)
    let newCart
    if (existing) {
      newCart = cart.map((i: any) =>
        i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
      )
    } else {
      newCart = [...cart, { ...item, quantity: 1 }]
    }
    setCart(newCart)
    localStorage.setItem('cart', JSON.stringify(newCart))
    window.dispatchEvent(new Event('cartUpdated'))
  }

  const removeFromCart = (itemId: string) => {
    const existing = cart.find((i: any) => i.id === itemId)
    if (!existing) return
    let newCart
    if (existing.quantity <= 1) {
      newCart = cart.filter((i: any) => i.id !== itemId)
    } else {
      newCart = cart.map((i: any) =>
        i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i
      )
    }
    setCart(newCart)
    localStorage.setItem('cart', JSON.stringify(newCart))
    window.dispatchEvent(new Event('cartUpdated'))
  }

  const openDetails = (item: MenuItem) => {
    setSelectedItem(item)
    setIsModalOpen(true)
  }

  // Loading state
  if (loading) {
    return (
      <section className="py-16 sm:py-20 bg-secondary">
        <div className="container-custom text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading featured dishes...</p>
        </div>
      </section>
    )
  }

  // No items state
  if (items.length === 0) {
    return (
      <section className="py-16 sm:py-20 bg-secondary">
        <div className="container-custom text-center">
          <p className="text-muted-foreground">No featured items yet. Check back soon!</p>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 sm:py-20 bg-secondary">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-12">
          <span className="inline-block text-primary font-medium text-xs sm:text-sm tracking-widest uppercase">
            Chef's Picks
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mt-2">
            Featured <span className="text-gold-gradient">Dishes</span>
          </h2>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto text-sm">
            Our most loved dishes, crafted with authentic Nigerian flavors
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {items.map((item) => (
            <div key={item.id}>
              <MenuCard
                item={item}
                quantity={getQuantity(item.id)}
                onAdd={() => addToCart(item)}
                onRemove={() => removeFromCart(item.id)}
                onViewDetails={() => openDetails(item)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Detail Modal */}
      <MenuDetailModal
        item={selectedItem}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        quantity={selectedItem ? getQuantity(selectedItem.id) : 0}
        onAdd={() => selectedItem && addToCart(selectedItem)}
        onRemove={() => selectedItem && removeFromCart(selectedItem.id)}
      />
    </section>
  )
}