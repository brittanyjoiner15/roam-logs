'use client'

import { useState } from 'react'
import { updateJournalEntry } from '@/actions/journal'

type ExistingPhoto = {
  id: string
  storage_path: string
}

type EditJournalEntryFormProps = {
  entry: {
    id: string
    start_date: string
    end_date: string
    notes: string | null
    status: 'published' | 'draft'
    campgrounds: { name: string } | null
    photos: ExistingPhoto[]
  }
  username: string
  supabaseUrl: string
}

export default function EditJournalEntryForm({
  entry,
  username,
  supabaseUrl,
}: EditJournalEntryFormProps) {
  const [startDate, setStartDate] = useState(entry.start_date)
  const [endDate, setEndDate] = useState(entry.end_date)
  const [notes, setNotes] = useState(entry.notes ?? '')
  const [status, setStatus] = useState<'published' | 'draft'>(entry.status)

  // Track which existing photos to delete
  const [removedPhotoIds, setRemovedPhotoIds] = useState<string[]>([])
  const visibleExisting = entry.photos.filter((p) => !removedPhotoIds.includes(p.id))

  // New photos to add
  const [newPhotos, setNewPhotos] = useState<File[]>([])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const totalPhotos = visibleExisting.length + newPhotos.length

  const handleNewPhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + totalPhotos > 5) {
      setError('Maximum 5 photos allowed')
      return
    }
    setNewPhotos((prev) => [...prev, ...files])
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData()
    formData.append('entry_id', entry.id)
    formData.append('username', username)
    formData.append('startDate', startDate)
    formData.append('endDate', endDate)
    formData.append('notes', notes)
    formData.append('status', status)

    removedPhotoIds.forEach((id) => formData.append('delete_photo_ids', id))
    newPhotos.forEach((photo) => formData.append('photos', photo))
    const result = await updateJournalEntry(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
    // On success, updateJournalEntry redirects
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Campground name (read-only) */}
      {entry.campgrounds && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-1">Campground</p>
          <p className="px-3 py-2 border border-gray-200 rounded-button bg-gray-50 text-gray-500 text-sm">
            {entry.campgrounds.name}
          </p>
        </div>
      )}

      {/* Date range */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
            Start date
          </label>
          <input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-button focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
            End date
          </label>
          <input
            id="endDate"
            type="date"
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
          Notes
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={5}
          placeholder="How was your stay?"
          className="w-full px-3 py-2 border border-gray-300 rounded-button focus:outline-none focus:ring-2 focus:ring-brand resize-none"
        />
      </div>

      {/* Status */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Visibility</p>
        <div className="flex gap-3">
          {(['published', 'draft'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={`flex-1 py-2 px-4 rounded-button text-sm font-medium border transition-colors ${
                status === s
                  ? 'bg-brand text-white border-brand'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-brand'
              }`}
            >
              {s === 'published' ? 'Published' : 'Draft'}
            </button>
          ))}
        </div>
      </div>

      {/* Photos */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">
          Photos <span className="text-gray-400 font-normal">({totalPhotos}/5)</span>
        </p>

        {totalPhotos === 0 && (
          <p className="text-sm text-gray-400 mb-2">No photos yet.</p>
        )}

        <div className={totalPhotos > 0 ? 'grid grid-cols-3 gap-2 mb-3' : ''}>
          {/* Existing photos */}
          {visibleExisting.map((photo) => {
            const url = `${supabaseUrl}/storage/v1/object/public/campground-photos/${photo.storage_path}`
            return (
              <div key={photo.id} className="relative">
                <img
                  src={url}
                  alt="Campground photo"
                  className="w-full h-24 object-cover rounded"
                />
                <button
                  type="button"
                  onClick={() => setRemovedPhotoIds((prev) => [...prev, photo.id])}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                  aria-label="Remove photo"
                >
                  ✕
                </button>
              </div>
            )
          })}

          {/* New photo previews */}
          {newPhotos.map((file, i) => (
            <div key={i} className="relative">
              <img
                src={URL.createObjectURL(file)}
                alt={`New photo ${i + 1}`}
                className="w-full h-24 object-cover rounded"
              />
              <button
                type="button"
                onClick={() => setNewPhotos((prev) => prev.filter((_, idx) => idx !== i))}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                aria-label="Remove photo"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {totalPhotos < 5 && (
          <label className="cursor-pointer inline-block w-full">
            <div className="border-2 border-dashed border-gray-300 rounded-button p-3 text-center hover:border-brand transition-colors">
              <p className="text-gray-500 text-sm">📷 Add photos</p>
            </div>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleNewPhotos}
              className="hidden"
            />
          </label>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <a
          href={`/profile/${username}`}
          className="flex-1 text-center py-3 px-4 rounded-button border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
        >
          Cancel
        </a>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-brand text-white py-3 px-4 rounded-button font-medium hover:bg-brand/90 transition-colors disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save changes'}
        </button>
      </div>
    </form>
  )
}
