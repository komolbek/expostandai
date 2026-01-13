'use client'

import { Textarea } from '@/components/ui/Textarea'
import type { InquiryData, BudgetRange } from '@/lib/types'

interface StepBudgetNotesProps {
  data: Partial<InquiryData>
  onChange: (data: Partial<InquiryData>) => void
}

const BUDGET_OPTIONS: { value: BudgetRange; label: string; description: string }[] = [
  { value: 'under_500k', label: 'до 500 000 ₽', description: 'Базовое решение' },
  { value: '500k_1m', label: '500 000 – 1 000 000 ₽', description: 'Стандартное оформление' },
  { value: '1m_2m', label: '1 000 000 – 2 000 000 ₽', description: 'Улучшенный дизайн' },
  { value: '2m_5m', label: '2 000 000 – 5 000 000 ₽', description: 'Премиум решение' },
  { value: 'over_5m', label: 'более 5 000 000 ₽', description: 'VIP стенд' },
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
          Бюджет на стенд <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          {BUDGET_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange({ budget_range: option.value })}
              className={`w-full flex items-center justify-between rounded-xl border-2 p-4 text-left transition-all ${
                data.budget_range === option.value
                  ? 'border-primary-600 bg-primary-50 ring-2 ring-primary-600/20'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div>
                <p className="font-semibold text-gray-900">{option.label}</p>
                <p className="text-sm text-gray-500">{option.description}</p>
              </div>
              <div
                className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                  data.budget_range === option.value
                    ? 'border-primary-600 bg-primary-600'
                    : 'border-gray-300'
                }`}
              >
                {data.budget_range === option.value && (
                  <div className="h-2 w-2 rounded-full bg-white" />
                )}
              </div>
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
