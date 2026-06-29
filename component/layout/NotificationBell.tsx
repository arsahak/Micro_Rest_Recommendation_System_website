"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Checkin } from "@/lib/api";

const POLL_INTERVAL_MS = 10000;
const LAST_SEEN_KEY = "fatigue_alerts_last_seen_at";

const badgeClass: Record<string, string> = { Medium: "badge-medium", High: "badge-high" };

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function NotificationBell() {
  const [alerts, setAlerts] = useState<Checkin[]>([]);
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const alertsRef = useRef<Checkin[]>([]);

  const fetchAlerts = async () => {
    try {
      const res = await fetch("/api/alerts", { cache: "no-store" });
      const body = await res.json();
      const data: Checkin[] = body.data ?? [];

      const prev = alertsRef.current;
      const changed =
        prev.length !== data.length || data.some((a, i) => a.checkin_id !== prev[i]?.checkin_id);

      if (changed) {
        alertsRef.current = data;
        setAlerts(data);

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
    fetchAlerts();
    const interval = setInterval(fetchAlerts, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

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
            <h3 className="text-sm font-semibold text-slate-700">Risk Alerts</h3>
            <span className="text-xs text-slate-400">{alerts.length} recent</span>
          </div>
          {alerts.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No risk alerts yet.</p>
          ) : (
            <div className="divide-y divide-slate-50">
              {alerts.map((a) => (
                <Link
                  key={a.checkin_id}
                  href={`/prompt/${a.checkin_id}`}
                  onClick={() => setOpen(false)}
                  className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
                >
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold shrink-0 ${badgeClass[a.risk_level] ?? "badge-low"}`}>
                    {a.risk_level}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-700">
                      {a.participant_id} · {a.dominant_issue}
                    </p>
                    <p className="text-xs text-slate-400 truncate">{a.selected_prompt}</p>
                  </div>
                  <span className="text-xs text-slate-400 shrink-0">{timeAgo(a.createdAt)}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
