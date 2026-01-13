'use client'

import { Input } from '@/components/ui/Input'
import type { InquiryData } from '@/lib/types'

interface StepExhibitionInfoProps {
  data: Partial<InquiryData>
  onChange: (data: Partial<InquiryData>) => void
}

export function StepExhibitionInfo({ data, onChange }: StepExhibitionInfoProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Информация о выставке</h2>
        <p className="mt-1 text-gray-500">Укажите детали выставки (необязательно)</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Название выставки
          </label>
          <Input
            value={data.exhibition_name || ''}
            onChange={(e) => onChange({ exhibition_name: e.target.value })}
            placeholder="Например: WorldFood Moscow 2024"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Дата проведения
          </label>
          <Input
            type="date"
            value={data.exhibition_date || ''}
            onChange={(e) => onChange({ exhibition_date: e.target.value })}
          />
        </div>
      </div>
    </div>
  )
}
