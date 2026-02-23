'use client'

import { useState, useRef } from 'react'
import { updateProfile } from '@/actions/profile'
import Link from 'next/link'
import type { Profile } from '@/types/database'

type EditProfileFormProps = {
  profile: Profile
}

export default function EditProfileForm({ profile }: EditProfileFormProps) {
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    profile.avatar_url
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)

    const result = await updateProfile(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
    // On success, updateProfile redirects — no need to handle it here
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Hidden username for redirect after save */}
      <input type="hidden" name="username" value={profile.username} />

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Avatar */}
      <div className="flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="relative group focus:outline-none"
          aria-label="Change profile photo"
        >
          {avatarPreview ? (
            <img
              src={avatarPreview}
              alt="Profile photo"
              className="w-24 h-24 rounded-full object-cover border-2 border-gray-200 group-hover:border-brand transition-colors"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-brand text-white flex items-center justify-center text-3xl font-bold border-2 border-gray-200 group-hover:border-brand transition-colors">
              {profile.username[0].toUpperCase()}
            </div>
          )}
          {/* Overlay */}
          <div className="absolute inset-0 rounded-full bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-white text-xs font-medium">Change</span>
          </div>
        </button>
        <p className="text-xs text-gray-500">Tap to change photo</p>
        <input
          ref={fileInputRef}
          type="file"
          name="avatar"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleAvatarChange}
          className="hidden"
        />
      </div>

      {/* Username (read-only) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Username
        </label>
        <div className="w-full px-3 py-2 border border-gray-200 rounded-button bg-gray-50 text-gray-500 text-sm">
          @{profile.username}
        </div>
        <p className="text-xs text-gray-400 mt-1">Username cannot be changed</p>
      </div>

      {/* Full name */}
      <div>
        <label
          htmlFor="full_name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Full name
        </label>
        <input
          id="full_name"
          name="full_name"
          type="text"
          defaultValue={profile.full_name ?? ''}
          placeholder="Your name"
          className="w-full px-3 py-2 border border-gray-300 rounded-button focus:outline-none focus:ring-2 focus:ring-brand"
        />
      </div>

      {/* Bio */}
      <div>
        <label
          htmlFor="bio"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={4}
          defaultValue={profile.bio ?? ''}
          placeholder="Tell fellow campers about yourself..."
          className="w-full px-3 py-2 border border-gray-300 rounded-button focus:outline-none focus:ring-2 focus:ring-brand resize-none"
        />
      </div>

      {/* Website */}
      <div>
        <label
          htmlFor="website"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Website
        </label>
        <input
          id="website"
          name="website"
          type="url"
          defaultValue={profile.website ?? ''}
          placeholder="https://yoursite.com"
          className="w-full px-3 py-2 border border-gray-300 rounded-button focus:outline-none focus:ring-2 focus:ring-brand"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Link
          href={`/profile/${profile.username}`}
          className="flex-1 text-center py-3 px-4 rounded-button border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
        >
          Cancel
        </Link>
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
