import { useEffect, useRef, useState } from "react";

function Counter({ to, suffix = "", decimals = 0 }: { to: number; suffix?: string; decimals?: number }) {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const duration = 1600;
          const tick = (now: number) => {
            const p = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            setN(to * eased);
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      });
    }, { threshold: 0.4 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to]);
  return <span ref={ref}>{n.toFixed(decimals)}{suffix}</span>;
}

export function Stats() {
  return (
    <section className="relative bg-gradient-ink px-4 py-20 text-white sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-spotlight pointer-events-none" />
      <div className="relative mx-auto grid max-w-7xl grid-cols-2 gap-6 lg:grid-cols-4">
        {[
          { v: 10000, suf: "+", label: "Happy users" },
          { v: 500, suf: "+", label: "Verified pros" },
          { v: 20, suf: "+", label: "Services" },
          { v: 4.9, suf: "★", label: "Average rating", dec: 1 },
        ].map((s) => (
          <div key={s.label} className="glass-card rounded-2xl p-6 text-center hover-lift">
            <div className="text-4xl font-bold text-gradient-bee sm:text-5xl">
              <Counter to={s.v} suffix={s.suf} decimals={s.dec ?? 0} />
            </div>
            <p className="mt-2 text-sm text-white/60">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
