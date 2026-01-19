'use client'

import { useState } from 'react'
import { X, ZoomIn, ImageOff, Check } from 'lucide-react'

interface GeneratedImagesProps {
  images: string[]
  selectedIndex?: number | null
  onSelect?: (index: number) => void
}

export function GeneratedImages({ images, selectedIndex, onSelect }: GeneratedImagesProps) {
  const [zoomedImage, setZoomedImage] = useState<string | null>(null)
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set())

  if (images.length === 0) return null

  const handleImageError = (index: number) => {
    setImageErrors(prev => new Set(prev).add(index))
  }

  const validImages = images.filter((_, index) => !imageErrors.has(index))

  const isSelectable = onSelect !== undefined

  return (
    <>
      <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
        <p className="mb-3 text-sm font-medium text-gray-700">
          {isSelectable ? 'Выберите понравившийся вариант:' : `Сгенерированные варианты дизайна (${validImages.length}):`}
        </p>
        {isSelectable && selectedIndex === undefined && (
          <div className="mb-3 flex items-center gap-2 text-sm text-orange-600">
            <span className="inline-block">👆</span>
            <span>Нажмите на изображение, чтобы выбрать</span>
          </div>
        )}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((url, index) => {
            const hasError = imageErrors.has(index)
            const isSelected = selectedIndex === index
            return (
              <div key={index} className="relative">
                <button
                  onClick={() => {
                    if (hasError) return
                    if (isSelectable) {
                      onSelect(index)
                    } else {
                      setZoomedImage(url)
                    }
                  }}
                  className={`group relative aspect-video w-full overflow-hidden rounded-lg bg-gray-100 transition-all ${
                    hasError ? 'cursor-not-allowed' : ''
                  } ${isSelected ? 'ring-4 ring-green-500 ring-offset-2' : ''}`}
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
                      {isSelected && (
                        <div className="absolute inset-0 bg-green-500/20" />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/30">
                        {!isSelectable && (
                          <ZoomIn className="h-8 w-8 text-white opacity-0 transition-opacity group-hover:opacity-100" />
                        )}
                      </div>
                      {isSelected && (
                        <div className="absolute top-2 right-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white shadow-lg">
                            <Check className="h-5 w-5" />
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  <span className={`absolute bottom-2 left-2 rounded-full px-2 py-1 text-xs font-medium text-white ${
                    isSelected ? 'bg-green-500' : 'bg-black/50'
                  }`}>
                    Вариант {index + 1}
                  </span>
                </button>
                {/* Zoom button for selectable mode */}
                {isSelectable && !hasError && (
                  <button
                    onClick={() => setZoomedImage(url)}
                    className="absolute bottom-2 right-2 rounded-full bg-black/50 p-1.5 text-white transition-colors hover:bg-black/70"
                    title="Увеличить"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </button>
                )}
              </div>
            )
          })}
        </div>
        {isSelectable && selectedIndex !== undefined && selectedIndex !== null && (
          <div className="mt-3 flex items-center gap-2 text-sm text-green-600 font-medium">
            <Check className="h-4 w-4" />
            <span>Выбран вариант {selectedIndex + 1}</span>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {zoomedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setZoomedImage(null)}
        >
          <button
            onClick={() => setZoomedImage(null)}
            className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
          >
            <X className="h-6 w-6" />
          </button>
          <div className="relative max-h-[90vh] max-w-[90vw]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={zoomedImage}
              alt="Увеличенное изображение"
              className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
            />
          </div>
        </div>
      )}
    </>
  )
}
