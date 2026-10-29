import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import beeLogo from "@/assets/bee-logo.png";
import { ArrowLeft } from "lucide-react";

export function AuthShell({
  title,
  subtitle,
  children,
  showBack = true,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  showBack?: boolean;
}) {
  return (
    <div className="relative flex min-h-screen overflow-hidden bg-gradient-ink text-white">
      <div className="absolute inset-0 bg-spotlight pointer-events-none" />
      <div className="absolute inset-0 honeycomb-bg pointer-events-none" />

      {/* Left visual panel */}
      <div className="relative hidden flex-1 flex-col justify-between p-10 lg:flex">
        <Link to="/" className="inline-flex items-center gap-2">
          <img src={beeLogo} alt="Near Bee" width={44} height={44} className="animate-float" />
          <span className="text-2xl font-bold">Near <span className="text-gradient-bee">Bee</span></span>
        </Link>

        <div className="relative">
          <div className="absolute -left-10 -top-10 size-72 rounded-full bg-bee/20 blur-3xl" />
          <div className="relative">
            <div className="text-7xl">🐝</div>
            <h2 className="mt-6 text-4xl font-bold leading-tight">
              Find • Book • <span className="text-gradient-bee">Relax</span>
            </h2>
            <p className="mt-4 max-w-md text-white/60">
              Trusted local pros at your doorstep. Verified, fast, and transparent — every booking.
            </p>
          </div>
        </div>

        <p className="text-xs text-white/40">© {new Date().getFullYear()} Near Bee</p>
      </div>

      {/* Right form panel */}
      <div className="relative flex flex-1 items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-6 inline-flex items-center gap-2 lg:hidden">
            <img src={beeLogo} alt="Near Bee" width={36} height={36} />
            <span className="text-lg font-bold">Near <span className="text-gradient-bee">Bee</span></span>
          </Link>

          <div className="glass-card animate-fade-up rounded-3xl p-6 sm:p-8">
            {showBack && (
              <Link to="/auth" className="mb-4 inline-flex items-center gap-1 text-xs text-white/60 hover:text-bee">
                <ArrowLeft size={14} /> Back to options
              </Link>
            )}
            <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
            {subtitle && <p className="mt-2 text-sm text-white/60">{subtitle}</p>}
            <div className="mt-6">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FormField({
  label, name, type = "text", required, placeholder, value, onChange, autoComplete,
}: {
  label: string; name: string; type?: string; required?: boolean; placeholder?: string;
  value?: string; onChange?: (v: string) => void; autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-white/80">{label}{required && <span className="text-bee"> *</span>}</span>
      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        autoComplete={autoComplete}
        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-bee/60 focus:outline-none focus:ring-2 focus:ring-bee/30"
      />
    </label>
  );
}

export function SubmitBtn({ children, loading }: { children: ReactNode; loading?: boolean }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-bee px-5 py-3 text-sm font-bold text-ink shadow-bee transition hover:scale-[1.01] disabled:opacity-60"
    >
      {loading ? "Please wait…" : children}
    </button>
  );
}
