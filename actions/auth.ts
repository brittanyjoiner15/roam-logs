'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import Mixpanel from 'mixpanel'

const mixpanel = Mixpanel.init(process.env.MIXPANEL_TOKEN!);

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    redirect('/login?error=' + encodeURIComponent(error.message))
  }

  console.log("Sending to mixpanel");
  mixpanel.people.set(data.user.id, {
     $email: email,
     username: data.user.user_metadata.username,
  });  
  revalidatePath('/feed')
  redirect('/feed')
}

export async function signup(formData: FormData) {
  console.log("Starting up")
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
    redirect('/signup?error=' + encodeURIComponent('Sorry that didn\'t work. Please try a different username.'))
  }

  const { data, error } = await supabase.auth.signUp({ email, password })

  if (error) {
    redirect('/signup?error=' + encodeURIComponent(error.message))
  }

  if (data.user) {
    await supabase
      .from('profiles')
      .upsert({ id: data.user.id, username })

    console.log("Sending event to mixpanel");
    mixpanel.track('Sign Up', {
      distinct_id: data.user.id,
      email,
      username,
    })
    console.log("update profile in mixpanel");
    mixpanel.people.set(data.user.id, {
      $email: email,
      username,
    })
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
