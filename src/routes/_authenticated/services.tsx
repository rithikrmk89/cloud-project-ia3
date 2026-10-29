import { createFileRoute, Link } from "@tanstack/react-router";
import { DashboardShell } from "@/components/dashboard-shell";
import { SERVICES } from "@/lib/services";
import * as Icons from "lucide-react";
import { Star, Zap } from "lucide-react";

export const Route = createFileRoute("/_authenticated/services")({
  head: () => ({ meta: [{ title: "Services — Near Bee" }] }),
  component: ServicesPage,
});

function ServicesPage() {
  return (
    <DashboardShell title="Services">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Browse services</h2>
          <p className="text-sm text-white/60">12 essential home services, all backed by verified helpers.</p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {SERVICES.map((s) => {
            const Icon = (Icons[s.icon as keyof typeof Icons] as React.ComponentType<{ size?: number }>) ?? Icons.Wrench;
            return (
              <Link key={s.slug} to="/book" className="glass-card group rounded-2xl p-5 hover-lift">
                <div className={`inline-flex size-12 items-center justify-center rounded-xl bg-gradient-to-br ${s.color} text-ink shadow-bee`}>
                  <Icon size={22} />
                </div>
                <h3 className="mt-3 font-semibold">{s.name}</h3>
                <div className="mt-1 flex items-center gap-3 text-xs text-white/60">
                  <span className="flex items-center gap-1"><Star size={11} className="text-bee" /> 4.8</span>
                  <span className="flex items-center gap-1"><Zap size={11} className="text-bee" /> {s.count} pros</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </DashboardShell>
  );
}
