'use client'

import { Wallet, Coins, Star, Crown } from 'lucide-react'
import { Textarea } from '@/components/ui/Textarea'
import type { InquiryData, BudgetRange } from '@/lib/types'

interface StepBudgetNotesProps {
  data: Partial<InquiryData>
  onChange: (data: Partial<InquiryData>) => void
}

const BUDGET_OPTIONS: { value: BudgetRange; label: string; description: string; icon: React.ReactNode; gradient: string }[] = [
  { value: 'economy', label: 'Эконом', description: 'Базовое функциональное решение', icon: <Coins className="h-6 w-6" />, gradient: 'from-gray-400 to-gray-500' },
  { value: 'standard', label: 'Стандарт', description: 'Оптимальное соотношение цена/качество', icon: <Star className="h-6 w-6" />, gradient: 'from-blue-400 to-blue-500' },
  { value: 'premium', label: 'Премиум', description: 'Максимальное качество и материалы', icon: <Crown className="h-6 w-6" />, gradient: 'from-amber-400 to-amber-500' },
]

export function StepBudgetNotes({ data, onChange }: StepBudgetNotesProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Бюджет и пожелания</h2>
        <p className="mt-1 text-gray-500">Укажите ваш бюджет и особые требования</p>
      </div>

      {/* Budget Range */}
      <div>
        <label className="mb-3 block text-sm font-medium text-gray-700">
          <span className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-gray-400" />
            Бюджет на стенд <span className="text-red-500">*</span>
          </span>
        </label>
        <div className="grid grid-cols-3 gap-3">
          {BUDGET_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange({ budget_range: option.value })}
              className={`flex flex-col items-center rounded-xl border-2 p-4 text-center transition-all ${
                data.budget_range === option.value
                  ? 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-teal-50 ring-2 ring-emerald-500/20 scale-105'
                  : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/30'
              }`}
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${option.gradient} text-white mb-2`}>
                {option.icon}
              </div>
              <p className={`font-semibold ${data.budget_range === option.value ? 'text-emerald-700' : 'text-gray-900'}`}>
                {option.label}
              </p>
              <p className="text-xs text-gray-500 mt-1">{option.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Special Requests */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Особые пожелания
          <span className="ml-2 text-xs text-gray-400">(опционально)</span>
        </label>
        <Textarea
          value={data.special_requests || ''}
          onChange={(e) => onChange({ special_requests: e.target.value })}
          placeholder="Например: нужна интерактивная витрина, важно много места для хранения образцов..."
          rows={3}
        />
      </div>

      {/* Exclusions */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Что исключить
          <span className="ml-2 text-xs text-gray-400">(опционально)</span>
        </label>
        <Textarea
          value={data.exclusions || ''}
          onChange={(e) => onChange({ exclusions: e.target.value })}
          placeholder="Например: не использовать красный цвет, избегать стеклянных поверхностей..."
          rows={2}
        />
      </div>
    </div>
  )
}
