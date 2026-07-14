'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface CodeInputProps {
  value: string
  onChange: (value: string) => void
  onComplete?: (code: string) => void
  error?: string
  disabled?: boolean
}

export function CodeInput({ value, onChange, onComplete, error, disabled }: CodeInputProps) {
  const [localValue, setLocalValue] = useState(value || '')
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const completedRef = useRef(false)

  // Reset completed flag when value changes externally
  useEffect(() => {
    if (value !== localValue) {
      setLocalValue(value || '')
      completedRef.current = false
    }
  }, [value])

  // Auto-focus first input
  useEffect(() => {
    if (inputRefs.current[0] && !disabled) {
      inputRefs.current[0].focus()
    }
  }, [disabled])

  const triggerComplete = useCallback((code: string) => {
    if (completedRef.current) return
    completedRef.current = true
    
    // Use requestAnimationFrame to ensure DOM is updated before callback
    requestAnimationFrame(() => {
      if (onComplete) {
        try {
          onComplete(code)
        } catch (err) {
          console.error('onComplete error:', err)
          completedRef.current = false
        }
      }
    })
  }, [onComplete])

  const handleChange = (index: number, digit: string) => {
    if (disabled || completedRef.current) return

    // Only allow digits
    if (!/^\d*$/.test(digit)) return

    const newValue = localValue.split('')
    newValue[index] = digit.slice(0, 1)
    const result = newValue.join('')
    setLocalValue(result)
    onChange(result)

    // Auto-advance to next input
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Check if code is complete
    if (result.length === 6 && !result.includes('')) {
      triggerComplete(result)
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled || completedRef.current) return

    if (e.key === 'Backspace') {
      e.preventDefault()
      const newValue = localValue.split('')
      
      if (localValue[index]) {
        // Clear current digit
        newValue[index] = ''
      } else if (index > 0) {
        // Move to previous input and clear it
        newValue[index - 1] = ''
        inputRefs.current[index - 1]?.focus()
      }
      
      const result = newValue.join('')
      setLocalValue(result)
      onChange(result)
      completedRef.current = false
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    if (disabled || completedRef.current) return
    
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '')
    const digits = pasted.slice(0, 6).split('')
    
    const newValue = ['', '', '', '', '', '']
    digits.forEach((digit, i) => {
      newValue[i] = digit
    })
    
    const result = newValue.join('')
    setLocalValue(result)
    onChange(result)
    
    // Focus last filled input or first empty
    const lastFilledIndex = digits.length - 1
    if (lastFilledIndex < 5) {
      inputRefs.current[lastFilledIndex + 1]?.focus()
    } else {
      inputRefs.current[5]?.focus()
    }
    
    // Check if complete
    if (result.length === 6 && !result.includes('')) {
      triggerComplete(result)
    }
  }

  // Reset completed state
  const resetCompleted = () => {
    completedRef.current = false
  }

  return (
    <div>
      <div className="flex gap-2 justify-center">
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <input
            key={index}
            ref={(el) => { inputRefs.current[index] = el }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={localValue[index] || ''}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={resetCompleted}
            onClick={(e) => (e.target as HTMLInputElement).select()}
            disabled={disabled}
            autoComplete="one-time-code"
            className="w-12 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-bold border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          />
        ))}
      </div>
      {error && (
        <p className="text-xs text-red-500 text-center mt-2">{error}</p>
      )}
    </div>
  )
}