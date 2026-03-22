'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-pass-stone-900">
        <div className="text-center">
          <h2 className="text-xl font-medium text-pass-stone-50">Something went wrong</h2>
          <button
            onClick={reset}
            className="mt-4 rounded-lg bg-pass-amber-600 px-6 py-2 text-white hover:bg-pass-amber-500"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
