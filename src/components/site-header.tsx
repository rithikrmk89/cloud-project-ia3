import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import beeLogo from "@/assets/bee-logo.png";
import { Menu, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSignedIn(!!s));
    return () => {
      window.removeEventListener("scroll", onScroll);
      sub.subscription.unsubscribe();
    };
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled ? "bg-black/80 backdrop-blur-xl border-b border-white/5" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <img src={beeLogo} alt="Near Bee" width={40} height={40} className="animate-float" />
          <span className="text-xl font-bold text-white">Near <span className="text-gradient-bee">Bee</span></span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <a href="/#services" className="text-sm font-medium text-white/80 hover:text-bee transition">Services</a>
          <a href="/#how-it-works" className="text-sm font-medium text-white/80 hover:text-bee transition">How it works</a>
          <Link to="/cloud-dashboard" className="text-sm font-semibold text-bee hover:underline transition flex items-center gap-1">
            ⚡ Cloud Analytics
          </Link>
          <a href="/#provider" className="text-sm font-medium text-white/80 hover:text-bee transition">Become a Pro</a>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {signedIn ? (
            <Link to="/dashboard" className="rounded-full bg-gradient-bee px-5 py-2 text-sm font-semibold text-ink shadow-bee hover:scale-105 transition">
              Dashboard
            </Link>
          ) : (
            <>
              <Link to="/auth" className="text-sm font-medium text-white/90 hover:text-bee transition">Sign in</Link>
              <Link to="/auth/user-signup" className="rounded-full bg-gradient-bee px-5 py-2 text-sm font-semibold text-ink shadow-bee hover:scale-105 transition">
                Get started
              </Link>
            </>
          )}
        </div>

        <button onClick={() => setOpen(!open)} className="rounded-full p-2 text-white md:hidden" aria-label="Menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/5 bg-black/95 px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-3">
            <a href="/#services" onClick={() => setOpen(false)} className="text-white/80">Services</a>
            <a href="/#how-it-works" onClick={() => setOpen(false)} className="text-white/80">How it works</a>
            <Link to="/cloud-dashboard" onClick={() => setOpen(false)} className="text-bee font-semibold">⚡ Cloud Analytics</Link>
            <a href="/#provider" onClick={() => setOpen(false)} className="text-white/80">Become a Pro</a>
            <div className="pt-2 flex gap-2">
              {signedIn ? (
                <Link to="/dashboard" onClick={() => setOpen(false)} className="flex-1 rounded-full bg-gradient-bee px-5 py-2 text-center text-sm font-semibold text-ink">Dashboard</Link>
              ) : (
                <>
                  <Link to="/auth" onClick={() => setOpen(false)} className="flex-1 rounded-full border border-white/20 px-5 py-2 text-center text-sm font-semibold text-white">Sign in</Link>
                  <Link to="/auth/user-signup" onClick={() => setOpen(false)} className="flex-1 rounded-full bg-gradient-bee px-5 py-2 text-center text-sm font-semibold text-ink">Get started</Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
