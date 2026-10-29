import { Zap, ShieldCheck, Receipt, Star } from "lucide-react";

const REASONS = [
  { icon: Zap, title: "Fast booking", desc: "Nearest pro assigned in under a minute." },
  { icon: ShieldCheck, title: "Verified experts", desc: "Every pro background-checked & rated." },
  { icon: Receipt, title: "Transparent billing", desc: "Digital invoices. No hidden charges, ever." },
  { icon: Star, title: "Real reviews", desc: "Honest ratings from verified customers." },
];

export function WhyNearBee() {
  return (
    <section id="why" className="bg-black px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-bee">Why Near Bee</span>
          <h2 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
            Built for <span className="text-gradient-bee">peace of mind</span>
          </h2>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {REASONS.map((r) => (
            <div key={r.title} className="glass-card rounded-2xl p-6 text-white hover-lift">
              <div className="mb-4 inline-flex size-12 items-center justify-center rounded-xl bg-bee/15 text-bee">
                <r.icon size={22} />
              </div>
              <h3 className="text-lg font-semibold">{r.title}</h3>
              <p className="mt-2 text-sm text-white/60">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
