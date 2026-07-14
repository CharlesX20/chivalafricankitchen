'use client'

import { useState } from 'react'
import { MenuItem } from '@/lib/types/menu'
import { createMenuItem, updateMenuItem } from '@/lib/actions/menu'
import { uploadFoodImage } from '@/lib/actions/upload'
import { X, Upload, Image as ImageIcon } from 'lucide-react'
import { toast } from 'sonner'

interface MenuItemFormProps {
  item?: MenuItem | null
  onClose: () => void
  onSuccess: () => void
}

const categories = [
  'Starters',
  'Soup',
  'Rice/ Rice Combo',
  'Drinks',
  'Specials',
  'Swallow',
  'Soup/Swallow Combo',
  'Protein / Sides',
]

export function MenuItemForm({ item, onClose, onSuccess }: MenuItemFormProps) {
  const [loading, setLoading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>(item?.image_url || '')
  
  const [formData, setFormData] = useState({
    name: item?.name || '',
    description: item?.description || '',
    price: item?.price || 0,
    category: item?.category || categories[0],
    is_featured: item?.is_featured || false,
    is_available: item?.is_available !== undefined ? item.is_available : true,
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let imageUrl = item?.image_url || ''

      // Only upload image if a new file was selected
      if (imageFile) {
        const formData = new FormData()
        formData.append('file', imageFile)
        const uploadResult = await uploadFoodImage(formData)
        if (uploadResult.success && uploadResult.url) {
          imageUrl = uploadResult.url
        } else {
          toast.error(uploadResult.error || 'Failed to upload image')
          setLoading(false)
          return
        }
      }

      const data = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        category: formData.category,
        is_featured: formData.is_featured,
        is_available: formData.is_available,
        image_url: imageUrl || null, // Allow null if no image
      }

      let result
      if (item) {
        result = await updateMenuItem({ ...data, id: item.id })
      } else {
        result = await createMenuItem(data)
      }

      if (result.success) {
        toast.success(item ? 'Item updated!' : 'Item created!')
        onSuccess()
      } else {
        toast.error(result.error || 'Failed to save item')
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl p-5 sm:p-6 md:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto border border-border shadow-2xl">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold">
            {item ? 'Edit Menu Item' : 'Add Menu Item'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name - Required */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-4 py-2.5 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary transition-all text-sm"
              placeholder="e.g., Jollof Rice with Chicken"
            />
          </div>

          {/* Description - Optional */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2.5 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary transition-all text-sm resize-none"
              placeholder="Describe your dish (optional)..."
            />
          </div>

          {/* Price - Required */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Price (CAD) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
              required
              className="w-full px-4 py-2.5 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary transition-all text-sm"
              placeholder="0.00"
            />
          </div>

          {/* Category - Required */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
              className="w-full px-4 py-2.5 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary transition-all text-sm"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Image - Optional */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Image <span className="text-muted-foreground text-xs font-normal">(optional)</span>
            </label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <label className="flex-1 cursor-pointer w-full">
                <div className="border-2 border-dashed border-border rounded-xl p-4 text-center hover:border-primary transition-colors">
                  <Upload className="w-6 h-6 mx-auto text-muted-foreground" />
                  <span className="text-sm text-muted-foreground block mt-1">
                    {imageFile ? imageFile.name : 'Click to upload image'}
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              {imagePreview && (
                <div className="relative flex-shrink-0">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-20 h-20 object-cover rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">
              Upload an image to make your dish stand out (optional)
            </p>
          </div>

          {/* Featured & Available Toggles */}
          <div className="flex flex-wrap gap-4 pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_featured}
                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                className="w-4 h-4 rounded border-border focus:ring-primary"
              />
              <span className="text-sm">Featured</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_available}
                onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                className="w-4 h-4 rounded border-border focus:ring-primary"
              />
              <span className="text-sm">Available</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gold-gradient text-white py-3 rounded-xl font-medium hover:shadow-gold transition-all disabled:opacity-50 text-sm mt-2"
          >
            {loading ? 'Saving...' : (item ? 'Update Item' : 'Create Item')}
          </button>
        </form>
      </div>
    </div>
  )
}