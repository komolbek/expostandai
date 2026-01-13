'use client'

import { useState, useRef } from 'react'
import { X, FileText, Image } from 'lucide-react'
import type { InquiryData, UploadedFile } from '@/lib/types'
import { generateId } from '@/lib/utils'

interface StepFilesUploadProps {
  data: Partial<InquiryData>
  onChange: (data: Partial<InquiryData>) => void
}

export function StepFilesUpload({ data, onChange }: StepFilesUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const brandInputRef = useRef<HTMLInputElement>(null)
  const standInputRef = useRef<HTMLInputElement>(null)

  const brandFiles = data.brand_files || []
  const previousStandFiles = data.previous_stand_files || []

  const handleFileUpload = async (
    files: FileList,
    type: 'brand' | 'stand'
  ) => {
    setIsUploading(true)
    const uploadedFiles: UploadedFile[] = []

    for (const file of Array.from(files)) {
      try {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (response.ok) {
          const result = await response.json()
          uploadedFiles.push({
            id: generateId(),
            name: file.name,
            url: result.url,
            type: file.type,
            size: file.size,
          })
        }
      } catch (error) {
        console.error('Upload failed:', error)
      }
    }

    if (type === 'brand') {
      onChange({ brand_files: [...brandFiles, ...uploadedFiles] })
    } else {
      onChange({ previous_stand_files: [...previousStandFiles, ...uploadedFiles] })
    }

    setIsUploading(false)
  }

  const removeFile = (type: 'brand' | 'stand', index: number) => {
    if (type === 'brand') {
      const newFiles = brandFiles.filter((_, i) => i !== index)
      onChange({ brand_files: newFiles })
    } else {
      const newFiles = previousStandFiles.filter((_, i) => i !== index)
      onChange({ previous_stand_files: newFiles })
    }
  }

  const handleDrop = (e: React.DragEvent, type: 'brand' | 'stand') => {
    e.preventDefault()
    if (e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files, type)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Файлы и материалы</h2>
        <p className="mt-1 text-gray-500">Загрузите логотипы и фото предыдущего стенда</p>
      </div>

      {/* Brand Files */}
      <div>
        <label className="mb-3 block text-sm font-medium text-gray-700">
          Фирменный стиль
          <span className="ml-2 text-xs text-gray-400">(логотипы, брендбук - до 20 файлов)</span>
        </label>
        <div
          onDrop={(e) => handleDrop(e, 'brand')}
          onDragOver={handleDragOver}
          className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center transition-colors hover:border-primary-400 hover:bg-primary-50/50"
        >
          <FileText className="mx-auto h-10 w-10 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            Перетащите файлы сюда или{' '}
            <button
              type="button"
              onClick={() => brandInputRef.current?.click()}
              className="text-primary-600 hover:underline"
            >
              выберите
            </button>
          </p>
          <p className="mt-1 text-xs text-gray-400">
            EPS, CDR, AI, PDF, PNG, JPG, SVG
          </p>
          <input
            ref={brandInputRef}
            type="file"
            multiple
            accept=".eps,.cdr,.ai,.pdf,.png,.jpg,.jpeg,.svg"
            onChange={(e) => e.target.files && handleFileUpload(e.target.files, 'brand')}
            className="hidden"
          />
        </div>

        {/* Brand Files List */}
        {brandFiles.length > 0 && (
          <div className="mt-3 space-y-2">
            {brandFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg bg-gray-100 px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700 truncate max-w-[200px]">{file.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile('brand', index)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Previous Stand Photos */}
      <div>
        <label className="mb-3 block text-sm font-medium text-gray-700">
          Фото предыдущего стенда
          <span className="ml-2 text-xs text-gray-400">(опционально - до 20 фото)</span>
        </label>
        <div
          onDrop={(e) => handleDrop(e, 'stand')}
          onDragOver={handleDragOver}
          className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center transition-colors hover:border-primary-400 hover:bg-primary-50/50"
        >
          <Image className="mx-auto h-10 w-10 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            Перетащите фото сюда или{' '}
            <button
              type="button"
              onClick={() => standInputRef.current?.click()}
              className="text-primary-600 hover:underline"
            >
              выберите
            </button>
          </p>
          <p className="mt-1 text-xs text-gray-400">
            PNG, JPG, JPEG, WebP, HEIC
          </p>
          <input
            ref={standInputRef}
            type="file"
            multiple
            accept=".png,.jpg,.jpeg,.webp,.heic"
            onChange={(e) => e.target.files && handleFileUpload(e.target.files, 'stand')}
            className="hidden"
          />
        </div>

        {/* Stand Files List */}
        {previousStandFiles.length > 0 && (
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {previousStandFiles.map((file, index) => (
              <div
                key={index}
                className="relative group rounded-lg overflow-hidden bg-gray-100"
              >
                <img
                  src={file.url}
                  alt={file.name}
                  className="h-20 w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeFile('stand', index)}
                  className="absolute top-1 right-1 rounded-full bg-black/50 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {isUploading && (
        <div className="text-center text-sm text-gray-500">
          Загрузка файлов...
        </div>
      )}
    </div>
  )
}
