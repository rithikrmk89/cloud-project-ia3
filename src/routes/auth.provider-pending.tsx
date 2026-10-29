import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthShell } from "@/components/auth-shell";
import { Clock, ShieldCheck, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/auth/provider-pending")({
  head: () => ({ meta: [{ title: "Application Submitted — Near Bee" }] }),
  component: () => (
    <AuthShell title="Application submitted! 🎉" subtitle="Your provider profile is now under admin review." showBack={false}>
      <div className="space-y-3">
        {[
          { icon: CheckCircle2, t: "Registration Submitted", d: "We received your details.", active: true },
          { icon: ShieldCheck, t: "Admin Verification", d: "Document review in progress.", active: true },
          { icon: Clock, t: "Approval", d: "Usually within 24 hours.", active: false },
          { icon: CheckCircle2, t: "Provider Login Enabled", d: "Start receiving jobs!", active: false },
        ].map((s) => (
          <div key={s.t} className={`flex items-start gap-3 rounded-xl border p-4 ${s.active ? "border-bee/40 bg-bee/5" : "border-white/10 bg-white/5"}`}>
            <s.icon size={20} className={s.active ? "text-bee" : "text-white/40"} />
            <div>
              <p className="text-sm font-semibold text-white">{s.t}</p>
              <p className="text-xs text-white/60">{s.d}</p>
            </div>
          </div>
        ))}
      </div>
      <Link to="/" className="mt-6 block text-center text-sm font-semibold text-bee hover:underline">Back to home</Link>
    </AuthShell>
  ),
});
