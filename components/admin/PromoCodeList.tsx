'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Dialog } from '@/components/ui/Dialog'
import type { PromoCode } from '@/lib/types'
import {
  RefreshCw,
  Plus,
  Copy,
  Trash2,
  Check,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react'

export function PromoCodeList() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Create form state
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [expiresAt, setExpiresAt] = useState('')
  const [maxGenerations, setMaxGenerations] = useState('5')

  // Dialog states
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [showErrorDialog, setShowErrorDialog] = useState(false)
  const [errorDialogMessage, setErrorDialogMessage] = useState('')

  const fetchPromoCodes = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/promo-codes')

      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = '/admin/login'
          return
        }
        throw new Error('Failed to fetch promo codes')
      }

      const data = await response.json()
      setPromoCodes(data.promoCodes)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPromoCodes()
  }, [])

  const handleCreate = async () => {
    setIsCreating(true)

    try {
      const response = await fetch('/api/admin/promo-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expires_at: expiresAt || undefined,
          max_generations: parseInt(maxGenerations) || 5,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create promo code')
      }

      await fetchPromoCodes()
      setShowCreateForm(false)
      setExpiresAt('')
      setMaxGenerations('5')
    } catch (err) {
      setErrorDialogMessage('Ошибка при создании промокода')
      setShowErrorDialog(true)
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteClick = (id: string) => {
    setDeleteId(id)
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteId) return

    try {
      const response = await fetch(`/api/admin/promo-codes?id=${deleteId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete promo code')
      }

      await fetchPromoCodes()
    } catch (err) {
      setErrorDialogMessage('Ошибка при удалении промокода')
      setShowErrorDialog(true)
    }
  }

  const handleCopy = async (code: string, id: string) => {
    await navigator.clipboard.writeText(code)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false
    return new Date(expiresAt) < new Date()
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Промокоды</h1>
          <p className="text-gray-600">
            Промокоды дают клиентам до 5 генераций вместо 2
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={fetchPromoCodes}
            leftIcon={
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            }
          >
            Обновить
          </Button>
          <Button
            size="sm"
            onClick={() => setShowCreateForm(!showCreateForm)}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Создать
          </Button>
        </div>
      </div>

      {/* Create form */}
      {showCreateForm && (
        <div className="mb-6 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Новый промокод
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Максимум генераций"
              type="number"
              value={maxGenerations}
              onChange={(e) => setMaxGenerations(e.target.value)}
              placeholder="5"
              min={1}
              max={10}
            />
            <Input
              label="Срок действия (опционально)"
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
            />
          </div>
          <div className="mt-4 flex gap-2">
            <Button onClick={handleCreate} loading={isCreating}>
              Создать промокод
            </Button>
            <Button variant="secondary" onClick={() => setShowCreateForm(false)}>
              Отмена
            </Button>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-600">{error}</div>
      )}

      {/* List */}
      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="shimmer h-20 rounded-xl" />
          ))
        ) : promoCodes.length === 0 ? (
          <div className="rounded-xl bg-white p-12 text-center shadow-sm ring-1 ring-gray-100">
            <p className="text-gray-500">Промокоды не созданы</p>
            <Button
              className="mt-4"
              onClick={() => setShowCreateForm(true)}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Создать первый промокод
            </Button>
          </div>
        ) : (
          promoCodes.map((promo) => (
            <div
              key={promo.id}
              className={`rounded-xl bg-white p-4 shadow-sm ring-1 ${
                promo.is_used
                  ? 'ring-gray-200 bg-gray-50'
                  : isExpired(promo.expires_at)
                  ? 'ring-red-200 bg-red-50'
                  : 'ring-gray-100'
              }`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  {/* Status indicator */}
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      promo.is_used
                        ? 'bg-gray-200'
                        : isExpired(promo.expires_at)
                        ? 'bg-red-100'
                        : 'bg-green-100'
                    }`}
                  >
                    {promo.is_used ? (
                      <CheckCircle className="h-5 w-5 text-gray-500" />
                    ) : isExpired(promo.expires_at) ? (
                      <XCircle className="h-5 w-5 text-red-500" />
                    ) : (
                      <Clock className="h-5 w-5 text-green-600" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <code className="text-lg font-bold text-gray-900">
                        {promo.code}
                      </code>
                      <button
                        onClick={() => handleCopy(promo.code, promo.id)}
                        className="rounded p-1 hover:bg-gray-100"
                        title="Копировать"
                      >
                        {copiedId === promo.id ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-gray-500">
                      <span>До {promo.max_generations} генераций</span>
                      <span>•</span>
                      <span>Создан: {formatDate(promo.created_at)}</span>
                      {promo.expires_at && (
                        <>
                          <span>•</span>
                          <span
                            className={
                              isExpired(promo.expires_at) ? 'text-red-500' : ''
                            }
                          >
                            Истекает: {formatDate(promo.expires_at)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {promo.is_used ? (
                    <div className="rounded-full bg-gray-200 px-3 py-1 text-sm font-medium text-gray-600">
                      Использован
                    </div>
                  ) : isExpired(promo.expires_at) ? (
                    <div className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-600">
                      Истёк
                    </div>
                  ) : (
                    <div className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                      Активен
                    </div>
                  )}
                  <button
                    onClick={() => handleDeleteClick(promo.id)}
                    className="rounded p-2 text-gray-400 hover:bg-red-50 hover:text-red-500"
                    title="Удалить"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Usage info */}
              {promo.is_used && promo.used_at && (
                <div className="mt-3 border-t border-gray-200 pt-3 text-sm text-gray-500">
                  <div className="flex flex-wrap gap-x-2 gap-y-1">
                    <span>
                      <span className="font-medium">Использован:</span>{' '}
                      {formatDate(promo.used_at)}
                    </span>
                    {promo.used_by_phone && (
                      <span className="text-green-600 font-medium">
                        📞 {promo.used_by_phone}
                      </span>
                    )}
                    {promo.used_by_ip && <span>• IP: {promo.used_by_ip}</span>}
                  </div>
                  {promo.used_by_user_agent && (
                    <div className="mt-1 text-xs text-gray-400 truncate max-w-full" title={promo.used_by_user_agent}>
                      Устройство: {promo.used_by_user_agent}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modern Dialogs */}
      <Dialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteConfirm}
        title="Удалить промокод?"
        variant="warning"
        confirmText="Удалить"
        cancelText="Отмена"
      >
        <p className="text-sm text-gray-600">
          Вы уверены, что хотите удалить этот промокод? Это действие нельзя отменить.
        </p>
      </Dialog>

      <Dialog
        isOpen={showErrorDialog}
        onClose={() => setShowErrorDialog(false)}
        title="Ошибка"
        variant="error"
        confirmText="Закрыть"
        showCancel={false}
      >
        <p className="text-sm text-gray-600">{errorDialogMessage}</p>
      </Dialog>
    </div>
  )
}
