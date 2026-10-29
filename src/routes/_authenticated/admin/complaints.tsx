import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { RoleShell } from "@/components/role-shell";
import { AdminGuard } from "./route";
import { ADMIN_NAV } from "./dashboard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Row = { id: string; subject: string; description: string; status: string; created_at: string; user_id: string };

export const Route = createFileRoute("/_authenticated/admin/complaints")({
  head: () => ({ meta: [{ title: "Complaints — Admin" }] }),
  component: () => <AdminGuard><ComplaintsAdmin /></AdminGuard>,
});

function ComplaintsAdmin() {
  const [rows, setRows] = useState<Row[]>([]);
  const [filter, setFilter] = useState("open");

  useEffect(() => { void load(); }, [filter]);
  async function load() {
    let q = supabase.from("complaints").select("*").order("created_at", { ascending: false });
    if (filter !== "all") q = q.eq("status", filter as "open");
    const { data } = await q;
    setRows((data ?? []) as Row[]);
  }

  async function setStatus(id: string, status: "in_review" | "resolved" | "closed") {
    const { error } = await supabase.from("complaints").update({ status }).eq("id", id);
    if (error) toast.error(error.message); else { toast.success(`Marked ${status}`); void load(); }
  }

  return (
    <RoleShell title="Complaints" nav={ADMIN_NAV} brand="Admin" showChat={false}>
      <div className="space-y-4">
        <div className="flex gap-2">
          {["open", "in_review", "resolved", "closed", "all"].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`rounded-full px-4 py-1.5 text-xs font-semibold ${filter === f ? "bg-bee text-ink" : "border border-white/10 text-white/70"}`}>{f.replace("_", " ")}</button>
          ))}
        </div>
        <div className="space-y-3">
          {rows.length === 0 ? (
            <div className="glass-card rounded-2xl p-10 text-center text-white/60">No complaints here.</div>
          ) : rows.map((r) => (
            <div key={r.id} className="glass-card rounded-2xl p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="font-bold">{r.subject}</p>
                  <p className="mt-1 text-sm text-white/70">{r.description}</p>
                  <p className="mt-2 text-xs text-white/40">{new Date(r.created_at).toLocaleString()} · User {r.user_id.slice(0, 8)}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="rounded-full bg-white/10 px-3 py-1 text-center text-xs font-semibold">{r.status.replace("_", " ")}</span>
                  {r.status === "open" && <button onClick={() => setStatus(r.id, "in_review")} className="rounded-full bg-sky-500 px-3 py-1.5 text-xs font-semibold text-ink">Start review</button>}
                  {r.status !== "resolved" && r.status !== "closed" && <button onClick={() => setStatus(r.id, "resolved")} className="rounded-full bg-green-500 px-3 py-1.5 text-xs font-semibold text-ink">Resolve</button>}
                  {r.status !== "closed" && <button onClick={() => setStatus(r.id, "closed")} className="rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold">Close</button>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </RoleShell>
  );
}
