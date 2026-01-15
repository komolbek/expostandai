'use client'

import { Square, CornerDownRight, Hexagon, Box, Users, ArrowUpDown } from 'lucide-react'
import type { InquiryData, StandType } from '@/lib/types'

interface StepStandSpecsProps {
  data: Partial<InquiryData>
  onChange: (data: Partial<InquiryData>) => void
}

const AREA_OPTIONS = [
  { value: 9, label: '9 м²', description: 'Компактный' },
  { value: 12, label: '12 м²', description: 'Малый' },
  { value: 18, label: '18 м²', description: 'Средний' },
  { value: 24, label: '24 м²', description: 'Стандартный' },
  { value: 36, label: '36 м²', description: 'Большой' },
  { value: 50, label: '50+ м²', description: 'Премиум' },
]

const HEIGHT_OPTIONS = [
  { value: 2.5, label: '2.5 м', description: 'Низкий' },
  { value: 3, label: '3 м', description: 'Стандарт' },
  { value: 3.5, label: '3.5 м', description: 'Средний' },
  { value: 4, label: '4 м', description: 'Высокий' },
  { value: 4.5, label: '4.5 м', description: 'Максимум' },
]

const TYPE_OPTIONS: { value: StandType; label: string; description: string; icon: React.ReactNode }[] = [
  { value: 'linear', label: 'Линейный', description: '3 стены, 1 открытая сторона', icon: <Square className="h-6 w-6" /> },
  { value: 'corner', label: 'Угловой', description: '2 стены, 2 открытые стороны', icon: <CornerDownRight className="h-6 w-6" /> },
  { value: 'peninsula', label: 'Полуостров', description: '1 стена, 3 открытые стороны', icon: <Hexagon className="h-6 w-6" /> },
  { value: 'island', label: 'Остров', description: 'Открыт со всех сторон', icon: <Box className="h-6 w-6" /> },
]

const STAFF_OPTIONS = [
  { value: 2, label: '1-2' },
  { value: 4, label: '3-4' },
  { value: 6, label: '5-6' },
  { value: 8, label: '7+' },
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
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {AREA_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange({ area_sqm: option.value })}
              className={`rounded-xl border-2 p-3 text-center transition-all ${
                data.area_sqm === option.value
                  ? 'border-violet-500 bg-violet-50 ring-2 ring-violet-500/20 scale-105'
                  : 'border-gray-200 hover:border-violet-300 hover:bg-violet-50/50'
              }`}
            >
              <p className={`text-lg font-bold ${data.area_sqm === option.value ? 'text-violet-600' : 'text-gray-900'}`}>
                {option.label}
              </p>
              <p className="text-xs text-gray-500">{option.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Height */}
      <div>
        <label className="mb-3 block text-sm font-medium text-gray-700">
          <span className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-gray-400" />
            Высота стенда <span className="text-red-500">*</span>
          </span>
        </label>
        <div className="grid grid-cols-5 gap-2">
          {HEIGHT_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange({ height_meters: option.value })}
              className={`rounded-xl border-2 p-3 text-center transition-all ${
                data.height_meters === option.value
                  ? 'border-violet-500 bg-violet-50 ring-2 ring-violet-500/20 scale-105'
                  : 'border-gray-200 hover:border-violet-300 hover:bg-violet-50/50'
              }`}
            >
              <p className={`text-lg font-bold ${data.height_meters === option.value ? 'text-violet-600' : 'text-gray-900'}`}>
                {option.label}
              </p>
              <p className="text-xs text-gray-500">{option.description}</p>
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
                  ? 'border-violet-500 bg-gradient-to-br from-violet-50 to-purple-50 ring-2 ring-violet-500/20'
                  : 'border-gray-200 hover:border-violet-300 hover:bg-violet-50/30'
              }`}
            >
              <div className={`mb-2 ${data.stand_type === option.value ? 'text-violet-600' : 'text-gray-400'}`}>
                {option.icon}
              </div>
              <p className="font-semibold text-gray-900">{option.label}</p>
              <p className="text-sm text-gray-500">{option.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Staff */}
      <div>
        <label className="mb-3 block text-sm font-medium text-gray-700">
          <span className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-400" />
            Количество сотрудников <span className="text-red-500">*</span>
          </span>
        </label>
        <div className="flex gap-2">
          {STAFF_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange({ staff_count: option.value })}
              className={`flex-1 rounded-xl border-2 py-3 text-center transition-all ${
                data.staff_count === option.value
                  ? 'border-violet-500 bg-violet-500 text-white font-bold'
                  : 'border-gray-200 hover:border-violet-300 hover:bg-violet-50/50 text-gray-900'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
