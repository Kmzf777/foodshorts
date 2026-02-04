'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import type { Product } from '@/types'
import { ProductCard } from './ProductCard'

interface VideoFeedProps {
  products: Product[]
  initialIndex?: number
}

export function VideoFeed({ products, initialIndex = 0 }: VideoFeedProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map())
  const [activeIndex, setActiveIndex] = useState(initialIndex)
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)

  // Intersection Observer para detectar video visivel
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement
          const productId = video.dataset.productId

          if (entry.isIntersecting && entry.intersectionRatio >= 0.7) {
            // Video esta 70%+ visivel - play
            video.play().catch(() => {})
            const index = products.findIndex((p) => p.id === productId)
            if (index !== -1) setActiveIndex(index)
          } else {
            // Video saiu da view - pause e reset
            video.pause()
            video.currentTime = 0
          }
        })
      },
      {
        root: containerRef.current,
        threshold: [0.7],
      }
    )

    videoRefs.current.forEach((video) => observer.observe(video))

    return () => observer.disconnect()
  }, [products])

  const registerVideoRef = useCallback(
    (productId: string, el: HTMLVideoElement | null) => {
      if (el) {
        videoRefs.current.set(productId, el)
      } else {
        videoRefs.current.delete(productId)
      }
    },
    []
  )

  return (
    <div
      ref={containerRef}
      className="h-[100dvh] overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
    >
      {products.map((product, index) => (
        <div
          key={product.id}
          className="h-[100dvh] w-full snap-start snap-always relative"
        >
          {/* Video Background */}
          <video
            ref={(el) => registerVideoRef(product.id, el)}
            data-product-id={product.id}
            src={product.video_url}
            poster={product.video_thumbnail_url || undefined}
            className="absolute inset-0 w-full h-full object-cover"
            loop
            muted
            playsInline
            preload={Math.abs(index - activeIndex) <= 1 ? 'auto' : 'none'}
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />

          {/* Product Info Overlay */}
          <ProductCard
            product={product}
            isExpanded={isDescriptionExpanded && activeIndex === index}
            onToggleExpand={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
          />
        </div>
      ))}
    </div>
  )
}
