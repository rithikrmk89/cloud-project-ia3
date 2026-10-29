import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode, type ComponentType } from "react";
import { supabase } from "@/integrations/supabase/client";
import beeLogo from "@/assets/bee-logo.png";
import { LogOut, Menu, X } from "lucide-react";
import { ChatWidget } from "@/components/chat-widget";

export type NavItem = { to: string; icon: ComponentType<{ size?: number }>; label: string };

export function RoleShell({
  children,
  title,
  nav,
  brand,
  showChat = true,
}: {
  children: ReactNode;
  title?: string;
  nav: ReadonlyArray<NavItem>;
  brand: string;
  showChat?: boolean;
}) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [name, setName] = useState("there");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const n = data.user?.user_metadata?.full_name || data.user?.email?.split("@")[0];
      if (n) setName(n);
    });
  }, []);

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-gradient-ink text-white">
      <div className="flex">
        <aside className={`fixed inset-y-0 left-0 z-30 w-64 transform border-r border-white/5 bg-black/80 backdrop-blur-xl transition-transform lg:relative lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="flex h-16 items-center gap-2 border-b border-white/5 px-5">
            <img src={beeLogo} alt="" width={32} height={32} />
            <span className="font-bold">Near <span className="text-gradient-bee">Bee</span> · <span className="text-xs uppercase tracking-wider text-white/60">{brand}</span></span>
          </div>
          <nav className="space-y-1 p-3">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/5 hover:text-white"
                activeProps={{ className: "!bg-bee/15 !text-bee" }}
              >
                <n.icon size={18} /> {n.label}
              </Link>
            ))}
            <button onClick={signOut} className="mt-4 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/70 hover:bg-white/5 hover:text-red-400">
              <LogOut size={18} /> Sign out
            </button>
          </nav>
        </aside>

        <div className="flex-1 lg:ml-0">
          <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-white/5 bg-black/70 px-4 backdrop-blur-xl lg:px-8">
            <div className="flex items-center gap-3">
              <button onClick={() => setOpen(!open)} className="lg:hidden" aria-label="Menu">
                {open ? <X size={20} /> : <Menu size={20} />}
              </button>
              <div>
                <p className="text-xs text-white/50">Hello,</p>
                <p className="text-sm font-semibold capitalize">{name} 🐝</p>
              </div>
            </div>
            {title && <h1 className="hidden text-lg font-bold sm:block">{title}</h1>}
          </header>
          <main className="p-4 lg:p-8">{children}</main>
        </div>
      </div>
      {showChat && <ChatWidget />}
    </div>
  );
}
