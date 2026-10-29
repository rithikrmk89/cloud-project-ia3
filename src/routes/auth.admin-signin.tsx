import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthShell, FormField, SubmitBtn } from "@/components/auth-shell";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/auth/admin-signin")({
  head: () => ({ meta: [{ title: "Admin Sign In — Near Bee" }] }),
  component: AdminSignIn,
});

function AdminSignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secret, setSecret] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const typedEmail = String(formData.get("email") || email).trim();
    const typedPassword = String(formData.get("password") || password);
    const loginEmail = typedEmail === "abinaya@123" ? "abinaya@nearbee.in" : typedEmail;
    const { data, error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: typedPassword });
    if (error) { setLoading(false); return toast.error(error.message); }
    const { data: roleRow } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id)
      .eq("role", "admin")
      .maybeSingle();
    setLoading(false);
    if (!roleRow) {
      await supabase.auth.signOut();
      return toast.error("This account doesn't have admin access.");
    }
    void secret;
    toast.success("Welcome, admin!");
    navigate({ to: "/admin/dashboard", replace: true });
  }

  return (
    <AuthShell title="Admin Sign In" subtitle="Restricted access. All actions are logged.">
      <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-xs text-red-300">
        <ShieldAlert size={16} /> Authorized personnel only.
      </div>
      <form onSubmit={onSubmit} className="space-y-3">
        <FormField label="Email" name="email" required value={email} onChange={setEmail} autoComplete="username" placeholder="abinaya@123 or admin email" />
        <FormField label="Password" name="password" type="password" required value={password} onChange={setPassword} autoComplete="current-password" />
        <FormField label="Admin Secret Key (optional)" name="secret" type="password" value={secret} onChange={setSecret} placeholder="Extra security key" />
        <SubmitBtn loading={loading}>Sign in</SubmitBtn>
      </form>
    </AuthShell>
  );
}
