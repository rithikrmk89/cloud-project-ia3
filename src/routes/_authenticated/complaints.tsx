import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DashboardShell } from "@/components/dashboard-shell";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MessageSquareWarning } from "lucide-react";

export const Route = createFileRoute("/_authenticated/complaints")({
  head: () => ({ meta: [{ title: "Complaints — Near Bee" }] }),
  component: ComplaintsPage,
});

function ComplaintsPage() {
  const qc = useQueryClient();
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");

  const { data: complaints = [] } = useQuery({
    queryKey: ["complaints"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase.from("complaints").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("complaints").insert({ user_id: user.id, subject, description });
    if (error) return toast.error(error.message);
    toast.success("Complaint submitted. We'll get back to you soon.");
    setSubject(""); setDescription("");
    qc.invalidateQueries({ queryKey: ["complaints"] });
  }

  return (
    <DashboardShell title="Complaints">
      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={submit} className="glass-card space-y-3 rounded-2xl p-6">
          <h2 className="text-lg font-bold">Submit a complaint</h2>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-white/80">Subject</span>
            <input value={subject} onChange={(e) => setSubject(e.target.value)} required maxLength={120} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm focus:border-bee/60 focus:outline-none" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-white/80">Description</span>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} required maxLength={1000} rows={5} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm focus:border-bee/60 focus:outline-none" />
          </label>
          <button className="w-full rounded-xl bg-gradient-bee py-3 text-sm font-bold text-ink shadow-bee hover:scale-[1.01] transition">Submit complaint</button>
        </form>

        <div className="space-y-3">
          <h2 className="text-lg font-bold">My complaints</h2>
          {complaints.length === 0 ? (
            <div className="glass-card flex flex-col items-center rounded-2xl p-10 text-center">
              <MessageSquareWarning size={36} className="text-bee/60" />
              <p className="mt-3 text-sm text-white/60">No complaints filed.</p>
            </div>
          ) : (
            complaints.map((c) => (
              <div key={c.id} className="glass-card rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{c.subject}</p>
                  <span className="rounded-full bg-bee/15 px-2 py-0.5 text-xs font-semibold text-bee capitalize">{c.status}</span>
                </div>
                <p className="mt-1 text-xs text-white/60">{c.description}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
