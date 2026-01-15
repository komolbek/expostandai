'use client'

import { Square, CornerDownRight, Hexagon, Box, Users, Ruler, ArrowLeftRight, ArrowUpDown } from 'lucide-react'
import type { InquiryData, StandType } from '@/lib/types'

interface StepStandSpecsProps {
  data: Partial<InquiryData>
  onChange: (data: Partial<InquiryData>) => void
}

// Dimension slider component
interface DimensionSliderProps {
  label: string
  icon: React.ReactNode
  value: number
  min: number
  max: number
  step: number
  presets: number[]
  onChange: (value: number) => void
}

function DimensionSlider({ label, icon, value, min, max, step, presets, onChange }: DimensionSliderProps) {
  const percent = ((value - min) / (max - min)) * 100
  // Adjust thumb position to account for thumb width (12px = half of 24px thumb)
  const thumbOffset = 12

  return (
    <div className="rounded-xl border-2 border-gray-200 p-4 bg-gradient-to-br from-gray-50 to-slate-50">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-gray-400">{icon}</span>
        <span className="text-sm font-medium text-gray-700">{label}</span>
      </div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-500">{min} м</span>
        <span className="text-2xl font-bold text-violet-600">{value} м</span>
        <span className="text-sm text-gray-500">{max} м</span>
      </div>
      <div className="relative px-3">
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-400 to-violet-600 rounded-full transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          style={{ left: 0, right: 0, paddingLeft: '12px', paddingRight: '12px' }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white border-2 border-violet-500 rounded-full shadow-lg pointer-events-none transition-all"
          style={{ left: `calc(${percent}% + ${thumbOffset - (percent / 100) * (thumbOffset * 2)}px)` }}
        />
      </div>
      <div className="flex justify-between mt-2 px-3">
        {presets.map((p, index) => {
          const presetPercent = ((p - min) / (max - min)) * 100
          const isSelected = Math.abs(value - p) < 0.05
          return (
            <button
              key={p}
              type="button"
              onClick={() => onChange(p)}
              className={`text-xs px-2 py-1 rounded-md transition-all ${
                isSelected
                  ? 'bg-violet-500 text-white font-medium'
                  : 'text-gray-500 hover:bg-gray-200'
              }`}
              style={{
                position: index === 0 ? 'relative' : index === presets.length - 1 ? 'relative' : 'relative',
              }}
            >
              {p}м
            </button>
          )
        })}
      </div>
    </div>
  )
}

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
        <p className="mt-1 text-gray-500">Укажите габариты и тип стенда</p>
      </div>

      {/* Dimensions - Width, Length, Height sliders */}
      <div>
        <label className="mb-3 block text-sm font-medium text-gray-700">
          Габариты стенда <span className="text-red-500">*</span>
        </label>
        <div className="space-y-4">
          <DimensionSlider
            label="Ширина (фронт)"
            icon={<ArrowLeftRight className="h-4 w-4" />}
            value={data.width_meters || 3}
            min={2}
            max={12}
            step={0.5}
            presets={[2, 3, 4, 6, 8, 12]}
            onChange={(value) => onChange({ width_meters: value })}
          />
          <DimensionSlider
            label="Глубина"
            icon={<Ruler className="h-4 w-4" />}
            value={data.length_meters || 3}
            min={2}
            max={12}
            step={0.5}
            presets={[2, 3, 4, 6, 8, 12]}
            onChange={(value) => onChange({ length_meters: value })}
          />
          <DimensionSlider
            label="Высота"
            icon={<ArrowUpDown className="h-4 w-4" />}
            value={data.height_meters || 3}
            min={2.5}
            max={4.5}
            step={0.1}
            presets={[2.5, 3, 3.5, 4, 4.5]}
            onChange={(value) => onChange({ height_meters: value })}
          />
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
