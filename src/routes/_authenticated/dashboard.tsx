import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, CheckCircle2, Clock, Star, ArrowRight, Sparkles, Bell } from "lucide-react";
import { SERVICES } from "@/lib/services";
import * as Icons from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Near Bee" }] }),
  component: DashboardHome,
});

type Activity = { id: string; status: string; created_at: string; area: string | null; service?: string | null };

function DashboardHome() {
  const [stats, setStats] = useState({ total: 0, active: 0, completed: 0, ratings: 0, pending: 0 });
  const [recent, setRecent] = useState<Activity[]>([]);

  useEffect(() => {
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return;
      const [{ data: bookings }, { data: reviews }] = await Promise.all([
        supabase.from("bookings").select("id, status, created_at, area, service_categories(name)").eq("user_id", auth.user.id).order("created_at", { ascending: false }),
        supabase.from("reviews").select("id").eq("user_id", auth.user.id),
      ]);
      const list = bookings ?? [];
      const active = list.filter((b) => ["accepted", "on_the_way", "in_progress"].includes(b.status as string)).length;
      const completed = list.filter((b) => b.status === "completed").length;
      const pending = list.filter((b) => b.status === "pending").length;
      setStats({ total: list.length, active, completed, pending, ratings: reviews?.length ?? 0 });
      setRecent(list.slice(0, 5).map((b) => ({ id: b.id, status: b.status as string, created_at: b.created_at, area: b.area, service: (b as { service_categories?: { name?: string } }).service_categories?.name ?? null })));
    })();
  }, []);

  return (
    <DashboardShell title="Dashboard">
      <div className="space-y-8">
        {/* Hero CTA */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-bee p-6 text-ink sm:p-8">
          <div className="absolute -right-10 -top-10 size-48 rounded-full bg-white/20 blur-3xl" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full bg-black/10 px-3 py-1 text-xs font-semibold">
              <Sparkles size={12} /> Need help today?
            </div>
            <h2 className="mt-3 text-2xl font-bold sm:text-3xl">Book a verified pro in under a minute</h2>
            <p className="mt-2 text-sm text-ink/80">Set your location, pick a service, and choose a verified provider in your area.</p>
            <Link to="/book" className="mt-5 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-bee transition hover:scale-105">
              Book a service <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat icon={Calendar} label="Total Bookings" value={stats.total} tint="from-bee to-amber-400" />
          <Stat icon={CheckCircle2} label="Completed Services" value={stats.completed} tint="from-green-400 to-emerald-500" />
          <Stat icon={Clock} label="Pending Services" value={stats.pending + stats.active} tint="from-violet-400 to-purple-500" />
          <Stat icon={Star} label="Ratings Given" value={stats.ratings} tint="from-pink-400 to-rose-500" />
        </div>

        {/* Recent activity + timeline */}
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="glass-card rounded-2xl p-5 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">Recent activity</h3>
              <Link to="/bookings" className="text-xs text-bee">View all →</Link>
            </div>
            <div className="mt-3 space-y-3">
              {recent.length === 0 ? (
                <p className="text-sm text-white/50">No activity yet — book your first service.</p>
              ) : recent.map((a) => (
                <div key={a.id} className="flex items-start gap-3 border-l-2 border-bee/40 pl-3">
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{a.service ?? "Service"} · <span className="text-xs font-normal text-white/60">{a.area ?? "—"}</span></p>
                    <p className="text-xs text-white/50">{new Date(a.created_at).toLocaleString()}</p>
                  </div>
                  <span className="rounded-full bg-bee/15 px-2 py-0.5 text-[10px] font-semibold capitalize text-bee">{a.status.replace("_", " ")}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-2"><Bell size={16} className="text-bee" /><h3 className="font-bold">Notifications</h3></div>
            <ul className="mt-3 space-y-2 text-sm text-white/70">
              {stats.active > 0 && <li>🔧 You have {stats.active} active job{stats.active > 1 ? "s" : ""} in progress.</li>}
              {stats.pending > 0 && <li>⏳ {stats.pending} booking{stats.pending > 1 ? "s" : ""} awaiting a provider.</li>}
              {stats.completed > 0 && stats.ratings < stats.completed && <li>⭐ Rate your last service to help the community.</li>}
              {stats.total === 0 && <li>🐝 Welcome to Near Bee — start with your first booking!</li>}
            </ul>
          </div>
        </div>

        {/* Quick services */}
        <div>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h3 className="text-xl font-bold">Book a service</h3>
              <p className="text-sm text-white/60">All 30 services with transparent starting prices.</p>
            </div>
            <Link to="/services" className="text-sm font-semibold text-bee hover:underline">View all →</Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {SERVICES.map((s) => {
              const Icon = (Icons[s.icon as keyof typeof Icons] as React.ComponentType<{ size?: number }>) ?? Icons.Wrench;
              return (
                <Link key={s.slug} to="/book" className="glass-card group rounded-2xl p-4 text-center hover-lift">
                  <div className={`mx-auto mb-2 inline-flex size-10 items-center justify-center rounded-xl bg-gradient-to-br ${s.color} text-ink`}>
                    <Icon size={18} />
                  </div>
                  <p className="text-xs font-semibold">{s.name}</p>
                  <p className="mt-0.5 text-[10px] text-bee">From ₹{s.price}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

function Stat({ icon: Icon, label, value, tint }: { icon: React.ComponentType<{ size?: number }>; label: string; value: number; tint: string }) {
  return (
    <div className="glass-card rounded-2xl p-5 hover-lift">
      <div className={`inline-flex size-11 items-center justify-center rounded-xl bg-gradient-to-br ${tint} text-ink shadow-bee`}>
        <Icon size={20} />
      </div>
      <p className="mt-3 text-2xl font-bold">{value}</p>
      <p className="text-sm text-white/60">{label}</p>
    </div>
  );
}
