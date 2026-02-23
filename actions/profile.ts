'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const username = formData.get('username') as string
  const full_name = formData.get('full_name') as string
  const bio = formData.get('bio') as string
  const website = formData.get('website') as string
  const avatarFile = formData.get('avatar') as File | null

  // Build update object
  const updates: Record<string, string | null> = {
    full_name: full_name || null,
    bio: bio || null,
    website: website || null,
  }

  // Handle avatar upload
  if (avatarFile && avatarFile.size > 0) {
    const fileExt = avatarFile.name.split('.').pop()
    const storagePath = `${user.id}/${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(storagePath, avatarFile, {
        contentType: avatarFile.type,
        upsert: true,
      })

    if (uploadError) {
      return { error: `Failed to upload avatar: ${uploadError.message}` }
    }

    updates.avatar_url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${storagePath}`
  }

  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/profile/${username}`)
  redirect(`/profile/${username}`)
}
