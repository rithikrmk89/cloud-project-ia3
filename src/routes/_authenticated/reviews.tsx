import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { supabase } from "@/integrations/supabase/client";
import { Star } from "lucide-react";
import { toast } from "sonner";

type Reviewable = {
  id: string;
  provider_id: string;
  provider_name: string;
  service: string | null;
  created_at: string;
};

type ReviewRow = {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  provider_name?: string | null;
};

export const Route = createFileRoute("/_authenticated/reviews")({
  head: () => ({ meta: [{ title: "Ratings & Reviews — Near Bee" }] }),
  component: ReviewsPage,
});

function ReviewsPage() {
  const [pending, setPending] = useState<Reviewable[]>([]);
  const [done, setDone] = useState<ReviewRow[]>([]);
  const [form, setForm] = useState<{ bookingId: string; providerId: string; rating: number; comment: string } | null>(null);

  useEffect(() => { void load(); }, []);

  async function load() {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;
    const [{ data: completed }, { data: myReviews }] = await Promise.all([
      supabase.from("bookings").select("id, provider_id, created_at, service_categories(name)").eq("user_id", auth.user.id).eq("status", "completed"),
      supabase.from("reviews").select("id, rating, comment, created_at, provider_id, booking_id").eq("user_id", auth.user.id).order("created_at", { ascending: false }),
    ]);
    const reviewedBookings = new Set((myReviews ?? []).map((r) => r.booking_id));
    const reviewablesRaw = (completed ?? []).filter((b) => b.provider_id && !reviewedBookings.has(b.id));
    const providerIds = Array.from(new Set([...reviewablesRaw.map((b) => b.provider_id!), ...(myReviews ?? []).map((r) => r.provider_id)]));
    const { data: profs } = providerIds.length
      ? await supabase.from("profiles").select("id, full_name").in("id", providerIds)
      : { data: [] as { id: string; full_name: string | null }[] };
    const nameMap = new Map((profs ?? []).map((p) => [p.id, p.full_name ?? "Provider"]));
    setPending(reviewablesRaw.map((b) => ({
      id: b.id,
      provider_id: b.provider_id!,
      provider_name: nameMap.get(b.provider_id!) ?? "Provider",
      service: (b as { service_categories?: { name?: string } }).service_categories?.name ?? null,
      created_at: b.created_at,
    })));
    setDone((myReviews ?? []).map((r) => ({ ...r, provider_name: nameMap.get(r.provider_id) ?? "Provider" })));
  }

  async function submit() {
    if (!form) return;
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;
    const { error } = await supabase.from("reviews").insert({
      booking_id: form.bookingId,
      user_id: auth.user.id,
      provider_id: form.providerId,
      rating: form.rating,
      comment: form.comment || null,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Thanks for your review!");
    setForm(null);
    void load();
  }

  return (
    <DashboardShell title="Ratings & Reviews">
      <div className="space-y-6">
        <section>
          <h2 className="text-2xl font-bold">Pending reviews</h2>
          <p className="text-sm text-white/60">Rate completed services so providers improve.</p>
          <div className="mt-3 space-y-3">
            {pending.length === 0 ? (
              <div className="glass-card rounded-2xl p-8 text-center text-sm text-white/60">All caught up — no pending reviews.</div>
            ) : pending.map((p) => (
              <div key={p.id} className="glass-card flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4">
                <div>
                  <p className="font-semibold">{p.service ?? "Service"} — {p.provider_name}</p>
                  <p className="text-xs text-white/50">{new Date(p.created_at).toLocaleDateString()}</p>
                </div>
                <button onClick={() => setForm({ bookingId: p.id, providerId: p.provider_id, rating: 5, comment: "" })} className="rounded-full bg-bee px-4 py-2 text-xs font-bold text-ink">Write review</button>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-lg font-bold">Your past reviews</h3>
          <div className="mt-3 space-y-3">
            {done.length === 0 ? (
              <p className="text-sm text-white/50">No reviews yet.</p>
            ) : done.map((r) => (
              <div key={r.id} className="glass-card rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{r.provider_name}</p>
                  <div className="flex">{Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} className={i < r.rating ? "fill-bee text-bee" : "text-white/20"} />
                  ))}</div>
                </div>
                {r.comment && <p className="mt-1 text-sm text-white/70">"{r.comment}"</p>}
                <p className="mt-1 text-xs text-white/40">{new Date(r.created_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {form && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setForm(null)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-2xl border border-white/10 bg-black p-6">
            <h3 className="text-lg font-bold">Rate this service</h3>
            <div className="mt-4 flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} onClick={() => setForm({ ...form, rating: n })}>
                  <Star size={32} className={n <= form.rating ? "fill-bee text-bee" : "text-white/20"} />
                </button>
              ))}
            </div>
            <textarea value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} placeholder="Tell us what went well…" rows={4} className="mt-4 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white" />
            <div className="mt-4 flex gap-2">
              <button onClick={submit} className="flex-1 rounded-full bg-bee py-2 text-sm font-bold text-ink">Submit review</button>
              <button onClick={() => setForm(null)} className="flex-1 rounded-full border border-white/20 py-2 text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
