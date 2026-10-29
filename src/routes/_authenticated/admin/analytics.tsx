import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { RoleShell } from "@/components/role-shell";
import { AdminGuard } from "./route";
import { ADMIN_NAV } from "./dashboard";
import { supabase } from "@/integrations/supabase/client";

type Stats = {
  customers: { total: number; today: number; month: number };
  providers: { total: number; today: number; month: number };
  bookings: { total: number; today: number; month: number };
  revenue: { total: number; today: number; month: number };
  topService: string;
  topProvider: string;
};

export const Route = createFileRoute("/_authenticated/admin/analytics")({
  head: () => ({ meta: [{ title: "Analytics — Admin" }] }),
  component: () => <AdminGuard><Analytics /></AdminGuard>,
});

function Analytics() {
  const [s, setS] = useState<Stats | null>(null);

  useEffect(() => {
    (async () => {
      const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0);
      const startOfMonth = new Date(); startOfMonth.setDate(1); startOfMonth.setHours(0, 0, 0, 0);
      const iso = (d: Date) => d.toISOString();

      const [profilesAll, profilesToday, profilesMonth, provAll, provToday, provMonth, bkAll, bkToday, bkMonth, invAll, invToday, invMonth, bookingsAll, providersList] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", iso(startOfDay)),
        supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", iso(startOfMonth)),
        supabase.from("providers").select("id", { count: "exact", head: true }).eq("status", "approved"),
        supabase.from("providers").select("id", { count: "exact", head: true }).eq("status", "approved").gte("created_at", iso(startOfDay)),
        supabase.from("providers").select("id", { count: "exact", head: true }).eq("status", "approved").gte("created_at", iso(startOfMonth)),
        supabase.from("bookings").select("id", { count: "exact", head: true }),
        supabase.from("bookings").select("id", { count: "exact", head: true }).gte("created_at", iso(startOfDay)),
        supabase.from("bookings").select("id", { count: "exact", head: true }).gte("created_at", iso(startOfMonth)),
        supabase.from("invoices").select("total"),
        supabase.from("invoices").select("total").gte("created_at", iso(startOfDay)),
        supabase.from("invoices").select("total").gte("created_at", iso(startOfMonth)),
        supabase.from("bookings").select("service_category_id, provider_id, service_categories(name)"),
        supabase.from("providers").select("id, total_jobs, rating").order("total_jobs", { ascending: false }).limit(1),
      ]);

      const sumTotals = (r: { total: number | null }[] | null | undefined) => (r ?? []).reduce((a, b) => a + Number(b.total ?? 0), 0);

      // Top service & provider
      const svcCount = new Map<string, number>();
      const provCount = new Map<string, number>();
      (bookingsAll.data ?? []).forEach((b) => {
        const sn = (b as { service_categories?: { name?: string } }).service_categories?.name;
        if (sn) svcCount.set(sn, (svcCount.get(sn) ?? 0) + 1);
        if (b.provider_id) provCount.set(b.provider_id, (provCount.get(b.provider_id) ?? 0) + 1);
      });
      const topSvc = Array.from(svcCount.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
      let topProvName = "—";
      const topPid = (providersList.data ?? [])[0]?.id;
      if (topPid) {
        const { data: tp } = await supabase.from("profiles").select("full_name").eq("id", topPid).maybeSingle();
        topProvName = tp?.full_name ?? "—";
      }

      setS({
        customers: { total: profilesAll.count ?? 0, today: profilesToday.count ?? 0, month: profilesMonth.count ?? 0 },
        providers: { total: provAll.count ?? 0, today: provToday.count ?? 0, month: provMonth.count ?? 0 },
        bookings: { total: bkAll.count ?? 0, today: bkToday.count ?? 0, month: bkMonth.count ?? 0 },
        revenue: { total: sumTotals(invAll.data), today: sumTotals(invToday.data), month: sumTotals(invMonth.data) },
        topService: topSvc,
        topProvider: topProvName,
      });
    })();
  }, []);

  return (
    <RoleShell title="Analytics & Statistics" nav={ADMIN_NAV} brand="Admin" showChat={false}>
      {!s ? <p className="text-sm text-white/60">Loading…</p> : (
        <div className="space-y-8">
          <Section title="👥 Customer statistics" rows={[["Total customers", s.customers.total], ["Joined today", s.customers.today], ["Joined this month", s.customers.month]]} />
          <Section title="🔧 Provider statistics" rows={[["Total providers", s.providers.total], ["Joined today", s.providers.today], ["Joined this month", s.providers.month]]} />
          <Section title="📅 Booking statistics" rows={[["Orders today", s.bookings.today], ["Orders this month", s.bookings.month], ["Total orders", s.bookings.total]]} />
          <Section title="💰 Revenue statistics" rows={[["Revenue today", `₹${s.revenue.today.toLocaleString()}`], ["Revenue this month", `₹${s.revenue.month.toLocaleString()}`], ["Total revenue", `₹${s.revenue.total.toLocaleString()}`]]} />
          <Section title="🏆 Service statistics" rows={[["Most booked service", s.topService], ["Most active provider", s.topProvider]]} />
        </div>
      )}
    </RoleShell>
  );
}

function Section({ title, rows }: { title: string; rows: [string, number | string][] }) {
  return (
    <div>
      <h3 className="mb-3 text-lg font-bold">{title}</h3>
      <div className="grid gap-3 sm:grid-cols-3">
        {rows.map(([label, value]) => (
          <div key={label} className="glass-card rounded-2xl p-5">
            <p className="text-xs uppercase tracking-wider text-white/50">{label}</p>
            <p className="mt-2 text-2xl font-bold text-bee">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
