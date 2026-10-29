import { createFileRoute, Outlet, Link } from "@tanstack/react-router";
import { useRole } from "@/lib/use-role";

export const Route = createFileRoute("/_authenticated/admin")({
  component: () => <Outlet />,
});

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { role, loading } = useRole();
  if (loading) return <div className="p-10 text-center text-white/60">Loading…</div>;
  if (role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black p-8 text-center text-white">
        <div className="max-w-md space-y-4">
          <h1 className="text-2xl font-bold">Admin access only</h1>
          <p className="text-white/60">You don't have permission to view this area.</p>
          <Link to="/dashboard" className="inline-block rounded-full bg-bee px-5 py-2.5 text-sm font-semibold text-ink">Back to dashboard</Link>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
