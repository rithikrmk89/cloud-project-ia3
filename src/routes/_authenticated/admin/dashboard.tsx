import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { RoleShell, type NavItem } from "@/components/role-shell";
import { AdminGuard } from "./route";
import { supabase } from "@/integrations/supabase/client";
import { LayoutDashboard, Users, ShieldCheck, Wrench, Calendar, MessageSquareWarning, ArrowRight, BarChart3 } from "lucide-react";

export const ADMIN_NAV: ReadonlyArray<NavItem> = [
  { to: "/admin/dashboard", icon: LayoutDashboard, label: "Overview" },
  { to: "/admin/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/admin/users", icon: Users, label: "Users" },
  { to: "/admin/providers", icon: ShieldCheck, label: "Provider Approvals" },
  { to: "/admin/services", icon: Wrench, label: "Service Categories" },
  { to: "/admin/bookings", icon: Calendar, label: "All Bookings" },
  { to: "/admin/complaints", icon: MessageSquareWarning, label: "Complaints" },
];

export const Route = createFileRoute("/_authenticated/admin/dashboard")({
  head: () => ({ meta: [{ title: "Admin — Near Bee" }] }),
  component: () => <AdminGuard><AdminHome /></AdminGuard>,
});

function AdminHome() {
  const [stats, setStats] = useState({ users: 0, providers: 0, pendingProviders: 0, bookings: 0, openComplaints: 0, revenue: 0 });

  useEffect(() => {
    (async () => {
      const [u, p, pp, b, oc, inv] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("providers").select("id", { count: "exact", head: true }).eq("status", "approved"),
        supabase.from("providers").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("bookings").select("id", { count: "exact", head: true }),
        supabase.from("complaints").select("id", { count: "exact", head: true }).eq("status", "open"),
        supabase.from("invoices").select("total"),
      ]);
      const revenue = (inv.data ?? []).reduce((s, i) => s + Number(i.total ?? 0), 0);
      setStats({
        users: u.count ?? 0,
        providers: p.count ?? 0,
        pendingProviders: pp.count ?? 0,
        bookings: b.count ?? 0,
        openComplaints: oc.count ?? 0,
        revenue,
      });
    })();
  }, []);

  return (
    <RoleShell title="Admin Overview" nav={ADMIN_NAV} brand="Admin" showChat={false}>
      <div className="space-y-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Stat label="Total users" value={stats.users} />
          <Stat label="Approved providers" value={stats.providers} />
          <Stat label="Pending approvals" value={stats.pendingProviders} accent />
          <Stat label="Total bookings" value={stats.bookings} />
          <Stat label="Open complaints" value={stats.openComplaints} accent />
          <Stat label="Platform revenue" value={`₹${stats.revenue.toLocaleString()}`} />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <QuickLink to="/admin/providers" title="Review provider applications" subtitle={`${stats.pendingProviders} pending`} />
          <QuickLink to="/admin/complaints" title="Resolve complaints" subtitle={`${stats.openComplaints} open`} />
          <QuickLink to="/admin/services" title="Manage service categories" subtitle="Add or edit services" />
          <QuickLink to="/admin/bookings" title="Monitor all bookings" subtitle="See live activity" />
        </div>
      </div>
    </RoleShell>
  );
}

function Stat({ label, value, accent }: { label: string; value: number | string; accent?: boolean }) {
  return (
    <div className={`glass-card rounded-2xl p-5 ${accent ? "ring-1 ring-bee/40" : ""}`}>
      <p className="text-xs uppercase tracking-wider text-white/50">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${accent ? "text-bee" : ""}`}>{value}</p>
    </div>
  );
}

function QuickLink({ to, title, subtitle }: { to: string; title: string; subtitle: string }) {
  return (
    <Link to={to} className="glass-card flex items-center justify-between rounded-2xl p-5 hover-lift">
      <div><p className="font-semibold">{title}</p><p className="text-sm text-white/60">{subtitle}</p></div>
      <ArrowRight className="text-bee" />
    </Link>
  );
}
