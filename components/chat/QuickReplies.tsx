'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Check } from 'lucide-react'

interface QuickRepliesProps {
  options: string[]
  onSelect: (option: string) => void
  selected?: string[]
  multiSelect?: boolean
  onConfirm?: () => void
}

export function QuickReplies({
  options,
  onSelect,
  selected = [],
  multiSelect = false,
  onConfirm,
}: QuickRepliesProps) {
  return (
    <div className="border-t border-gray-100 bg-gray-50 p-4">
      <div className="mx-auto max-w-2xl">
        {multiSelect && (
          <p className="mb-3 text-sm text-gray-500">
            Выберите несколько вариантов:
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          {options.map((option) => {
            const isSelected = selected.includes(option)
            return (
              <button
                key={option}
                onClick={() => onSelect(option)}
                className={cn(
                  'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all',
                  isSelected
                    ? 'border-primary-600 bg-primary-50 text-primary-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-primary-300 hover:bg-primary-50'
                )}
              >
                {multiSelect && isSelected && <Check className="h-4 w-4" />}
                {option}
              </button>
            )
          })}
        </div>

        {multiSelect && selected.length > 0 && onConfirm && (
          <div className="mt-4">
            <Button onClick={onConfirm} size="sm">
              Подтвердить выбор ({selected.length})
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
