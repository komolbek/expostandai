'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Badge, StatusSelect } from '@/components/ui/Badge'
import {
  formatDateTime,
  formatBudget,
  formatStandType,
  formatStyle,
  formatZone,
  formatElement,
  formatGoal,
} from '@/lib/utils'
import type { Inquiry, InquiryStatus } from '@/lib/types'
import {
  ArrowLeft,
  Building,
  Calendar,
  Phone,
  Mail,
  Users,
  Ruler,
  Palette,
  Target,
  DollarSign,
  Save,
  Loader2,
} from 'lucide-react'

interface InquiryDetailProps {
  inquiryId: string
}

export function InquiryDetail({ inquiryId }: InquiryDetailProps) {
  const router = useRouter()
  const [inquiry, setInquiry] = useState<Inquiry | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Edit state
  const [status, setStatus] = useState<InquiryStatus>('new')
  const [quotedPrice, setQuotedPrice] = useState('')
  const [adminNotes, setAdminNotes] = useState('')

  useEffect(() => {
    const fetchInquiry = async () => {
      try {
        const response = await fetch(`/api/admin/inquiries/${inquiryId}`)

        if (!response.ok) {
          if (response.status === 401) {
            router.push('/admin/login')
            return
          }
          throw new Error('Failed to fetch inquiry')
        }

        const data = await response.json()
        setInquiry(data)
        setStatus(data.status)
        setQuotedPrice(data.quoted_price?.toString() || '')
        setAdminNotes(data.admin_notes || '')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки')
      } finally {
        setIsLoading(false)
      }
    }

    fetchInquiry()
  }, [inquiryId, router])

  const handleSave = async () => {
    setIsSaving(true)

    try {
      const response = await fetch(`/api/admin/inquiries/${inquiryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          quoted_price: quotedPrice ? parseFloat(quotedPrice) : null,
          admin_notes: adminNotes || null,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update inquiry')
      }

      const updated = await response.json()
      setInquiry(updated)
    } catch (err) {
      alert('Ошибка сохранения')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    )
  }

  if (error || !inquiry) {
    return (
      <div className="rounded-xl bg-red-50 p-6 text-center text-red-600">
        {error || 'Заявка не найдена'}
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <Link href="/admin" className="btn-ghost p-2">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{inquiry.company_name}</h1>
          <p className="text-gray-600">{formatDateTime(inquiry.created_at)}</p>
        </div>
        <Badge status={inquiry.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main info */}
        <div className="space-y-6 lg:col-span-2">
          {/* Contact */}
          <section className="card">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Контактные данные</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                  <Users className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Имя</p>
                  <p className="font-medium text-gray-900">{inquiry.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                  <Phone className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Телефон</p>
                  <a
                    href={`tel:${inquiry.phone}`}
                    className="font-medium text-primary-600 hover:underline"
                  >
                    {inquiry.phone}
                  </a>
                </div>
              </div>
              {inquiry.email && (
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                    <Mail className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <a
                      href={`mailto:${inquiry.email}`}
                      className="font-medium text-primary-600 hover:underline"
                    >
                      {inquiry.email}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Stand specifications */}
          <section className="card">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Параметры стенда</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <InfoItem
                icon={Building}
                label="Площадь"
                value={inquiry.area_sqm ? `${inquiry.area_sqm} м²` : '—'}
              />
              <InfoItem
                icon={Ruler}
                label="Тип стенда"
                value={inquiry.stand_type ? formatStandType(inquiry.stand_type) : '—'}
              />
              <InfoItem
                icon={Users}
                label="Персонал"
                value={inquiry.staff_count ? `${inquiry.staff_count} чел.` : '—'}
              />
              <InfoItem
                icon={Ruler}
                label="Высота"
                value={inquiry.height_meters ? `${inquiry.height_meters} м` : '—'}
              />
              <InfoItem
                icon={Palette}
                label="Стиль"
                value={inquiry.style ? formatStyle(inquiry.style) : '—'}
              />
              <InfoItem
                icon={Target}
                label="Цель"
                value={inquiry.main_goal ? formatGoal(inquiry.main_goal) : '—'}
              />
              <InfoItem
                icon={DollarSign}
                label="Бюджет"
                value={inquiry.budget_range ? formatBudget(inquiry.budget_range) : '—'}
              />
              <InfoItem
                icon={Calendar}
                label="Выставка"
                value={inquiry.exhibition_name || '—'}
              />
            </div>

            {/* Zones */}
            {inquiry.zones && inquiry.zones.length > 0 && (
              <div className="mt-4 border-t border-gray-100 pt-4">
                <p className="mb-2 text-sm text-gray-500">Зоны:</p>
                <div className="flex flex-wrap gap-2">
                  {inquiry.zones.map((zone) => (
                    <span
                      key={zone}
                      className="rounded-full bg-primary-50 px-3 py-1 text-sm text-primary-700"
                    >
                      {formatZone(zone)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Elements */}
            {inquiry.elements && inquiry.elements.length > 0 && (
              <div className="mt-4 border-t border-gray-100 pt-4">
                <p className="mb-2 text-sm text-gray-500">Элементы:</p>
                <div className="flex flex-wrap gap-2">
                  {inquiry.elements.map((element) => (
                    <span
                      key={element}
                      className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
                    >
                      {formatElement(element)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Special requests */}
            {inquiry.special_requests && (
              <div className="mt-4 border-t border-gray-100 pt-4">
                <p className="mb-2 text-sm text-gray-500">Особые пожелания:</p>
                <p className="text-gray-900">{inquiry.special_requests}</p>
              </div>
            )}

            {/* Brand colors */}
            {inquiry.brand_colors && (
              <div className="mt-4 border-t border-gray-100 pt-4">
                <p className="mb-2 text-sm text-gray-500">Цвета бренда:</p>
                <p className="text-gray-900">{inquiry.brand_colors}</p>
              </div>
            )}
          </section>

          {/* Generated images */}
          {inquiry.generated_images && inquiry.generated_images.length > 0 && (
            <section className="card">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                {inquiry.selected_image_index !== undefined && inquiry.selected_image_index !== null
                  ? 'Выбранный клиентом дизайн'
                  : 'Сгенерированные дизайны'}
              </h2>

              {/* Show selected design prominently */}
              {inquiry.selected_image_index !== undefined && inquiry.selected_image_index !== null && (
                <div className="mb-6">
                  <a
                    href={inquiry.generated_images[inquiry.selected_image_index]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block aspect-video overflow-hidden rounded-xl bg-gray-100 ring-4 ring-primary-500 ring-offset-2"
                  >
                    <Image
                      src={inquiry.generated_images[inquiry.selected_image_index]}
                      alt="Выбранный дизайн"
                      width={800}
                      height={450}
                      className="h-full w-full object-cover"
                    />
                  </a>
                  <p className="mt-2 text-center text-sm font-medium text-primary-600">
                    Клиент выбрал этот вариант
                  </p>
                </div>
              )}

              {/* Show other designs as smaller thumbnails */}
              {inquiry.generated_images.length > 1 && (
                <div>
                  <p className="mb-2 text-sm text-gray-500">
                    {inquiry.selected_image_index !== undefined && inquiry.selected_image_index !== null
                      ? 'Другие варианты:'
                      : 'Клиент не выбрал предпочтительный вариант:'}
                  </p>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {inquiry.generated_images.map((url, i) => {
                      const isSelected = inquiry.selected_image_index === i
                      if (isSelected && inquiry.selected_image_index !== undefined) return null
                      return (
                        <a
                          key={i}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="aspect-video overflow-hidden rounded-lg bg-gray-100 opacity-70 hover:opacity-100 transition-opacity"
                        >
                          <Image
                            src={url}
                            alt={`Дизайн ${i + 1}`}
                            width={300}
                            height={169}
                            className="h-full w-full object-cover"
                          />
                        </a>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* If only one image and no selection made, show it */}
              {inquiry.generated_images.length === 1 && (inquiry.selected_image_index === undefined || inquiry.selected_image_index === null) && (
                <a
                  href={inquiry.generated_images[0]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block aspect-video overflow-hidden rounded-lg bg-gray-100"
                >
                  <Image
                    src={inquiry.generated_images[0]}
                    alt="Дизайн 1"
                    width={400}
                    height={225}
                    className="h-full w-full object-cover"
                  />
                </a>
              )}
            </section>
          )}
        </div>

        {/* Admin panel */}
        <div className="space-y-6">
          <section className="card">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Управление</h2>

            <div className="space-y-4">
              <div>
                <label className="label">Статус</label>
                <StatusSelect value={status} onChange={setStatus} />
              </div>

              <Input
                label="Цена расчёта ($)"
                type="number"
                value={quotedPrice}
                onChange={(e) => setQuotedPrice(e.target.value)}
                placeholder="15000"
              />

              <Textarea
                label="Внутренние заметки"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Заметки для команды..."
                rows={4}
              />

              <Button
                onClick={handleSave}
                loading={isSaving}
                className="w-full"
                leftIcon={<Save className="h-4 w-4" />}
              >
                Сохранить
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
        <Icon className="h-5 w-5 text-gray-600" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="font-medium text-gray-900">{value}</p>
      </div>
    </div>
  )
}
