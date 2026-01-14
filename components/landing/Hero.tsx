'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { ArrowRight } from 'lucide-react'

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary-50 to-white pt-32 pb-10 sm:pt-40 sm:pb-12">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-1/4 h-72 w-72 rounded-full bg-primary-200/30 blur-3xl" />
        <div className="absolute top-40 right-1/4 h-96 w-96 rounded-full bg-blue-200/20 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          {/* Headline */}
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            Дизайн выставочного стенда{' '}
            <span className="text-primary-600">с ИИ</span>
          </h1>

          {/* Subheadline */}
          <p className="mt-6 text-lg leading-8 text-gray-600 sm:text-xl">
            Опишите свои требования и получите визуализацию стенда за несколько минут
          </p>

          {/* CTA */}
          <div className="mt-10">
            <Link href="/chat">
              <Button size="lg" rightIcon={<ArrowRight className="h-5 w-5" />}>
                Начать
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
