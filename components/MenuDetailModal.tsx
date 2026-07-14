'use client'

import { MenuItem } from '@/lib/types/menu'
import { formatPrice } from '@/lib/utils'
import { X, Star, ShoppingBag, Minus, Plus, ImageIcon, Lock } from 'lucide-react'
import { useState } from 'react'

interface MenuDetailModalProps {
  item: MenuItem | null
  isOpen: boolean
  onClose: () => void
  quantity: number
  onAdd: () => void
  onRemove: () => void
}

export function MenuDetailModal({ 
  item, 
  isOpen, 
  onClose, 
  quantity, 
  onAdd, 
  onRemove 
}: MenuDetailModalProps) {
  const [imageError, setImageError] = useState(false)

  if (!isOpen || !item) return null

  const isAvailable = item.is_available !== false

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div 
        className="bg-card rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-border shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-secondary rounded-t-2xl">
          {item.image_url && !imageError ? (
            <img
              src={item.image_url}
              alt={item.name}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
              <ImageIcon className="w-16 h-16 mb-3 opacity-30" />
              <span className="text-sm">No image available</span>
            </div>
          )}
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {item.is_featured && (
            <div className="absolute top-4 left-4 bg-gold-gradient text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg flex items-center gap-1">
              <Star className="w-3 h-3 fill-white" />
              Featured
            </div>
          )}

          {!isAvailable && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                Not Available
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-xl font-bold">{item.name}</h2>
            <span className="text-2xl font-bold text-primary">{formatPrice(item.price)}</span>
          </div>

          <div className="text-sm text-muted-foreground mb-4">
            <span className="bg-secondary px-3 py-1 rounded-full text-xs">
              {item.category}
            </span>
            {!isAvailable && (
              <span className="ml-2 bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs">
                Not Available
              </span>
            )}
          </div>

          {item.description && (
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-2">Description</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </div>
          )}

          {/* Add/Quantity Controls */}
          <div className="border-t border-border pt-4">
            {!isAvailable ? (
              <button
                disabled
                className="w-full bg-gray-100 dark:bg-gray-800 text-muted-foreground py-3 rounded-xl font-medium flex items-center justify-center gap-2 cursor-not-allowed"
              >
                <Lock className="w-4 h-4" />
                Not Available
              </button>
            ) : quantity === 0 ? (
              <button
                onClick={onAdd}
                className="w-full bg-gold-gradient text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:shadow-gold transition-all"
              >
                <ShoppingBag className="w-4 h-4" />
                Add to Order
              </button>
            ) : (
              <div className="flex items-center justify-between bg-secondary rounded-xl p-2">
                <button
                  onClick={onRemove}
                  className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-primary/10 transition-colors"
                >
                  <Minus className="w-5 h-5 text-muted-foreground" />
                </button>
                <span className="font-medium text-lg min-w-[40px] text-center">
                  {quantity}
                </span>
                <button
                  onClick={onAdd}
                  className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-primary/10 transition-colors"
                >
                  <Plus className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}