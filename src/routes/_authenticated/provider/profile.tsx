import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { RoleShell } from "@/components/role-shell";
import { ProviderGuard } from "./route";
import { PROVIDER_NAV } from "./dashboard";
import { supabase } from "@/integrations/supabase/client";
import { STATES, districtsOf, areasOf } from "@/lib/locations";
import { Power, Save } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/provider/profile")({
  head: () => ({ meta: [{ title: "Profile & Service Area — Provider" }] }),
  component: () => <ProviderGuard><Profile /></ProviderGuard>,
});

function Profile() {
  const [available, setAvailable] = useState(false);
  const [bio, setBio] = useState("");
  const [experience, setExperience] = useState(0);
  const [serviceCategoryId, setServiceCategoryId] = useState<string | null>(null);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [state, setState] = useState("Tamil Nadu");
  const [district, setDistrict] = useState("Coimbatore");
  const [areasSelected, setAreasSelected] = useState<string[]>([]);
  const [primaryArea, setPrimaryArea] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { void load(); }, []);
  async function load() {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;
    const [{ data: prov }, { data: cats }, { data: prof }] = await Promise.all([
      supabase.from("providers").select("available, bio, experience_years, service_category_id").eq("id", auth.user.id).maybeSingle(),
      supabase.from("service_categories").select("id, name").order("display_order"),
      supabase.from("profiles").select("area").eq("id", auth.user.id).maybeSingle(),
    ]);
    if (prov) {
      setAvailable(prov.available);
      setBio(prov.bio ?? "");
      setExperience(prov.experience_years ?? 0);
      setServiceCategoryId(prov.service_category_id);
    }
    setCategories(cats ?? []);
    if (prof?.area) {
      const stored = prof.area.split("|").map((s) => s.trim()).filter(Boolean);
      if (stored.length) { setPrimaryArea(stored[0]); setAreasSelected(stored); }
    }
  }

  async function toggleAvailable(next: boolean) {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;
    setAvailable(next);
    await supabase.from("providers").update({ available: next }).eq("id", auth.user.id);
  }

  function toggleArea(a: string) {
    setAreasSelected((cur) => cur.includes(a) ? cur.filter((x) => x !== a) : [...cur, a]);
    if (!primaryArea) setPrimaryArea(a);
  }

  async function save() {
    setSaving(true);
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) { setSaving(false); return; }
    const [{ error: e1 }, { error: e2 }] = await Promise.all([
      supabase.from("providers").update({ bio, experience_years: experience, service_category_id: serviceCategoryId }).eq("id", auth.user.id),
      supabase.from("profiles").update({ area: areasSelected.join(" | ") }).eq("id", auth.user.id),
    ]);
    setSaving(false);
    if (e1 || e2) toast.error((e1 ?? e2)!.message); else toast.success("Profile saved");
  }

  return (
    <RoleShell title="Profile & Service Area" nav={PROVIDER_NAV} brand="Provider" showChat={false}>
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="glass-card flex flex-wrap items-center justify-between gap-3 rounded-2xl p-5">
          <div>
            <p className="text-xs uppercase tracking-wider text-white/50">Availability</p>
            <p className="text-xl font-bold">{available ? "🟢 Available" : "🔴 Offline"}</p>
          </div>
          <button onClick={() => toggleAvailable(!available)} className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold ${available ? "bg-bee text-ink" : "bg-white/10"}`}>
            <Power size={14} /> {available ? "Go offline" : "Go online"}
          </button>
        </div>

        <div className="glass-card rounded-2xl p-5 space-y-4">
          <h3 className="text-lg font-bold">About you</h3>
          <label className="block text-xs text-white/60">Bio
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm" />
          </label>
          <label className="block text-xs text-white/60">Experience (years)
            <input type="number" value={experience} onChange={(e) => setExperience(Number(e.target.value) || 0)} className="mt-1 w-32 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm" />
          </label>
          <label className="block text-xs text-white/60">Primary service category
            <select value={serviceCategoryId ?? ""} onChange={(e) => setServiceCategoryId(e.target.value || null)} className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm">
              <option value="" className="bg-black">— select —</option>
              {categories.map((c) => <option key={c.id} value={c.id} className="bg-black">{c.name}</option>)}
            </select>
          </label>
          <p className="text-xs text-white/50">Note: one primary service today — multi-service support coming soon.</p>
        </div>

        <div className="glass-card rounded-2xl p-5 space-y-4">
          <h3 className="text-lg font-bold">Working locations</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-xs text-white/60">State
              <select value={state} onChange={(e) => { setState(e.target.value); setDistrict(districtsOf(e.target.value)[0] ?? ""); }} className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm">
                {STATES.map((s) => <option key={s} value={s} className="bg-black">{s}</option>)}
              </select>
            </label>
            <label className="block text-xs text-white/60">District
              <select value={district} onChange={(e) => setDistrict(e.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm">
                {districtsOf(state).map((d) => <option key={d} value={d} className="bg-black">{d}</option>)}
              </select>
            </label>
          </div>
          <div>
            <p className="text-xs text-white/60 mb-2">Tap to add/remove areas you serve:</p>
            <div className="flex flex-wrap gap-2">
              {areasOf(state, district).map((a) => {
                const on = areasSelected.includes(a);
                return (
                  <button key={a} onClick={() => toggleArea(a)} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${on ? "bg-bee text-ink" : "border border-white/15 text-white/70"}`}>{a}</button>
                );
              })}
            </div>
          </div>
          {areasSelected.length > 0 && (
            <div className="rounded-xl bg-white/5 p-3 text-sm">
              <p className="text-xs text-white/60">Serving:</p>
              <p>{areasSelected.join(" • ")}</p>
            </div>
          )}
        </div>

        <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-bee px-6 py-2.5 text-sm font-bold text-ink disabled:opacity-50">
          <Save size={14} /> {saving ? "Saving…" : "Save profile"}
        </button>
      </div>
    </RoleShell>
  );
}
