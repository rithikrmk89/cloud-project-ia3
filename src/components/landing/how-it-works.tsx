import { Search, MapPin, MousePointerClick, Truck, CheckCircle2, Star } from "lucide-react";

const STEPS = [
  { icon: MapPin, title: "Select location", desc: "Pick state, district and area, then add your address." },
  { icon: Search, title: "Choose service", desc: "Pick from 30 everyday services with transparent pricing." },
  { icon: MousePointerClick, title: "Choose your provider", desc: "Browse verified pros in your area and send a request." },
  { icon: Truck, title: "Provider arrives", desc: "Track status from accepted to on the way to on-site." },
  { icon: CheckCircle2, title: "Work completed", desc: "Before/after photos and a digital invoice." },
  { icon: Star, title: "Pay & review", desc: "Rate your provider and share feedback." },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative bg-gradient-ink px-4 py-20 text-white sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-spotlight pointer-events-none" />
      <div className="relative mx-auto max-w-7xl">
        <div className="text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-bee">How it works</span>
          <h2 className="mt-2 text-3xl font-bold sm:text-4xl">From request to relief in <span className="text-gradient-bee">6 simple steps</span></h2>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {STEPS.map((s, i) => (
            <div key={s.title} className="glass-card group relative overflow-hidden rounded-2xl p-6 hover-lift">
              <div className="absolute right-4 top-4 text-6xl font-bold text-white/5">{String(i + 1).padStart(2, "0")}</div>
              <div className="mb-4 inline-flex size-14 items-center justify-center rounded-2xl bg-gradient-bee text-ink shadow-bee">
                <s.icon size={26} />
              </div>
              <h3 className="text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-white/60">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
