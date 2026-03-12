'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createJournalEntry(formData: FormData) {

  const supabase = await createClient()

  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'You must be logged in to create a journal entry' }
  }

  // Extract form data
  const googlePlaceId = formData.get('googlePlaceId') as string
  const campgroundName = formData.get('campgroundName') as string
  const campgroundAddress = formData.get('campgroundAddress') as string
  const latitude = parseFloat(formData.get('latitude') as string)
  const longitude = parseFloat(formData.get('longitude') as string)
  const startDate = formData.get('startDate') as string
  const endDate = formData.get('endDate') as string
  const notes = formData.get('notes') as string
  const status = formData.get('status') as 'published' | 'draft'
  const photoPaths = formData.getAll('photo_paths') as string[]
  const photoUrls = formData.getAll('photo_urls') as string[]
  const taggedUserIds = formData.getAll('tagged_user_ids') as string[]

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

  if (journalError) {
    console.error('Error creating journal entry:', journalError)
    return { error: journalError.message }
  }

  // Save tagged users
  if (taggedUserIds.length > 0 && journalEntry) {
    await supabase.from('journal_entry_tags').insert(
      taggedUserIds.map((tagged_user_id) => ({
        journal_entry_id: journalEntry.id,
        tagged_user_id,
      }))
    )
  }

  // Save photo records (photos already uploaded to storage client-side)
  if (photoPaths.length > 0 && journalEntry) {
    for (let i = 0; i < photoPaths.length; i++) {
      const { error: photoError } = await supabase
        .from('photos')
        .insert({
          user_id: user.id,
          journal_entry_id: journalEntry.id,
          campground_id: campground.id,
          storage_path: photoPaths[i],
          public_url: photoUrls[i],
        })

      if (photoError) {
        console.error('Error creating photo record:', photoError)
      }
    }
  }
}

export async function updateJournalEntry(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const entryId = formData.get('entry_id') as string
  const username = formData.get('username') as string
  const startDate = formData.get('startDate') as string
  const endDate = formData.get('endDate') as string
  const notes = formData.get('notes') as string
  const status = formData.get('status') as 'published' | 'draft'
  const deletePhotoIds = formData.getAll('delete_photo_ids') as string[]
  const newPhotos = formData.getAll('photos') as File[]
  const taggedUserIds = formData.getAll('tagged_user_ids') as string[]

  // Verify ownership
  const { data: entry } = await supabase
    .from('journal_entries')
    .select('id, campground_id')
    .eq('id', entryId)
    .eq('user_id', user.id)
    .single()

  if (!entry) {
    return { error: 'Entry not found or you do not have permission to edit it' }
  }

  // Delete photos marked for removal
  if (deletePhotoIds.length > 0) {
    const { data: photosToDelete } = await supabase
      .from('photos')
      .select('id, storage_path')
      .in('id', deletePhotoIds)
      .eq('journal_entry_id', entryId)

    if (photosToDelete?.length) {
      await supabase.storage
        .from('campground-photos')
        .remove(photosToDelete.map((p) => p.storage_path))

      await supabase
        .from('photos')
        .delete()
        .in('id', deletePhotoIds)
    }
  }

  // Upload new photos
  const validNewPhotos = newPhotos.filter((p) => p.size > 0)
  for (const photo of validNewPhotos) {
    const timestamp = Date.now()
    const filename = `${timestamp}-${photo.name}`
    const storagePath = `${user.id}/${entry.campground_id}/${filename}`

    const { error: uploadError } = await supabase.storage
      .from('campground-photos')
      .upload(storagePath, photo, { contentType: photo.type, upsert: false })

    if (!uploadError) {
      const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/campground-photos/${storagePath}`
      await supabase.from('photos').insert({
        user_id: user.id,
        journal_entry_id: entryId,
        campground_id: entry.campground_id,
        storage_path: storagePath,
        public_url: publicUrl,
      })
    }
  }

  // Replace tags
  await supabase.from('journal_entry_tags').delete().eq('journal_entry_id', entryId)
  if (taggedUserIds.length > 0) {
    await supabase.from('journal_entry_tags').insert(
      taggedUserIds.map((tagged_user_id) => ({ journal_entry_id: entryId, tagged_user_id }))
    )
  }

  // Update the entry
  const { error } = await supabase
    .from('journal_entries')
    .update({ start_date: startDate, end_date: endDate, notes, status })
    .eq('id', entryId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/profile/${username}`)
  redirect(`/profile/${username}`)
}

export async function deleteJournalEntry(entryId: string, username: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Verify ownership
  const { data: entry } = await supabase
    .from('journal_entries')
    .select('id')
    .eq('id', entryId)
    .eq('user_id', user.id)
    .single()

  if (!entry) return { error: 'Entry not found or you do not have permission to delete it' }

  // Get photos to remove from storage
  const { data: photos } = await supabase
    .from('photos')
    .select('storage_path')
    .eq('journal_entry_id', entryId)

  if (photos?.length) {
    await supabase.storage
      .from('campground-photos')
      .remove(photos.map((p) => p.storage_path))
  }

  // Delete entry (photo DB records cascade via FK)
  const { error } = await supabase
    .from('journal_entries')
    .delete()
    .eq('id', entryId)

  if (error) return { error: error.message }

  revalidatePath(`/profile/${username}`)
  redirect(`/profile/${username}`)
}
