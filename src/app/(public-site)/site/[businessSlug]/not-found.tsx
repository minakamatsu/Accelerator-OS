export default function SiteUnavailable() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#10231f] px-6 text-[#f6f4ed]">
      <section className="max-w-xl text-center">
        <p className="text-xs font-black tracking-[0.18em] text-[#d8f23f] uppercase">
          Site unavailable
        </p>
        <h1 className="mt-5 text-5xl leading-none font-black tracking-[-0.055em] sm:text-7xl">
          This business site is not currently published.
        </h1>
        <p className="mx-auto mt-6 max-w-lg text-lg leading-8 text-white/65">
          The address may be incorrect, or the business may have paused its
          public site. Please confirm the web address and try again.
        </p>
      </section>
    </main>
  )
}
