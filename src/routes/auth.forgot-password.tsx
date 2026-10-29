import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AuthShell, FormField, SubmitBtn } from "@/components/auth-shell";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Mail, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/auth/forgot-password")({
  head: () => ({ meta: [{ title: "Reset Password — Near Bee" }] }),
  component: Forgot,
});

function Forgot() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/reset-password",
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    setSent(true);
    toast.success("Reset link sent! Check your inbox.");
  }

  return (
    <AuthShell title="Forgot password?" subtitle="We'll email you a secure link to reset it.">
      {sent ? (
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-xl border border-green-500/30 bg-green-500/10 p-4">
            <CheckCircle2 className="text-green-400" />
            <div>
              <p className="text-sm font-semibold text-white">Check your email</p>
              <p className="text-xs text-white/70">We sent a reset link to <span className="font-semibold text-bee">{email}</span>. Click it to set a new password.</p>
            </div>
          </div>
          <Link to="/auth" className="block text-center text-sm font-semibold text-bee hover:underline">Back to sign in</Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-3">
          <FormField label="Email" name="email" type="email" required value={email} onChange={setEmail} placeholder="you@example.com" />
          <SubmitBtn loading={loading}><Mail size={15} className="mr-1" /> Send reset link</SubmitBtn>
          <Link to="/auth" className="block text-center text-sm text-white/60 hover:text-bee">Back to sign in</Link>
        </form>
      )}
    </AuthShell>
  );
}
