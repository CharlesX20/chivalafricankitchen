'use client'

import { useState } from 'react'
import { MenuItem } from '@/lib/types/menu'
import { formatPrice } from '@/lib/utils'
import { Plus, Minus, ImageIcon, Lock } from 'lucide-react'

interface MenuCardProps {
  item: MenuItem
  quantity: number
  onAdd: () => void
  onRemove: () => void
  onViewDetails: () => void
}

export function MenuCard({ item, quantity, onAdd, onRemove, onViewDetails }: MenuCardProps) {
  const [imageError, setImageError] = useState(false)
  const isAvailable = item.is_available !== false

  return (
    <div 
      className={`flex flex-col items-center text-center ${isAvailable ? 'cursor-pointer' : ''}`}
      onClick={isAvailable ? onViewDetails : undefined}
    >
      {/* Circular Image */}
      <div className="relative w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 lg:w-44 lg:h-44 mb-4">
        <div className="w-full h-full rounded-full overflow-hidden border-2 border-border/50 shadow-sm">
          {item.image_url && !imageError ? (
            <img
              src={item.image_url}
              alt={item.name}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-secondary flex items-center justify-center">
              <ImageIcon className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground/30" />
            </div>
          )}
          
          {/* Not Available Overlay */}
          {!isAvailable && (
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
              <Lock className="w-6 h-6 sm:w-7 sm:h-7 text-white/90" />
            </div>
          )}
        </div>

        {/* Featured Badge */}
        {item.is_featured && (
          <div className="absolute -top-1 -right-1 bg-gold-gradient text-white rounded-full p-1 shadow-md">
            <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
        )}
      </div>

      {/* Item Name */}
      <h3 className="font-semibold text-sm sm:text-base line-clamp-2 mb-1.5 px-2 leading-snug">
        {item.name}
      </h3>

      {/* Price */}
      <p className="text-primary font-bold text-base sm:text-lg mb-4">
        {formatPrice(item.price)}
      </p>

      {/* Action Button */}
      <div className="w-full max-w-[180px] sm:max-w-[200px]">
        {!isAvailable ? (
          <button
            disabled
            className="w-full flex items-center justify-center gap-2 bg-muted text-muted-foreground py-2.5 sm:py-3 rounded-full text-sm font-medium cursor-not-allowed"
          >
            <Lock className="w-4 h-4" />
            Not Available
          </button>
        ) : quantity === 0 ? (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onAdd()
            }}
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white py-2.5 sm:py-3 rounded-full text-sm sm:text-base font-semibold transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            Add to Order
          </button>
        ) : (
          <div className="flex items-center justify-between bg-primary/10 rounded-full px-2 py-1.5 sm:py-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onRemove()
              }}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-background hover:bg-background/80 transition-colors shadow-sm"
              aria-label="Remove one"
            >
              <Minus className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <span className="font-bold text-sm sm:text-base min-w-[28px] text-center tabular-nums">
              {quantity}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onAdd()
              }}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-background hover:bg-background/80 transition-colors shadow-sm"
              aria-label="Add one more"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}