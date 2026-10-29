import { SERVICES } from "@/lib/services";
import * as Icons from "lucide-react";
import { Link } from "@tanstack/react-router";

export function ServicesGrid() {
  return (
    <section id="services" className="relative bg-black px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-bee">Popular Services</span>
          <h2 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
            12 essential home services, <span className="text-gradient-bee">one buzz away</span>
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-white/60">
            From babysitting to pest control — book verified pros at transparent starting prices.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {SERVICES.map((s, i) => {
            const Icon = (Icons[s.icon as keyof typeof Icons] as React.ComponentType<{ size?: number; className?: string }>) ?? Icons.Wrench;
            return (
              <Link
                key={s.slug}
                to="/auth/user-signup"
                className="glass-card group relative overflow-hidden rounded-2xl p-5 text-left hover-lift"
                style={{ animationDelay: `${i * 30}ms` }}
              >
                <div className={`mb-3 inline-flex size-12 items-center justify-center rounded-xl bg-gradient-to-br ${s.color} text-ink shadow-bee transition group-hover:scale-110`}>
                  <Icon size={22} />
                </div>
                <h3 className="text-sm font-semibold text-white">{s.name}</h3>
                <p className="mt-1 text-xs text-white/50">From <span className="font-semibold text-bee">₹{s.price}</span></p>
                <div className="absolute -right-8 -top-8 size-20 rounded-full bg-bee/10 blur-2xl opacity-0 transition group-hover:opacity-100" />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
