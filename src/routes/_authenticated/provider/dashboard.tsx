import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { RoleShell, type NavItem } from "@/components/role-shell";
import { ProviderGuard } from "./route";
import { supabase } from "@/integrations/supabase/client";
import { LayoutDashboard, Inbox, Briefcase, Wallet, Images, Wrench, Power, Star, CheckCircle2, UserCog } from "lucide-react";

export const Route = createFileRoute("/_authenticated/provider/dashboard")({
  head: () => ({ meta: [{ title: "Provider Dashboard — Near Bee" }] }),
  component: () => <ProviderGuard><ProviderDashboard /></ProviderGuard>,
});

export const PROVIDER_NAV: ReadonlyArray<NavItem> = [
  { to: "/provider/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/provider/requests", icon: Inbox, label: "Requests" },
  { to: "/provider/jobs", icon: Briefcase, label: "Active Jobs" },
  { to: "/provider/earnings", icon: Wallet, label: "Earnings" },
  { to: "/provider/gallery", icon: Images, label: "Gallery" },
  { to: "/provider/profile", icon: UserCog, label: "Profile & Area" },
];

function ProviderDashboard() {
  const [available, setAvailable] = useState(false);
  const [stats, setStats] = useState({ pending: 0, active: 0, completed: 0, earnings: 0, rating: 0 });

  useEffect(() => { void load(); }, []);
  async function load() {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;
    const { data: prov } = await supabase.from("providers").select("available, rating, total_jobs").eq("id", auth.user.id).maybeSingle();
    if (prov) setAvailable(prov.available);
    const { data: bookings } = await supabase.from("bookings").select("id, status").eq("provider_id", auth.user.id);
    const pending = bookings?.filter((b) => b.status === "pending").length ?? 0;
    const active = bookings?.filter((b) => ["accepted", "on_the_way", "in_progress"].includes(b.status as string)).length ?? 0;
    const completed = bookings?.filter((b) => b.status === "completed").length ?? 0;
    const { data: inv } = await supabase.from("invoices").select("total, booking_id, bookings!inner(provider_id)").eq("bookings.provider_id", auth.user.id);
    const earnings = inv?.reduce((s, i) => s + Number(i.total ?? 0), 0) ?? 0;
    setStats({ pending, active, completed, earnings, rating: Number(prov?.rating ?? 0) });
  }

  async function toggleAvailable(next: boolean) {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;
    setAvailable(next);
    await supabase.from("providers").update({ available: next }).eq("id", auth.user.id);
  }

  return (
    <RoleShell title="Provider Dashboard" nav={PROVIDER_NAV} brand="Provider" showChat={false}>
      <div className="space-y-8">
        <div className="glass-card flex flex-wrap items-center justify-between gap-4 rounded-3xl p-6">
          <div>
            <p className="text-xs uppercase tracking-wider text-white/50">Your status</p>
            <p className="mt-1 text-2xl font-bold">{available ? "🟢 Online & accepting jobs" : "⚫️ Offline"}</p>
            <p className="mt-1 text-sm text-white/60">Toggle off when you're done for the day.</p>
          </div>
          <button onClick={() => toggleAvailable(!available)} className={`flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition ${available ? "bg-bee text-ink" : "bg-white/10 text-white hover:bg-white/20"}`}>
            <Power size={16} /> {available ? "Go offline" : "Go online"}
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Inbox} label="Pending requests" value={String(stats.pending)} tint="from-bee to-amber-400" />
          <StatCard icon={Wrench} label="Active jobs" value={String(stats.active)} tint="from-sky-400 to-blue-500" />
          <StatCard icon={CheckCircle2} label="Completed" value={String(stats.completed)} tint="from-green-400 to-emerald-500" />
          <StatCard icon={Wallet} label="Earnings" value={`₹${stats.earnings.toLocaleString()}`} tint="from-violet-400 to-purple-500" />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Link to="/provider/requests" className="glass-card flex items-center justify-between rounded-2xl p-5 hover-lift">
            <div><p className="font-semibold">New booking requests</p><p className="text-sm text-white/60">Accept or decline jobs.</p></div>
            <Inbox className="text-bee" />
          </Link>
          <Link to="/provider/jobs" className="glass-card flex items-center justify-between rounded-2xl p-5 hover-lift">
            <div><p className="font-semibold">Active jobs</p><p className="text-sm text-white/60">Update status & invoice.</p></div>
            <Briefcase className="text-bee" />
          </Link>
          <Link to="/provider/gallery" className="glass-card flex items-center justify-between rounded-2xl p-5 hover-lift">
            <div><p className="font-semibold">Work gallery</p><p className="text-sm text-white/60">Show off before/after photos.</p></div>
            <Images className="text-bee" />
          </Link>
          <div className="glass-card flex items-center justify-between rounded-2xl p-5">
            <div><p className="font-semibold">Your rating</p><p className="text-sm text-white/60">Based on customer reviews.</p></div>
            <p className="flex items-center gap-1 text-2xl font-bold text-bee"><Star size={18} className="fill-bee" /> {stats.rating.toFixed(1)}</p>
          </div>
        </div>
      </div>
    </RoleShell>
  );
}

function StatCard({ icon: Icon, label, value, tint }: { icon: React.ComponentType<{ size?: number }>; label: string; value: string; tint: string }) {
  return (
    <div className="glass-card rounded-2xl p-5 hover-lift">
      <div className={`inline-flex size-11 items-center justify-center rounded-xl bg-gradient-to-br ${tint} text-ink shadow-bee`}><Icon size={20} /></div>
      <p className="mt-3 text-2xl font-bold">{value}</p>
      <p className="text-sm text-white/60">{label}</p>
    </div>
  );
}
