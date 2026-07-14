export interface RestaurantSettings {
  id: string
  day_of_week: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'
  open_time: string
  close_time: string
  is_closed: boolean
  created_at: string
  updated_at: string
}

export interface UpdateSettingsInput {
  day_of_week: string
  open_time: string
  close_time: string
  is_closed?: boolean
}