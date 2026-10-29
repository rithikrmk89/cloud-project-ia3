import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthShell, FormField, SubmitBtn } from "@/components/auth-shell";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "New Password — Near Bee" }] }),
  component: ResetPwd,
});

function ResetPwd() {
  const navigate = useNavigate();
  const [pwd, setPwd] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pwd.length < 6) return toast.error("Password must be at least 6 characters");
    if (pwd !== confirm) return toast.error("Passwords don't match");
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: pwd });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Password updated! Signing you in…");
    navigate({ to: "/dashboard" });
  }

  return (
    <AuthShell title="Set a new password" subtitle="Choose a strong password to secure your account." showBack={false}>
      <form onSubmit={onSubmit} className="space-y-3">
        <FormField label="New password" name="password" type="password" required value={pwd} onChange={setPwd} placeholder="At least 6 characters" />
        <FormField label="Confirm password" name="confirm" type="password" required value={confirm} onChange={setConfirm} />
        <SubmitBtn loading={loading}>Update password</SubmitBtn>
      </form>
    </AuthShell>
  );
}
