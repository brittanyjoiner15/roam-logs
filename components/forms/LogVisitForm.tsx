'use client'

import { useState } from 'react'
import { createJournalEntry } from '@/actions/journal'
import { set } from 'date-fns'
import mixpanel from 'mixpanel-browser'
import UserTagInput, { type TaggedUser } from '@/components/UserTagInput'

type LogVisitFormProps = {
  campground: {
    googlePlaceId: string
    name: string
    address: string
    latitude: number
    longitude: number
  }
}

function toLocalDateString(date: Date) {
  return date.toLocaleDateString('en-CA') // YYYY-MM-DD in local time
}

export default function LogVisitForm({ campground }: LogVisitFormProps) {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  const [startDate, setStartDate] = useState(toLocalDateString(yesterday))
  const [endDate, setEndDate] = useState(toLocalDateString(today))
  const [notes, setNotes] = useState('')
  const [photos, setPhotos] = useState<File[]>([])
  const [taggedUsers, setTaggedUsers] = useState<TaggedUser[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + photos.length > 5) {
      setError('Maximum 5 photos allowed')
      return
    }
    setPhotos([...photos, ...files])
    setError('')
  }

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    mixpanel.track('Journal Entry Submitted', { campground: campground.name, photosCount: photos.length, hasNotes: !!notes })
    setLoading(true)
    setError('')

    // Create FormData to send files
    const formData = new FormData()
    formData.append('googlePlaceId', campground.googlePlaceId)
    formData.append('campgroundName', campground.name)
    formData.append('campgroundAddress', campground.address)
    formData.append('latitude', campground.latitude.toString())
    formData.append('longitude', campground.longitude.toString())
    formData.append('startDate', startDate)
    formData.append('endDate', endDate)
    formData.append('notes', notes)
    formData.append('status', 'published')

    // Add tagged users
    taggedUsers.forEach((u) => formData.append('tagged_user_ids', u.id))

    // Add photos
    photos.forEach((photo) => {
      formData.append('photos', photo)
    })

    try {
      const result = await createJournalEntry(formData)

      if (result?.error) {
        setError(result.error)
        setLoading(false)
        return
      }

      window.location.reload()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      mixpanel.track('Journal Entry Error', { campground: campground.name, error: message })
      setError('Something went wrong uploading your entry. Please try again.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">    
          {error}
        </div>
      )}

      {/* Date Range */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-button focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-button focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
          Notes (optional)
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={6}
          placeholder="How was your stay? Any tips for future campers?"
          className="w-full px-3 py-2 border border-gray-300 rounded-button focus:outline-none focus:ring-2 focus:ring-brand resize-none"
        />
      </div>

      {/* Tag friends */}
      <UserTagInput value={taggedUsers} onChange={setTaggedUsers} />

      {/* Photos */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Photos (optional, max 5)
        </label>

        {photos.length < 5 && (
          <label className="cursor-pointer inline-block">
            <div className="border-2 border-dashed border-gray-300 rounded-button p-4 text-center hover:border-brand transition-colors">
              <p className="text-gray-600">📷 Tap to add photos</p>
              <p className="text-xs text-gray-400 mt-1">{photos.length}/5 photos</p>
            </div>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handlePhotoChange}
              className="hidden"
            />
          </label>
        )}

        {photos.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mt-2">
            {photos.map((photo, index) => (
              <div key={index} className="relative">
                <img
                  src={URL.createObjectURL(photo)}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-32 object-cover rounded"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-brand text-white py-3 px-6 rounded-button hover:bg-brand/90 transition-colors font-medium text-lg disabled:opacity-50"
      >
        {loading ? 'Saving...' : 'Save to Journal'}
      </button>
    </form>
  )
}
