import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { RoleShell } from "@/components/role-shell";
import { ProviderGuard } from "./route";
import { PROVIDER_NAV } from "./dashboard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const FLOW = ["accepted", "on_the_way", "in_progress", "completed"] as const;
type Status = (typeof FLOW)[number] | "pending" | "cancelled";

type Job = { id: string; status: Status; address: string; area: string | null; notes: string | null; created_at: string };

export const Route = createFileRoute("/_authenticated/provider/jobs")({
  head: () => ({ meta: [{ title: "Active Jobs — Near Bee Provider" }] }),
  component: () => <ProviderGuard><Jobs /></ProviderGuard>,
});

function Jobs() {
  const [rows, setRows] = useState<Job[]>([]);
  const [invoice, setInvoice] = useState<{ bookingId: string; service: string; material: string } | null>(null);

  useEffect(() => { void load(); }, []);
  async function load() {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;
    const { data } = await supabase
      .from("bookings")
      .select("id, status, address, area, notes, created_at")
      .eq("provider_id", auth.user.id)
      .in("status", ["accepted", "on_the_way", "in_progress", "completed"])
      .order("created_at", { ascending: false });
    setRows((data ?? []) as Job[]);
  }

  async function advance(id: string, current: Status) {
    const idx = FLOW.indexOf(current as (typeof FLOW)[number]);
    if (idx < 0 || idx >= FLOW.length - 1) return;
    const next = FLOW[idx + 1];
    const { error } = await supabase.from("bookings").update({ status: next }).eq("id", id);
    if (error) toast.error(error.message); else { toast.success(`Marked ${next.replace("_", " ")}`); void load(); }
  }

  async function submitInvoice() {
    if (!invoice) return;
    const service_charge = Number(invoice.service) || 0;
    const material_cost = Number(invoice.material) || 0;
    const { error } = await supabase.from("invoices").insert({ booking_id: invoice.bookingId, service_charge, material_cost, status: "sent" });
    if (error) toast.error(error.message); else { toast.success("Invoice generated"); setInvoice(null); }
  }

  return (
    <RoleShell title="Active Jobs" nav={PROVIDER_NAV} brand="Provider" showChat={false}>
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Your active jobs</h2>
        {rows.length === 0 ? (
          <div className="glass-card rounded-2xl p-10 text-center text-white/60">No active jobs. Accept requests to get started.</div>
        ) : rows.map((j) => (
          <div key={j.id} className="glass-card rounded-2xl p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">{j.area ?? "—"} · <span className="font-normal text-white/60">{j.address}</span></p>
                {j.notes && <p className="mt-1 text-sm text-white/70">"{j.notes}"</p>}
                <p className="mt-1 text-xs text-white/40">{new Date(j.created_at).toLocaleString()}</p>
              </div>
              <span className="rounded-full bg-bee/15 px-3 py-1 text-xs font-semibold text-bee">{j.status.replace("_", " ")}</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {j.status !== "completed" && (
                <button onClick={() => advance(j.id, j.status)} className="rounded-full bg-bee px-4 py-2 text-xs font-semibold text-ink">
                  Mark {FLOW[FLOW.indexOf(j.status as (typeof FLOW)[number]) + 1]?.replace("_", " ")}
                </button>
              )}
              {(j.status === "in_progress" || j.status === "completed") && (
                <button onClick={() => setInvoice({ bookingId: j.id, service: "", material: "" })} className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold hover:bg-white/5">Generate invoice</button>
              )}
            </div>
          </div>
        ))}
      </div>

      {invoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setInvoice(null)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-2xl border border-white/10 bg-black p-6">
            <h3 className="text-lg font-bold">Generate invoice</h3>
            <div className="mt-4 space-y-3">
              <label className="block text-xs text-white/60">Service charge (₹)
                <input type="number" value={invoice.service} onChange={(e) => setInvoice({ ...invoice, service: e.target.value })} className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white" />
              </label>
              <label className="block text-xs text-white/60">Material cost (₹)
                <input type="number" value={invoice.material} onChange={(e) => setInvoice({ ...invoice, material: e.target.value })} className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white" />
              </label>
              <p className="text-sm font-semibold">Total: ₹{((Number(invoice.service) || 0) + (Number(invoice.material) || 0)).toLocaleString()}</p>
              <div className="flex gap-2 pt-2">
                <button onClick={submitInvoice} className="flex-1 rounded-full bg-bee py-2 text-sm font-semibold text-ink">Send invoice</button>
                <button onClick={() => setInvoice(null)} className="flex-1 rounded-full border border-white/20 py-2 text-sm font-semibold">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </RoleShell>
  );
}
