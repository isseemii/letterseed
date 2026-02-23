import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { CAPTION_STYLES } from '@/lib/constants'
import { getTextColor } from '@/lib/DarkModeUtils'
import { TYPOGRAPHY } from '@/lib/typography'
import type { SanityImage, UrlForFn } from './types'

type Props = {
  value: {
    images?: SanityImage[]
    autoplay?: boolean
    sliderCaption?: string
    showThumbnails?: boolean
  }
  isDarkMode: boolean
  urlFor: UrlForFn
  renderTextWithLinks: (text: string) => React.ReactNode
}

export function ArticleImageSlider({ value, isDarkMode, urlFor, renderTextWithLinks }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const imageUrls = useMemo(() => {
    if (!value?.images || !Array.isArray(value.images)) return []
    return value.images
      .map((image) => {
        if (image?.asset?._ref) {
          return urlFor(image).url() || null
        } else if (image?.asset?.url) {
          return image.asset.url
        }
        return null
      })
      .filter((url: string | null) => url !== null)
  }, [value?.images, urlFor])

  useEffect(() => {
    if (!value.autoplay || imageUrls.length < 2) return

    const interval = setInterval(() => {
      setIsTransitioning(true)
      setCurrentIndex((prev) => {
        const newIndex = (prev + 1) % imageUrls.length
        setTimeout(() => setIsTransitioning(false), 500)
        return newIndex
      })
    }, 3000)

    return () => {
      clearInterval(interval)
    }
  }, [value.autoplay, imageUrls.length])

  useEffect(() => {
    if (imageUrls.length < 2) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isTransitioning) return
      if (e.key === 'ArrowLeft') {
        setIsTransitioning(true)
        setCurrentIndex((prev) => {
          const newIndex = (prev - 1 + imageUrls.length) % imageUrls.length
          setTimeout(() => setIsTransitioning(false), 500)
          return newIndex
        })
      } else if (e.key === 'ArrowRight') {
        setIsTransitioning(true)
        setCurrentIndex((prev) => {
          const newIndex = (prev + 1) % imageUrls.length
          setTimeout(() => setIsTransitioning(false), 500)
          return newIndex
        })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [imageUrls.length, isTransitioning])

  if (!value?.images || !Array.isArray(value.images) || imageUrls.length < 2) return null

  const goToNext = () => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setCurrentIndex((prev) => (prev + 1) % imageUrls.length)
    setTimeout(() => setIsTransitioning(false), 500)
  }

  const goToPrevious = () => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setCurrentIndex((prev) => (prev - 1 + imageUrls.length) % imageUrls.length)
    setTimeout(() => setIsTransitioning(false), 500)
  }

  const goToSlide = (index: number) => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setCurrentIndex(index)
    setTimeout(() => setIsTransitioning(false), 500)
  }

  return (
    <div className="my-8">
      <div className="relative group w-full">
        <div className="relative overflow-hidden w-[80%] mx-auto">
          <Image
            key={currentIndex}
            src={imageUrls[currentIndex]}
            alt={value.images[currentIndex]?.alt || `이미지 ${currentIndex + 1}`}
            width={1200}
            height={800}
            className="w-full h-auto transition-opacity duration-300"
            sizes="80vw"
            unoptimized
          />
        </div>

        {imageUrls.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className={`hidden md:block absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center z-10 ${getTextColor(isDarkMode)}`}
              aria-label="이전 이미지"
            >
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={goToNext}
              className={`hidden md:block absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center z-10 ${getTextColor(isDarkMode)}`}
              aria-label="다음 이미지"
            >
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {imageUrls.length > 1 && (
          <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 flex gap-2 md:gap-3 z-20 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
            {imageUrls.map((_, index: number) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 md:w-2 md:h-2 rounded-full border-2 transition-all duration-300 ${
                  index === currentIndex
                    ? isDarkMode
                      ? 'border-white'
                      : 'border-black'
                    : isDarkMode
                      ? 'border-white/40 hover:border-white/80'
                      : 'border-black/40 hover:border-black/80'
                }`}
                aria-label={`이미지 ${index + 1}로 이동`}
              />
            ))}
          </div>
        )}

        {imageUrls.length > 1 && (
          <div className={`hidden md:block absolute top-[-1] right-1 px-3 ${TYPOGRAPHY.ui.imageCounter} ${getTextColor(isDarkMode)}`}>
            {currentIndex + 1} / {imageUrls.length}
          </div>
        )}
      </div>

      {value.images[currentIndex]?.caption && (
        <p className={`${CAPTION_STYLES.DEFAULT} ${getTextColor(isDarkMode, 'subtle')}`}>
          {renderTextWithLinks(value.images[currentIndex].caption)}
        </p>
      )}

      {value.sliderCaption && (
        <p className={`${CAPTION_STYLES.DEFAULT} ${getTextColor(isDarkMode, 'subtle')}`}>
          {renderTextWithLinks(value.sliderCaption)}
        </p>
      )}

      {value.showThumbnails && imageUrls.length > 1 && (
        <div className="mt-2 md:mt-4 flex gap-2 md:gap-3 overflow-x-auto pb-2 scrollbar-hide justify-center">
          {imageUrls.map((url: string, index: number) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 overflow-hidden transition-all hover:scale-105 relative ${
                index === currentIndex
                  ? 'scale-105'
                  : 'opacity-60 hover:opacity-80'
              }`}
            >
              <Image
                src={url}
                alt={`썸네일 ${index + 1}`}
                width={80}
                height={80}
                className="w-full h-full object-cover"
                unoptimized
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
