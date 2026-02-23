import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import BottomNavWrapper from '@/components/BottomNavWrapper'
import MixpanelProvider from '@/components/MixpanelProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'RoamLogs - Your Camping Journal',
  description: 'Log your camping adventures and share with fellow campers',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <MixpanelProvider />
        <div className="pb-16">
          {children}
        </div>
        <BottomNavWrapper />
      </body>
    </html>
  )
}
