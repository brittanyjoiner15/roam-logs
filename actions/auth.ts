'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    redirect('/login?error=' + encodeURIComponent(error.message))
  }

  revalidatePath('/feed')
  redirect('/feed')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const username = (formData.get('username') as string).toLowerCase().trim()

  // Check username availability
  const { data: existing } = await supabase
    .from('profiles')
    .select('username')
    .eq('username', username)
    .single()

  if (existing) {
    redirect('/signup?error=' + encodeURIComponent('Username already taken'))
  }

  const { data, error } = await supabase.auth.signUp({ email, password })

  if (error) {
    redirect('/signup?error=' + encodeURIComponent(error.message))
  }

  if (data.user) {
    await supabase
      .from('profiles')
      .upsert({ id: data.user.id, username })
  }

  // If session exists, email confirmation is off — go straight to feed
  if (data.session) {
    revalidatePath('/feed')
    redirect('/feed')
  }

  // Otherwise, prompt them to check their email
  redirect('/signup/confirm')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/feed')
  redirect('/login')
}
