'use client'

import { useEffect, useState } from 'react'
import { getMenuItems, deleteMenuItem, toggleFeatured } from '@/lib/actions/menu'
import { MenuItem } from '@/lib/types/menu'
import { formatPrice } from '@/lib/utils'
import { Plus, Edit, Trash2, Star, StarOff, UtensilsCrossed } from 'lucide-react'
import { toast } from 'sonner'
import { MenuItemForm } from './components/MenuItemForm'

export default function AdminMenuPage() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)

  useEffect(() => {
    loadItems()
  }, [])

  async function loadItems() {
    const data = await getMenuItems()
    setItems(data)
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return
    
    const result = await deleteMenuItem(id)
    if (result.success) {
      toast.success('Item deleted successfully')
      await loadItems()
    } else {
      toast.error(result.error || 'Failed to delete item')
    }
  }

  const handleToggleFeatured = async (id: string, currentStatus: boolean) => {
    const result = await toggleFeatured(id, !currentStatus)
    if (result.success) {
      toast.success(`Item ${!currentStatus ? 'featured' : 'unfeatured'}`)
      await loadItems()
    } else {
      toast.error(result.error || 'Failed to update')
    }
  }

  const handleFormSuccess = async () => {
    await loadItems()
    setShowForm(false)
    setEditingItem(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div>
      {/* Header with Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Menu Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {items.length} {items.length === 1 ? 'item' : 'items'} in your menu
          </p>
        </div>
        <button
          onClick={() => {
            setEditingItem(null)
            setShowForm(true)
          }}
          className="bg-gold-gradient text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:shadow-gold transition-all text-sm font-medium w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          Add New Item
        </button>
      </div>

      {/* Menu Items Grid */}
      {items.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-xl">
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <UtensilsCrossed className="w-8 h-8 text-primary" />
          </div>
          <p className="text-lg font-medium text-foreground">No menu items yet</p>
          <p className="text-sm text-muted-foreground mt-1">Click "Add New Item" to create your first menu item.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-card border border-border rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 hover:shadow-md transition-shadow"
            >
              {/* Image */}
              <div className="w-full sm:w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-secondary">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                    No image
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 w-full">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-base sm:text-lg truncate">{item.name}</h3>
                  {item.is_featured && (
                    <Star className="w-4 h-4 fill-primary text-primary flex-shrink-0" />
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mt-0.5">
                  <span>{item.category}</span>
                  <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                  <span className="font-medium text-primary">{formatPrice(item.price)}</span>
                  {!item.is_available && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                      <span className="text-red-500 text-xs font-medium">Unavailable</span>
                    </>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0 self-end sm:self-center w-full sm:w-auto justify-end">
                <button
                  onClick={() => handleToggleFeatured(item.id, item.is_featured)}
                  className="p-2.5 hover:bg-secondary rounded-xl transition-colors"
                  title={item.is_featured ? 'Unfeature' : 'Feature'}
                >
                  {item.is_featured ? (
                    <StarOff className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Star className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
                <button
                  onClick={() => {
                    setEditingItem(item)
                    setShowForm(true)
                  }}
                  className="p-2.5 hover:bg-secondary rounded-xl transition-colors"
                >
                  <Edit className="w-4 h-4 text-muted-foreground" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <MenuItemForm
          item={editingItem}
          onClose={() => {
            setShowForm(false)
            setEditingItem(null)
          }}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  )
}