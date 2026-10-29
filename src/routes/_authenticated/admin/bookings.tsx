import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { RoleShell } from "@/components/role-shell";
import { AdminGuard } from "./route";
import { ADMIN_NAV } from "./dashboard";
import { supabase } from "@/integrations/supabase/client";

type Row = { id: string; status: string; address: string; area: string | null; created_at: string; user_id: string; provider_id: string | null };

export const Route = createFileRoute("/_authenticated/admin/bookings")({
  head: () => ({ meta: [{ title: "Bookings — Admin" }] }),
  component: () => <AdminGuard><BookingsAdmin /></AdminGuard>,
});

const COLOR: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-300",
  accepted: "bg-sky-500/15 text-sky-300",
  on_the_way: "bg-violet-500/15 text-violet-300",
  in_progress: "bg-blue-500/15 text-blue-300",
  completed: "bg-green-500/15 text-green-300",
  cancelled: "bg-red-500/15 text-red-300",
};

function BookingsAdmin() {
  const [rows, setRows] = useState<Row[]>([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    (async () => {
      let q = supabase.from("bookings").select("id, status, address, area, created_at, user_id, provider_id").order("created_at", { ascending: false }).limit(200);
      if (filter !== "all") q = q.eq("status", filter as "pending");
      const { data } = await q;
      setRows((data ?? []) as Row[]);
    })();
  }, [filter]);

  return (
    <RoleShell title="All Bookings" nav={ADMIN_NAV} brand="Admin" showChat={false}>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {["all", "pending", "accepted", "in_progress", "completed", "cancelled"].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`rounded-full px-4 py-1.5 text-xs font-semibold ${filter === f ? "bg-bee text-ink" : "border border-white/10 text-white/70"}`}>{f.replace("_", " ")}</button>
          ))}
        </div>
        <div className="glass-card overflow-x-auto rounded-2xl">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-xs uppercase tracking-wider text-white/60">
              <tr><th className="px-4 py-3">When</th><th className="px-4 py-3">Address</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">User</th><th className="px-4 py-3">Provider</th></tr>
            </thead>
            <tbody>
              {rows.length === 0 ? <tr><td colSpan={5} className="px-4 py-10 text-center text-white/50">No bookings.</td></tr> : rows.map((r) => (
                <tr key={r.id} className="border-t border-white/5">
                  <td className="px-4 py-3 text-xs text-white/60">{new Date(r.created_at).toLocaleString()}</td>
                  <td className="px-4 py-3">{r.area ?? "—"} · <span className="text-white/60">{r.address}</span></td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${COLOR[r.status] ?? "bg-white/10"}`}>{r.status.replace("_", " ")}</span></td>
                  <td className="px-4 py-3 font-mono text-xs text-white/50">{r.user_id.slice(0, 8)}</td>
                  <td className="px-4 py-3 font-mono text-xs text-white/50">{r.provider_id?.slice(0, 8) ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </RoleShell>
  );
}
