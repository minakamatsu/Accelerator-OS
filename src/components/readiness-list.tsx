import type { IntegrationReadiness } from '@/lib/integrations/readiness-schema'

export function ReadinessList({ items }: { items: IntegrationReadiness[] }) {
  return (
    <section
      aria-labelledby="readiness-title"
      className="rounded-[var(--radius-md)] bg-[var(--brand)] p-7 text-white sm:p-8"
    >
      <p className="text-xs font-black tracking-[0.16em] text-[var(--signal)] uppercase">
        Configuration
      </p>
      <h2
        id="readiness-title"
        className="mt-2 text-2xl font-black tracking-[-0.03em]"
      >
        Provider readiness
      </h2>
      <ul className="mt-8 divide-y divide-white/15">
        {items.map((item) => (
          <li
            key={item.name}
            className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0"
          >
            <div>
              <p className="font-bold">{item.name}</p>
              <p className="mt-1 text-sm leading-5 text-white/60">
                {item.detail}
              </p>
            </div>
            <span className="shrink-0 rounded-full border border-white/20 px-2.5 py-1 text-[0.68rem] font-black tracking-wide text-white/80 uppercase">
              {item.label}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
