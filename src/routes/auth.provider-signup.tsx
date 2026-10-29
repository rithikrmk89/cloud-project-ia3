import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AuthShell, FormField, SubmitBtn } from "@/components/auth-shell";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/auth/provider-signup")({
  head: () => ({ meta: [{ title: "Become a Provider — Near Bee" }] }),
  component: ProviderSignUp,
});

type Category = { id: string; name: string };

function ProviderSignUp() {
  const navigate = useNavigate();
  const [cats, setCats] = useState<Category[]>([]);
  const [form, setForm] = useState({
    full_name: "", age: "", phone: "", email: "", service_category_id: "", experience_years: "",
    area: "", address: "", password: "", confirm: "",
  });
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [idProof, setIdProof] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const upd = (k: keyof typeof form) => (v: string) => setForm((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    supabase.from("service_categories").select("id,name").order("display_order").then(({ data }) => {
      if (data) setCats(data);
    });
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const phoneDigits = form.phone.replace(/\D/g, "");
    if (!/^\d{10}$/.test(phoneDigits)) return toast.error("Enter a valid 10-digit phone number");
    if (form.password.length < 6) return toast.error("Password must be at least 6 characters");
    if (form.password !== form.confirm) return toast.error("Passwords don't match");
    if (!form.service_category_id) return toast.error("Pick a service category");
    if (!idProof) return toast.error("Upload an ID proof");
    setLoading(true);

    const { data: signupData, error: signupErr } = await supabase.auth.signUp({
      email: form.email, password: form.password,
      options: {
        emailRedirectTo: window.location.origin + "/dashboard",
        data: { full_name: form.full_name, phone: phoneDigits, area: form.area, address: form.address, role: "provider" },
      },
    });
    if (signupErr || !signupData.user) { setLoading(false); return toast.error(signupErr?.message || "Signup failed"); }
    const userId = signupData.user.id;

    // Upload ID proof (private)
    const idPath = `${userId}/id-${Date.now()}-${idProof.name}`;
    const { error: idErr } = await supabase.storage.from("id-proofs").upload(idPath, idProof);
    if (idErr) console.warn("ID upload:", idErr.message);

    // Upload avatar (private bucket)
    let avatarUrl: string | null = null;
    if (profilePhoto) {
      const aPath = `${userId}/avatar-${Date.now()}-${profilePhoto.name}`;
      const { error: aErr } = await supabase.storage.from("avatars").upload(aPath, profilePhoto);
      if (!aErr) avatarUrl = aPath;
    }

    // Create provider row
    await supabase.from("providers").insert({
      id: userId,
      age: form.age ? Number(form.age) : null,
      service_category_id: form.service_category_id,
      experience_years: form.experience_years ? Number(form.experience_years) : null,
      id_proof_url: idPath,
      status: "pending",
    });

    if (avatarUrl) await supabase.from("profiles").update({ avatar_url: avatarUrl }).eq("id", userId);

    setLoading(false);
    toast.success("Application submitted! We'll review and notify you within 24 hours.");
    navigate({ to: "/auth/provider-pending" });
  }

  return (
    <AuthShell title="Become a Provider" subtitle="Apply once. Get verified. Start earning.">
      <form onSubmit={onSubmit} className="space-y-3">
        <FormField label="Full Name" name="full_name" required value={form.full_name} onChange={upd("full_name")} />
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Age" name="age" type="number" required value={form.age} onChange={upd("age")} />
          <FormField label="Phone" name="phone" type="tel" required value={form.phone} onChange={(v) => upd("phone")(v.replace(/\D/g, "").slice(0, 10))} />
        </div>
        <FormField label="Email" name="email" type="email" required value={form.email} onChange={upd("email")} autoComplete="email" />

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-white/80">Service Category <span className="text-bee">*</span></span>
            <select required value={form.service_category_id} onChange={(e) => upd("service_category_id")(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:border-bee/60 focus:outline-none">
              <option value="" className="bg-black">Select…</option>
              {cats.map((c) => <option key={c.id} value={c.id} className="bg-black">{c.name}</option>)}
            </select>
          </label>
          <FormField label="Experience (yrs)" name="experience_years" type="number" required value={form.experience_years} onChange={upd("experience_years")} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Area" name="area" required value={form.area} onChange={upd("area")} />
          <FormField label="Address" name="address" required value={form.address} onChange={upd("address")} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-white/80">Profile Photo</span>
            <input type="file" accept="image/*" onChange={(e) => setProfilePhoto(e.target.files?.[0] ?? null)}
              className="block w-full text-xs text-white/70 file:mr-2 file:rounded-lg file:border-0 file:bg-bee/20 file:px-3 file:py-2 file:text-bee" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-white/80">ID Proof <span className="text-bee">*</span></span>
            <input type="file" required accept="image/*,application/pdf" onChange={(e) => setIdProof(e.target.files?.[0] ?? null)}
              className="block w-full text-xs text-white/70 file:mr-2 file:rounded-lg file:border-0 file:bg-bee/20 file:px-3 file:py-2 file:text-bee" />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Password" name="password" type="password" required value={form.password} onChange={upd("password")} autoComplete="new-password" />
          <FormField label="Confirm" name="confirm" type="password" required value={form.confirm} onChange={upd("confirm")} autoComplete="new-password" />
        </div>

        <SubmitBtn loading={loading}>Register as Provider</SubmitBtn>
      </form>
      <p className="mt-6 text-center text-sm text-white/60">
        Already approved? <Link to="/auth/provider-signin" className="font-semibold text-bee hover:underline">Sign in</Link>
      </p>
    </AuthShell>
  );
}
