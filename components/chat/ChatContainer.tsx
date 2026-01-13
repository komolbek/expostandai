'use client'

import { useState, useRef, useEffect } from 'react'
import { ArrowLeft, Send, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { MessageBubble } from './MessageBubble'
import { QuickReplies } from './QuickReplies'
import { GeneratedImages } from './GeneratedImages'
import { ContactForm } from './ContactForm'
import { FileUpload } from './FileUpload'
import { Button } from '@/components/ui/Button'
import type { ChatMessage, ChatState, UploadedFile } from '@/lib/types'
import { generateId } from '@/lib/utils'

export function ChatContainer() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [chatState, setChatState] = useState<ChatState>({
    phase: 'greeting',
    collectedData: {},
    isComplete: false,
  })
  const [currentQuickReplies, setCurrentQuickReplies] = useState<string[]>([])
  const [isMultiSelect, setIsMultiSelect] = useState(false)
  const [selectedMulti, setSelectedMulti] = useState<string[]>([])

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<string[]>([])
  const [showContactForm, setShowContactForm] = useState(false)
  const [inquirySubmitted, setInquirySubmitted] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  // Initial greeting
  useEffect(() => {
    const initChat = async () => {
      setIsLoading(true)
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [],
            currentState: chatState,
          }),
        })

        if (!response.ok) throw new Error('Failed to initialize chat')

        const data = await response.json()

        const aiMessage: ChatMessage = {
          id: generateId(),
          role: 'assistant',
          content: data.message,
          timestamp: new Date().toISOString(),
        }

        setMessages([aiMessage])
        setChatState(data.updatedState)
        setCurrentQuickReplies(data.quickReplies || [])
        setIsMultiSelect(data.multiSelect || false)
      } catch (error) {
        console.error('Failed to initialize chat:', error)
        // Fallback greeting
        const fallbackMessage: ChatMessage = {
          id: generateId(),
          role: 'assistant',
          content:
            'Привет! 👋 Я помогу вам создать дизайн выставочного стенда. Давайте начнём! Как называется ваша компания?',
          timestamp: new Date().toISOString(),
        }
        setMessages([fallbackMessage])
        setChatState({
          phase: 'company_name',
          collectedData: {},
          isComplete: false,
        })
      } finally {
        setIsLoading(false)
      }
    }

    initChat()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return

    // Add user message
    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toISOString(),
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInputValue('')
    setCurrentQuickReplies([])
    setSelectedMulti([])
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          currentState: chatState,
        }),
      })

      if (!response.ok) throw new Error('Failed to send message')

      const data = await response.json()

      const aiMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, aiMessage])
      setChatState(data.updatedState)
      setCurrentQuickReplies(data.quickReplies || [])
      setIsMultiSelect(data.multiSelect || false)
    } catch (error) {
      console.error('Failed to send message:', error)
      const errorMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: 'Извините, произошла ошибка. Попробуйте ещё раз.',
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleQuickReply = (reply: string) => {
    if (isMultiSelect) {
      setSelectedMulti((prev) =>
        prev.includes(reply) ? prev.filter((r) => r !== reply) : [...prev, reply]
      )
    } else {
      sendMessage(reply)
    }
  }

  const handleMultiSelectConfirm = () => {
    if (selectedMulti.length > 0) {
      sendMessage(selectedMulti.join(', '))
    }
  }

  const handleGenerateDesigns = async () => {
    setIsGenerating(true)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inquiryData: chatState.collectedData,
        }),
      })

      if (!response.ok) throw new Error('Failed to generate designs')

      const data = await response.json()
      setGeneratedImages(data.images.map((img: { url: string }) => img.url))

      const successMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content:
          'Отлично! Вот несколько вариантов дизайна вашего стенда. Если вам нравится один из них, вы можете оставить заявку, и мы свяжемся с вами для обсуждения деталей.',
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, successMessage])
    } catch (error) {
      console.error('Failed to generate designs:', error)
      const errorMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content:
          'К сожалению, не удалось сгенерировать дизайны. Вы всё равно можете оставить заявку, и мы создадим визуализации вручную.',
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSubmitInquiry = () => {
    setShowContactForm(true)
  }

  const handleContactFormSubmit = async (contactInfo: {
    name: string
    phone: string
    email?: string
  }) => {
    try {
      const response = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactInfo,
          inquiryData: chatState.collectedData,
          generatedImages,
          conversationLog: messages,
        }),
      })

      if (!response.ok) throw new Error('Failed to submit inquiry')

      setInquirySubmitted(true)
      setShowContactForm(false)

      const successMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: `Спасибо, ${contactInfo.name}! 🎉 Ваша заявка успешно отправлена. Мы свяжемся с вами в течение 24 часов для обсуждения деталей и предоставления коммерческого предложения.`,
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, successMessage])
    } catch (error) {
      console.error('Failed to submit inquiry:', error)
      alert('Произошла ошибка при отправке заявки. Попробуйте ещё раз.')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(inputValue)
    }
  }

  // Handle file uploads for brand materials
  const handleBrandFilesUpload = (files: UploadedFile[]) => {
    setChatState((prev) => ({
      ...prev,
      collectedData: {
        ...prev.collectedData,
        brand_files: files,
      },
      phase: 'previous_stand_upload',
    }))

    const fileNames = files.map((f) => f.name).join(', ')
    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: `Загружено ${files.length} файл(ов): ${fileNames}`,
      timestamp: new Date().toISOString(),
    }
    const aiMsg: ChatMessage = {
      id: generateId(),
      role: 'assistant',
      content: 'Отлично! Теперь, если вы уже участвовали на выставках, загрузите фото вашего предыдущего стенда. Это поможет нам лучше понять ваши предпочтения.',
      timestamp: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, userMsg, aiMsg])
  }

  const handleBrandFilesSkip = () => {
    setChatState((prev) => ({
      ...prev,
      phase: 'previous_stand_upload',
    }))
    const aiMsg: ChatMessage = {
      id: generateId(),
      role: 'assistant',
      content: 'Хорошо! Если вы уже участвовали на выставках, загрузите фото вашего предыдущего стенда. Это поможет нам лучше понять ваши предпочтения.',
      timestamp: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, aiMsg])
  }

  // Handle file uploads for previous stand photos
  const handlePreviousStandUpload = (files: UploadedFile[]) => {
    setChatState((prev) => ({
      ...prev,
      collectedData: {
        ...prev.collectedData,
        previous_stand_files: files,
      },
      phase: 'budget',
    }))

    const fileNames = files.map((f) => f.name).join(', ')
    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: `Загружено ${files.length} фото: ${fileNames}`,
      timestamp: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, userMsg])

    // Continue to next question via API
    sendMessage('Продолжить')
  }

  const handlePreviousStandSkip = () => {
    setChatState((prev) => ({
      ...prev,
      phase: 'budget',
    }))
    sendMessage('Продолжить')
  }

  // Check if we're in a file upload phase
  const isFileUploadPhase = chatState.phase === 'brand_files_upload' || chatState.phase === 'previous_stand_upload'

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* Header */}
      <header className="flex items-center gap-4 border-b border-gray-200 bg-white px-4 py-3">
        <Link href="/" className="btn-ghost p-2">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="font-semibold text-gray-900">Создание стенда</h1>
          <p className="text-sm text-gray-500">ИИ-помощник ExpoCity</p>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mx-auto max-w-2xl space-y-4">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-gray-500">
              <div className="flex gap-1">
                <span className="typing-dot h-2 w-2 rounded-full bg-gray-400" />
                <span className="typing-dot h-2 w-2 rounded-full bg-gray-400" />
                <span className="typing-dot h-2 w-2 rounded-full bg-gray-400" />
              </div>
            </div>
          )}

          {/* Generated Images */}
          {generatedImages.length > 0 && (
            <GeneratedImages images={generatedImages} />
          )}

          {/* Generation Loading */}
          {isGenerating && (
            <div className="rounded-xl bg-white p-6 text-center shadow-sm">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary-600" />
              <p className="mt-3 font-medium text-gray-900">Генерируем дизайны...</p>
              <p className="mt-1 text-sm text-gray-500">
                Это может занять 30-60 секунд
              </p>
            </div>
          )}

          {/* File Upload - Brand Materials */}
          {chatState.phase === 'brand_files_upload' && (
            <FileUpload
              title="Фирменный стиль"
              description="Загрузите логотипы и торговые марки (форматы EPS, CDR, AI), брендбук, полиграфию"
              maxFiles={20}
              acceptedTypes=".eps,.cdr,.ai,.pdf,.png,.jpg,.jpeg,.svg"
              onFilesSelected={handleBrandFilesUpload}
              onSkip={handleBrandFilesSkip}
            />
          )}

          {/* File Upload - Previous Stand Photos */}
          {chatState.phase === 'previous_stand_upload' && (
            <FileUpload
              title="Предыдущий стенд"
              description="Если вы участвовали на выставках раньше, загрузите фото вашего стенда"
              maxFiles={20}
              acceptedTypes=".png,.jpg,.jpeg,.webp,.heic"
              onFilesSelected={handlePreviousStandUpload}
              onSkip={handlePreviousStandSkip}
            />
          )}

          {/* Contact Form */}
          {showContactForm && (
            <ContactForm
              onSubmit={handleContactFormSubmit}
              onCancel={() => setShowContactForm(false)}
              initialData={{
                company: chatState.collectedData.company_name,
              }}
            />
          )}

          {/* Action Buttons */}
          {chatState.isComplete && !isGenerating && !showContactForm && !inquirySubmitted && (
            <div className="flex flex-col gap-3 sm:flex-row">
              {generatedImages.length === 0 ? (
                <Button onClick={handleGenerateDesigns} className="flex-1">
                  Сгенерировать дизайн
                </Button>
              ) : (
                <>
                  <Button onClick={handleSubmitInquiry} className="flex-1">
                    Оставить заявку
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handleGenerateDesigns}
                    className="flex-1"
                  >
                    Сгенерировать заново
                  </Button>
                </>
              )}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick Replies */}
      {currentQuickReplies.length > 0 && !isLoading && (
        <QuickReplies
          options={currentQuickReplies}
          onSelect={handleQuickReply}
          selected={selectedMulti}
          multiSelect={isMultiSelect}
          onConfirm={handleMultiSelectConfirm}
        />
      )}

      {/* Input */}
      {!chatState.isComplete && !showContactForm && !isFileUploadPhase && (
        <div className="border-t border-gray-200 bg-white p-4">
          <div className="mx-auto flex max-w-2xl gap-3">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Введите сообщение..."
              className="input flex-1"
              disabled={isLoading}
            />
            <Button
              onClick={() => sendMessage(inputValue)}
              disabled={!inputValue.trim() || isLoading}
              leftIcon={<Send className="h-4 w-4" />}
            >
              Отправить
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
