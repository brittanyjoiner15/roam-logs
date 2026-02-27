'use client'

import { useRef, useState } from 'react'

type Photo = {
  id: string
  storage_path: string
  caption?: string | null
}

export default function PhotoCarousel({
  photos,
  supabaseUrl,
}: {
  photos: Photo[]
  supabaseUrl: string
}) {
  const [activeIndex, setActiveIndex] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  const handleScroll = () => {
    if (!scrollRef.current) return
    const { scrollLeft, clientWidth } = scrollRef.current
    setActiveIndex(Math.round(scrollLeft / clientWidth))
  }

  if (photos.length === 1) {
    return (
      <img
        src={`${supabaseUrl}/storage/v1/object/public/campground-photos/${photos[0].storage_path}`}
        alt={photos[0].caption || 'Campground photo'}
        className="w-full h-52 object-cover"
      />
    )
  }

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none"
        style={{ scrollbarWidth: 'none' }}
      >
        {photos.map((photo) => (
          <img
            key={photo.id}
            src={`${supabaseUrl}/storage/v1/object/public/campground-photos/${photo.storage_path}`}
            alt={photo.caption || 'Campground photo'}
            className="w-full h-52 object-cover flex-shrink-0 snap-start"
            style={{ minWidth: '100%' }}
          />
        ))}
      </div>

      {/* Dot indicators */}
      <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
        {photos.map((_, i) => (
          <span
            key={i}
            className={`block rounded-full transition-all ${
              i === activeIndex ? 'w-2 h-2 bg-white' : 'w-1.5 h-1.5 bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
