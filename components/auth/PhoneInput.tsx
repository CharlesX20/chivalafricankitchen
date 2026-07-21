'use client'

import { useState, useRef } from 'react'

interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
  error?: string
  disabled?: boolean
}

export function PhoneInput({ value, onChange, error, disabled }: PhoneInputProps) {
  const [localValue, setLocalValue] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove non-digits
    const raw = e.target.value.replace(/\D/g, '')
    
    // Limit to 10 digits
    const limited = raw.slice(0, 10)
    
    setLocalValue(limited)
    onChange(limited)
  }

  return (
    <div className="relative">
      <div className="flex">
        <div className="flex-shrink-0 px-3 py-2.5 border border-r-0 border-border rounded-l-xl bg-secondary text-foreground text-base font-medium flex items-center">
          +1
        </div>
        <input
          ref={inputRef}
          type="tel"
          value={localValue}
          onChange={handleChange}
          disabled={disabled}
          placeholder="123-456-7890"
          className="flex-1 px-3 py-2.5 border border-border rounded-r-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all text-base disabled:opacity-50 disabled:cursor-not-allowed"
          maxLength={10}
          inputMode="numeric"
          pattern="[0-9]*"
        />
      </div>
      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </div>
  )
}