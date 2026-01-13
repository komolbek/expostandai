'use client'

import { useState, useRef, useEffect } from 'react'
import { ArrowLeft, ArrowRight, Check, Loader2, Building2, Ruler, Palette, LayoutGrid, Upload, Wallet, User, Sparkles, Wand2, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { StepCompanyInfo } from './steps/StepCompanyInfo'
import { StepStandSpecs } from './steps/StepStandSpecs'
import { StepDesignPrefs } from './steps/StepDesignPrefs'
import { StepZonesElements } from './steps/StepZonesElements'
import { StepFilesUpload } from './steps/StepFilesUpload'
import { StepBudgetNotes } from './steps/StepBudgetNotes'
import { StepContactInfo } from './steps/StepContactInfo'
import { GeneratedImages } from '@/components/chat/GeneratedImages'
import type { InquiryData, ContactInfo } from '@/lib/types'

const MAX_GENERATION_REQUESTS = 2

const STEPS = [
  { id: 'company', title: 'Компания', icon: Building2, color: 'from-blue-500 to-blue-600' },
  { id: 'specs', title: 'Параметры', icon: Ruler, color: 'from-violet-500 to-violet-600' },
  { id: 'design', title: 'Дизайн', icon: Palette, color: 'from-pink-500 to-pink-600' },
  { id: 'zones', title: 'Зоны', icon: LayoutGrid, color: 'from-orange-500 to-orange-600' },
  { id: 'files', title: 'Файлы', icon: Upload, color: 'from-teal-500 to-teal-600' },
  { id: 'budget', title: 'Бюджет', icon: Wallet, color: 'from-emerald-500 to-emerald-600' },
  { id: 'contact', title: 'Контакты', icon: User, color: 'from-indigo-500 to-indigo-600' },
  { id: 'preview', title: 'Превью', icon: Sparkles, color: 'from-purple-500 to-fuchsia-600' },
]

export function StandForm() {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<Partial<InquiryData>>({})
  const [contactInfo, setContactInfo] = useState<ContactInfo>({ name: '', phone: '' })

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<string[]>([])
  const [generationCount, setGenerationCount] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  // AbortController for canceling generation
  const abortControllerRef = useRef<AbortController | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  const updateFormData = (data: Partial<InquiryData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }

  const remainingGenerations = MAX_GENERATION_REQUESTS - generationCount

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
    if (remainingGenerations <= 0) {
      alert('Вы использовали все попытки генерации. Пожалуйста, отправьте заявку с текущими дизайнами.')
      return
    }

    // Cancel any ongoing generation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    setIsGenerating(true)
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inquiryData: formData }),
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) throw new Error('Failed to generate designs')

      const data = await response.json()
      setGeneratedImages(data.images.map((img: { url: string }) => img.url))
      setGenerationCount((prev) => prev + 1)
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Generation was cancelled')
        return
      }
      console.error('Failed to generate designs:', error)
      alert('Не удалось сгенерировать дизайны. Попробуйте ещё раз или оставьте заявку без визуализации.')
    } finally {
      setIsGenerating(false)
      abortControllerRef.current = null
    }
  }

  const handleCancelGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
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
      case 'preview':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">AI визуализация стенда</h2>
              <p className="mt-1 text-gray-500">Сгенерируйте предварительные дизайны вашего стенда с помощью ИИ</p>
            </div>

            {/* Generation Limit Warning */}
            <div className={`rounded-xl p-4 flex items-start gap-3 ${
              remainingGenerations === 0
                ? 'bg-red-50 border border-red-200'
                : remainingGenerations === 1
                ? 'bg-amber-50 border border-amber-200'
                : 'bg-blue-50 border border-blue-200'
            }`}>
              <AlertCircle className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                remainingGenerations === 0
                  ? 'text-red-500'
                  : remainingGenerations === 1
                  ? 'text-amber-500'
                  : 'text-blue-500'
              }`} />
              <div>
                <p className={`font-medium ${
                  remainingGenerations === 0
                    ? 'text-red-700'
                    : remainingGenerations === 1
                    ? 'text-amber-700'
                    : 'text-blue-700'
                }`}>
                  {remainingGenerations === 0
                    ? 'Лимит генераций исчерпан'
                    : `Осталось генераций: ${remainingGenerations} из ${MAX_GENERATION_REQUESTS}`}
                </p>
                <p className={`text-sm mt-0.5 ${
                  remainingGenerations === 0
                    ? 'text-red-600'
                    : remainingGenerations === 1
                    ? 'text-amber-600'
                    : 'text-blue-600'
                }`}>
                  {remainingGenerations === 0
                    ? 'Вы можете отправить заявку с текущими дизайнами или без них'
                    : 'Каждая генерация создаёт 3 варианта дизайна'}
                </p>
              </div>
            </div>

            {/* Summary Card */}
            <div className="rounded-xl bg-gradient-to-br from-purple-50 to-fuchsia-50 p-5 border border-purple-100">
              <h3 className="font-semibold text-purple-900 mb-3">Ваш стенд:</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-gray-500">Площадь:</span> <span className="font-medium">{formData.area_sqm} м²</span></div>
                <div><span className="text-gray-500">Тип:</span> <span className="font-medium">{
                  formData.stand_type === 'linear' ? 'Линейный' :
                  formData.stand_type === 'corner' ? 'Угловой' :
                  formData.stand_type === 'peninsula' ? 'Полуостров' :
                  formData.stand_type === 'island' ? 'Остров' :
                  formData.stand_type
                }</span></div>
                <div><span className="text-gray-500">Стиль:</span> <span className="font-medium">{
                  formData.style === 'hi-tech' ? 'Hi-Tech' :
                  formData.style === 'classic' ? 'Классический' :
                  formData.style === 'eco' ? 'Эко' :
                  formData.style === 'minimal' ? 'Минимализм' :
                  formData.style
                }</span></div>
                <div><span className="text-gray-500">Высота:</span> <span className="font-medium">{formData.height_meters} м</span></div>
              </div>
            </div>

            {generatedImages.length === 0 && !isGenerating && remainingGenerations > 0 && (
              <div className="text-center py-8">
                <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-purple-500/30 mb-4">
                  <Wand2 className="h-10 w-10 text-white" />
                </div>
                <p className="text-gray-600 mb-6">
                  Нажмите кнопку ниже, чтобы сгенерировать варианты дизайна вашего стенда с помощью DALL-E 3
                </p>
                <Button
                  onClick={handleGenerateDesigns}
                  className="bg-gradient-to-r from-purple-500 to-fuchsia-600 hover:opacity-90 border-0"
                  leftIcon={<Sparkles className="h-4 w-4" />}
                >
                  Сгенерировать дизайн
                </Button>
              </div>
            )}

            {isGenerating && (
              <div className="text-center py-8">
                <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-purple-500/30 mb-4">
                  <Loader2 className="h-10 w-10 animate-spin text-white" />
                </div>
                <p className="font-semibold text-gray-900">Генерируем дизайны...</p>
                <p className="text-sm text-gray-500 mt-1">Это может занять 30-60 секунд</p>
                <p className="text-xs text-gray-400 mt-2">Пожалуйста, не закрывайте страницу</p>
                <Button
                  variant="secondary"
                  onClick={handleCancelGeneration}
                  className="mt-4"
                  size="sm"
                >
                  Отменить
                </Button>
              </div>
            )}

            {generatedImages.length > 0 && !isGenerating && (
              <div>
                <GeneratedImages images={generatedImages} />
                {remainingGenerations > 0 && (
                  <div className="mt-4 text-center">
                    <Button
                      variant="secondary"
                      onClick={handleGenerateDesigns}
                      disabled={isGenerating}
                      leftIcon={<Sparkles className="h-4 w-4" />}
                    >
                      Сгенерировать заново ({remainingGenerations} осталось)
                    </Button>
                  </div>
                )}
              </div>
            )}

            {generatedImages.length === 0 && !isGenerating && remainingGenerations === 0 && (
              <div className="text-center py-8">
                <div className="mx-auto h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                  <Wand2 className="h-10 w-10 text-gray-400" />
                </div>
                <p className="text-gray-600">
                  Лимит генераций исчерпан. Вы можете отправить заявку, и мы создадим визуализации вручную.
                </p>
              </div>
            )}
          </div>
        )
      default:
        return null
    }
  }

  const isStepValid = () => {
    switch (STEPS[currentStep].id) {
      case 'company':
        return formData.company_name && formData.products_services
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
      case 'preview':
        return true // Optional - can proceed without generating (this is now the last step)
      default:
        return true
    }
  }

  if (isComplete) {
    return (
      <div className="flex min-h-screen flex-col bg-gradient-to-br from-gray-50 to-gray-100">
        <header className="flex items-center gap-4 border-b border-gray-200 bg-white/80 backdrop-blur-sm px-4 py-3">
          <Link href="/" className="btn-ghost p-2">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="font-semibold text-gray-900">Заявка отправлена</h1>
        </header>
        <div className="flex flex-1 items-center justify-center p-4">
          <div className="max-w-md text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg shadow-green-500/30">
              <Check className="h-10 w-10 text-white" />
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
  const CurrentIcon = STEPS[currentStep].icon

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header with gradient accent */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className={`h-1 bg-gradient-to-r ${STEPS[currentStep].color}`} />
        <div className="px-4 py-3">
          <div className="mx-auto flex max-w-3xl items-center gap-4">
            <Link href="/" className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${STEPS[currentStep].color} text-white shadow-sm`}>
                  <CurrentIcon className="h-4 w-4" />
                </div>
                <h1 className="font-semibold text-gray-900">{STEPS[currentStep].title}</h1>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Шаг {currentStep + 1} из {STEPS.length}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Step indicators */}
      <div className="bg-white/50 px-4 py-4 border-b border-gray-100">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center justify-between gap-2">
            {STEPS.map((step, index) => {
              const StepIcon = step.icon
              const isActive = index === currentStep
              const isCompleted = index < currentStep
              return (
                <div key={step.id} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 ${
                      isActive
                        ? `bg-gradient-to-br ${step.color} text-white shadow-lg scale-110`
                        : isCompleted
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <StepIcon className="h-5 w-5" />
                    )}
                  </div>
                  <span className={`text-xs font-medium hidden sm:block ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                    {step.title}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
            {renderStep()}
          </div>
        </div>
      </div>

      {/* Footer with navigation */}
      <div className="border-t border-gray-200 bg-white/80 backdrop-blur-sm p-4">
        <div className="mx-auto flex max-w-3xl gap-3">
          {currentStep > 0 && (
            <Button variant="secondary" onClick={prevStep} leftIcon={<ArrowLeft className="h-4 w-4" />} disabled={isGenerating}>
              Назад
            </Button>
          )}
          <div className="flex-1" />

          {isLastStep ? (
            <Button
              onClick={handleSubmit}
              disabled={!isStepValid() || isSubmitting || isGenerating}
              leftIcon={isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:opacity-90 border-0"
            >
              {isSubmitting ? 'Отправка...' : generatedImages.length > 0 ? 'Отправить заявку' : 'Отправить без дизайна'}
            </Button>
          ) : (
            <Button
              onClick={nextStep}
              disabled={!isStepValid() || isGenerating}
              rightIcon={<ArrowRight className="h-4 w-4" />}
              className={`bg-gradient-to-r ${STEPS[currentStep].color} hover:opacity-90 border-0`}
            >
              Далее
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
