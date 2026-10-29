import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthShell, FormField, SubmitBtn } from "@/components/auth-shell";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";

export const Route = createFileRoute("/auth/user-signin")({
  head: () => ({ meta: [{ title: "User Sign In — Near Bee" }] }),
  component: UserSignIn,
});

function UserSignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back!");
    navigate({ to: "/dashboard" });
  }

  async function onGoogle() {
    const res = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/dashboard" });
    if (res.error) toast.error(res.error.message);
    if (!res.redirected && !res.error) navigate({ to: "/dashboard" });
  }

  return (
    <AuthShell title="User Sign In" subtitle="Sign in to book trusted local pros.">
      <form onSubmit={onSubmit} className="space-y-3">
        <FormField label="Email" name="email" type="email" required value={email} onChange={setEmail} placeholder="you@example.com" autoComplete="email" />
        <FormField label="Password" name="password" type="password" required value={password} onChange={setPassword} placeholder="••••••••" autoComplete="current-password" />
        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center gap-2 text-white/70">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="accent-bee" />
            Remember me
          </label>
          <Link to="/auth/forgot-password" className="font-semibold text-bee hover:underline">Forgot password?</Link>
        </div>
        <SubmitBtn loading={loading}>Sign in</SubmitBtn>
      </form>

      <div className="my-5 flex items-center gap-3 text-xs text-white/40">
        <div className="h-px flex-1 bg-white/10" /> OR <div className="h-px flex-1 bg-white/10" />
      </div>
      <button onClick={onGoogle} className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10">
        <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.84 14.09a6.6 6.6 0 0 1 0-4.18V7.07H2.18a11 11 0 0 0 0 9.86l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
        Continue with Google
      </button>

      <p className="mt-6 text-center text-sm text-white/60">
        New here? <Link to="/auth/user-signup" className="font-semibold text-bee hover:underline">Create account</Link>
      </p>
    </AuthShell>
  );
}
