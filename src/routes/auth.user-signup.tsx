import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthShell, FormField, SubmitBtn } from "@/components/auth-shell";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";

export const Route = createFileRoute("/auth/user-signup")({
  head: () => ({ meta: [{ title: "Create Account — Near Bee" }] }),
  component: UserSignUp,
});

function UserSignUp() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: "", phone: "", email: "", area: "", address: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const upd = (k: keyof typeof form) => (v: string) => setForm((p) => ({ ...p, [k]: v }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const phoneDigits = form.phone.replace(/\D/g, "");
    if (!/^\d{10}$/.test(phoneDigits)) return toast.error("Enter a valid 10-digit phone number");
    if (form.password.length < 6) return toast.error("Password must be at least 6 characters");
    if (form.password !== form.confirm) return toast.error("Passwords don't match");
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: window.location.origin + "/dashboard",
        data: {
          full_name: form.full_name, phone: phoneDigits, area: form.area, address: form.address, role: "user",
        },
      },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Account created! Welcome to Near Bee 🐝");
    navigate({ to: "/dashboard" });
  }

  async function onGoogle() {
    const res = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/dashboard" });
    if (res.error) toast.error(res.error.message);
    if (!res.redirected && !res.error) navigate({ to: "/dashboard" });
  }

  return (
    <AuthShell title="Create your account" subtitle="Join thousands booking trusted services.">
      <form onSubmit={onSubmit} className="space-y-3">
        <FormField label="Full Name" name="full_name" required value={form.full_name} onChange={upd("full_name")} placeholder="Priya Sharma" />
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Phone" name="phone" type="tel" required value={form.phone} onChange={(v) => upd("phone")(v.replace(/\D/g, "").slice(0, 10))} placeholder="9876543210" />
          <FormField label="Area" name="area" required value={form.area} onChange={upd("area")} placeholder="Vadavalli" />
        </div>
        <FormField label="Email" name="email" type="email" required value={form.email} onChange={upd("email")} placeholder="you@example.com" autoComplete="email" />
        <FormField label="Address" name="address" required value={form.address} onChange={upd("address")} placeholder="House no, street, landmark" />
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Password" name="password" type="password" required value={form.password} onChange={upd("password")} placeholder="At least 6 characters" autoComplete="new-password" />
          <FormField label="Confirm" name="confirm" type="password" required value={form.confirm} onChange={upd("confirm")} placeholder="Repeat password" autoComplete="new-password" />
        </div>
        <SubmitBtn loading={loading}>Register</SubmitBtn>
      </form>

      <div className="my-5 flex items-center gap-3 text-xs text-white/40">
        <div className="h-px flex-1 bg-white/10" /> OR <div className="h-px flex-1 bg-white/10" />
      </div>
      <button onClick={onGoogle} className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10">
        <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.84 14.09a6.6 6.6 0 0 1 0-4.18V7.07H2.18a11 11 0 0 0 0 9.86l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
        Sign up with Google
      </button>

      <p className="mt-6 text-center text-sm text-white/60">
        Already have an account? <Link to="/auth/user-signin" className="font-semibold text-bee hover:underline">Sign in instead</Link>
      </p>
    </AuthShell>
  );
}
