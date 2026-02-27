'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import mixpanel from 'mixpanel-browser'

function getBasePath(pathname:string ) {
  try {
    const segments = pathname
      .split("/")
      .filter(Boolean); // remove empty segments

    return segments.length ? segments[0] : null;
  } catch (err) {
    return null;
  }
}

mixpanel.init('3ced240d82f2ac96a64b53459597daca', {
  record_sessions_percent: 100,
})

type MixpanelProviderProps = {
  userId?: string | null
}

export default function MixpanelProvider({ userId }: MixpanelProviderProps) {
  const pathname = usePathname()

  useEffect(() => {
    if (userId) {
      mixpanel.identify(String(userId))
      mixpanel.people.set({
        last_seen_user_agent: navigator.userAgent,
        last_seen_platform: navigator.platform,
        last_seen_mobile: /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent),
      })
      return
    }

    mixpanel.reset()
  }, [userId])

  useEffect(() => {
    mixpanel.track('Page View', { 
      page: pathname,
      base_path: getBasePath(pathname),
    })
  }, [pathname])

  return null
}
