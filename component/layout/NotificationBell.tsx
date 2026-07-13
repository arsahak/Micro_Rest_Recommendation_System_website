"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { NotificationLogEntry } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const POLL_INTERVAL_MS = 10000;
const LAST_SEEN_KEY = "fatigue_alerts_last_seen_at";

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

// Each notification_type gets its own badge + link, since a "due" reminder,
// a per-check-in risk result, and an escalation alert all mean different
// things and point the participant somewhere different.
function presentation(n: NotificationLogEntry): { badge: string; badgeClass: string; href: string } {
  if (n.notification_type === "quick_checkin_notification") {
    return { badge: "Due", badgeClass: "badge-medium", href: "/checkin" };
  }
  if (n.notification_type === "extended_rest_recommendation") {
    return { badge: "Alert", badgeClass: "badge-high", href: "/checkin" };
  }
  // micro_rest_notification — trigger_reason is like "high_risk_checkin"
  const level = n.trigger_reason[0]?.split("_")[0];
  const badge = level ? level[0].toUpperCase() + level.slice(1) : "Result";
  const badgeClass = level === "high" ? "badge-high" : level === "medium" ? "badge-medium" : "badge-low";
  return { badge, badgeClass, href: "/history" };
}

export default function NotificationBell() {
  const { participantId, isLoggedIn } = useAuth();
  const [items, setItems] = useState<NotificationLogEntry[]>([]);
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<NotificationLogEntry[]>([]);

  const fetchNotifications = async () => {
    if (!isLoggedIn || !participantId) return;
    try {
      const res = await fetch("/api/notifications", { cache: "no-store" });
      const body = await res.json();
      const data: NotificationLogEntry[] = body.data ?? [];

      const prev = itemsRef.current;
      const changed =
        prev.length !== data.length || data.some((a, i) => a.notification_id !== prev[i]?.notification_id);

      if (changed) {
        itemsRef.current = data;
        setItems(data);

        const lastSeenAt = localStorage.getItem(LAST_SEEN_KEY);
        const lastSeenTime = lastSeenAt ? new Date(lastSeenAt).getTime() : 0;
        const unreadCount = data.filter((a) => new Date(a.createdAt).getTime() > lastSeenTime).length;
        setUnread(unreadCount);
      }
    } catch {
      // backend unreachable — leave existing state as-is
    }
  };

  useEffect(() => {
    // Clear immediately on identity change so a same-tab account switch
    // (logout -> different participant logs in, both client-side navigations)
    // never briefly shows the previous participant's stale notification list.
    itemsRef.current = [];
    setItems([]);
    setUnread(0);

    if (!isLoggedIn || !participantId) return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [isLoggedIn, participantId]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = () => {
    setOpen((o) => !o);
    if (!open) {
      localStorage.setItem(LAST_SEEN_KEY, new Date().toISOString());
      setUnread(0);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={handleToggle}
        aria-label="Notifications"
        className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
      >
        <span className="text-lg">🔔</span>
        {unread > 0 && (
          <span className="absolute top-0.5 right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed sm:absolute left-2 right-2 sm:left-auto sm:right-0 mt-2 sm:w-80 max-h-96 overflow-y-auto card shadow-lg z-50">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700">Notifications</h3>
            <span className="text-xs text-slate-400">{items.length} recent</span>
          </div>
          {items.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No notifications yet.</p>
          ) : (
            <div className="divide-y divide-slate-50">
              {items.map((n) => {
                const { badge, badgeClass, href } = presentation(n);
                return (
                  <Link
                    key={n.notification_id}
                    href={href}
                    onClick={() => setOpen(false)}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
                  >
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold shrink-0 ${badgeClass}`}>
                      {badge}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-700">{n.message}</p>
                      {n.trigger_reason.length > 0 && (
                        <p className="text-xs text-slate-400 truncate">{n.trigger_reason.join(" · ")}</p>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 shrink-0">{timeAgo(n.createdAt)}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
