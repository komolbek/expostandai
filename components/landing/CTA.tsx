'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { ArrowRight, Sparkles } from 'lucide-react'

export function CTA() {
  return (
    <section className="bg-white py-20 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 to-primary-800 px-6 py-16 sm:px-16 sm:py-24">
          {/* Background decoration */}
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-primary-400/20 blur-3xl" />

          <div className="relative mx-auto max-w-2xl text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
              <Sparkles className="h-8 w-8 text-white" />
            </div>

            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Готовы создать свой стенд?
            </h2>
            <p className="mt-4 text-lg text-primary-100">
              Начните прямо сейчас — это бесплатно и займёт всего 5 минут.
              Никакой регистрации не требуется.
            </p>

            <div className="mt-10">
              <Link href="/chat">
                <Button
                  size="lg"
                  variant="secondary"
                  rightIcon={<ArrowRight className="h-5 w-5" />}
                  className="bg-white text-primary-700 hover:bg-primary-50"
                >
                  Создать дизайн стенда
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
