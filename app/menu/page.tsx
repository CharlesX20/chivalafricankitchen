'use client'

import { useState, useEffect, useRef } from 'react'
import { getMenuItems, getCategories } from '@/lib/actions/menu'
import { MenuItem } from '@/lib/types/menu'
import { MenuCard } from '@/components/MenuCard'
import { MenuDetailModal } from '@/components/MenuDetailModal'
import { Search, X } from 'lucide-react'

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState<any[]>([])
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    loadData()
    loadCart()

    const handleCartUpdate = () => loadCart()
    window.addEventListener('cartUpdated', handleCartUpdate)
    return () => window.removeEventListener('cartUpdated', handleCartUpdate)
  }, [])

  useEffect(() => {
    filterItems()
  }, [items, selectedCategory, searchQuery])

  async function loadData() {
    setLoading(true)
    const [menuItems, cats] = await Promise.all([
      getMenuItems(),
      getCategories()
    ])
    setItems(menuItems)
    setFilteredItems(menuItems)
    setCategories(['All', ...cats])
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

  function filterItems() {
    let results = items

    if (selectedCategory !== 'All') {
      results = results.filter(item => item.category === selectedCategory)
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      results = results.filter(item =>
        item.name.toLowerCase().includes(query) ||
        (item.description && item.description.toLowerCase().includes(query))
      )
    }

    setFilteredItems(results)
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

  if (loading) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center pt-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
            <p className="mt-4 text-muted-foreground">Loading menu...</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <main ref={sectionRef} className="pt-16 md:pt-20 min-h-screen bg-background">
        {/* Hero Header */}
        <div className="relative bg-gradient-to-r from-black/90 to-black/60 py-12 sm:py-16 md:py-20 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img src="/cta_image.jpeg" alt="Menu Image" className="w-full h-full object-cover opacity-20" />
          </div>
          <div className="relative z-10 container-custom">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3">
              Our <span className="text-gold-gradient">Menu</span>
            </h1>
            <p className="text-white/70 text-sm sm:text-base max-w-md">
              Explore our authentic Nigerian dishes, crafted with love and tradition.
            </p>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="sticky top-16 md:top-20 z-20 bg-background/95 backdrop-blur-md border-b border-border py-4 sm:py-5">
          <div className="container-custom">
            <div className="flex flex-col gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search dishes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-10 py-3 border border-border rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Category Filter */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide flex-nowrap sm:flex-wrap">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                      selectedCategory === cat
                        ? 'bg-gold-gradient text-white shadow-gold'
                        : 'bg-secondary text-muted-foreground hover:bg-primary/10'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="container-custom py-4 sm:py-5">
        </div>

        {/* Menu Grid */}
        <div className="container-custom pb-20 sm:pb-24 pt-8 sm:pt-12">
          {filteredItems.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No items found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 md:gap-5 pb-20 sm:pb-24 pt-8 sm:pt-12">
              {filteredItems.map((item) => (
                <MenuCard
                  key={item.id}
                  item={item}
                  quantity={getQuantity(item.id)}
                  onAdd={() => addToCart(item)}
                  onRemove={() => removeFromCart(item.id)}
                  onViewDetails={() => openDetails(item)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <MenuDetailModal
        item={selectedItem}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        quantity={selectedItem ? getQuantity(selectedItem.id) : 0}
        onAdd={() => selectedItem && addToCart(selectedItem)}
        onRemove={() => selectedItem && removeFromCart(selectedItem.id)}
      />
    </>
  )
}