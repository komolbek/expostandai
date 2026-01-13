'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Sparkles, ArrowRight } from 'lucide-react'

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary-50 to-white pt-32 pb-20 sm:pt-40 sm:pb-32">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-1/4 h-72 w-72 rounded-full bg-primary-200/30 blur-3xl" />
        <div className="absolute top-40 right-1/4 h-96 w-96 rounded-full bg-blue-200/20 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary-100 px-4 py-2 text-sm font-medium text-primary-700">
            <Sparkles className="h-4 w-4" />
            <span>Дизайн с искусственным интеллектом</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            Создайте дизайн выставочного стенда{' '}
            <span className="text-primary-600">за 5 минут</span>
          </h1>

          {/* Subheadline */}
          <p className="mt-6 text-lg leading-8 text-gray-600 sm:text-xl">
            ИИ-помощник соберёт ваши требования и сгенерирует несколько вариантов
            дизайна стенда. Быстро, удобно, без долгих форм.
          </p>

          {/* CTA */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/chat">
              <Button size="lg" rightIcon={<ArrowRight className="h-5 w-5" />}>
                Создать стенд с ИИ
              </Button>
            </Link>
            <span className="text-sm text-gray-500">Бесплатно • Без регистрации</span>
          </div>
        </div>

        {/* Hero image placeholder */}
        <div className="mt-16 sm:mt-24">
          <div className="relative mx-auto max-w-5xl">
            <div className="aspect-video overflow-hidden rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 shadow-2xl ring-1 ring-gray-200">
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100">
                    <Sparkles className="h-8 w-8 text-primary-600" />
                  </div>
                  <p className="text-gray-500">Пример сгенерированного стенда</p>
                </div>
              </div>
            </div>

            {/* Floating cards */}
            <div className="absolute -left-4 top-1/4 hidden rounded-xl bg-white p-4 shadow-lg ring-1 ring-gray-100 lg:block">
              <p className="text-sm font-medium text-gray-900">36 м²</p>
              <p className="text-xs text-gray-500">Площадь стенда</p>
            </div>
            <div className="absolute -right-4 top-1/3 hidden rounded-xl bg-white p-4 shadow-lg ring-1 ring-gray-100 lg:block">
              <p className="text-sm font-medium text-gray-900">Hi-Tech</p>
              <p className="text-xs text-gray-500">Стиль оформления</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
