'use client'

import type { InquiryData, StandType } from '@/lib/types'

interface StepStandSpecsProps {
  data: Partial<InquiryData>
  onChange: (data: Partial<InquiryData>) => void
}

const AREA_OPTIONS = [
  { value: 9, label: '9 м²', description: 'Компактный стенд' },
  { value: 12, label: '12 м²', description: 'Малый стенд' },
  { value: 18, label: '18 м²', description: 'Средний стенд' },
  { value: 24, label: '24 м²', description: 'Стандартный' },
  { value: 36, label: '36 м²', description: 'Большой стенд' },
  { value: 50, label: '50+ м²', description: 'Премиум стенд' },
]

const TYPE_OPTIONS: { value: StandType; label: string; description: string }[] = [
  { value: 'linear', label: 'Линейный', description: 'Открыт с 1 стороны' },
  { value: 'corner', label: 'Угловой', description: 'Открыт с 2 сторон' },
  { value: 'peninsula', label: 'Полуостров', description: 'Открыт с 3 сторон' },
  { value: 'island', label: 'Остров', description: 'Открыт со всех сторон' },
]

const STAFF_OPTIONS = [
  { value: 2, label: '1-2 человека' },
  { value: 4, label: '3-4 человека' },
  { value: 6, label: '5-6 человек' },
  { value: 8, label: '7+ человек' },
]

export function StepStandSpecs({ data, onChange }: StepStandSpecsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Параметры стенда</h2>
        <p className="mt-1 text-gray-500">Выберите размер и тип стенда</p>
      </div>

      {/* Area */}
      <div>
        <label className="mb-3 block text-sm font-medium text-gray-700">
          Площадь стенда <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {AREA_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange({ area_sqm: option.value })}
              className={`rounded-xl border-2 p-4 text-left transition-all ${
                data.area_sqm === option.value
                  ? 'border-primary-600 bg-primary-50 ring-2 ring-primary-600/20'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <p className="font-semibold text-gray-900">{option.label}</p>
              <p className="text-sm text-gray-500">{option.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Type */}
      <div>
        <label className="mb-3 block text-sm font-medium text-gray-700">
          Тип стенда <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          {TYPE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange({ stand_type: option.value })}
              className={`rounded-xl border-2 p-4 text-left transition-all ${
                data.stand_type === option.value
                  ? 'border-primary-600 bg-primary-50 ring-2 ring-primary-600/20'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <p className="font-semibold text-gray-900">{option.label}</p>
              <p className="text-sm text-gray-500">{option.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Staff */}
      <div>
        <label className="mb-3 block text-sm font-medium text-gray-700">
          Количество сотрудников на стенде <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {STAFF_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange({ staff_count: option.value })}
              className={`rounded-xl border-2 p-3 text-center transition-all ${
                data.staff_count === option.value
                  ? 'border-primary-600 bg-primary-50 ring-2 ring-primary-600/20'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <p className="font-medium text-gray-900">{option.label}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
