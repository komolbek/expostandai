'use client'

import { ReactNode, useEffect } from 'react'
import { X, AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react'

interface DialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm?: () => void
  title: string
  description?: string
  children?: ReactNode
  variant?: 'default' | 'warning' | 'success' | 'error' | 'info'
  confirmText?: string
  cancelText?: string
  showCancel?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function Dialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  children,
  variant = 'default',
  confirmText = 'Подтвердить',
  cancelText = 'Отмена',
  showCancel = true,
  size = 'md',
}: DialogProps) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  }

  const variantConfig = {
    default: {
      icon: null,
      iconBg: '',
      iconColor: '',
      confirmBg: 'bg-primary-600 hover:bg-primary-700',
    },
    warning: {
      icon: AlertTriangle,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      confirmBg: 'bg-amber-600 hover:bg-amber-700',
    },
    success: {
      icon: CheckCircle2,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      confirmBg: 'bg-green-600 hover:bg-green-700',
    },
    error: {
      icon: XCircle,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      confirmBg: 'bg-red-600 hover:bg-red-700',
    },
    info: {
      icon: Info,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      confirmBg: 'bg-blue-600 hover:bg-blue-700',
    },
  }

  const config = variantConfig[variant]
  const Icon = config.icon

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Dialog */}
      <div
        className={`relative w-full ${sizeClasses[size]} transform rounded-2xl bg-white shadow-2xl transition-all`}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Content */}
        <div className="p-6">
          {/* Icon */}
          {Icon && (
            <div className={`mb-4 inline-flex rounded-full p-3 ${config.iconBg}`}>
              <Icon className={`h-6 w-6 ${config.iconColor}`} />
            </div>
          )}

          {/* Title */}
          <h3 className="mb-2 text-xl font-semibold text-gray-900">{title}</h3>

          {/* Description */}
          {description && (
            <p className="mb-6 whitespace-pre-line text-sm leading-relaxed text-gray-600">
              {description}
            </p>
          )}

          {/* Custom content */}
          {children && <div className="mb-6">{children}</div>}

          {/* Actions */}
          <div className="flex gap-3">
            {showCancel && (
              <button
                onClick={onClose}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                {cancelText}
              </button>
            )}
            {onConfirm && (
              <button
                onClick={() => {
                  onConfirm()
                  onClose()
                }}
                className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors ${config.confirmBg}`}
              >
                {confirmText}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Convenience hook for managing dialog state
import { useState } from 'react'

export function useDialog() {
  const [isOpen, setIsOpen] = useState(false)

  const open = () => setIsOpen(true)
  const close = () => setIsOpen(false)
  const toggle = () => setIsOpen((prev) => !prev)

  return { isOpen, open, close, toggle }
}
