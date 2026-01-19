'use client'

import { useEffect } from 'react'
import { X, CheckCircle2, XCircle, AlertTriangle, Info } from 'lucide-react'

interface ToastProps {
  isOpen: boolean
  onClose: () => void
  message: string
  variant?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

export function Toast({
  isOpen,
  onClose,
  message,
  variant = 'info',
  duration = 5000,
}: ToastProps) {
  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(onClose, duration)
      return () => clearTimeout(timer)
    }
  }, [isOpen, duration, onClose])

  if (!isOpen) return null

  const variantConfig = {
    success: {
      icon: CheckCircle2,
      bg: 'bg-green-50 border-green-200',
      iconColor: 'text-green-600',
      textColor: 'text-green-900',
    },
    error: {
      icon: XCircle,
      bg: 'bg-red-50 border-red-200',
      iconColor: 'text-red-600',
      textColor: 'text-red-900',
    },
    warning: {
      icon: AlertTriangle,
      bg: 'bg-amber-50 border-amber-200',
      iconColor: 'text-amber-600',
      textColor: 'text-amber-900',
    },
    info: {
      icon: Info,
      bg: 'bg-blue-50 border-blue-200',
      iconColor: 'text-blue-600',
      textColor: 'text-blue-900',
    },
  }

  const config = variantConfig[variant]
  const Icon = config.icon

  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-start sm:justify-end">
      <div
        className={`pointer-events-auto flex w-full max-w-sm transform items-start gap-3 rounded-xl border p-4 shadow-lg transition-all ${config.bg}`}
        role="alert"
      >
        <Icon className={`mt-0.5 h-5 w-5 flex-shrink-0 ${config.iconColor}`} />
        <p className={`flex-1 text-sm font-medium ${config.textColor}`}>{message}</p>
        <button
          onClick={onClose}
          className={`flex-shrink-0 rounded-lg p-1 transition-colors hover:bg-black/5 ${config.textColor}`}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

// Hook for managing toast state
import { useState, useCallback } from 'react'

export function useToast() {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [variant, setVariant] = useState<'success' | 'error' | 'warning' | 'info'>('info')

  const show = useCallback(
    (msg: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
      setMessage(msg)
      setVariant(type)
      setIsOpen(true)
    },
    []
  )

  const close = useCallback(() => {
    setIsOpen(false)
  }, [])

  return { isOpen, message, variant, show, close }
}
