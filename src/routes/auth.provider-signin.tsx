import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthShell, FormField, SubmitBtn } from "@/components/auth-shell";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/auth/provider-signin")({
  head: () => ({ meta: [{ title: "Provider Sign In — Near Bee" }] }),
  component: ProviderSignIn,
});

function ProviderSignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setLoading(false); return toast.error(error.message); }

    // Verify provider status
    const { data: prov } = await supabase.from("providers").select("status").eq("id", data.user.id).maybeSingle();
    setLoading(false);
    if (!prov) {
      toast.error("This account isn't registered as a provider.");
      await supabase.auth.signOut();
      return;
    }
    if (prov.status === "pending") return toast.warning("Your application is awaiting admin approval. We'll email you when ready.");
    if (prov.status === "rejected") return toast.error("Your application was not approved.");
    if (prov.status === "suspended") return toast.error("This provider account is suspended.");
    toast.success("Welcome back!");
    navigate({ to: "/provider/dashboard", replace: true });
  }

  return (
    <AuthShell title="Provider Sign In" subtitle="Access your jobs and earnings.">
      <form onSubmit={onSubmit} className="space-y-3">
        <FormField label="Email" name="email" type="email" required value={email} onChange={setEmail} autoComplete="email" />
        <FormField label="Password" name="password" type="password" required value={password} onChange={setPassword} autoComplete="current-password" />
        <div className="text-right text-xs">
          <Link to="/auth/forgot-password" className="font-semibold text-bee hover:underline">Forgot password?</Link>
        </div>
        <SubmitBtn loading={loading}>Sign in</SubmitBtn>
      </form>
      <p className="mt-6 text-center text-sm text-white/60">
        Not a provider yet? <Link to="/auth/provider-signup" className="font-semibold text-bee hover:underline">Apply now</Link>
      </p>
    </AuthShell>
  );
}
