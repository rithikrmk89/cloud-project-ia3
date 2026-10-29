import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthShell } from "@/components/auth-shell";
import { User, Wrench, ShieldCheck, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/auth/")({
  head: () => ({ meta: [{ title: "Sign in — Near Bee" }] }),
  component: AuthSelector,
});

const OPTIONS = [
  { to: "/auth/user-signin", icon: User, title: "User Login", desc: "Book trusted services near you", color: "from-bee to-amber-400" },
  { to: "/auth/provider-signin", icon: Wrench, title: "Provider Login", desc: "Grow your business with us", color: "from-sky-400 to-blue-500" },
  { to: "/auth/admin-signin", icon: ShieldCheck, title: "Admin Login", desc: "Manage the platform", color: "from-violet-400 to-purple-500" },
] as const;

function AuthSelector() {
  return (
    <AuthShell
      title="Welcome back 🐝"
      subtitle="Choose how you'd like to sign in to Near Bee."
      showBack={false}
    >
      <div className="space-y-3">
        {OPTIONS.map((opt) => (
          <Link
            key={opt.to}
            to={opt.to}
            className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-bee/40 hover:bg-white/10"
          >
            <div className={`flex size-12 items-center justify-center rounded-xl bg-gradient-to-br ${opt.color} text-ink shadow-bee`}>
              <opt.icon size={22} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">{opt.title}</p>
              <p className="text-xs text-white/60">{opt.desc}</p>
            </div>
            <ArrowRight size={16} className="text-white/40 transition group-hover:translate-x-1 group-hover:text-bee" />
          </Link>
        ))}
      </div>
      <p className="mt-6 text-center text-xs text-white/50">
        New here? <Link to="/auth/user-signup" className="font-semibold text-bee hover:underline">Create an account</Link>
      </p>
    </AuthShell>
  );
}
