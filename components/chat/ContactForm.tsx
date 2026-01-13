'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { isValidEmail, isValidPhone } from '@/lib/utils'
import { X } from 'lucide-react'

interface ContactFormProps {
  onSubmit: (data: { name: string; phone: string; email?: string }) => void
  onCancel: () => void
  initialData?: {
    company?: string
  }
}

export function ContactForm({ onSubmit, onCancel, initialData }: ContactFormProps) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [errors, setErrors] = useState<{
    name?: string
    phone?: string
    email?: string
    agreed?: string
  }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validate = (): boolean => {
    const newErrors: typeof errors = {}

    if (!name.trim()) {
      newErrors.name = 'Введите ваше имя'
    }

    if (!phone.trim()) {
      newErrors.phone = 'Введите номер телефона'
    } else if (!isValidPhone(phone)) {
      newErrors.phone = 'Введите корректный номер телефона'
    }

    if (email && !isValidEmail(email)) {
      newErrors.email = 'Введите корректный email'
    }

    if (!agreed) {
      newErrors.agreed = 'Необходимо согласие на обработку данных'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    setIsSubmitting(true)
    try {
      await onSubmit({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="animate-fade-in-up rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Контактные данные</h3>
        <button
          onClick={onCancel}
          className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <p className="mb-6 text-sm text-gray-600">
        Оставьте ваши контакты, и мы свяжемся с вами для обсуждения деталей
        {initialData?.company ? ` по проекту для ${initialData.company}` : ''}.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Ваше имя *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Иван Иванов"
          error={errors.name}
        />

        <Input
          label="Телефон *"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+998 90 123 45 67"
          error={errors.phone}
        />

        <Input
          label="Email (необязательно)"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ivan@company.com"
          error={errors.email}
        />

        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="agreement"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <label htmlFor="agreement" className="text-sm text-gray-600">
            Я согласен на обработку персональных данных в соответствии с политикой
            конфиденциальности
          </label>
        </div>
        {errors.agreed && <p className="text-sm text-red-600">{errors.agreed}</p>}

        <div className="flex gap-3 pt-2">
          <Button type="submit" loading={isSubmitting} className="flex-1">
            Отправить заявку
          </Button>
          <Button type="button" variant="secondary" onClick={onCancel}>
            Отмена
          </Button>
        </div>
      </form>
    </div>
  )
}
