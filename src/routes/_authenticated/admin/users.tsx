import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { RoleShell } from "@/components/role-shell";
import { AdminGuard } from "./route";
import { ADMIN_NAV } from "./dashboard";
import { supabase } from "@/integrations/supabase/client";

type Row = { id: string; full_name: string | null; email: string | null; phone: string | null; area: string | null; created_at: string };

export const Route = createFileRoute("/_authenticated/admin/users")({
  head: () => ({ meta: [{ title: "Users — Admin" }] }),
  component: () => <AdminGuard><UsersPage /></AdminGuard>,
});

function UsersPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("profiles").select("id, full_name, email, phone, area, created_at").order("created_at", { ascending: false }).limit(200);
      setRows((data ?? []) as Row[]);
    })();
  }, []);

  const filtered = rows.filter((r) =>
    !q || [r.full_name, r.email, r.phone, r.area].some((v) => v?.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <RoleShell title="Users" nav={ADMIN_NAV} brand="Admin" showChat={false}>
      <div className="space-y-4">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, email, phone…" className="w-full max-w-md rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm" />
        <div className="glass-card overflow-x-auto rounded-2xl">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-xs uppercase tracking-wider text-white/60">
              <tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Phone</th><th className="px-4 py-3">Area</th><th className="px-4 py-3">Joined</th></tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-t border-white/5">
                  <td className="px-4 py-3 font-semibold">{r.full_name ?? "—"}</td>
                  <td className="px-4 py-3 text-white/70">{r.email ?? "—"}</td>
                  <td className="px-4 py-3 text-white/70">{r.phone ?? "—"}</td>
                  <td className="px-4 py-3 text-white/70">{r.area ?? "—"}</td>
                  <td className="px-4 py-3 text-xs text-white/50">{new Date(r.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={5} className="px-4 py-10 text-center text-white/50">No users found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </RoleShell>
  );
}
