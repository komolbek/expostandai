'use client'

import { useState } from 'react'
import { Palette, Cpu, Leaf, Minimize2, Target, TrendingUp, Store, Award, ArrowUpDown, Pipette } from 'lucide-react'
import type { InquiryData, StandStyle, MainGoal } from '@/lib/types'

interface StepDesignPrefsProps {
  data: Partial<InquiryData>
  onChange: (data: Partial<InquiryData>) => void
}

const STYLE_OPTIONS: { value: StandStyle; label: string; description: string; icon: React.ReactNode; gradient: string }[] = [
  { value: 'hi-tech', label: 'Hi-Tech', description: 'LED подсветка, металл, стекло', icon: <Cpu className="h-6 w-6" />, gradient: 'from-blue-500 to-cyan-500' },
  { value: 'classic', label: 'Классический', description: 'Дерево, тёплые тона', icon: <Palette className="h-6 w-6" />, gradient: 'from-amber-500 to-orange-500' },
  { value: 'eco', label: 'Эко', description: 'Растения, натуральные материалы', icon: <Leaf className="h-6 w-6" />, gradient: 'from-green-500 to-emerald-500' },
  { value: 'minimal', label: 'Минимализм', description: 'Чистые линии, простые формы', icon: <Minimize2 className="h-6 w-6" />, gradient: 'from-gray-500 to-slate-600' },
]

const GOAL_OPTIONS: { value: MainGoal; label: string; icon: React.ReactNode }[] = [
  { value: 'brand_awareness', label: 'Узнаваемость бренда', icon: <Target className="h-4 w-4" /> },
  { value: 'sales_increase', label: 'Увеличение продаж', icon: <TrendingUp className="h-4 w-4" /> },
  { value: 'trade', label: 'Торговля на выставке', icon: <Store className="h-4 w-4" /> },
  { value: 'prestige', label: 'Престиж компании', icon: <Award className="h-4 w-4" /> },
]

// Color palettes for easy selection
const COLOR_PALETTES = [
  { name: 'Корпоративный синий', background: '#F0F4F8', main: '#1E40AF', accent: '#3B82F6' },
  { name: 'Элегантный чёрный', background: '#F5F5F5', main: '#1F2937', accent: '#6B7280' },
  { name: 'Природный зелёный', background: '#F0FDF4', main: '#166534', accent: '#22C55E' },
  { name: 'Тёплый оранжевый', background: '#FFF7ED', main: '#C2410C', accent: '#F97316' },
  { name: 'Роскошный бордо', background: '#FDF2F8', main: '#881337', accent: '#DB2777' },
  { name: 'Технологичный фиолет', background: '#FAF5FF', main: '#6B21A8', accent: '#A855F7' },
]

export function StepDesignPrefs({ data, onChange }: StepDesignPrefsProps) {
  const [showCustomColors, setShowCustomColors] = useState(false)

  const heightValue = data.height_meters || 3
  const heightPercent = ((heightValue - 2.5) / 2) * 100

  const applyPalette = (palette: typeof COLOR_PALETTES[0]) => {
    onChange({
      color_background: palette.background,
      color_main: palette.main,
      color_accent: palette.accent,
    })
  }

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
                  ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 ring-2 ring-blue-500/20 scale-[1.02]'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/30'
              }`}
            >
              <div className={`mb-2 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${option.gradient} text-white`}>
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
        <div className="grid grid-cols-2 gap-2">
          {GOAL_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange({ main_goal: option.value })}
              className={`rounded-xl border-2 p-3 transition-all flex items-center gap-2 ${
                data.main_goal === option.value
                  ? 'border-blue-500 bg-blue-500 text-white'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 text-gray-700'
              }`}
            >
              {option.icon}
              <span className="font-medium text-sm">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Height Slider */}
      <div>
        <label className="mb-3 block text-sm font-medium text-gray-700">
          <span className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-gray-400" />
            Высота стенда <span className="text-red-500">*</span>
          </span>
        </label>
        <div className="rounded-xl border-2 border-gray-200 p-4 bg-gradient-to-br from-gray-50 to-slate-50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500">2.5 м</span>
            <span className="text-2xl font-bold text-blue-600">{heightValue} м</span>
            <span className="text-sm text-gray-500">4.5 м</span>
          </div>
          <div className="relative">
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all"
                style={{ width: `${heightPercent}%` }}
              />
            </div>
            <input
              type="range"
              min="2.5"
              max="4.5"
              step="0.1"
              value={heightValue}
              onChange={(e) => onChange({ height_meters: parseFloat(e.target.value) })}
              className="absolute inset-0 w-full h-3 opacity-0 cursor-pointer"
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white border-2 border-blue-500 rounded-full shadow-lg pointer-events-none transition-all"
              style={{ left: `calc(${heightPercent}% - 12px)` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            {[2.5, 3, 3.5, 4, 4.5].map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => onChange({ height_meters: h })}
                className={`text-xs px-2 py-1 rounded-md transition-all ${
                  Math.abs(heightValue - h) < 0.05
                    ? 'bg-blue-500 text-white font-medium'
                    : 'text-gray-500 hover:bg-gray-200'
                }`}
              >
                {h}м
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Suspended structure */}
      <div
        onClick={() => onChange({ has_suspended: !data.has_suspended })}
        className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${
          data.has_suspended
            ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50'
            : 'border-gray-200 hover:border-blue-300'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`flex h-6 w-6 items-center justify-center rounded-md border-2 transition-all ${
            data.has_suspended
              ? 'border-blue-500 bg-blue-500'
              : 'border-gray-300'
          }`}>
            {data.has_suspended && (
              <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 12 12">
                <path d="M10.28 2.72a.75.75 0 010 1.06l-5.5 5.5a.75.75 0 01-1.06 0l-2.5-2.5a.75.75 0 111.06-1.06L4.5 7.94l4.97-4.97a.75.75 0 011.06 0z" />
              </svg>
            )}
          </div>
          <div>
            <p className="font-medium text-gray-900">Подвесная конструкция</p>
            <p className="text-sm text-gray-500">Дополнительная конструкция над стендом</p>
          </div>
        </div>
      </div>

      {/* Color Scheme Section */}
      <div>
        <label className="mb-3 block text-sm font-medium text-gray-700">
          <span className="flex items-center gap-2">
            <Pipette className="h-4 w-4 text-gray-400" />
            Цветовая схема <span className="text-xs text-gray-400">(опционально)</span>
          </span>
        </label>

        {/* Color Palettes */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
          {COLOR_PALETTES.map((palette) => {
            const isSelected =
              data.color_background === palette.background &&
              data.color_main === palette.main &&
              data.color_accent === palette.accent
            return (
              <button
                key={palette.name}
                type="button"
                onClick={() => applyPalette(palette)}
                className={`rounded-xl border-2 p-3 transition-all ${
                  isSelected
                    ? 'border-blue-500 ring-2 ring-blue-500/20'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex gap-1 mb-2">
                  <div
                    className="h-6 w-6 rounded-md border border-gray-200"
                    style={{ backgroundColor: palette.background }}
                    title="Фон"
                  />
                  <div
                    className="h-6 w-6 rounded-md"
                    style={{ backgroundColor: palette.main }}
                    title="Основной"
                  />
                  <div
                    className="h-6 w-6 rounded-md"
                    style={{ backgroundColor: palette.accent }}
                    title="Акцент"
                  />
                </div>
                <p className="text-xs font-medium text-gray-700 truncate">{palette.name}</p>
              </button>
            )
          })}
        </div>

        {/* Toggle for custom colors */}
        <button
          type="button"
          onClick={() => setShowCustomColors(!showCustomColors)}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
        >
          <Pipette className="h-3 w-3" />
          {showCustomColors ? 'Скрыть свои цвета' : 'Указать свои цвета'}
        </button>

        {/* Custom Color Inputs */}
        {showCustomColors && (
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Фоновый цвет</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={data.color_background || '#F5F5F5'}
                  onChange={(e) => onChange({ color_background: e.target.value })}
                  className="h-10 w-10 rounded-lg border-2 border-gray-200 cursor-pointer"
                />
                <input
                  type="text"
                  value={data.color_background || '#F5F5F5'}
                  onChange={(e) => onChange({ color_background: e.target.value })}
                  className="flex-1 text-xs px-2 py-2 rounded-lg border border-gray-200 font-mono"
                  placeholder="#F5F5F5"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Основной цвет</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={data.color_main || '#1E40AF'}
                  onChange={(e) => onChange({ color_main: e.target.value })}
                  className="h-10 w-10 rounded-lg border-2 border-gray-200 cursor-pointer"
                />
                <input
                  type="text"
                  value={data.color_main || '#1E40AF'}
                  onChange={(e) => onChange({ color_main: e.target.value })}
                  className="flex-1 text-xs px-2 py-2 rounded-lg border border-gray-200 font-mono"
                  placeholder="#1E40AF"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Акцентный цвет</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={data.color_accent || '#3B82F6'}
                  onChange={(e) => onChange({ color_accent: e.target.value })}
                  className="h-10 w-10 rounded-lg border-2 border-gray-200 cursor-pointer"
                />
                <input
                  type="text"
                  value={data.color_accent || '#3B82F6'}
                  onChange={(e) => onChange({ color_accent: e.target.value })}
                  className="flex-1 text-xs px-2 py-2 rounded-lg border border-gray-200 font-mono"
                  placeholder="#3B82F6"
                />
              </div>
            </div>
          </div>
        )}

        {/* Color Preview */}
        {(data.color_background || data.color_main || data.color_accent) && (
          <div className="mt-4 rounded-xl border-2 border-gray-200 p-3">
            <p className="text-xs text-gray-500 mb-2">Превью цветовой схемы:</p>
            <div
              className="rounded-lg p-4 flex items-center justify-center gap-3"
              style={{ backgroundColor: data.color_background || '#F5F5F5' }}
            >
              <div
                className="h-12 w-24 rounded-lg shadow-sm flex items-center justify-center"
                style={{ backgroundColor: data.color_main || '#1E40AF' }}
              >
                <span className="text-white text-xs font-medium">Основной</span>
              </div>
              <div
                className="h-8 w-16 rounded-lg shadow-sm flex items-center justify-center"
                style={{ backgroundColor: data.color_accent || '#3B82F6' }}
              >
                <span className="text-white text-xs">Акцент</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
