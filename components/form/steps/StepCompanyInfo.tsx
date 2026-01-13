'use client'

import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import type { InquiryData } from '@/lib/types'

interface StepCompanyInfoProps {
  data: Partial<InquiryData>
  onChange: (data: Partial<InquiryData>) => void
}

export function StepCompanyInfo({ data, onChange }: StepCompanyInfoProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Информация о компании</h2>
        <p className="mt-1 text-gray-500">Расскажите нам о вашей компании</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Название компании <span className="text-red-500">*</span>
          </label>
          <Input
            value={data.company_name || ''}
            onChange={(e) => onChange({ company_name: e.target.value })}
            placeholder="ООО «Ваша Компания»"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Продукция / Услуги <span className="text-red-500">*</span>
          </label>
          <Textarea
            value={data.products_services || ''}
            onChange={(e) => onChange({ products_services: e.target.value })}
            placeholder="Опишите, что производит или какие услуги оказывает ваша компания"
            rows={3}
          />
        </div>
      </div>
    </div>
  )
}
