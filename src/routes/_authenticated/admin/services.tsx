import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { RoleShell } from "@/components/role-shell";
import { AdminGuard } from "./route";
import { ADMIN_NAV } from "./dashboard";
import { supabase } from "@/integrations/supabase/client";

type Row = { id: string; name: string; slug: string; icon: string | null; description: string | null; display_order: number; base_price: number | null };

export const Route = createFileRoute("/_authenticated/admin/services")({
  head: () => ({ meta: [{ title: "Services — Admin" }] }),
  component: () => <AdminGuard><Services /></AdminGuard>,
});

function Services() {
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => { void load(); }, []);
  async function load() {
    const { data } = await supabase.from("service_categories").select("*").order("display_order").order("name");
    setRows((data ?? []) as Row[]);
  }

  return (
    <RoleShell title="Service Categories" nav={ADMIN_NAV} brand="Admin" showChat={false}>
      <div className="space-y-6">
        <div className="glass-card rounded-2xl p-5">
          <h2 className="font-bold">Platform services</h2>
          <p className="text-sm text-white/60">The service catalogue is fixed. Providers register against these categories and users book from them.</p>
          <p className="mt-2 text-xs text-white/50">{rows.length} categories active</p>
        </div>
        <div className="glass-card overflow-hidden rounded-2xl">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-xs uppercase tracking-wider text-white/60">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Icon</th>
                <th className="px-4 py-3">Starting Price</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-10 text-center text-white/50">No categories yet.</td></tr>
              ) : rows.map((r) => (
                <tr key={r.id} className="border-t border-white/5">
                  <td className="px-4 py-3 font-semibold">{r.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-white/60">{r.slug}</td>
                  <td className="px-4 py-3 text-white/60">{r.icon ?? "—"}</td>
                  <td className="px-4 py-3 text-bee font-semibold">₹{r.base_price ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </RoleShell>
  );
}
