import { ImageResponse } from 'next/og'
import { getPublicSiteBySlug } from '@/data/public-site'

export const alt = 'Automotive business site preview'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

type Props = {
  params: Promise<{ businessSlug: string }>
}

function safeColor(value: unknown, fallback: string): string {
  return typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value)
    ? value
    : fallback
}

export default async function OpenGraphImage({ params }: Props) {
  const { businessSlug } = await params
  const site = await getPublicSiteBySlug(businessSlug)
  const primary = safeColor(site?.brand.colorDirection.primary, '#123b35')
  const accent = safeColor(site?.brand.colorDirection.accent, '#d8f23f')
  const name = site?.name ?? 'Business site unavailable'
  const value = site?.profile.valueProposition.replace(/^\[DEMO]\s*/i, '') ?? ''

  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        padding: 68,
        color: '#f4f1e9',
        background: primary,
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div
        style={{
          display: 'flex',
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            fontSize: 30,
            fontWeight: 800,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 62,
              height: 62,
              color: primary,
              background: accent,
              borderRadius: '50% 50% 16% 50%',
            }}
          >
            A
          </div>
          {name}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div
            style={{
              maxWidth: 900,
              fontSize: 82,
              fontWeight: 900,
              lineHeight: 0.92,
              letterSpacing: '-0.055em',
            }}
          >
            Practical care for the road ahead.
          </div>
          <div
            style={{
              maxWidth: 780,
              color: 'rgba(244, 241, 233, .68)',
              fontSize: 25,
              lineHeight: 1.4,
            }}
          >
            {value}
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            color: accent,
            fontSize: 18,
            fontWeight: 800,
            letterSpacing: '.12em',
            textTransform: 'uppercase',
          }}
        >
          Clear answers start with a clear conversation
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 330,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 290,
            height: 290,
            border: `2px dashed ${accent}`,
            borderRadius: '50%',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 190,
              height: 190,
              color: primary,
              background: accent,
              borderRadius: '50%',
              fontSize: 30,
              fontWeight: 900,
              textTransform: 'uppercase',
            }}
          >
            Start here
          </div>
        </div>
      </div>
    </div>,
    size,
  )
}
