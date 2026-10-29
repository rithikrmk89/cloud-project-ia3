import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { supabase } from "@/integrations/supabase/client";
import { Receipt, Download } from "lucide-react";

type InvoiceRow = {
  id: string;
  service_charge: number;
  material_cost: number;
  total: number | null;
  status: string;
  created_at: string;
  notes: string | null;
  booking_id: string;
  booking?: { area: string | null; address: string; provider_id: string | null; service?: string | null };
  provider_name?: string | null;
};

export const Route = createFileRoute("/_authenticated/invoices")({
  head: () => ({ meta: [{ title: "Invoices — Near Bee" }] }),
  component: InvoicesPage,
});

function InvoicesPage() {
  const [rows, setRows] = useState<InvoiceRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return;
      const { data: bookings } = await supabase
        .from("bookings")
        .select("id, area, address, provider_id, service_categories(name)")
        .eq("user_id", auth.user.id);
      const bookingIds = (bookings ?? []).map((b) => b.id);
      if (bookingIds.length === 0) { setLoading(false); return; }
      const { data: invs } = await supabase
        .from("invoices")
        .select("id, booking_id, service_charge, material_cost, total, status, notes, created_at")
        .in("booking_id", bookingIds)
        .order("created_at", { ascending: false });
      const providerIds = Array.from(new Set((bookings ?? []).map((b) => b.provider_id).filter(Boolean) as string[]));
      const { data: profs } = providerIds.length
        ? await supabase.from("profiles").select("id, full_name").in("id", providerIds)
        : { data: [] as { id: string; full_name: string | null }[] };
      const profMap = new Map((profs ?? []).map((p) => [p.id, p.full_name]));
      const bookMap = new Map((bookings ?? []).map((b) => [b.id, { area: b.area, address: b.address, provider_id: b.provider_id, service: (b as { service_categories?: { name?: string } }).service_categories?.name ?? null }]));
      setRows((invs ?? []).map((i) => {
        const b = bookMap.get(i.booking_id);
        return { ...i, booking: b, provider_name: b?.provider_id ? profMap.get(b.provider_id) ?? null : null };
      }));
      setLoading(false);
    })();
  }, []);

  function download(inv: InvoiceRow) {
    const html = `<html><head><title>Invoice ${inv.id.slice(0, 8)}</title>
<style>body{font-family:system-ui;padding:40px;max-width:600px;margin:auto;color:#111}h1{color:#f59e0b;margin:0}hr{border:none;border-top:1px solid #ddd;margin:20px 0}table{width:100%;border-collapse:collapse}td{padding:8px 0}.total{font-size:1.5rem;font-weight:bold;color:#f59e0b}.brand{font-size:1.5rem;font-weight:bold}</style></head><body>
<div class="brand">🐝 Near Bee</div><h1>Invoice</h1>
<p><strong>Invoice #:</strong> ${inv.id.slice(0, 8).toUpperCase()}<br>
<strong>Date:</strong> ${new Date(inv.created_at).toLocaleDateString()}<br>
<strong>Provider:</strong> ${inv.provider_name ?? "—"}<br>
<strong>Service:</strong> ${inv.booking?.service ?? "—"}<br>
<strong>Address:</strong> ${inv.booking?.address ?? "—"}, ${inv.booking?.area ?? ""}</p>
<hr><table>
<tr><td>Service charge</td><td style="text-align:right">₹${Number(inv.service_charge).toFixed(2)}</td></tr>
<tr><td>Material cost</td><td style="text-align:right">₹${Number(inv.material_cost).toFixed(2)}</td></tr>
${inv.notes ? `<tr><td colspan="2"><em>Notes: ${inv.notes}</em></td></tr>` : ""}
</table><hr>
<table><tr><td class="total">Total</td><td class="total" style="text-align:right">₹${Number(inv.total).toFixed(2)}</td></tr></table>
<p style="margin-top:40px;color:#777;font-size:0.85rem">Thank you for choosing Near Bee.</p>
<script>window.print()</script></body></html>`;
    const w = window.open("", "_blank");
    if (w) { w.document.write(html); w.document.close(); }
  }

  return (
    <DashboardShell title="Invoices">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Your invoices</h2>
        {loading ? (
          <p className="text-sm text-white/60">Loading…</p>
        ) : rows.length === 0 ? (
          <div className="glass-card flex flex-col items-center rounded-2xl p-12 text-center">
            <Receipt size={42} className="text-bee/60" />
            <p className="mt-4 text-lg font-semibold">No invoices yet</p>
            <p className="mt-1 text-sm text-white/60">Digital invoices appear here once a job is completed.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {rows.map((inv) => (
              <div key={inv.id} className="glass-card rounded-2xl p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-white/50">Invoice #{inv.id.slice(0, 8).toUpperCase()}</p>
                    <p className="font-bold">{inv.booking?.service ?? "Service"} — {inv.provider_name ?? "Provider"}</p>
                    <p className="text-xs text-white/60">{inv.booking?.area ?? ""} · {new Date(inv.created_at).toLocaleDateString()}</p>
                    <div className="mt-3 text-sm text-white/70">
                      Service ₹{Number(inv.service_charge).toLocaleString()} + Materials ₹{Number(inv.material_cost).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-bee">₹{Number(inv.total).toLocaleString()}</p>
                    <button onClick={() => download(inv)} className="mt-2 inline-flex items-center gap-1 rounded-full bg-bee px-4 py-1.5 text-xs font-bold text-ink">
                      <Download size={12} /> PDF
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
