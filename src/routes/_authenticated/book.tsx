import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { supabase } from "@/integrations/supabase/client";
import { STATES, districtsOf, areasOf } from "@/lib/locations";
import { SERVICES } from "@/lib/services";
import * as Icons from "lucide-react";
import { toast } from "sonner";
import { Star, MapPin, ArrowRight, Check } from "lucide-react";

export const Route = createFileRoute("/_authenticated/book")({
  head: () => ({ meta: [{ title: "Book a Service — Near Bee" }] }),
  component: BookPage,
});

type Provider = {
  id: string;
  rating: number;
  total_jobs: number;
  experience_years: number | null;
  available: boolean;
  profile?: { full_name: string | null; area: string | null };
};

function BookPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [state, setState] = useState("Tamil Nadu");
  const [district, setDistrict] = useState("Coimbatore");
  const [area, setArea] = useState("Vadavalli");
  const [address, setAddress] = useState("");
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [serviceName, setServiceName] = useState<string>("");
  const [servicePrice, setServicePrice] = useState<number>(0);
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string; icon: string | null; color: string | null; base_price: number }[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("service_categories").select("id, name, slug, icon, color, base_price").order("display_order");
      setCategories(data ?? []);
    })();
  }, []);

  const districts = useMemo(() => districtsOf(state), [state]);
  const areas = useMemo(() => areasOf(state, district), [state, district]);

  async function loadProviders(catId: string) {
    const { data } = await supabase
      .from("providers")
      .select("id, rating, total_jobs, experience_years, available")
      .eq("status", "approved")
      .eq("service_category_id", catId);
    const ids = (data ?? []).map((p) => p.id);
    const { data: profs } = ids.length
      ? await supabase.from("profiles").select("id, full_name, area").in("id", ids)
      : { data: [] as { id: string; full_name: string | null; area: string | null }[] };
    const map = new Map((profs ?? []).map((p) => [p.id, p]));
    // Prefer same-area providers first
    const enriched = (data ?? []).map((p) => ({ ...p, profile: map.get(p.id) }));
    enriched.sort((a, b) => {
      const aNear = (a.profile?.area ?? "").toLowerCase() === area.toLowerCase() ? 1 : 0;
      const bNear = (b.profile?.area ?? "").toLowerCase() === area.toLowerCase() ? 1 : 0;
      if (aNear !== bNear) return bNear - aNear;
      return (b.rating ?? 0) - (a.rating ?? 0);
    });
    setProviders(enriched);
  }

  async function book(providerId: string) {
    setSubmitting(true);
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) { toast.error("Sign in first"); setSubmitting(false); return; }
    if (!serviceId) { toast.error("Pick a service"); setSubmitting(false); return; }
    if (!address.trim()) { toast.error("Add your address"); setSubmitting(false); return; }
    const { error } = await supabase.from("bookings").insert({
      user_id: auth.user.id,
      provider_id: providerId,
      service_category_id: serviceId,
      area: `${area}, ${district}`,
      address,
      status: "pending",
    });
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Request sent to provider — they'll respond shortly");
    navigate({ to: "/bookings" });
  }

  return (
    <DashboardShell title="Book a Service">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Stepper */}
        <div className="flex items-center gap-2 text-xs">
          {["Location", "Service", "Provider"].map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div className={`flex size-7 items-center justify-center rounded-full text-xs font-bold ${step > i + 1 ? "bg-bee text-ink" : step === i + 1 ? "bg-bee text-ink" : "bg-white/10 text-white/50"}`}>
                {step > i + 1 ? <Check size={14} /> : i + 1}
              </div>
              <span className={step >= i + 1 ? "font-semibold" : "text-white/40"}>{label}</span>
              {i < 2 && <div className="h-px w-8 bg-white/10" />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="glass-card space-y-4 rounded-2xl p-6">
            <h2 className="text-xl font-bold flex items-center gap-2"><MapPin className="text-bee" size={20} /> Where do you need the service?</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              <Select label="State" value={state} options={STATES} onChange={(v) => { setState(v); setDistrict(districtsOf(v)[0] ?? ""); setArea(areasOf(v, districtsOf(v)[0] ?? "")[0] ?? ""); }} />
              <Select label="District" value={district} options={districts} onChange={(v) => { setDistrict(v); setArea(areasOf(state, v)[0] ?? ""); }} />
              <Select label="Area" value={area} options={areas} onChange={setArea} />
            </div>
            <label className="block text-xs text-white/60">Full address (street, landmark)
              <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="e.g. 42, MG Road, near park" className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white" />
            </label>
            <button disabled={!address.trim()} onClick={() => setStep(2)} className="rounded-full bg-bee px-5 py-2 text-sm font-bold text-ink disabled:opacity-40">Next: Pick service <ArrowRight size={14} className="inline ml-1" /></button>
          </div>
        )}

        {step === 2 && (
          <div className="glass-card space-y-4 rounded-2xl p-6">
            <h2 className="text-xl font-bold">Which service?</h2>
            <p className="text-sm text-white/60">{area}, {district}, {state}</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {SERVICES.map((s) => {
                const Icon = (Icons[s.icon as keyof typeof Icons] as React.ComponentType<{ size?: number }>) ?? Icons.Wrench;
                const cat = categories.find((c) => c.slug === s.slug);
                const active = cat && serviceId === cat.id;
                const price = cat?.base_price ?? s.price;
                return (
                  <button key={s.slug} disabled={!cat} onClick={() => { if (cat) { setServiceId(cat.id); setServiceName(s.name); setServicePrice(Number(price)); } }} className={`glass-card rounded-2xl p-4 text-left transition ${active ? "ring-2 ring-bee" : "hover-lift"} ${!cat ? "opacity-40" : ""}`}>
                    <div className={`inline-flex size-10 items-center justify-center rounded-xl bg-gradient-to-br ${s.color} text-ink`}><Icon size={18} /></div>
                    <p className="mt-2 text-sm font-semibold">{s.name}</p>
                    <p className="text-xs text-bee">From ₹{price}</p>
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setStep(1)} className="rounded-full border border-white/15 px-4 py-2 text-sm">Back</button>
              <button disabled={!serviceId} onClick={() => { setStep(3); if (serviceId) void loadProviders(serviceId); }} className="rounded-full bg-bee px-5 py-2 text-sm font-bold text-ink disabled:opacity-40">Next: Choose provider</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-xl font-bold">Choose your provider</h2>
              <p className="mt-1 text-sm text-white/60">{serviceName} · From ₹{servicePrice} · {area}, {district}</p>
              <p className="mt-1 text-xs text-white/50">Providers in <span className="text-bee font-semibold">{area}</span> are shown first.</p>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold text-white/70">{providers.length} verified providers offering {serviceName}</p>
              {providers.length === 0 ? (
                <div className="glass-card rounded-2xl p-10 text-center text-white/60">No providers available for this service yet. Try another service or check back soon.</div>
              ) : providers.map((p) => {
                const nearby = (p.profile?.area ?? "").toLowerCase() === area.toLowerCase();
                return (
                  <div key={p.id} className={`glass-card flex items-center justify-between rounded-2xl p-4 ${nearby ? "ring-1 ring-bee/40" : ""}`}>
                    <div className="flex items-center gap-3">
                      <div className="flex size-12 items-center justify-center rounded-full bg-gradient-bee text-lg font-bold text-ink">{(p.profile?.full_name ?? "P")[0]}</div>
                      <div>
                        <p className="font-semibold">{p.profile?.full_name ?? "Provider"} {nearby && <span className="ml-1 rounded-full bg-bee/20 px-2 py-0.5 text-[10px] font-bold text-bee">NEARBY</span>}</p>
                        <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-white/60">
                          <span className="flex items-center gap-1"><Star size={10} className="fill-bee text-bee" />{p.rating.toFixed(1)}</span>
                          <span>· {p.total_jobs} jobs</span>
                          <span>· {p.experience_years ?? 0}y exp</span>
                          <span>· {p.profile?.area ?? "—"}</span>
                          <span className={p.available ? "text-green-400" : "text-white/40"}>{p.available ? "● Available" : "○ Offline"}</span>
                        </p>
                      </div>
                    </div>
                    <button disabled={submitting || !p.available} onClick={() => book(p.id)} className="rounded-full bg-bee px-4 py-2 text-xs font-bold text-ink disabled:opacity-50">Send request</button>
                  </div>
                );
              })}
            </div>

            <button onClick={() => setStep(2)} className="rounded-full border border-white/15 px-4 py-2 text-sm">Back</button>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <label className="block text-xs text-white/60">{label}
      <select value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white">
        {options.map((o) => <option key={o} value={o} className="bg-black">{o}</option>)}
      </select>
    </label>
  );
}
