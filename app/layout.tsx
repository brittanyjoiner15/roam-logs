import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import BottomNavWrapper from '@/components/BottomNavWrapper'
import MixpanelProvider from '@/components/MixpanelProvider'
import { createClient } from '@/lib/supabase/server'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'RoamLogs - Your Camping Journal',
  description: 'Log your camping adventures and share with fellow campers',
  openGraph: {
    title: "RoamLogs - Your Camping Journal",
    description: "Log your camping adventures and share with fellow campers",
    url: "https://roamlogs.com",
    siteName: "RoamLogs",
    images: [
      {
        url: "https://kgdngaaatfzttkywstkp.supabase.co/storage/v1/object/public/Public%20Storage%20Bucket/CleanShot%202026-02-22%20at%2021.30.44@2x.png",
        width: 1200,
        height: 630,
        alt: "Get started",
      },
    ],
    type: "website",
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <html lang="en">
      <body className={inter.className}>
        <MixpanelProvider userId={user?.id} />
        <div className="pb-16">
          {children}
        </div>
        <BottomNavWrapper />
      </body>
    </html>
  )
}
