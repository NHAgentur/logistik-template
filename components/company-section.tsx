export function CompanySection() {
  return (
    <section className="flex h-full w-full items-center justify-center bg-zinc-950 px-6 py-16 text-zinc-100">
      <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
        <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-accent">
          Nordhaven Logistics
        </p>
        <h1 className="mb-6 text-balance text-4xl font-semibold tracking-tight md:text-7xl">
          Moving cargo. Moving markets.
        </h1>
        <p className="mx-auto mb-10 max-w-2xl text-pretty text-base leading-relaxed text-zinc-400 md:text-lg">
          Pan-European overnight freight, full-truck-load and last-mile delivery —
          operated from twelve hubs, monitored in real time, signed for at every door.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <a
            href="#contact"
            className="rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-fg transition hover:opacity-90"
          >
            Request a quote
          </a>
          <a
            href="#fleet"
            className="rounded-full border border-zinc-700 px-6 py-3 text-sm font-medium text-zinc-100 transition hover:bg-zinc-900"
          >
            See the fleet
          </a>
        </div>
      </div>
    </section>
  )
}
