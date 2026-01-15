'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatDateTime, formatBudget, formatStandType } from '@/lib/utils'
import type { Inquiry, InquiryStatus } from '@/lib/types'
import { ChevronLeft, ChevronRight, RefreshCw, Building, Calendar, DollarSign, CheckCircle } from 'lucide-react'

const statusFilters: Array<{ value: InquiryStatus | 'all'; label: string }> = [
  { value: 'all', label: 'Все' },
  { value: 'new', label: 'Новые' },
  { value: 'quoted', label: 'Расчёт отправлен' },
  { value: 'accepted', label: 'Принятые' },
  { value: 'rejected', label: 'Отклонённые' },
]

export function InquiryList() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<InquiryStatus | 'all'>('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const fetchInquiries = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/admin/inquiries?status=${status}&page=${page}&limit=10`
      )

      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = '/admin/login'
          return
        }
        throw new Error('Failed to fetch inquiries')
      }

      const data = await response.json()
      setInquiries(data.inquiries)
      setTotalPages(data.totalPages)
      setTotal(data.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchInquiries()
  }, [status, page])

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Заявки</h1>
          <p className="text-gray-600">
            Всего: {total} {total === 1 ? 'заявка' : total < 5 ? 'заявки' : 'заявок'}
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={fetchInquiries}
          leftIcon={<RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />}
        >
          Обновить
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        {statusFilters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => {
              setStatus(filter.value)
              setPage(1)
            }}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              status === filter.value
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-600">
          {error}
        </div>
      )}

      {/* List */}
      <div className="space-y-4">
        {isLoading ? (
          // Loading skeleton
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="shimmer h-32 rounded-xl" />
          ))
        ) : inquiries.length === 0 ? (
          <div className="rounded-xl bg-white p-12 text-center shadow-sm ring-1 ring-gray-100">
            <p className="text-gray-500">Заявки не найдены</p>
          </div>
        ) : (
          inquiries.map((inquiry) => (
            <Link
              key={inquiry.id}
              href={`/admin/${inquiry.id}`}
              className="block rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100 transition-all hover:shadow-md hover:ring-primary-200"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Badge status={inquiry.status} />
                    <span className="font-semibold text-gray-900">
                      {inquiry.company_name}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1.5">
                      <Building className="h-4 w-4" />
                      {inquiry.width_meters && inquiry.length_meters
                        ? `${inquiry.width_meters * inquiry.length_meters}м²`
                        : inquiry.area_sqm
                        ? `${inquiry.area_sqm}м²`
                        : '—'}{' '}
                      • {inquiry.stand_type ? formatStandType(inquiry.stand_type) : '—'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <DollarSign className="h-4 w-4" />
                      {inquiry.budget_range ? formatBudget(inquiry.budget_range) : '—'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      {formatDateTime(inquiry.created_at)}
                    </span>
                  </div>

                  <div className="text-sm">
                    <span className="text-gray-500">Контакт:</span>{' '}
                    <span className="text-gray-900">{inquiry.name}</span> •{' '}
                    <span className="text-gray-600">{inquiry.phone}</span>
                  </div>
                </div>

                {inquiry.generated_images && inquiry.generated_images.length > 0 && (
                  <div className="flex items-center gap-2">
                    {inquiry.selected_image_index !== undefined && inquiry.selected_image_index !== null && (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-xs font-medium">Выбран</span>
                      </div>
                    )}
                    <div className="flex -space-x-2">
                      {inquiry.generated_images.slice(0, 3).map((_, i) => (
                        <div
                          key={i}
                          className={`h-12 w-12 rounded-lg ring-2 ring-white ${
                            inquiry.selected_image_index === i
                              ? 'bg-primary-200 ring-primary-500'
                              : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            leftIcon={<ChevronLeft className="h-4 w-4" />}
          >
            Назад
          </Button>

          <span className="text-sm text-gray-600">
            Страница {page} из {totalPages}
          </span>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            rightIcon={<ChevronRight className="h-4 w-4" />}
          >
            Вперёд
          </Button>
        </div>
      )}
    </div>
  )
}
