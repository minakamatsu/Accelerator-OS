'use client'

export default function LeadPipelineError({ reset }: { reset: () => void }) {
  return (
    <div className="mx-auto grid min-h-[60vh] max-w-3xl place-items-center">
      <section className="rounded-[2rem] border border-[#d7dbd2] bg-white p-8 text-center shadow-sm sm:p-12">
        <p className="text-xs font-black tracking-[0.14em] text-[#6d7b23] uppercase">
          Pipeline unavailable
        </p>
        <h1 className="mt-4 text-4xl font-black tracking-[-0.05em]">
          Website requests did not load.
        </h1>
        <p className="mt-4 leading-7 text-[#5d6964]">
          No request data was changed. Retry this secure business view.
        </p>
        <button
          className="mt-7 rounded-full bg-[#173e38] px-6 py-3 font-black text-white"
          onClick={reset}
          type="button"
        >
          Try again
        </button>
      </section>
    </div>
  )
}
