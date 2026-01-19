'use client'

import { useState, useCallback } from 'react'
import { X, FileText, Image, Loader2, Upload } from 'lucide-react'
import type { InquiryData, UploadedFile } from '@/lib/types'
import { generateId } from '@/lib/utils'
import { useDropzone } from '@uploadthing/react'
import { generateClientDropzoneAccept, generatePermittedFileTypes } from 'uploadthing/client'
import { useUploadThing } from '@/lib/uploadthing-client'

interface StepFilesUploadProps {
  data: Partial<InquiryData>
  onChange: (data: Partial<InquiryData>) => void
}

export function StepFilesUpload({ data, onChange }: StepFilesUploadProps) {
  const [isUploadingBrand, setIsUploadingBrand] = useState(false)
  const [isUploadingStand, setIsUploadingStand] = useState(false)

  const brandFiles = data.brand_files || []
  const previousStandFiles = data.previous_stand_files || []

  // Brand files uploader
  const { startUpload: startBrandUpload, routeConfig: brandRouteConfig } = useUploadThing('brandFiles', {
    onClientUploadComplete: (res) => {
      const newFiles: UploadedFile[] = res.map((file) => ({
        id: generateId(),
        name: file.name,
        url: file.ufsUrl,
        type: file.type,
        size: file.size,
      }))
      onChange({ brand_files: [...brandFiles, ...newFiles] })
      setIsUploadingBrand(false)
    },
    onUploadError: (error) => {
      console.error('Brand upload error:', error)
      setIsUploadingBrand(false)
      alert('Ошибка загрузки файла. Попробуйте ещё раз.')
    },
    onUploadBegin: () => {
      setIsUploadingBrand(true)
    },
  })

  // Stand photos uploader
  const { startUpload: startStandUpload, routeConfig: standRouteConfig } = useUploadThing('standPhotos', {
    onClientUploadComplete: (res) => {
      const newFiles: UploadedFile[] = res.map((file) => ({
        id: generateId(),
        name: file.name,
        url: file.ufsUrl,
        type: file.type,
        size: file.size,
      }))
      onChange({ previous_stand_files: [...previousStandFiles, ...newFiles] })
      setIsUploadingStand(false)
    },
    onUploadError: (error) => {
      console.error('Stand upload error:', error)
      setIsUploadingStand(false)
      alert('Ошибка загрузки фото. Попробуйте ещё раз.')
    },
    onUploadBegin: () => {
      setIsUploadingStand(true)
    },
  })

  // Brand files dropzone
  const onDropBrand = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        startBrandUpload(acceptedFiles)
      }
    },
    [startBrandUpload]
  )

  const { getRootProps: getBrandRootProps, getInputProps: getBrandInputProps, isDragActive: isBrandDragActive } = useDropzone({
    onDrop: onDropBrand,
    accept: brandRouteConfig ? generateClientDropzoneAccept(generatePermittedFileTypes(brandRouteConfig).fileTypes) : undefined,
  })

  // Stand photos dropzone
  const onDropStand = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        startStandUpload(acceptedFiles)
      }
    },
    [startStandUpload]
  )

  const { getRootProps: getStandRootProps, getInputProps: getStandInputProps, isDragActive: isStandDragActive } = useDropzone({
    onDrop: onDropStand,
    accept: standRouteConfig ? generateClientDropzoneAccept(generatePermittedFileTypes(standRouteConfig).fileTypes) : undefined,
  })

  const removeFile = (type: 'brand' | 'stand', index: number) => {
    if (type === 'brand') {
      const newFiles = brandFiles.filter((_, i) => i !== index)
      onChange({ brand_files: newFiles })
    } else {
      const newFiles = previousStandFiles.filter((_, i) => i !== index)
      onChange({ previous_stand_files: newFiles })
    }
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
          {...getBrandRootProps()}
          className={`rounded-xl border-2 border-dashed p-6 text-center transition-colors cursor-pointer ${
            isBrandDragActive
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-300 bg-gray-50 hover:border-primary-400 hover:bg-primary-50/50'
          }`}
        >
          <input {...getBrandInputProps()} />
          {isUploadingBrand ? (
            <>
              <Loader2 className="mx-auto h-10 w-10 text-primary-500 animate-spin" />
              <p className="mt-2 text-sm text-gray-600">Загрузка файлов...</p>
            </>
          ) : (
            <>
              <FileText className="mx-auto h-10 w-10 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
                {isBrandDragActive ? 'Отпустите файлы здесь' : 'Перетащите файлы сюда или нажмите для выбора'}
              </p>
              <p className="mt-1 text-xs text-gray-400">
                PNG, JPG, PDF (до 8MB для изображений, до 16MB для PDF)
              </p>
            </>
          )}
        </div>

        {/* Brand Files List */}
        {brandFiles.length > 0 && (
          <div className="mt-3 space-y-2">
            {brandFiles.map((file, index) => (
              <div
                key={file.id}
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
          {...getStandRootProps()}
          className={`rounded-xl border-2 border-dashed p-6 text-center transition-colors cursor-pointer ${
            isStandDragActive
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-300 bg-gray-50 hover:border-primary-400 hover:bg-primary-50/50'
          }`}
        >
          <input {...getStandInputProps()} />
          {isUploadingStand ? (
            <>
              <Loader2 className="mx-auto h-10 w-10 text-primary-500 animate-spin" />
              <p className="mt-2 text-sm text-gray-600">Загрузка фото...</p>
            </>
          ) : (
            <>
              <Image className="mx-auto h-10 w-10 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
                {isStandDragActive ? 'Отпустите фото здесь' : 'Перетащите фото сюда или нажмите для выбора'}
              </p>
              <p className="mt-1 text-xs text-gray-400">
                PNG, JPG, WebP (до 8MB)
              </p>
            </>
          )}
        </div>

        {/* Stand Files List */}
        {previousStandFiles.length > 0 && (
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {previousStandFiles.map((file, index) => (
              <div
                key={file.id}
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
    </div>
  )
}
