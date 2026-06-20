"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import NotificationBell from "./NotificationBell";

const links = [
  { href: "/",           label: "Home" },
  { href: "/checkin",    label: "Check-in" },
  { href: "/history",    label: "History" },
  { href: "/dashboard",  label: "Dashboard" },
  // { href: "/baseline",   label: "Baseline" },
  // { href: "/participants", label: "Participants" },
  // { href: "/guide",      label: "Guide" },
];

export default function Navbar() {
  const path = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [path]);

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-14">
        <Link href="/" className="flex items-center gap-2 font-semibold text-sky-600 min-w-0 mr-2">
          <span className="text-xl shrink-0">💤</span>
          <span className="text-xs sm:text-sm leading-tight truncate max-w-35 sm:max-w-65 md:max-w-none" title="Micro_Rest_Recommendation_System">
            Micro_Rest_Recommendation_System
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                path === href
                  ? "bg-sky-50 text-sky-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {label}
            </Link>
          ))}
          <NotificationBell />
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-1 md:hidden">
          <NotificationBell />
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
            className="w-9 h-9 flex items-center justify-center rounded-md hover:bg-slate-100 transition-colors"
          >
            <span className="text-xl leading-none">{menuOpen ? "✕" : "☰"}</span>
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-2 space-y-1">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                path === href
                  ? "bg-sky-50 text-sky-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
