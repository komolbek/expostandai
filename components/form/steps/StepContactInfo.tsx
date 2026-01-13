'use client'

import { User, Phone, Mail, Building2 } from 'lucide-react'
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
        <div className="rounded-xl bg-gradient-to-r from-indigo-50 to-blue-50 p-4 border border-indigo-100">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-indigo-500" />
            <p className="text-sm text-indigo-700">
              Заявка от компании: <span className="font-semibold">{companyName}</span>
            </p>
          </div>
        </div>
      )}

      {/* Name */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          <span className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-400" />
            Ваше имя <span className="text-red-500">*</span>
          </span>
        </label>
        <Input
          value={data.name}
          onChange={(e) => onChange({ ...data, name: e.target.value })}
          placeholder="Азизбек Каримов"
        />
      </div>

      {/* Phone */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          <span className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-gray-400" />
            Телефон <span className="text-red-500">*</span>
          </span>
        </label>
        <Input
          type="tel"
          value={data.phone}
          onChange={(e) => onChange({ ...data, phone: e.target.value })}
          placeholder="+998 90 123 45 67"
        />
      </div>

      {/* Email */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          <span className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-gray-400" />
            Email <span className="text-xs text-gray-400">(опционально)</span>
          </span>
        </label>
        <Input
          type="email"
          value={data.email || ''}
          onChange={(e) => onChange({ ...data, email: e.target.value })}
          placeholder="info@company.uz"
        />
      </div>

      <div className="rounded-xl bg-gradient-to-r from-gray-50 to-slate-50 p-4 border border-gray-100">
        <p className="text-sm text-gray-600">
          Мы свяжемся с вами в течение 24 часов для обсуждения деталей и предоставления коммерческого предложения.
        </p>
      </div>
    </div>
  )
}
