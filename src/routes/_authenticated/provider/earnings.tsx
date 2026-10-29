import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { RoleShell } from "@/components/role-shell";
import { ProviderGuard } from "./route";
import { PROVIDER_NAV } from "./dashboard";
import { supabase } from "@/integrations/supabase/client";

type Row = { id: string; total: number | null; created_at: string; booking_id: string };

export const Route = createFileRoute("/_authenticated/provider/earnings")({
  head: () => ({ meta: [{ title: "Earnings — Near Bee Provider" }] }),
  component: () => <ProviderGuard><Earnings /></ProviderGuard>,
});

function Earnings() {
  const [rows, setRows] = useState<Row[]>([]);
  const total = rows.reduce((s, r) => s + Number(r.total ?? 0), 0);

  useEffect(() => {
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return;
      const { data } = await supabase
        .from("invoices")
        .select("id, total, created_at, booking_id, bookings!inner(provider_id)")
        .eq("bookings.provider_id", auth.user.id)
        .order("created_at", { ascending: false });
      setRows((data ?? []) as unknown as Row[]);
    })();
  }, []);

  return (
    <RoleShell title="Earnings" nav={PROVIDER_NAV} brand="Provider" showChat={false}>
      <div className="space-y-6">
        <div className="rounded-3xl bg-gradient-bee p-6 text-ink">
          <p className="text-xs font-semibold uppercase tracking-wider">Lifetime earnings</p>
          <p className="mt-2 text-4xl font-bold">₹{total.toLocaleString()}</p>
          <p className="mt-1 text-sm text-ink/80">{rows.length} invoices generated</p>
        </div>
        <div className="glass-card overflow-hidden rounded-2xl">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-xs uppercase tracking-wider text-white/60">
              <tr><th className="px-4 py-3">Date</th><th className="px-4 py-3">Booking</th><th className="px-4 py-3 text-right">Amount</th></tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan={3} className="px-4 py-10 text-center text-white/50">No invoices yet.</td></tr>
              ) : rows.map((r) => (
                <tr key={r.id} className="border-t border-white/5">
                  <td className="px-4 py-3 text-white/70">{new Date(r.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 font-mono text-xs text-white/50">{r.booking_id.slice(0, 8)}</td>
                  <td className="px-4 py-3 text-right font-semibold text-bee">₹{Number(r.total ?? 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </RoleShell>
  );
}
