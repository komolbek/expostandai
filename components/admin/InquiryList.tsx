'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatDateTime, formatBudget, formatStandType } from '@/lib/utils'
import type { Inquiry } from '@/lib/types'
import { ChevronLeft, ChevronRight, RefreshCw, Building, Calendar, DollarSign, CheckCircle, Search, X } from 'lucide-react'

export function InquiryList() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  // Search and filters
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'completed'>('all')

  const fetchInquiries = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '10',
        status: statusFilter,
      })

      if (searchQuery) params.append('search', searchQuery)
      if (dateFrom) params.append('dateFrom', dateFrom)
      if (dateTo) params.append('dateTo', dateTo)

      const response = await fetch(`/api/admin/inquiries?${params}`)

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
  }, [page, searchQuery, dateFrom, dateTo, statusFilter])

  const handleClearFilters = () => {
    setSearchQuery('')
    setDateFrom('')
    setDateTo('')
    setStatusFilter('all')
    setPage(1)
  }

  const hasActiveFilters = searchQuery || dateFrom || dateTo || statusFilter !== 'all'

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

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        {/* Status Filter Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setStatusFilter('all')
              setPage(1)
            }}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              statusFilter === 'all'
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Все ({total})
          </button>
          <button
            onClick={() => {
              setStatusFilter('new')
              setPage(1)
            }}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              statusFilter === 'new'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`}
          >
            🆕 Новые
          </button>
          <button
            onClick={() => {
              setStatusFilter('completed')
              setPage(1)
            }}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              statusFilter === 'completed'
                ? 'bg-green-600 text-white shadow-sm'
                : 'bg-green-50 text-green-700 hover:bg-green-100'
            }`}
          >
            ✅ Выполненные
          </button>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск по телефону, имени или компании..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setPage(1)
              }}
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 pl-10 pr-4 text-sm shadow-sm transition-all placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>

          {/* Date From */}
          <div className="sm:w-48">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value)
                setPage(1)
              }}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm shadow-sm transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              placeholder="От даты"
            />
          </div>

          {/* Date To */}
          <div className="sm:w-48">
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value)
                setPage(1)
              }}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm shadow-sm transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              placeholder="До даты"
            />
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleClearFilters}
              leftIcon={<X className="h-4 w-4" />}
            >
              Очистить
            </Button>
          )}
        </div>
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
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-xs font-medium">Выбран дизайн</span>
                    </div>
                    <div className="h-12 w-12 rounded-lg bg-primary-200 ring-2 ring-primary-500" />
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
