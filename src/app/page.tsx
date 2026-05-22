export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center min-h-screen px-6">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <span className="inline-block px-3 py-1 text-xs font-semibold tracking-widest uppercase text-[#3B82F6] border border-[#3B82F6]/30 rounded-full mb-6">
            Private
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-[#F1F5F9] mb-3">
            NOVA
          </h1>
          <p className="text-[#94A3B8] text-base leading-relaxed">
            Executive networking intelligence. Built for conferences, trade missions, and diplomatic events.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <a
            href="/contacts"
            className="inline-flex items-center justify-center h-12 px-6 rounded-lg bg-[#3B82F6] text-white font-medium hover:bg-[#2563EB] transition-colors"
          >
            Open Network
          </a>
          <p className="text-xs text-[#475569]">
            Stage 1 — Foundation complete
          </p>
        </div>
      </div>
    </main>
  );
}
