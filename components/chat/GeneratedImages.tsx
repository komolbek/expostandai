'use client'

import { useState } from 'react'
import { X, ZoomIn, ImageOff } from 'lucide-react'

interface GeneratedImagesProps {
  images: string[]
}

export function GeneratedImages({ images }: GeneratedImagesProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set())

  if (images.length === 0) return null

  const handleImageError = (index: number) => {
    setImageErrors(prev => new Set(prev).add(index))
  }

  const validImages = images.filter((_, index) => !imageErrors.has(index))

  return (
    <>
      <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
        <p className="mb-3 text-sm font-medium text-gray-700">
          Сгенерированные варианты дизайна ({validImages.length}):
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((url, index) => {
            const hasError = imageErrors.has(index)
            return (
              <button
                key={index}
                onClick={() => !hasError && setSelectedImage(url)}
                className={`group relative aspect-video overflow-hidden rounded-lg bg-gray-100 ${hasError ? 'cursor-not-allowed' : ''}`}
                disabled={hasError}
              >
                {hasError ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                    <ImageOff className="h-8 w-8 mb-2" />
                    <span className="text-xs">Ошибка загрузки</span>
                  </div>
                ) : (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`Вариант дизайна ${index + 1}`}
                      className="absolute inset-0 h-full w-full object-cover transition-transform group-hover:scale-105"
                      onError={() => handleImageError(index)}
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/30">
                      <ZoomIn className="h-8 w-8 text-white opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                  </>
                )}
                <span className="absolute bottom-2 left-2 rounded-full bg-black/50 px-2 py-1 text-xs font-medium text-white">
                  Вариант {index + 1}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
          >
            <X className="h-6 w-6" />
          </button>
          <div className="relative max-h-[90vh] max-w-[90vw]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedImage}
              alt="Увеличенное изображение"
              className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
            />
          </div>
        </div>
      )}
    </>
  )
}
