import { Link } from "@tanstack/react-router";
import { Wallet, Calendar, TrendingUp, ArrowRight } from "lucide-react";

export function BecomeProviderCTA() {
  return (
    <section id="provider" className="bg-black px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-bee p-8 sm:p-12 lg:p-16">
          <div className="absolute -right-20 -top-20 size-72 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute -bottom-32 -left-10 size-80 rounded-full bg-black/10 blur-3xl" />

          <div className="relative grid items-center gap-10 lg:grid-cols-2">
            <div className="text-ink">
              <div className="inline-flex items-center gap-2 rounded-full bg-black/10 px-3 py-1 text-xs font-semibold">
                🐝 Join the hive
              </div>
              <h2 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
                Grow your business with Near Bee
              </h2>
              <p className="mt-4 max-w-lg text-base text-ink/80">
                Get verified, get bookings, get paid. Set your own schedule and reach thousands of local customers.
              </p>
              <Link
                to="/auth/provider-signup"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3.5 text-sm font-semibold text-bee transition hover:scale-105"
              >
                Join now <ArrowRight size={16} />
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { icon: Wallet, t: "More earnings", d: "Multiple jobs per day" },
                { icon: TrendingUp, t: "More customers", d: "Get matched instantly" },
                { icon: Calendar, t: "Flexible hours", d: "Work when you want" },
                { icon: ArrowRight, t: "Grow faster", d: "Build a 5★ rating" },
              ].map((b) => (
                <div key={b.t} className="rounded-2xl bg-ink/90 p-5 text-white shadow-card">
                  <b.icon size={22} className="text-bee" />
                  <p className="mt-3 font-semibold">{b.t}</p>
                  <p className="text-sm text-white/60">{b.d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
