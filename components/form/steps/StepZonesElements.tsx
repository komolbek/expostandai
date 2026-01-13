'use client'

import { Monitor, Users, DoorClosed, Coffee, Package, MessageSquare, Tv, BookOpen, Box, Leaf } from 'lucide-react'
import type { InquiryData, Zone, Element } from '@/lib/types'

interface StepZonesElementsProps {
  data: Partial<InquiryData>
  onChange: (data: Partial<InquiryData>) => void
}

const ZONE_OPTIONS: { value: Zone; label: string; description: string; icon: React.ReactNode; color: string }[] = [
  { value: 'reception', label: 'Ресепшн', description: 'Стойка регистрации', icon: <MessageSquare className="h-5 w-5" />, color: 'from-blue-500 to-blue-600' },
  { value: 'presentation', label: 'Презентационная', description: 'Зона демонстраций', icon: <Monitor className="h-5 w-5" />, color: 'from-purple-500 to-purple-600' },
  { value: 'open_meeting', label: 'Открытая переговорная', description: 'Столы и стулья', icon: <Users className="h-5 w-5" />, color: 'from-teal-500 to-teal-600' },
  { value: 'closed_meeting', label: 'Закрытая переговорная', description: 'Отдельная комната', icon: <DoorClosed className="h-5 w-5" />, color: 'from-indigo-500 to-indigo-600' },
  { value: 'mini_kitchen', label: 'Мини-кухня', description: 'Кофе, напитки', icon: <Coffee className="h-5 w-5" />, color: 'from-amber-500 to-amber-600' },
  { value: 'storage', label: 'Склад', description: 'Хранение материалов', icon: <Package className="h-5 w-5" />, color: 'from-gray-500 to-gray-600' },
]

const ELEMENT_OPTIONS: { value: Element; label: string; icon: React.ReactNode }[] = [
  { value: 'display_cases', label: 'Витрины', icon: <Box className="h-4 w-4" /> },
  { value: 'brochure_stands', label: 'Буклетницы', icon: <BookOpen className="h-4 w-4" /> },
  { value: 'podiums', label: 'Подиумы', icon: <Package className="h-4 w-4" /> },
  { value: 'monitors_led', label: 'LED экраны', icon: <Tv className="h-4 w-4" /> },
  { value: 'plants', label: 'Растения', icon: <Leaf className="h-4 w-4" /> },
]

export function StepZonesElements({ data, onChange }: StepZonesElementsProps) {
  const selectedZones = data.zones || []
  const selectedElements = data.elements || []

  const toggleZone = (zone: Zone) => {
    const newZones = selectedZones.includes(zone)
      ? selectedZones.filter((z) => z !== zone)
      : [...selectedZones, zone]
    onChange({ zones: newZones })
  }

  const toggleElement = (element: Element) => {
    const newElements = selectedElements.includes(element)
      ? selectedElements.filter((e) => e !== element)
      : [...selectedElements, element]
    onChange({ elements: newElements })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Функциональные зоны</h2>
        <p className="mt-1 text-gray-500">Выберите необходимые зоны и элементы</p>
      </div>

      {/* Zones */}
      <div>
        <label className="mb-3 block text-sm font-medium text-gray-700">
          Зоны стенда <span className="text-red-500">*</span>
          <span className="ml-2 text-xs text-gray-400">(выберите одну или несколько)</span>
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          {ZONE_OPTIONS.map((option) => {
            const isSelected = selectedZones.includes(option.value)
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => toggleZone(option.value)}
                className={`flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                  isSelected
                    ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-amber-50 ring-2 ring-orange-500/20 scale-[1.02]'
                    : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50/30'
                }`}
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${option.color} text-white`}>
                  {option.icon}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{option.label}</p>
                  <p className="text-sm text-gray-500">{option.description}</p>
                </div>
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-md border-2 transition-all ${
                    isSelected
                      ? 'border-orange-500 bg-orange-500 text-white'
                      : 'border-gray-300'
                  }`}
                >
                  {isSelected && (
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 12 12">
                      <path d="M10.28 2.72a.75.75 0 010 1.06l-5.5 5.5a.75.75 0 01-1.06 0l-2.5-2.5a.75.75 0 111.06-1.06L4.5 7.94l4.97-4.97a.75.75 0 011.06 0z" />
                    </svg>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Elements */}
      <div>
        <label className="mb-3 block text-sm font-medium text-gray-700">
          Дополнительные элементы
          <span className="ml-2 text-xs text-gray-400">(опционально)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {ELEMENT_OPTIONS.map((option) => {
            const isSelected = selectedElements.includes(option.value)
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => toggleElement(option.value)}
                className={`flex items-center gap-2 rounded-xl border-2 px-4 py-3 transition-all ${
                  isSelected
                    ? 'border-orange-500 bg-orange-500 text-white'
                    : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50/50 text-gray-700'
                }`}
              >
                {option.icon}
                <span className="font-medium">{option.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
