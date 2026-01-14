'use client'

import { MessageSquare, Wand2, FileText } from 'lucide-react'

const steps = [
  {
    number: '01',
    title: 'Расскажите о стенде',
    description:
      'Ответьте на вопросы ИИ-помощника о вашей компании, выставке, желаемом стиле и бюджете.',
    icon: MessageSquare,
    color: 'bg-blue-100 text-blue-600',
  },
  {
    number: '02',
    title: 'ИИ создаст варианты',
    description:
      'На основе ваших требований искусственный интеллект сгенерирует несколько уникальных дизайнов.',
    icon: Wand2,
    color: 'bg-purple-100 text-purple-600',
  },
  {
    number: '03',
    title: 'Получите расчёт',
    description:
      'Выберите понравившийся вариант и оставьте заявку. Мы свяжемся с вами в течение 24 часов.',
    icon: FileText,
    color: 'bg-green-100 text-green-600',
  },
]

export function HowItWorks() {
  return (
    <section className="bg-white pt-10 pb-20 sm:pt-16 sm:pb-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Как это работает
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Три простых шага от идеи до готового дизайна
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-5xl">
          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.number} className="relative">
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="absolute top-12 left-1/2 hidden h-0.5 w-full bg-gradient-to-r from-gray-200 to-gray-200 md:block" />
                )}

                <div className="relative flex flex-col items-center text-center">
                  {/* Icon */}
                  <div
                    className={`relative z-10 flex h-24 w-24 items-center justify-center rounded-2xl ${step.color}`}
                  >
                    <step.icon className="h-10 w-10" />
                  </div>

                  {/* Number badge */}
                  <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white">
                    {step.number}
                  </div>

                  {/* Content */}
                  <h3 className="mt-6 text-xl font-semibold text-gray-900">{step.title}</h3>
                  <p className="mt-3 text-gray-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
