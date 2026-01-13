'use client'

import { Input } from '@/components/ui/Input'
import type { ContactInfo } from '@/lib/types'

interface StepContactInfoProps {
  data: ContactInfo
  onChange: (data: ContactInfo) => void
  companyName?: string
}

export function StepContactInfo({ data, onChange, companyName }: StepContactInfoProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Контактная информация</h2>
        <p className="mt-1 text-gray-500">Укажите данные для связи</p>
      </div>

      {companyName && (
        <div className="rounded-lg bg-primary-50 p-4">
          <p className="text-sm text-primary-700">
            Заявка от компании: <span className="font-semibold">{companyName}</span>
          </p>
        </div>
      )}

      {/* Name */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Ваше имя <span className="text-red-500">*</span>
        </label>
        <Input
          value={data.name}
          onChange={(e) => onChange({ ...data, name: e.target.value })}
          placeholder="Иван Петров"
        />
      </div>

      {/* Phone */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Телефон <span className="text-red-500">*</span>
        </label>
        <Input
          type="tel"
          value={data.phone}
          onChange={(e) => onChange({ ...data, phone: e.target.value })}
          placeholder="+7 (999) 123-45-67"
        />
      </div>

      {/* Email */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Email
          <span className="ml-2 text-xs text-gray-400">(опционально)</span>
        </label>
        <Input
          type="email"
          value={data.email || ''}
          onChange={(e) => onChange({ ...data, email: e.target.value })}
          placeholder="ivan@company.ru"
        />
      </div>

      <div className="rounded-lg bg-gray-50 p-4">
        <p className="text-sm text-gray-600">
          Мы свяжемся с вами в течение 24 часов для обсуждения деталей и предоставления коммерческого предложения.
        </p>
      </div>
    </div>
  )
}
