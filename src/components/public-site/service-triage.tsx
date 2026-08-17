'use client'

import { useState } from 'react'
import type { PublicSite } from '@/lib/public-site/schema'
import { TrackedPhoneLink } from './tracked-phone-link'
import styles from './service-triage.module.css'

type Props = {
  services: PublicSite['services']
  phoneHref: string
  phoneLabel: string
  eventPath: string
}

const signals = [
  { label: 'A warning light', keywords: ['diagnostic', 'engine'] },
  { label: 'Braking feels different', keywords: ['brake', 'safety'] },
  { label: 'The ride or steering changed', keywords: ['steering', 'ride'] },
  { label: 'I’m staying ahead', keywords: ['maintenance', 'routine'] },
] as const

function findService(
  services: PublicSite['services'],
  keywords: readonly string[],
) {
  return (
    services.find((service) =>
      keywords.some((keyword) =>
        `${service.name} ${service.slug}`.toLowerCase().includes(keyword),
      ),
    ) ?? services[0]
  )
}

export function ServiceTriage({
  services,
  phoneHref,
  phoneLabel,
  eventPath,
}: Props) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const selectedSignal = signals[selectedIndex]
  const selectedService = findService(services, selectedSignal.keywords)

  return (
    <div className={styles.shell}>
      <div className={styles.intro}>
        <p className={styles.kicker}>Start with what you notice</p>
        <h2>Not sure what to call it? That’s okay.</h2>
        <p>
          Choose the closest signal. This does not diagnose the vehicle—it
          simply gives you a clearer place to begin the conversation.
        </p>
      </div>

      <div className={styles.workspace}>
        <div
          className={styles.options}
          role="group"
          aria-label="Vehicle signals"
        >
          {signals.map((signal, index) => (
            <button
              type="button"
              className={
                index === selectedIndex ? styles.activeOption : undefined
              }
              aria-pressed={index === selectedIndex}
              onClick={() => setSelectedIndex(index)}
              key={signal.label}
            >
              <span>{String(index + 1).padStart(2, '0')}</span>
              {signal.label}
            </button>
          ))}
        </div>

        <div className={styles.result} aria-live="polite">
          <span className={styles.resultLabel}>A useful starting point</span>
          <h3>{selectedService?.name ?? 'Call the shop'}</h3>
          <p>
            Tell the team what changed, when you first noticed it, and whether
            it is getting more frequent. They can confirm the right next step.
          </p>
          <TrackedPhoneLink
            href={phoneHref}
            eventPath={eventPath}
            className={styles.callButton}
            ariaLabel={`Call ${phoneLabel}`}
          >
            <span>Call the shop</span>
            <strong>{phoneLabel}</strong>
          </TrackedPhoneLink>
        </div>
      </div>
    </div>
  )
}
