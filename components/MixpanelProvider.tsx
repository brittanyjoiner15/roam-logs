'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import mixpanel from 'mixpanel-browser'

mixpanel.init('3ced240d82f2ac96a64b53459597daca', {
  autocapture: true,
  record_sessions_percent: 100,
})

export default function MixpanelProvider() {
  const pathname = usePathname()

  useEffect(() => {
    mixpanel.track('Page View', { page: pathname })
  }, [pathname])

  return null
}
