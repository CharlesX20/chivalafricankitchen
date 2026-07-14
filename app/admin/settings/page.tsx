'use client'

import { useEffect, useState } from 'react'
import { getRestaurantSettings, updateRestaurantSettings } from '@/lib/actions/settings'
import { RestaurantSettings } from '@/lib/types/settings'
import { toast } from 'sonner'
import { Clock, Save, AlertCircle } from 'lucide-react'

const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
const dayLabels = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<RestaurantSettings[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    loadSettings()
  }, [])

  async function loadSettings() {
    const data = await getRestaurantSettings()
    setSettings(data)
    setLoading(false)
  }

  const handleUpdate = async (day: string, field: 'open_time' | 'close_time' | 'is_closed', value: any) => {
    setSaving(day)
    
    const current = settings.find(s => s.day_of_week === day)
    if (!current) return

    const result = await updateRestaurantSettings({
      day_of_week: day,
      open_time: field === 'open_time' ? value : current.open_time,
      close_time: field === 'close_time' ? value : current.close_time,
      is_closed: field === 'is_closed' ? value : current.is_closed,
    })

    setSaving(null)

    if (result.success) {
      toast.success(`Updated ${dayLabels[day as keyof typeof dayLabels]} settings`)
      await loadSettings()
    } else {
      toast.error(result.error || 'Failed to update')
    }
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Restaurant Hours</h1>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="grid grid-cols-12 gap-2 p-4 bg-secondary font-medium text-sm text-muted-foreground border-b border-border">
          <div className="col-span-3">Day</div>
          <div className="col-span-3">Open Time</div>
          <div className="col-span-3">Close Time</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-1"></div>
        </div>

        {settings.map((setting) => (
          <div key={setting.id} className="grid grid-cols-12 gap-2 p-4 items-center border-b border-border last:border-0 hover:bg-secondary/50 transition-colors">
            <div className="col-span-3 font-medium">
              {dayLabels[setting.day_of_week as keyof typeof dayLabels]}
            </div>
            
            <div className="col-span-3">
              <input
                type="time"
                value={setting.open_time}
                onChange={(e) => handleUpdate(setting.day_of_week, 'open_time', e.target.value)}
                disabled={setting.is_closed}
                className={`px-3 py-1.5 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary w-full ${
                  setting.is_closed ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              />
            </div>
            
            <div className="col-span-3">
              <input
                type="time"
                value={setting.close_time}
                onChange={(e) => handleUpdate(setting.day_of_week, 'close_time', e.target.value)}
                disabled={setting.is_closed}
                className={`px-3 py-1.5 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary w-full ${
                  setting.is_closed ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              />
            </div>
            
            <div className="col-span-2">
              <button
                onClick={() => handleUpdate(setting.day_of_week, 'is_closed', !setting.is_closed)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  setting.is_closed
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                {setting.is_closed ? 'Closed' : 'Open'}
              </button>
            </div>
            
            <div className="col-span-1 flex justify-end">
              {saving === setting.day_of_week ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
              ) : (
                <Clock className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
        <p className="text-sm text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>When "Closed" is toggled, the restaurant will show as closed to customers regardless of time settings.</span>
        </p>
      </div>
    </div>
  )
}