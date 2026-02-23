'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createJournalEntry(formData: FormData) {
  console.log('=== CREATE JOURNAL ENTRY WITH PHOTOS ===')

  const supabase = await createClient()

  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'You must be logged in to create a journal entry' }
  }

  console.log('User authenticated:', user.id)

  // Extract form data
  const googlePlaceId = formData.get('googlePlaceId') as string
  const campgroundName = formData.get('campgroundName') as string
  const campgroundAddress = formData.get('campgroundAddress') as string
  const campgroundFormattedAddress = formData.get('campgroundFormattedAddress') as string
  const latitude = parseFloat(formData.get('latitude') as string)
  const longitude = parseFloat(formData.get('longitude') as string)
  const startDate = formData.get('startDate') as string
  const endDate = formData.get('endDate') as string
  const notes = formData.get('notes') as string
  const status = formData.get('status') as 'published' | 'draft'
  const photos = formData.getAll('photos') as File[]

  console.log('Photos to upload:', photos.length)
  console.log('Photo details:', photos.map(p => ({ name: p.name, size: p.size, type: p.type })))

  // Find or create campground
  let { data: campground } = await supabase
    .from('campgrounds')
    .select('id')
    .eq('google_place_id', googlePlaceId)
    .single()

  if (!campground) {
    const { data: newCampground, error: campgroundError } = await supabase
      .from('campgrounds')
      .insert({
        google_place_id: googlePlaceId,
        name: campgroundName,
        address: campgroundAddress,
        formatted_address: campgroundFormattedAddress,
        latitude,
        longitude,
      })
      .select('id')
      .single()

    if (campgroundError) {
      console.error('Error creating campground:', campgroundError)
      return { error: 'Failed to save campground' }
    }

    campground = newCampground
  }

  // Create journal entry
  const { data: journalEntry, error: journalError } = await supabase
    .from('journal_entries')
    .insert({
      user_id: user.id,
      campground_id: campground.id,
      start_date: startDate,
      end_date: endDate,
      notes,
      status,
    })
    .select('id')
    .single()

  console.log('Journal entry creation result:', { journalEntry, journalError })

  if (journalError) {
    console.error('Error creating journal entry:', journalError)
    return { error: 'Failed to create journal entry' }
  }

  // Upload photos if any
  if (photos.length > 0 && journalEntry) {
    console.log('Uploading photos...')

    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i]

      // Skip empty files
      if (photo.size === 0) {
        console.log(`Skipping empty file at index ${i}`)
        continue
      }

      const timestamp = Date.now()
      const filename = `${timestamp}-${photo.name}`
      const storagePath = `${user.id}/${campground.id}/${filename}`

      console.log(`Uploading photo ${i + 1}/${photos.length}:`, { filename, size: photo.size, type: photo.type })

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('campground-photos')
        .upload(storagePath, photo, {
          contentType: photo.type,
          upsert: false,
        })

      if (uploadError) {
        console.error('Error uploading photo:', uploadError)
        continue // Skip this photo but continue with others
      }

      console.log('Photo uploaded successfully:', storagePath)

      // Construct public URL
      const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/campground-photos/${storagePath}`

      // Create photo record in database
      const { error: photoError } = await supabase
        .from('photos')
        .insert({
          user_id: user.id,
          journal_entry_id: journalEntry.id,
          campground_id: campground.id,
          storage_path: storagePath,
          public_url: publicUrl,
        })

      if (photoError) {
        console.error('Error creating photo record:', photoError)
      } else {
        console.log('Photo record created in database')
      }
    }

    console.log('All photos processed')
  } else {
    console.log('No photos to upload or no journal entry created')
  }
}
