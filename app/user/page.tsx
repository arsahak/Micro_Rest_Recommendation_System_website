"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import SessionPanel from "@/component/session/SessionPanel";
import { getBaselineSummary, getCheckins, type BaselineSummary, type Checkin } from "@/lib/api";

export default function UserDashboardPage() {
  const { participantId, studyPhase, participantLabel, isLoggedIn, mounted, notificationPermission, requestNotificationPermission } = useAuth();
  const router = useRouter();
  const [lastCheckin, setLastCheckin] = useState<Checkin | null>(null);
  const [baseline, setBaseline] = useState<BaselineSummary | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const loadedFor = useRef<string | null>(null);

  // Redirect to login if not authenticated (wait for mount to avoid flash)
  useEffect(() => {
    if (mounted && !isLoggedIn) {
      router.push("/login");
    }
  }, [mounted, isLoggedIn, router]);

  // Fetch last check-in + baseline whenever participant changes
  useEffect(() => {
    if (!isLoggedIn || !participantId || loadedFor.current === participantId) return;
    loadedFor.current = participantId;
    setDataLoaded(false);

    Promise.all([
      getCheckins({ participant_id: participantId }).catch(() => null),
      getBaselineSummary(participantId).catch(() => null),
    ]).then(([checkinRes, baselineRes]) => {
      setLastCheckin(checkinRes?.data[0] ?? null);
      setBaseline(baselineRes?.data ?? null);
      setDataLoaded(true);
    });
  }, [isLoggedIn, participantId]);

  // Show nothing while waiting for localStorage restore
  if (!mounted || !isLoggedIn || !participantId) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="text-slate-400 text-sm">Loading…</div>
      </div>
    );
  }

  const phaseBadgeClass =
    studyPhase === "Prototype-use"
      ? "bg-teal-100 text-teal-700"
      : studyPhase === "Completed"
        ? "bg-green-100 text-green-700"
        : "bg-slate-100 text-slate-600";

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

      {/* Hero header */}
      <div className="hero-surface px-6 py-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${phaseBadgeClass}`}>
            {studyPhase} Phase
          </span>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome back,{" "}
            <span className="text-teal-600">{participantLabel || participantId}</span>
          </h1>
          <p className="text-sm text-slate-500">Your personal fatigue monitoring dashboard</p>
        </div>

        {notificationPermission === "default" && (
          <button
            onClick={requestNotificationPermission}
            className="btn-secondary text-xs gap-2 shrink-0"
          >
            🔔 Enable Notifications
          </button>
        )}
        {notificationPermission === "granted" && (
          <span className="text-xs text-teal-600 font-medium flex items-center gap-1.5 shrink-0">
            <span>🔔</span> Notifications on
          </span>
        )}
      </div>

      {/* Work session */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="h-5 w-1 rounded-full bg-teal-500" />
          <h2 className="text-sm font-semibold text-slate-700">Current Work Session</h2>
        </div>
        <SessionPanel participantId={participantId} />
      </section>

      {/* Baseline status */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="h-5 w-1 rounded-full bg-teal-500" />
          <h2 className="text-sm font-semibold text-slate-700">Baseline Status</h2>
        </div>
        {!dataLoaded ? (
          <div className="card p-4 text-xs text-slate-400">Loading…</div>
        ) : baseline ? (
          <div className="card p-4 flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-slate-800">Baseline recorded ✓</p>
              <p className="text-xs text-slate-500">
                Baseline HR: <strong>{baseline.baseline_hr} bpm</strong> ·{" "}
                {baseline.record_count} measurement{baseline.record_count !== 1 ? "s" : ""}
              </p>
            </div>
            <Link href="/baseline" className="text-xs text-teal-600 hover:text-teal-800 font-medium shrink-0">
              Update →
            </Link>
          </div>
        ) : (
          <div className="card p-4 bg-amber-50 border-amber-200 flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-amber-800">Baseline not set up yet</p>
              <p className="text-xs text-amber-600">Complete your baseline measurements before starting the study.</p>
            </div>
            <Link href="/baseline" className="btn-primary text-xs shrink-0 py-2 px-3">
              Set Up →
            </Link>
          </div>
        )}
      </section>

      {/* Last check-in */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="h-5 w-1 rounded-full bg-teal-500" />
          <h2 className="text-sm font-semibold text-slate-700">Last Check-in</h2>
        </div>
        {!dataLoaded ? (
          <div className="card p-4 text-xs text-slate-400">Loading…</div>
        ) : lastCheckin ? (
          <Link
            href={`/prompt/${lastCheckin.checkin_id}`}
            className="card card-link p-4 flex items-center justify-between gap-4"
          >
            <div className="space-y-1 min-w-0">
              <p className="text-sm font-medium text-slate-800">{lastCheckin.time_point}</p>
              <p className="text-xs text-slate-500">
                {new Date(lastCheckin.date).toLocaleDateString(undefined, {
                  weekday: "short", month: "short", day: "numeric",
                })}{" "}
                · Score: <strong>{lastCheckin.total_risk_score}</strong>
              </p>
              {lastCheckin.selected_prompt && (
                <p className="text-xs text-slate-400 truncate">{lastCheckin.selected_prompt}</p>
              )}
            </div>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold shrink-0 ${
                lastCheckin.risk_level === "High"
                  ? "badge-high"
                  : lastCheckin.risk_level === "Medium"
                    ? "badge-medium"
                    : "badge-low"
              }`}
            >
              {lastCheckin.risk_level}
            </span>
          </Link>
        ) : (
          <div className="card p-4 text-xs text-slate-500 text-center py-6">
            No check-ins recorded yet. Start your first check-in below.
          </div>
        )}
      </section>

      {/* Quick actions */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="h-5 w-1 rounded-full bg-teal-500" />
          <h2 className="text-sm font-semibold text-slate-700">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: "/checkin",                                icon: "📋", label: "New Check-in" },
            { href: `/history?pid=${participantId}`,          icon: "📜", label: "My History"   },
            { href: "/baseline",                              icon: "📏", label: "Baseline"      },
            { href: "/guide",                                 icon: "📖", label: "How to Use"    },
          ].map(({ href, icon, label }) => (
            <Link
              key={href}
              href={href}
              className="card card-link p-4 flex flex-col items-center gap-2.5 text-center"
            >
              <span className="icon-badge-sm">{icon}</span>
              <span className="text-xs font-medium text-slate-600">{label}</span>
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
}
