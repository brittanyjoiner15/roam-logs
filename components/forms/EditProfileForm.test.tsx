import { vi, describe, it, expect } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import EditProfileForm from './EditProfileForm'
import type { Profile } from '@/types/database'

// Mock the server action
const mockUpdateProfile = vi.fn()
vi.mock('@/actions/profile', () => ({
  updateProfile: (...args: unknown[]) => mockUpdateProfile(...args),
}))

// Mock Next.js Link (not available in jsdom)
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

// jsdom doesn't implement URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url')

const baseProfile: Profile = {
  id: 'user-1',
  username: 'campingqueen',
  full_name: 'Jane Camper',
  bio: 'Love the outdoors',
  avatar_url: null,
  website: 'https://janecamps.com',
  rig_type: 'tent',
  rig_name: 'My trusty tent',
  last_active_at: null,
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
}

describe('EditProfileForm', () => {
  it('renders the form with existing profile values', () => {
    render(<EditProfileForm profile={baseProfile} />)

    expect(screen.getByDisplayValue('Jane Camper')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Love the outdoors')).toBeInTheDocument()
    expect(screen.getByDisplayValue('https://janecamps.com')).toBeInTheDocument()
    expect(screen.getByDisplayValue('My trusty tent')).toBeInTheDocument()
  })

  it('shows the username as read-only text (not an editable input)', () => {
    render(<EditProfileForm profile={baseProfile} />)

    expect(screen.getByText('@campingqueen')).toBeInTheDocument()
    // No editable input with the username value
    expect(screen.queryByRole('textbox', { name: /username/i })).not.toBeInTheDocument()
  })

  it('shows the first letter of username as avatar placeholder when no avatar_url', () => {
    render(<EditProfileForm profile={baseProfile} />)
    // The avatar fallback div shows the uppercased first letter
    expect(screen.getByText('C')).toBeInTheDocument()
  })

  it('shows an img tag when profile has an avatar_url', () => {
    const profileWithAvatar = { ...baseProfile, avatar_url: 'https://example.com/avatar.jpg' }
    render(<EditProfileForm profile={profileWithAvatar} />)

    const img = screen.getByAltText('Profile photo')
    expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg')
  })

  it('shows "Save changes" on the submit button initially', () => {
    render(<EditProfileForm profile={baseProfile} />)
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeInTheDocument()
  })

  it('shows "Saving..." and disables the button while submitting', async () => {
    // updateProfile resolves after a tick so we can catch the loading state
    mockUpdateProfile.mockImplementation(() => new Promise(() => {}))
    render(<EditProfileForm profile={baseProfile} />)

    fireEvent.submit(screen.getByRole('button', { name: 'Save changes' }).closest('form')!)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Saving...' })).toBeDisabled()
    })
  })

  it('displays an error message returned by updateProfile', async () => {
    mockUpdateProfile.mockResolvedValue({ error: 'Username already taken' })
    render(<EditProfileForm profile={baseProfile} />)

    fireEvent.submit(screen.getByRole('button', { name: 'Save changes' }).closest('form')!)

    await waitFor(() => {
      expect(screen.getByText('Username already taken')).toBeInTheDocument()
    })
  })

  it('renders a Cancel link pointing to the profile page', () => {
    render(<EditProfileForm profile={baseProfile} />)
    const cancelLink = screen.getByRole('link', { name: 'Cancel' })
    expect(cancelLink).toHaveAttribute('href', '/profile/campingqueen')
  })
})
