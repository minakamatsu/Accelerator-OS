'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'

declare global {
  interface Window {
    acceleratorTurnstileVerified?: (token: string) => void
  }
}

export function TurnstileWidget({ siteKey }: { siteKey: string | null }) {
  const [token, setToken] = useState('')

  useEffect(() => {
    if (!siteKey) return
    window.acceleratorTurnstileVerified = setToken
    return () => {
      delete window.acceleratorTurnstileVerified
    }
  }, [siteKey])

  if (!siteKey) {
    return <input type="hidden" name="turnstileToken" value="development" />
  }

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
      />
      <input type="hidden" name="turnstileToken" value={token} />
      <div
        className="cf-turnstile"
        data-sitekey={siteKey}
        data-callback="acceleratorTurnstileVerified"
        data-theme="light"
      />
    </>
  )
}
