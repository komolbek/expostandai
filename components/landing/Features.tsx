'use client'

import { Clock, Palette, Shield, Zap, MessageSquare, ImageIcon } from 'lucide-react'

const features = [
  {
    icon: Clock,
    title: '5 минут вместо часов',
    description: 'Быстрый диалог с ИИ вместо заполнения длинных форм',
  },
  {
    icon: Palette,
    title: 'Уникальные дизайны',
    description: 'Каждый проект создаётся индивидуально под ваши требования',
  },
  {
    icon: ImageIcon,
    title: '3D визуализация',
    description: 'Фотореалистичные изображения стенда для оценки результата',
  },
  {
    icon: MessageSquare,
    title: 'Естественный диалог',
    description: 'Общайтесь с ИИ как с живым консультантом',
  },
  {
    icon: Zap,
    title: 'Мгновенный результат',
    description: 'Получите визуализации сразу после описания требований',
  },
  {
    icon: Shield,
    title: 'Без обязательств',
    description: 'Бесплатно создавайте дизайны и решайте позже',
  },
]

export function Features() {
  return (
    <section className="bg-gray-50 py-20 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Почему выбирают нас
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Современный подход к проектированию выставочных стендов
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-5xl">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 transition-all hover:shadow-md hover:ring-primary-100"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 text-primary-600 transition-colors group-hover:bg-primary-600 group-hover:text-white">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">{feature.title}</h3>
                <p className="mt-2 text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
