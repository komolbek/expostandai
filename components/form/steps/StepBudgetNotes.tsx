'use client'

import { Wallet } from 'lucide-react'
import { Textarea } from '@/components/ui/Textarea'
import type { InquiryData, BudgetRange } from '@/lib/types'

interface StepBudgetNotesProps {
  data: Partial<InquiryData>
  onChange: (data: Partial<InquiryData>) => void
}

const BUDGET_OPTIONS: { value: BudgetRange; label: string; description: string; tier: number }[] = [
  { value: 'under_500k', label: 'до $5,000', description: 'Базовое решение', tier: 1 },
  { value: '500k_1m', label: '$5,000 – $10,000', description: 'Стандартное оформление', tier: 2 },
  { value: '1m_2m', label: '$10,000 – $20,000', description: 'Улучшенный дизайн', tier: 3 },
  { value: '2m_5m', label: '$20,000 – $50,000', description: 'Премиум решение', tier: 4 },
  { value: 'over_5m', label: 'более $50,000', description: 'VIP стенд', tier: 5 },
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
        <div className="space-y-2">
          {BUDGET_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange({ budget_range: option.value })}
              className={`w-full flex items-center justify-between rounded-xl border-2 p-4 text-left transition-all ${
                data.budget_range === option.value
                  ? 'border-emerald-500 bg-gradient-to-r from-emerald-50 to-teal-50 ring-2 ring-emerald-500/20'
                  : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/30'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold ${
                  data.budget_range === option.value
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {option.tier}
                </div>
                <div>
                  <p className={`font-semibold ${data.budget_range === option.value ? 'text-emerald-700' : 'text-gray-900'}`}>
                    {option.label}
                  </p>
                  <p className="text-sm text-gray-500">{option.description}</p>
                </div>
              </div>
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all ${
                  data.budget_range === option.value
                    ? 'border-emerald-500 bg-emerald-500'
                    : 'border-gray-300'
                }`}
              >
                {data.budget_range === option.value && (
                  <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 12 12">
                    <path d="M10.28 2.72a.75.75 0 010 1.06l-5.5 5.5a.75.75 0 01-1.06 0l-2.5-2.5a.75.75 0 111.06-1.06L4.5 7.94l4.97-4.97a.75.75 0 011.06 0z" />
                  </svg>
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
