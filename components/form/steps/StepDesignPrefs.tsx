'use client'

import { Palette, Cpu, Leaf, Minimize2 } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import type { InquiryData, StandStyle, MainGoal } from '@/lib/types'

interface StepDesignPrefsProps {
  data: Partial<InquiryData>
  onChange: (data: Partial<InquiryData>) => void
}

const STYLE_OPTIONS: { value: StandStyle; label: string; description: string; icon: React.ReactNode }[] = [
  { value: 'hi-tech', label: 'Hi-Tech', description: 'Современный, с LED подсветкой', icon: <Cpu className="h-6 w-6" /> },
  { value: 'classic', label: 'Классический', description: 'Элегантный, деревянные панели', icon: <Palette className="h-6 w-6" /> },
  { value: 'eco', label: 'Эко', description: 'Натуральные материалы, растения', icon: <Leaf className="h-6 w-6" /> },
  { value: 'minimal', label: 'Минимализм', description: 'Чистые линии, простые формы', icon: <Minimize2 className="h-6 w-6" /> },
]

const GOAL_OPTIONS: { value: MainGoal; label: string }[] = [
  { value: 'brand_awareness', label: 'Узнаваемость бренда' },
  { value: 'sales_increase', label: 'Увеличение продаж' },
  { value: 'trade', label: 'Торговля на выставке' },
  { value: 'prestige', label: 'Престиж компании' },
]

const HEIGHT_OPTIONS = [
  { value: 2.5, label: '2.5 м' },
  { value: 3, label: '3 м' },
  { value: 3.5, label: '3.5 м' },
  { value: 4, label: '4 м' },
  { value: 4.5, label: '4+ м' },
]

export function StepDesignPrefs({ data, onChange }: StepDesignPrefsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Дизайн и стиль</h2>
        <p className="mt-1 text-gray-500">Выберите предпочтительный стиль оформления</p>
      </div>

      {/* Style */}
      <div>
        <label className="mb-3 block text-sm font-medium text-gray-700">
          Стиль оформления <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          {STYLE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange({ style: option.value })}
              className={`rounded-xl border-2 p-4 text-left transition-all ${
                data.style === option.value
                  ? 'border-primary-600 bg-primary-50 ring-2 ring-primary-600/20'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className={`mb-2 ${data.style === option.value ? 'text-primary-600' : 'text-gray-400'}`}>
                {option.icon}
              </div>
              <p className="font-semibold text-gray-900">{option.label}</p>
              <p className="text-sm text-gray-500">{option.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Goal */}
      <div>
        <label className="mb-3 block text-sm font-medium text-gray-700">
          Основная цель участия <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          {GOAL_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange({ main_goal: option.value })}
              className={`rounded-xl border-2 p-3 text-center transition-all ${
                data.main_goal === option.value
                  ? 'border-primary-600 bg-primary-50 ring-2 ring-primary-600/20'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <p className="font-medium text-gray-900">{option.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Height */}
      <div>
        <label className="mb-3 block text-sm font-medium text-gray-700">
          Высота стенда <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {HEIGHT_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange({ height_meters: option.value })}
              className={`rounded-lg border-2 px-4 py-2 transition-all ${
                data.height_meters === option.value
                  ? 'border-primary-600 bg-primary-50 ring-2 ring-primary-600/20'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <p className="font-medium text-gray-900">{option.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Suspended structure */}
      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={data.has_suspended || false}
            onChange={(e) => onChange({ has_suspended: e.target.checked })}
            className="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-gray-900">Подвесная конструкция над стендом</span>
        </label>
      </div>

      {/* Brand colors */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Фирменные цвета
        </label>
        <Input
          value={data.brand_colors || ''}
          onChange={(e) => onChange({ brand_colors: e.target.value })}
          placeholder="Например: синий, белый, серебристый"
        />
      </div>
    </div>
  )
}
