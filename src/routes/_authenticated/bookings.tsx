import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { DashboardShell } from "@/components/dashboard-shell";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Clock } from "lucide-react";

export const Route = createFileRoute("/_authenticated/bookings")({
  head: () => ({ meta: [{ title: "My Bookings — Near Bee" }] }),
  component: BookingsPage,
});

function BookingsPage() {
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["bookings"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase.from("bookings")
        .select("id, status, address, area, scheduled_at, created_at, service_category_id, service_categories(name, icon)")
        .eq("user_id", user.id).order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  return (
    <DashboardShell title="My Bookings">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">My Bookings</h2>
        {isLoading ? (
          <p className="text-sm text-white/60">Loading…</p>
        ) : bookings.length === 0 ? (
          <div className="glass-card flex flex-col items-center rounded-2xl p-12 text-center">
            <Calendar size={42} className="text-bee/60" />
            <p className="mt-4 text-lg font-semibold">No bookings yet</p>
            <p className="mt-1 text-sm text-white/60">When you book a service, it'll show up here.</p>
            <Link to="/services" className="mt-5 rounded-full bg-gradient-bee px-5 py-2.5 text-sm font-bold text-ink shadow-bee hover:scale-105 transition">
              Browse services
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((b) => (
              <div key={b.id} className="glass-card rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{(b as { service_categories?: { name?: string } }).service_categories?.name ?? "Service"}</p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-white/60">
                      <Clock size={12} /> {new Date(b.created_at).toLocaleString()}
                    </p>
                    <p className="text-xs text-white/60">{b.address}</p>
                  </div>
                  <span className="rounded-full bg-bee/15 px-3 py-1 text-xs font-semibold capitalize text-bee">{b.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
