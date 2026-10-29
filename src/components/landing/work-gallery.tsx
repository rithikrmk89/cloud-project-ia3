const ITEMS = [
  { tag: "Gardening", emoji: "🌿" },
  { tag: "House Cleaning", emoji: "🧹" },
  { tag: "Pet Care", emoji: "🐾" },
  { tag: "Car Washing", emoji: "🚗" },
  { tag: "Cook Service", emoji: "🍳" },
  { tag: "Movers & Packers", emoji: "📦" },
];

export function WorkGallery() {
  return (
    <section className="bg-gradient-ink px-4 py-20 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-bee">Recent Work</span>
          <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
            See the <span className="text-gradient-bee">before & after</span>
          </h2>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ITEMS.map((it, i) => (
            <div key={it.tag} className="glass-card group relative aspect-[4/3] overflow-hidden rounded-2xl hover-lift">
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-bee/20 via-transparent to-bee/5 text-7xl">
                {it.emoji}
              </div>
              <div className="absolute inset-x-4 bottom-4 flex items-center justify-between">
                <span className="rounded-full bg-black/60 px-3 py-1 text-xs font-semibold backdrop-blur">{it.tag}</span>
                <span className="rounded-full bg-bee px-3 py-1 text-xs font-semibold text-ink">Before/After</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
