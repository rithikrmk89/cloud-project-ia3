import { Star, Quote } from "lucide-react";

const REVIEWS = [
  { name: "Priya S.", role: "Vadavalli", text: "Booked a babysitter at short notice and she arrived within 30 minutes. Life-saver!", rating: 5 },
  { name: "Arjun M.", role: "Coimbatore", text: "House cleaning was spotless. Loved the before/after photos in the invoice.", rating: 5 },
  { name: "Lakshmi R.", role: "Saravanampatti", text: "Transparent pricing, no haggling. My go-to for cooking, cleaning and gardening help.", rating: 5 },
];

export function Testimonials() {
  return (
    <section className="bg-black px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-bee">Testimonials</span>
          <h2 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
            Loved by <span className="text-gradient-bee">thousands</span> of homes
          </h2>
        </div>
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {REVIEWS.map((r) => (
            <div key={r.name} className="glass-card relative rounded-2xl p-6 text-white hover-lift">
              <Quote className="absolute right-4 top-4 size-8 text-bee/20" />
              <div className="flex gap-1">
                {Array.from({ length: r.rating }).map((_, i) => (
                  <Star key={i} size={14} className="fill-bee text-bee" />
                ))}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-white/80">"{r.text}"</p>
              <div className="mt-6 flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-gradient-bee text-sm font-bold text-ink">{r.name[0]}</div>
                <div>
                  <p className="text-sm font-semibold">{r.name}</p>
                  <p className="text-xs text-white/50">{r.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
