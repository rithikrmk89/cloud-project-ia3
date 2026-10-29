import beeLogo from "@/assets/bee-logo.png";
import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/5 bg-black px-4 py-12 text-white/70 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <img src={beeLogo} alt="Near Bee" width={36} height={36} />
            <span className="text-lg font-bold text-white">Near <span className="text-gradient-bee">Bee</span></span>
          </div>
          <p className="mt-3 text-sm">Find • Book • Relax — Trusted services near you.</p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white">Company</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li><a href="#services" className="hover:text-bee">Services</a></li>
            <li><a href="#how-it-works" className="hover:text-bee">How it works</a></li>
            <li><a href="#why" className="hover:text-bee">Why us</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white">For Providers</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to="/auth/provider-signup" className="hover:text-bee">Become a Pro</Link></li>
            <li><Link to="/auth" className="hover:text-bee">Provider login</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white">Account</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to="/auth/user-signin" className="hover:text-bee">Sign in</Link></li>
            <li><Link to="/auth/user-signup" className="hover:text-bee">Create account</Link></li>
            <li><Link to="/auth/admin-signin" className="hover:text-bee">Admin</Link></li>
          </ul>
        </div>
      </div>
      <div className="mx-auto mt-10 max-w-7xl border-t border-white/5 pt-6 text-center text-xs text-white/40">
        © {new Date().getFullYear()} Near Bee. All rights reserved. 🐝
      </div>
    </footer>
  );
}
