import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { RoleShell } from "@/components/role-shell";
import { AdminGuard } from "./route";
import { ADMIN_NAV } from "./dashboard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Check, X, FileText, MapPin, Phone, Mail, Calendar, Briefcase, User as UserIcon } from "lucide-react";

type Row = {
  id: string;
  status: string;
  bio: string | null;
  experience_years: number | null;
  age: number | null;
  id_proof_url: string | null;
  service_category_id: string | null;
  created_at: string;
  rating: number | null;
  total_jobs: number | null;
  profile?: { full_name: string | null; email: string | null; phone: string | null; area: string | null; address: string | null; avatar_url: string | null; created_at: string | null };
  category?: { name: string | null };
};

export const Route = createFileRoute("/_authenticated/admin/providers")({
  head: () => ({ meta: [{ title: "Provider Approvals — Admin" }] }),
  component: () => <AdminGuard><Approvals /></AdminGuard>,
});

function Approvals() {
  const [rows, setRows] = useState<Row[]>([]);
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected" | "all">("pending");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [avatarUrls, setAvatarUrls] = useState<Record<string, string>>({});

  useEffect(() => { void load(); }, [filter]);
  async function load() {
    let q = supabase.from("providers").select("id, status, bio, experience_years, age, id_proof_url, service_category_id, created_at, rating, total_jobs").order("created_at", { ascending: false });
    if (filter !== "all") q = q.eq("status", filter);
    const { data } = await q;
    const list = (data ?? []) as Row[];
    const ids = list.map((r) => r.id);
    const catIds = list.map((r) => r.service_category_id).filter(Boolean) as string[];
    const [{ data: profs }, { data: cats }] = await Promise.all([
      ids.length ? supabase.from("profiles").select("id, full_name, email, phone, area, address, avatar_url, created_at").in("id", ids) : Promise.resolve({ data: [] as Array<{ id: string; full_name: string | null; email: string | null; phone: string | null; area: string | null; address: string | null; avatar_url: string | null; created_at: string | null }> }),
      catIds.length ? supabase.from("service_categories").select("id, name").in("id", catIds) : Promise.resolve({ data: [] as { id: string; name: string }[] }),
    ]);
    const profMap = new Map((profs ?? []).map((p) => [p.id, p]));
    const catMap = new Map((cats ?? []).map((c) => [c.id, c]));
    const merged = list.map((r) => ({ ...r, profile: profMap.get(r.id) as Row["profile"], category: r.service_category_id ? catMap.get(r.service_category_id) : undefined }));
    setRows(merged);

    // Pre-sign avatar URLs (private bucket)
    const urlMap: Record<string, string> = {};
    await Promise.all(
      merged.map(async (r) => {
        const path = r.profile?.avatar_url;
        if (!path) return;
        const { data: s } = await supabase.storage.from("avatars").createSignedUrl(path, 600);
        if (s?.signedUrl) urlMap[r.id] = s.signedUrl;
      })
    );
    setAvatarUrls(urlMap);
  }

  async function setStatus(id: string, status: "approved" | "rejected" | "suspended") {
    const { error } = await supabase.from("providers").update({ status }).eq("id", id);
    if (error) toast.error(error.message); else { toast.success(`Marked ${status}`); void load(); }
  }

  async function viewIdProof(path: string) {
    const { data } = await supabase.storage.from("id-proofs").createSignedUrl(path, 300);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  }

  return (
    <RoleShell title="Provider Approvals" nav={ADMIN_NAV} brand="Admin" showChat={false}>
      <div className="space-y-4">
        <div className="flex gap-2">
          {(["pending", "approved", "rejected", "all"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`rounded-full px-4 py-1.5 text-xs font-semibold capitalize ${filter === f ? "bg-bee text-ink" : "border border-white/10 text-white/70"}`}>
              {f}
            </button>
          ))}
        </div>
        <div className="space-y-3">
          {rows.length === 0 ? (
            <div className="glass-card rounded-2xl p-10 text-center text-white/60">No providers in this list.</div>
          ) : rows.map((r) => {
            const isOpen = expanded === r.id;
            return (
              <div key={r.id} className="glass-card rounded-2xl p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex flex-1 items-start gap-4">
                    {avatarUrls[r.id] ? (
                      <img src={avatarUrls[r.id]} alt="" className="size-16 rounded-2xl object-cover" />
                    ) : (
                      <div className="flex size-16 items-center justify-center rounded-2xl bg-gradient-bee text-2xl font-bold text-ink">
                        {(r.profile?.full_name ?? "?")[0]}
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-lg font-bold">{r.profile?.full_name ?? "Unnamed"}</p>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${r.status === "approved" ? "bg-green-500/20 text-green-300" : r.status === "rejected" ? "bg-red-500/20 text-red-300" : "bg-bee/20 text-bee"}`}>{r.status}</span>
                      </div>
                      <div className="mt-1 grid gap-1 text-xs text-white/70 sm:grid-cols-2">
                        <span className="flex items-center gap-1"><Mail size={11} /> {r.profile?.email ?? "—"}</span>
                        <span className="flex items-center gap-1"><Phone size={11} /> {r.profile?.phone ?? "—"}</span>
                        <span className="flex items-center gap-1"><MapPin size={11} /> {r.profile?.area ?? "—"}</span>
                        <span className="flex items-center gap-1"><Briefcase size={11} /> {r.category?.name ?? "No category"}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button onClick={() => setExpanded(isOpen ? null : r.id)} className="rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold hover:bg-white/5">
                      {isOpen ? "Hide details" : "View full details"}
                    </button>
                    {r.id_proof_url && (
                      <button onClick={() => viewIdProof(r.id_proof_url!)} className="flex items-center gap-1 rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold hover:bg-white/5"><FileText size={12} /> View ID proof</button>
                    )}
                    {r.status !== "approved" && <button onClick={() => setStatus(r.id, "approved")} className="flex items-center gap-1 rounded-full bg-green-500 px-3 py-1.5 text-xs font-semibold text-ink"><Check size={12} /> Approve</button>}
                    {r.status !== "rejected" && <button onClick={() => setStatus(r.id, "rejected")} className="flex items-center gap-1 rounded-full bg-red-500 px-3 py-1.5 text-xs font-semibold"><X size={12} /> Reject</button>}
                    {r.status === "approved" && <button onClick={() => setStatus(r.id, "suspended")} className="rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold">Suspend</button>}
                  </div>
                </div>

                {isOpen && (
                  <div className="mt-4 grid gap-3 rounded-xl border border-white/10 bg-white/5 p-4 text-sm sm:grid-cols-2">
                    <Detail icon={UserIcon} label="Full name" value={r.profile?.full_name ?? "—"} />
                    <Detail icon={Mail} label="Email" value={r.profile?.email ?? "—"} />
                    <Detail icon={Phone} label="Phone" value={r.profile?.phone ?? "—"} />
                    <Detail icon={Calendar} label="Age" value={r.age != null ? `${r.age} years` : "—"} />
                    <Detail icon={Briefcase} label="Service category" value={r.category?.name ?? "—"} />
                    <Detail icon={Briefcase} label="Experience" value={`${r.experience_years ?? 0} years`} />
                    <Detail icon={MapPin} label="Area" value={r.profile?.area ?? "—"} />
                    <Detail icon={MapPin} label="Full address" value={r.profile?.address ?? "—"} />
                    <Detail icon={Calendar} label="Joined" value={new Date(r.created_at).toLocaleDateString()} />
                    <Detail icon={Calendar} label="Rating / Jobs" value={`${(r.rating ?? 0).toFixed(1)} ★ · ${r.total_jobs ?? 0} jobs`} />
                    {r.bio && (
                      <div className="sm:col-span-2">
                        <p className="text-[10px] uppercase tracking-wider text-white/40">Bio</p>
                        <p className="mt-1 text-white/80">"{r.bio}"</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </RoleShell>
  );
}

function Detail({ icon: Icon, label, value }: { icon: React.ComponentType<{ size?: number; className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <Icon size={14} className="mt-0.5 text-bee" />
      <div>
        <p className="text-[10px] uppercase tracking-wider text-white/40">{label}</p>
        <p className="text-white/90">{value}</p>
      </div>
    </div>
  );
}

