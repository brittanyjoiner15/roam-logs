'use client'

import { useState, useCallback } from 'react'
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
  useMap,
} from '@vis.gl/react-google-maps'
import { format } from 'date-fns'

export type CampgroundVisit = {
  campground: {
    id: string
    google_place_id: string
    name: string
    latitude: number
    longitude: number
  }
  visits: {
    start_date: string
    end_date: string
  }[]
}

type Props = {
  campgrounds: CampgroundVisit[]
}

const TENT_SVG = (
  <svg
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="#F25C2A"
    xmlns="http://www.w3.org/2000/svg"
    style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
  >
    <path d="M12 2L2 22h20L12 2z" />
  </svg>
)

// Default center: geographic center of contiguous US
const DEFAULT_CENTER = { lat: 39.5, lng: -98.35 }
const DEFAULT_ZOOM = 4

function computeBounds(campgrounds: CampgroundVisit[]) {
  if (campgrounds.length === 0) return null
  let north = -90, south = 90, east = -180, west = 180
  for (const { campground } of campgrounds) {
    north = Math.max(north, campground.latitude)
    south = Math.min(south, campground.latitude)
    east = Math.max(east, campground.longitude)
    west = Math.min(west, campground.longitude)
  }
  // Add a small padding
  const latPad = Math.max((north - south) * 0.15, 0.5)
  const lngPad = Math.max((east - west) * 0.15, 0.5)
  return {
    north: north + latPad,
    south: south - latPad,
    east: east + lngPad,
    west: west - lngPad,
  }
}

function MapContent({ campgrounds }: Props) {
  const map = useMap()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const selectedCampground = campgrounds.find(
    (c) => c.campground.id === selectedId
  )

  const handleMarkerClick = useCallback(
    (id: string) => {
      setSelectedId((prev) => (prev === id ? null : id))
    },
    []
  )

  const handleInfoWindowClose = useCallback(() => {
    setSelectedId(null)
  }, [])

  return (
    <>
      {campgrounds.map(({ campground, visits }) => (
        <AdvancedMarker
          key={campground.id}
          position={{ lat: campground.latitude, lng: campground.longitude }}
          title={campground.name}
          onClick={() => handleMarkerClick(campground.id)}
        >
          {TENT_SVG}
        </AdvancedMarker>
      ))}

      {selectedCampground && (
        <InfoWindow
          position={{
            lat: selectedCampground.campground.latitude,
            lng: selectedCampground.campground.longitude,
          }}
          onCloseClick={handleInfoWindowClose}
          pixelOffset={[0, -36]}
        >
          <div className="p-1 max-w-[220px]">
            <p className="font-bold text-ink text-sm leading-snug mb-1">
              {selectedCampground.campground.name}
            </p>
            <div className="space-y-0.5">
              {selectedCampground.visits.map((visit, i) => (
                <p key={i} className="text-xs text-gray-600">
                  📅{' '}
                  {format(new Date(visit.start_date), 'MMM d, yyyy')}
                  {visit.end_date !== visit.start_date && (
                    <> – {format(new Date(visit.end_date), 'MMM d, yyyy')}</>
                  )}
                </p>
              ))}
            </div>
          </div>
        </InfoWindow>
      )}
    </>
  )
}

export default function CampgroundMap({ campgrounds }: Props) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!
  const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID

  const bounds = computeBounds(campgrounds)

  return (
    <APIProvider apiKey={apiKey}>
      <Map
        mapId={mapId}
        style={{ width: '100%', height: '100%' }}
        defaultBounds={bounds ?? undefined}
        defaultCenter={bounds ? undefined : DEFAULT_CENTER}
        defaultZoom={bounds ? undefined : DEFAULT_ZOOM}
        gestureHandling="greedy"
        disableDefaultUI={false}
      >
        <MapContent campgrounds={campgrounds} />
      </Map>
    </APIProvider>
  )
}
