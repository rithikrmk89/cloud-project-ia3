import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { RoleShell } from "@/components/role-shell";
import { ProviderGuard } from "./route";
import { PROVIDER_NAV } from "./dashboard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Clock, MapPin, Check, X } from "lucide-react";

export const Route = createFileRoute("/_authenticated/provider/requests")({
  head: () => ({ meta: [{ title: "Requests — Near Bee Provider" }] }),
  component: () => <ProviderGuard><Requests /></ProviderGuard>,
});

type Booking = { id: string; address: string; area: string | null; notes: string | null; created_at: string; status: string; user_id: string };

function Requests() {
  const [rows, setRows] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { void load(); }, []);
  async function load() {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;
    // Show pending bookings assigned to me OR unassigned in my category
    const { data: prov } = await supabase.from("providers").select("service_category_id").eq("id", auth.user.id).maybeSingle();
    const { data } = await supabase
      .from("bookings")
      .select("id, address, area, notes, created_at, status, user_id, provider_id, service_category_id")
      .eq("status", "pending")
      .or(`provider_id.eq.${auth.user.id}${prov?.service_category_id ? `,and(provider_id.is.null,service_category_id.eq.${prov.service_category_id})` : ""}`)
      .order("created_at", { ascending: false });
    setRows((data ?? []) as Booking[]);
    setLoading(false);
  }

  async function accept(id: string) {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;
    const { error } = await supabase.from("bookings").update({ status: "accepted", provider_id: auth.user.id }).eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Job accepted"); void load(); }
  }
  async function decline(id: string) {
    const { error } = await supabase.from("bookings").update({ status: "cancelled" }).eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Declined"); void load(); }
  }

  return (
    <RoleShell title="Booking Requests" nav={PROVIDER_NAV} brand="Provider" showChat={false}>
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Incoming requests</h2>
        {loading ? <p className="text-white/60">Loading…</p> : rows.length === 0 ? (
          <div className="glass-card rounded-2xl p-10 text-center text-white/60">No new requests. Stay online to receive jobs.</div>
        ) : rows.map((b) => (
          <div key={b.id} className="glass-card flex flex-col gap-4 rounded-2xl p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2 text-sm font-semibold"><MapPin size={14} className="text-bee" /> {b.area ?? "—"} · <span className="font-normal text-white/60">{b.address}</span></div>
              {b.notes && <p className="text-sm text-white/70">"{b.notes}"</p>}
              <p className="flex items-center gap-1 text-xs text-white/40"><Clock size={11} /> {new Date(b.created_at).toLocaleString()}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => accept(b.id)} className="flex items-center gap-1 rounded-full bg-bee px-4 py-2 text-sm font-semibold text-ink hover:scale-105 transition"><Check size={14} /> Accept</button>
              <button onClick={() => decline(b.id)} className="flex items-center gap-1 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold hover:bg-white/5"><X size={14} /> Decline</button>
            </div>
          </div>
        ))}
      </div>
    </RoleShell>
  );
}
