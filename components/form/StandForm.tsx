'use client'

import { useState } from 'react'
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { StepCompanyInfo } from './steps/StepCompanyInfo'
import { StepExhibitionInfo } from './steps/StepExhibitionInfo'
import { StepStandSpecs } from './steps/StepStandSpecs'
import { StepDesignPrefs } from './steps/StepDesignPrefs'
import { StepZonesElements } from './steps/StepZonesElements'
import { StepFilesUpload } from './steps/StepFilesUpload'
import { StepBudgetNotes } from './steps/StepBudgetNotes'
import { StepContactInfo } from './steps/StepContactInfo'
import { GeneratedImages } from '@/components/chat/GeneratedImages'
import type { InquiryData, UploadedFile, ContactInfo } from '@/lib/types'

const STEPS = [
  { id: 'company', title: 'Компания', description: 'Информация о компании' },
  { id: 'exhibition', title: 'Выставка', description: 'Детали выставки' },
  { id: 'specs', title: 'Параметры', description: 'Размер и тип стенда' },
  { id: 'design', title: 'Дизайн', description: 'Стиль и высота' },
  { id: 'zones', title: 'Зоны', description: 'Функциональные зоны' },
  { id: 'files', title: 'Файлы', description: 'Логотипы и фото' },
  { id: 'budget', title: 'Бюджет', description: 'Бюджет и пожелания' },
  { id: 'contact', title: 'Контакты', description: 'Контактная информация' },
]

export function StandForm() {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<Partial<InquiryData>>({})
  const [contactInfo, setContactInfo] = useState<ContactInfo>({ name: '', phone: '' })

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  const updateFormData = (data: Partial<InquiryData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleGenerateDesigns = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inquiryData: formData }),
      })

      if (!response.ok) throw new Error('Failed to generate designs')

      const data = await response.json()
      setGeneratedImages(data.images.map((img: { url: string }) => img.url))
    } catch (error) {
      console.error('Failed to generate designs:', error)
      alert('Не удалось сгенерировать дизайны. Попробуйте ещё раз или оставьте заявку без визуализации.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactInfo,
          inquiryData: formData,
          generatedImages,
          conversationLog: [],
        }),
      })

      if (!response.ok) throw new Error('Failed to submit inquiry')

      setIsComplete(true)
    } catch (error) {
      console.error('Failed to submit inquiry:', error)
      alert('Произошла ошибка при отправке заявки. Попробуйте ещё раз.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStep = () => {
    switch (STEPS[currentStep].id) {
      case 'company':
        return <StepCompanyInfo data={formData} onChange={updateFormData} />
      case 'exhibition':
        return <StepExhibitionInfo data={formData} onChange={updateFormData} />
      case 'specs':
        return <StepStandSpecs data={formData} onChange={updateFormData} />
      case 'design':
        return <StepDesignPrefs data={formData} onChange={updateFormData} />
      case 'zones':
        return <StepZonesElements data={formData} onChange={updateFormData} />
      case 'files':
        return <StepFilesUpload data={formData} onChange={updateFormData} />
      case 'budget':
        return <StepBudgetNotes data={formData} onChange={updateFormData} />
      case 'contact':
        return (
          <StepContactInfo
            data={contactInfo}
            onChange={setContactInfo}
            companyName={formData.company_name}
          />
        )
      default:
        return null
    }
  }

  const isStepValid = () => {
    switch (STEPS[currentStep].id) {
      case 'company':
        return formData.company_name && formData.products_services
      case 'exhibition':
        return true // Optional
      case 'specs':
        return formData.area_sqm && formData.stand_type && formData.staff_count
      case 'design':
        return formData.style && formData.height_meters && formData.main_goal
      case 'zones':
        return formData.zones && formData.zones.length > 0
      case 'files':
        return true // Optional
      case 'budget':
        return formData.budget_range
      case 'contact':
        return contactInfo.name && contactInfo.phone
      default:
        return true
    }
  }

  if (isComplete) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50">
        <header className="flex items-center gap-4 border-b border-gray-200 bg-white px-4 py-3">
          <Link href="/" className="btn-ghost p-2">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="font-semibold text-gray-900">Заявка отправлена</h1>
        </header>
        <div className="flex flex-1 items-center justify-center p-4">
          <div className="max-w-md text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Спасибо за заявку!</h2>
            <p className="mt-4 text-gray-600">
              Мы свяжемся с вами в течение 24 часов для обсуждения деталей и предоставления коммерческого предложения.
            </p>
            <Link href="/">
              <Button className="mt-8">На главную</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const isLastStep = currentStep === STEPS.length - 1

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-3xl items-center gap-4">
          <Link href="/" className="btn-ghost p-2">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex-1">
            <h1 className="font-semibold text-gray-900">Создание стенда</h1>
            <p className="text-sm text-gray-500">
              Шаг {currentStep + 1} из {STEPS.length}: {STEPS[currentStep].title}
            </p>
          </div>
        </div>
      </header>

      {/* Progress bar */}
      <div className="bg-white px-4 pb-4">
        <div className="mx-auto max-w-3xl">
          <div className="flex gap-1">
            {STEPS.map((step, index) => (
              <div
                key={step.id}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  index <= currentStep ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mx-auto max-w-3xl">
          {renderStep()}

          {/* Generated Images */}
          {generatedImages.length > 0 && isLastStep && (
            <div className="mt-6">
              <GeneratedImages images={generatedImages} />
            </div>
          )}

          {/* Generation Loading */}
          {isGenerating && (
            <div className="mt-6 rounded-xl bg-white p-6 text-center shadow-sm">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary-600" />
              <p className="mt-3 font-medium text-gray-900">Генерируем дизайны...</p>
              <p className="mt-1 text-sm text-gray-500">Это может занять 30-60 секунд</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer with navigation */}
      <div className="border-t border-gray-200 bg-white p-4">
        <div className="mx-auto flex max-w-3xl gap-3">
          {currentStep > 0 && (
            <Button variant="secondary" onClick={prevStep} leftIcon={<ArrowLeft className="h-4 w-4" />}>
              Назад
            </Button>
          )}
          <div className="flex-1" />

          {isLastStep ? (
            <div className="flex gap-3">
              {generatedImages.length === 0 && !isGenerating && (
                <Button variant="secondary" onClick={handleGenerateDesigns}>
                  Сгенерировать дизайн
                </Button>
              )}
              <Button
                onClick={handleSubmit}
                disabled={!isStepValid() || isSubmitting}
                leftIcon={isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              >
                {isSubmitting ? 'Отправка...' : 'Отправить заявку'}
              </Button>
            </div>
          ) : (
            <Button
              onClick={nextStep}
              disabled={!isStepValid()}
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Далее
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
