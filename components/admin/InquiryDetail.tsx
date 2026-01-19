'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import {
  formatDateTime,
  formatBudget,
  formatStandType,
  formatStyle,
  formatZone,
  formatElement,
  formatGoal,
} from '@/lib/utils'
import type { Inquiry } from '@/lib/types'
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
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки')
      } finally {
        setIsLoading(false)
      }
    }

    fetchInquiry()
  }, [inquiryId, router])

  const handleStatusToggle = async () => {
    if (!inquiry) return

    setIsSaving(true)
    const newStatus = inquiry.status === 'new' ? 'completed' : 'new'

    try {
      const response = await fetch(`/api/admin/inquiries/${inquiryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update status')
      }

      const updated = await response.json()
      setInquiry(updated)
    } catch (err) {
      alert('Ошибка обновления статуса')
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
                label="Габариты (Ш×Г×В)"
                value={
                  inquiry.width_meters && inquiry.length_meters && inquiry.height_meters
                    ? `${inquiry.width_meters}×${inquiry.length_meters}×${inquiry.height_meters} м (${inquiry.width_meters * inquiry.length_meters} м²)`
                    : inquiry.width_meters && inquiry.length_meters
                    ? `${inquiry.width_meters}×${inquiry.length_meters} м (${inquiry.width_meters * inquiry.length_meters} м²)`
                    : inquiry.area_sqm && inquiry.height_meters
                    ? `${inquiry.area_sqm} м², высота ${inquiry.height_meters} м`
                    : inquiry.area_sqm
                    ? `${inquiry.area_sqm} м²`
                    : inquiry.height_meters
                    ? `высота ${inquiry.height_meters} м`
                    : '—'
                }
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
            {(() => {
              // Extract colors from brand_colors string if structured fields are not available
              let mainColor = inquiry.color_main
              let accentColor = inquiry.color_accent
              let bgColor = inquiry.color_background

              // Parse old format: "Main: #ff2600, Accent: #0433ff"
              if (!mainColor && !accentColor && inquiry.brand_colors) {
                const mainMatch = inquiry.brand_colors.match(/Main:\s*(#[0-9a-fA-F]{6})/i)
                const accentMatch = inquiry.brand_colors.match(/Accent:\s*(#[0-9a-fA-F]{6})/i)
                const bgMatch = inquiry.brand_colors.match(/Background:\s*(#[0-9a-fA-F]{6})/i)

                if (mainMatch) mainColor = mainMatch[1]
                if (accentMatch) accentColor = accentMatch[1]
                if (bgMatch) bgColor = bgMatch[1]
              }

              const hasColors = mainColor || accentColor || bgColor || inquiry.brand_colors

              if (!hasColors) return null

              return (
                <div className="mt-4 border-t border-gray-100 pt-4">
                  <p className="mb-2 text-sm text-gray-500">Цвета бренда:</p>
                  <div className="flex flex-wrap items-center gap-3">
                    {mainColor && (
                      <div className="flex items-center gap-2">
                        <div
                          className="h-8 w-8 rounded-lg border-2 border-gray-200 shadow-sm"
                          style={{ backgroundColor: mainColor }}
                        />
                        <div>
                          <p className="text-xs text-gray-500">Основной</p>
                          <p className="font-mono text-sm text-gray-900">{mainColor}</p>
                        </div>
                      </div>
                    )}
                    {accentColor && (
                      <div className="flex items-center gap-2">
                        <div
                          className="h-8 w-8 rounded-lg border-2 border-gray-200 shadow-sm"
                          style={{ backgroundColor: accentColor }}
                        />
                        <div>
                          <p className="text-xs text-gray-500">Акцентный</p>
                          <p className="font-mono text-sm text-gray-900">{accentColor}</p>
                        </div>
                      </div>
                    )}
                    {bgColor && (
                      <div className="flex items-center gap-2">
                        <div
                          className="h-8 w-8 rounded-lg border-2 border-gray-200 shadow-sm"
                          style={{ backgroundColor: bgColor }}
                        />
                        <div>
                          <p className="text-xs text-gray-500">Фон</p>
                          <p className="font-mono text-sm text-gray-900">{bgColor}</p>
                        </div>
                      </div>
                    )}
                    {inquiry.brand_colors && !mainColor && !accentColor && !bgColor && (
                      <p className="text-gray-900">{inquiry.brand_colors}</p>
                    )}
                  </div>
                </div>
              )
            })()}
          </section>

          {/* Selected design */}
          {inquiry.generated_images && inquiry.generated_images.length > 0 && (
            <section className="card">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Выбранный клиентом дизайн
              </h2>

              <a
                href={inquiry.generated_images[0]}
                target="_blank"
                rel="noopener noreferrer"
                className="block aspect-video overflow-hidden rounded-xl bg-gray-100 ring-4 ring-primary-500 ring-offset-2"
              >
                <Image
                  src={inquiry.generated_images[0]}
                  alt="Выбранный дизайн"
                  width={800}
                  height={450}
                  className="h-full w-full object-cover"
                />
              </a>
              <p className="mt-2 text-center text-sm font-medium text-primary-600">
                Клиент выбрал этот вариант
              </p>
            </section>
          )}
        </div>

        {/* Info panel */}
        <div className="space-y-6">
          <section className="card">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Информация</h2>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Дата создания</p>
                <p className="font-medium text-gray-900">{formatDateTime(inquiry.created_at)}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">ID заявки</p>
                <p className="font-mono text-sm text-gray-600">{inquiry.id}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Статус</p>
                <Badge status={inquiry.status} />
                <button
                  onClick={handleStatusToggle}
                  disabled={isSaving}
                  className={`mt-2 w-full rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${
                    inquiry.status === 'new'
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {isSaving
                    ? 'Сохранение...'
                    : inquiry.status === 'new'
                    ? 'Отметить выполненной'
                    : 'Отметить как новую'}
                </button>
              </div>
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
