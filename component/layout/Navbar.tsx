"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import NotificationBell from "./NotificationBell";
import { useAuth } from "@/context/AuthContext";

const publicLinks = [
  { href: "/",          label: "Home"       },
  { href: "/checkin",   label: "Check-in"   },
  { href: "/history",   label: "History"    },
  { href: "/dashboard", label: "Dashboard"  },
];

const participantLinks = [
  { href: "/user",    label: "My Dashboard" },
  { href: "/checkin", label: "Check-in"     },
  { href: "/history", label: "My History"   },
];

export default function Navbar() {
  const path = usePathname();
  const router = useRouter();
  const { isLoggedIn, participantId, logout, mounted } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [path]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const links = isLoggedIn ? participantLinks : publicLinks;

  return (
    <nav className="bg-white/90 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="h-0.5 bg-linear-to-r from-teal-500 via-teal-400 to-teal-200" />
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-14">

        {/* Logo */}
        <Link href={isLoggedIn ? "/user" : "/"} className="flex items-center gap-2 font-semibold text-teal-600 min-w-0 mr-2">
          <span className="icon-badge-sm shrink-0">💤</span>
          <span className="text-xs sm:text-sm leading-tight truncate max-w-35 sm:max-w-65 md:max-w-none" title="Micro_Rest_Recommendation_System">
            Micro_Rest_Recommendation_System
          </span>
        </Link>

        <div className="flex items-center gap-1">
          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                  path === href || (href === "/user" && path.startsWith("/user"))
                    ? "bg-teal-50 text-teal-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          <NotificationBell />

          {/* Desktop auth controls */}
          <div className="hidden md:flex items-center gap-1">
            {mounted && isLoggedIn ? (
              <div className="flex items-center gap-2 ml-1 pl-3 border-l border-slate-200">
                <Link href="/user" className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-teal-50 hover:bg-teal-100 transition-colors">
                  <span className="w-5 h-5 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center">
                    {participantId?.[0]}
                  </span>
                  <span className="text-xs font-semibold text-teal-700">{participantId}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-xs text-slate-500 hover:text-slate-800 font-medium px-2 py-1 rounded-md hover:bg-slate-100 transition-colors"
                >
                  Sign out
                </button>
              </div>
            ) : mounted ? (
              <Link href="/login" className="ml-2 btn-primary text-xs py-1.5 px-3">
                Sign In
              </Link>
            ) : null}
          </div>

          {/* Mobile avatar badge */}
          {mounted && isLoggedIn && (
            <Link href="/user" className="flex items-center gap-1 px-2 py-1 rounded-md bg-teal-50 md:hidden">
              <span className="w-5 h-5 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center">
                {participantId?.[0]}
              </span>
            </Link>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
            className="w-9 h-9 flex items-center justify-center rounded-md hover:bg-slate-100 transition-colors md:hidden"
          >
            <span className="text-xl leading-none">{menuOpen ? "✕" : "☰"}</span>
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-2 space-y-1">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                path === href ? "bg-teal-50 text-teal-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {label}
            </Link>
          ))}
          {mounted && isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="block w-full text-left px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Sign out ({participantId})
            </button>
          ) : (
            <Link href="/login" className="block px-3 py-2 rounded-md text-sm font-medium text-teal-600 hover:bg-teal-50">
              Sign In
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
