import { Link } from "@tanstack/react-router";
import heroImg from "@/assets/hero-workers.jpg";
import { Search, MapPin, Star, Zap, ShieldCheck } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-ink pt-28 pb-20 sm:pt-32">
      <div className="absolute inset-0 bg-spotlight pointer-events-none" />
      <div className="absolute inset-0 honeycomb-bg pointer-events-none" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        {/* Left */}
        <div className="text-white animate-slide-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-bee/30 bg-bee/10 px-3 py-1 text-xs font-medium text-bee">
            🐝 Trusted local professionals
          </div>
          <h1 className="mt-5 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            Find <span className="text-gradient-bee">trusted local</span> pros near you
          </h1>
          <p className="mt-5 max-w-xl text-base text-white/70 sm:text-lg">
            Book pet care, pest control, house cleaning, cook service, movers, laundry and more — verified, fast, and at your doorstep in minutes.
          </p>

          {/* Search */}
          <div className="mt-8 glass-card rounded-2xl p-2 sm:p-3">
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="flex flex-1 items-center gap-2 rounded-xl bg-white/5 px-4 py-3">
                <Search size={18} className="text-bee" />
                <input
                  type="text"
                  placeholder="What service do you need?"
                  className="w-full bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
                />
              </div>
              <div className="flex flex-1 items-center gap-2 rounded-xl bg-white/5 px-4 py-3">
                <MapPin size={18} className="text-bee" />
                <input
                  type="text"
                  placeholder="Your area"
                  className="w-full bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
                />
              </div>
              <Link
                to="/auth/user-signup"
                className="rounded-xl bg-gradient-bee px-6 py-3 text-center text-sm font-semibold text-ink shadow-bee transition hover:scale-[1.02]"
              >
                Search
              </Link>
            </div>
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/auth/user-signup" className="rounded-full bg-gradient-bee px-6 py-3 text-sm font-semibold text-ink shadow-bee transition hover:scale-105">
              Book a Service
            </Link>
            <Link to="/auth/provider-signup" className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/10">
              Become a Provider
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-6 text-white/60">
            <div className="flex items-center gap-2 text-sm"><Star size={16} className="text-bee" /> 4.9 avg rating</div>
            <div className="flex items-center gap-2 text-sm"><ShieldCheck size={16} className="text-bee" /> Verified pros</div>
            <div className="flex items-center gap-2 text-sm"><Zap size={16} className="text-bee" /> Booked in 60s</div>
          </div>
        </div>

        {/* Right */}
        <div className="relative">
          <div className="relative mx-auto aspect-square max-w-lg">
            <div className="absolute inset-0 rounded-full bg-bee/20 blur-3xl" />
            <img
              src={heroImg}
              alt="Trusted local service professionals"
              width={1280}
              height={1280}
              className="relative h-full w-full rounded-3xl object-cover"
            />
            {/* Floating cards */}
            <div className="absolute -left-4 top-10 glass-card rounded-2xl px-4 py-3 text-white shadow-card animate-float">
              <div className="flex items-center gap-2">
                <Star size={16} className="fill-bee text-bee" />
                <span className="text-sm font-semibold">4.9 Rating</span>
              </div>
              <p className="text-xs text-white/60">From 12k+ reviews</p>
            </div>
            <div className="absolute -right-4 top-1/2 glass-card rounded-2xl px-4 py-3 text-white shadow-card animate-float" style={{ animationDelay: "1s" }}>
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-sm font-semibold">Available now</span>
              </div>
              <p className="text-xs text-white/60">500+ pros online</p>
            </div>
            <div className="absolute -bottom-4 left-10 glass-card rounded-2xl px-4 py-3 text-white shadow-card animate-float" style={{ animationDelay: "2s" }}>
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-bee" />
                <span className="text-sm font-semibold">Fast booking</span>
              </div>
              <p className="text-xs text-white/60">~60 seconds</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
