import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { RoleShell } from "@/components/role-shell";
import { ProviderGuard } from "./route";
import { PROVIDER_NAV } from "./dashboard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, Trash2 } from "lucide-react";

type Item = { id: string; image_url: string; caption: string | null; created_at: string };

export const Route = createFileRoute("/_authenticated/provider/gallery")({
  head: () => ({ meta: [{ title: "Work Gallery — Near Bee Provider" }] }),
  component: () => <ProviderGuard><Gallery /></ProviderGuard>,
});

function Gallery() {
  const [items, setItems] = useState<Item[]>([]);
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState("");

  useEffect(() => { void load(); }, []);
  async function load() {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;
    const { data } = await supabase.from("provider_gallery").select("*").eq("provider_id", auth.user.id).order("created_at", { ascending: false });
    const withUrls = await Promise.all((data ?? []).map(async (it) => {
      const { data: signed } = await supabase.storage.from("gallery").createSignedUrl(it.image_url, 3600);
      return { ...it, image_url: signed?.signedUrl ?? it.image_url } as Item;
    }));
    setItems(withUrls);
  }

  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;
    setUploading(true);
    const path = `${auth.user.id}/${Date.now()}-${file.name}`;
    const { error: upErr } = await supabase.storage.from("gallery").upload(path, file);
    if (upErr) { toast.error(upErr.message); setUploading(false); return; }
    const { error: insErr } = await supabase.from("provider_gallery").insert({ provider_id: auth.user.id, image_url: path, caption: caption || null });
    if (insErr) toast.error(insErr.message); else { toast.success("Photo added"); setCaption(""); void load(); }
    setUploading(false);
    e.target.value = "";
  }

  async function remove(id: string) {
    const { error } = await supabase.from("provider_gallery").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Removed"); void load(); }
  }

  return (
    <RoleShell title="Work Gallery" nav={PROVIDER_NAV} brand="Provider" showChat={false}>
      <div className="space-y-6">
        <div className="glass-card rounded-2xl p-5">
          <h2 className="text-lg font-bold">Add a work photo</h2>
          <p className="text-sm text-white/60">Before/after shots build trust with customers.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
            <input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Caption (optional)" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm" />
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-bee px-4 py-2 text-sm font-semibold text-ink">
              <Upload size={14} /> {uploading ? "Uploading…" : "Upload"}
              <input type="file" accept="image/*" hidden onChange={upload} disabled={uploading} />
            </label>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.length === 0 ? (
            <p className="col-span-full py-10 text-center text-white/50">No photos yet.</p>
          ) : items.map((it) => (
            <div key={it.id} className="glass-card overflow-hidden rounded-2xl">
              <img src={it.image_url} alt={it.caption ?? ""} className="aspect-[4/3] w-full object-cover" />
              <div className="flex items-center justify-between p-3">
                <p className="text-sm text-white/80">{it.caption ?? "Untitled"}</p>
                <button onClick={() => remove(it.id)} className="text-white/50 hover:text-red-400"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </RoleShell>
  );
}
