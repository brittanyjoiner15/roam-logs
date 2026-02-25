'use client'

import { useState } from 'react'
import LogVisitForm from './forms/LogVisitForm'
import mixpanel from 'mixpanel-browser'

type LogVisitButtonProps = {
  campground: {
    googlePlaceId: string
    name: string
    address: string
    formattedAddress: string
    latitude: number
    longitude: number
  }
}

export default function LogVisitButton({ campground }: LogVisitButtonProps) {
  const [showForm, setShowForm] = useState(false)

  console.log(campground)

  const logVisit = () => {
    mixpanel.track('Log Visit Clicked', { campground: campground.name })
    setShowForm(true)
  }

  if (showForm) {
    return (
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Log Your Visit</h3>
          <button
            onClick={() => setShowForm(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕ Cancel
          </button>
        </div>
        <LogVisitForm campground={campground} />
      </div>
    )
  }

  return (
    <div className="mt-6 pt-6 border-t border-gray-200">
      <button
        onClick={() => logVisit()}
        className="w-full bg-brand text-white py-3 px-6 rounded-button hover:bg-brand/90 transition-colors font-medium text-lg"
        disabled={campground.latitude === 0 || campground.longitude === 0}
      >
        Log a Visit
      </button>
      <p className="text-sm text-gray-500 text-center mt-2">
        We'll add this to your journal
      </p>
    </div>
  )
}
