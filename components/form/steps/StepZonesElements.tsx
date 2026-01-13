'use client'

import { Monitor, Users, DoorClosed, Coffee, Package, MessageSquare } from 'lucide-react'
import type { InquiryData, Zone, Element } from '@/lib/types'

interface StepZonesElementsProps {
  data: Partial<InquiryData>
  onChange: (data: Partial<InquiryData>) => void
}

const ZONE_OPTIONS: { value: Zone; label: string; description: string; icon: React.ReactNode }[] = [
  { value: 'reception', label: 'Ресепшн', description: 'Стойка регистрации гостей', icon: <MessageSquare className="h-5 w-5" /> },
  { value: 'presentation', label: 'Презентационная', description: 'Зона для демонстраций', icon: <Monitor className="h-5 w-5" /> },
  { value: 'open_meeting', label: 'Переговорная открытая', description: 'Столы и стулья для встреч', icon: <Users className="h-5 w-5" /> },
  { value: 'closed_meeting', label: 'Переговорная закрытая', description: 'Отдельная комната', icon: <DoorClosed className="h-5 w-5" /> },
  { value: 'mini_kitchen', label: 'Мини-кухня', description: 'Кофе, напитки для гостей', icon: <Coffee className="h-5 w-5" /> },
  { value: 'storage', label: 'Склад', description: 'Хранение материалов', icon: <Package className="h-5 w-5" /> },
]

const ELEMENT_OPTIONS: { value: Element; label: string }[] = [
  { value: 'display_cases', label: 'Витрины для продукции' },
  { value: 'brochure_stands', label: 'Стойки для буклетов' },
  { value: 'podiums', label: 'Подиумы для оборудования' },
  { value: 'monitors_led', label: 'LED мониторы/экраны' },
  { value: 'plants', label: 'Живые растения' },
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
                    ? 'border-primary-600 bg-primary-50 ring-2 ring-primary-600/20'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className={`mt-0.5 ${isSelected ? 'text-primary-600' : 'text-gray-400'}`}>
                  {option.icon}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{option.label}</p>
                  <p className="text-sm text-gray-500">{option.description}</p>
                </div>
                <div
                  className={`flex h-5 w-5 items-center justify-center rounded border-2 ${
                    isSelected
                      ? 'border-primary-600 bg-primary-600 text-white'
                      : 'border-gray-300'
                  }`}
                >
                  {isSelected && (
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 12 12">
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
                className={`flex items-center gap-2 rounded-lg border-2 px-4 py-2 transition-all ${
                  isSelected
                    ? 'border-primary-600 bg-primary-50 ring-2 ring-primary-600/20'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div
                  className={`flex h-4 w-4 items-center justify-center rounded border ${
                    isSelected
                      ? 'border-primary-600 bg-primary-600 text-white'
                      : 'border-gray-300'
                  }`}
                >
                  {isSelected && (
                    <svg className="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 12 12">
                      <path d="M10.28 2.72a.75.75 0 010 1.06l-5.5 5.5a.75.75 0 01-1.06 0l-2.5-2.5a.75.75 0 111.06-1.06L4.5 7.94l4.97-4.97a.75.75 0 011.06 0z" />
                    </svg>
                  )}
                </div>
                <span className="font-medium text-gray-900">{option.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
