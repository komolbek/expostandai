'use client'

import { useState, useRef } from 'react'
import { Upload, X, FileImage, File, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  url: string
}

interface FileUploadProps {
  onFilesSelected: (files: UploadedFile[]) => void
  onSkip: () => void
  maxFiles?: number
  acceptedTypes?: string
  title: string
  description: string
}

export function FileUpload({
  onFilesSelected,
  onSkip,
  maxFiles = 20,
  acceptedTypes = '.eps,.cdr,.ai,.pdf,.png,.jpg,.jpeg',
  title,
  description,
}: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = async (fileList: FileList) => {
    if (files.length + fileList.length > maxFiles) {
      alert(`Максимум ${maxFiles} файлов`)
      return
    }

    setIsUploading(true)

    const newFiles: UploadedFile[] = []

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i]

      // Create a local URL for preview (in production, upload to cloud storage)
      const url = URL.createObjectURL(file)

      newFiles.push({
        id: `${Date.now()}-${i}`,
        name: file.name,
        size: file.size,
        type: file.type,
        url,
      })
    }

    setFiles((prev) => [...prev, ...newFiles])
    setIsUploading(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = () => {
    setDragActive(false)
  }

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }

  const handleConfirm = () => {
    onFilesSelected(files)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const isImage = (type: string) => type.startsWith('image/')

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{description}</p>

      {/* Drop zone */}
      <div
        className={`mt-4 rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
          dragActive
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-200 hover:border-gray-300'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={acceptedTypes}
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
        <Upload className="mx-auto h-8 w-8 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          Перетащите файлы сюда или{' '}
          <span className="text-primary-600 cursor-pointer hover:underline">
            выберите
          </span>
        </p>
        <p className="mt-1 text-xs text-gray-400">
          Форматы: EPS, CDR, AI, PDF, PNG, JPG (макс. {maxFiles} файлов)
        </p>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium text-gray-700">
            Загружено: {files.length} из {maxFiles}
          </p>
          <div className="max-h-48 overflow-y-auto space-y-2">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-3 rounded-lg bg-gray-50 p-2"
              >
                {isImage(file.type) ? (
                  <FileImage className="h-8 w-8 text-primary-500" />
                ) : (
                  <File className="h-8 w-8 text-gray-400" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    removeFile(file.id)
                  }}
                  className="p-1 text-gray-400 hover:text-red-500"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 flex gap-3">
        {files.length > 0 ? (
          <Button onClick={handleConfirm} className="flex-1" leftIcon={<Check className="h-4 w-4" />}>
            Продолжить ({files.length})
          </Button>
        ) : (
          <Button onClick={onSkip} variant="secondary" className="flex-1">
            Пропустить
          </Button>
        )}
      </div>

      {isUploading && (
        <p className="mt-2 text-sm text-gray-500 text-center">Загрузка...</p>
      )}
    </div>
  )
}
