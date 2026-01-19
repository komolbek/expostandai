'use client'

import { cn } from '@/lib/utils'
import type { InquiryStatus } from '@/lib/types'

interface BadgeProps {
  status: InquiryStatus
  className?: string
}

const statusConfig: Record<InquiryStatus, { label: string; className: string; icon: string }> = {
  new: {
    label: 'Новая',
    className: 'bg-blue-100 text-blue-700',
    icon: '🆕',
  },
  completed: {
    label: 'Выполнена',
    className: 'bg-green-100 text-green-700',
    icon: '✅',
  },
}

export function Badge({ status, className }: BadgeProps) {
  const config = statusConfig[status]

  return (
    <span
      className={cn(
        'status-badge',
        config.className,
        className
      )}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  )
}

export function StatusSelect({
  value,
  onChange,
  className,
}: {
  value: InquiryStatus
  onChange: (status: InquiryStatus) => void
  className?: string
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as InquiryStatus)}
      className={cn('input py-2', className)}
    >
      {Object.entries(statusConfig).map(([key, config]) => (
        <option key={key} value={key}>
          {config.icon} {config.label}
        </option>
      ))}
    </select>
  )
}
