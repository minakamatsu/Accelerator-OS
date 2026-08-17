'use client'

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body>
        <main
          style={{
            display: 'grid',
            minHeight: '100vh',
            placeItems: 'center',
            padding: '2rem',
          }}
        >
          <section style={{ maxWidth: '34rem' }}>
            <p>Accelerator OS encountered an unexpected error.</p>
            <button type="button" onClick={reset}>
              Try again
            </button>
          </section>
        </main>
      </body>
    </html>
  )
}
