"use client";

import { useEffect, useRef, useState } from "react";
import {
  CheckinStatus,
  Session,
  endSession,
  getActiveSession,
  getCheckinStatus,
  sendHeartbeat,
  snoozeCheckin,
  startSession,
} from "@/lib/api";

const HEARTBEAT_INTERVAL_MS = 60_000;          // 1 min — increment sitting/screen counters
const DECISION_POINT_INTERVAL_MS = 10 * 60_000; // 10 min — evaluate notification conditions ( spec Section 2)
const CLOCK_TICK_MS = 1_000;                    // 1 sec — live session-duration display only, no network calls

function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export default function SessionPanel({
  participantId,
  onSessionLoaded,
}: {
  participantId: string;
  onSessionLoaded?: (session: Session) => void;
}) {
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<CheckinStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [now, setNow] = useState<number>(() => Date.now());
  const loadedForParticipant = useRef<string | null>(null);
  // Escalation (2 consecutive High-risk results) is a one-time flag — only
  // notify on its rising edge. "Due" is a recurring reminder and intentionally
  // has no such guard below: it renotifies on every decision-point poll for
  // as long as a check-in remains outstanding.
  const prevEscalateRef = useRef<boolean>(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setStatus(null);
    prevEscalateRef.current = false;
    getActiveSession(participantId)
      .then((res) => {
        if (cancelled) return;
        setSession(res.data);
        if (loadedForParticipant.current !== participantId) {
          loadedForParticipant.current = participantId;
          onSessionLoaded?.(res.data);
        }
      })
      .catch(() => {
        if (!cancelled) setSession(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [participantId]);

  useEffect(() => {
    if (!session || session.status !== "active") return;
    let cancelled = false;

    const heartbeat = setInterval(() => {
      if (document.visibilityState !== "visible") return;
      sendHeartbeat(session.session_id, 1)
        .then((res) => { if (!cancelled) setSession(res.data); })
        .catch(() => {});
    }, HEARTBEAT_INTERVAL_MS);

    const checkDecisionPoint = () => {
      getCheckinStatus(session.session_id)
        .then((res) => {
          if (cancelled) return;
          const newStatus = res.data;
          const notifyReady = typeof window !== "undefined" && Notification.permission === "granted";
          // Renotify on every poll while a check-in remains due — not just once —
          // so the reminder keeps showing until the participant actually checks in.
          if (newStatus.due && notifyReady) {
            new Notification("Fatigue Check-in Due", {
              body: "Please complete a quick fatigue check-in.",
              icon: "/favicon.ico",
              silent: true,
            });
          }
          // Escalation stays rising-edge-only — it's a one-time flag, not a recurring reminder.
          if (newStatus.escalate && !prevEscalateRef.current && notifyReady) {
            new Notification("Extended Rest Recommended", {
              body: "Two consecutive High-risk readings — consider a longer break or pausing work.",
              icon: "/favicon.ico",
              silent: true,
            });
          }
          prevEscalateRef.current = newStatus.escalate;
          setStatus(newStatus);
        })
        .catch(() => {});
    };

    // Run once immediately — a session that's already overdue when the page
    // loads (e.g. rest_threshold_elapsed from a prior visit) must not wait
    // up to 10 minutes for its first check. Guarded by `cancelled` so React
    // Strict Mode's dev-only double-invoke of this effect can't double-fire
    // the rising-edge notification (the aborted first mount's in-flight
    // request is marked cancelled before it can act on stale data).
    checkDecisionPoint();
    const decisionPoint = setInterval(checkDecisionPoint, DECISION_POINT_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(heartbeat);
      clearInterval(decisionPoint);
    };
  }, [session?.session_id, session?.status]);

  // Live-ticking session-duration display — purely local, no network calls.
  useEffect(() => {
    if (!session || session.status !== "active") return;
    const clock = setInterval(() => setNow(Date.now()), CLOCK_TICK_MS);
    return () => clearInterval(clock);
  }, [session?.session_id, session?.status]);

  const handleStart = async () => {
    setStarting(true);
    try {
      const res = await startSession(participantId);
      setSession(res.data);
      onSessionLoaded?.(res.data);
    } catch (error) {
      void error;
    } finally {
      setStarting(false);
    }
  };

  const handleEnd = async () => {
    if (!session) return;
    try {
      await endSession(session.session_id);
    } catch (error) {
      void error;
    }
    setSession(null);
    setStatus(null);
  };

  const handleSnooze = async () => {
    if (!session) return;
    try {
      await snoozeCheckin(session.session_id);
    } catch (error) {
      void error;
    }
    setStatus((s) => (s ? { ...s, due: false } : s));
  };

  const elapsedSec = session ? Math.max(0, Math.floor((now - new Date(session.start_time).getTime()) / 1000)) : 0;

  if (loading) return null;

  if (!session) {
    return (
      <div className="card p-4 bg-teal-50 border-teal-200 flex items-center justify-between gap-3">
        <p className="text-sm text-teal-800">No active work session for {participantId}.</p>
        <button
          type="button"
          onClick={handleStart}
          disabled={starting}
          className="bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shrink-0"
        >
          {starting ? "Starting…" : "Start Work Session"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="card p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <span className={`px-2 py-0.5 rounded-full font-semibold ${session.session_mode === "Baseline" ? "bg-slate-100 text-slate-600" : "bg-teal-100 text-teal-700"}`}>
            {session.session_mode} Mode
          </span>
          <span>Session time: <strong className="text-slate-700">{formatDuration(elapsedSec)}</strong></span>
          <span>Sitting: <strong className="text-slate-700">{session.sitting_duration_min} min</strong></span>
          <span>Screen: <strong className="text-slate-700">{session.screen_exposure_min} min</strong></span>
          <span>Check-ins: <strong className="text-slate-700">{session.total_checkins}</strong></span>
        </div>
        <button
          type="button"
          onClick={handleEnd}
          className="text-xs text-slate-400 hover:text-slate-600 font-medium shrink-0"
        >
          End Session
        </button>
      </div>

      {status?.due && (
        <div className="card p-4 bg-amber-50 border-amber-200 space-y-2">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-amber-800">Check-in due now</p>
              {status.trigger_reason.length > 0 && (
                <p className="text-xs text-amber-600">{status.trigger_reason.join(" · ")}</p>
              )}
            </div>
            <div className="flex gap-2 shrink-0">
              <a
                href="/checkin"
                className="text-xs text-white bg-amber-500 hover:bg-amber-600 font-semibold px-3 py-1.5 rounded-lg transition-colors"
              >
                Check in
              </a>
              <button
                type="button"
                onClick={handleSnooze}
                className="text-xs text-amber-700 hover:text-amber-900 font-semibold px-3 py-1.5 rounded-lg border border-amber-300 hover:bg-amber-100 transition-colors"
              >
                Snooze
              </button>
            </div>
          </div>
          {typeof window !== "undefined" && Notification.permission === "denied" && (
            <p className="text-xs text-red-600 font-medium">
              🔕 No pop-up notification was sent — notifications are blocked for this site in your browser. Re-allow them via the lock/info icon in your address bar, then reload.
            </p>
          )}
        </div>
      )}

      {status?.escalate && (
        <div className="card p-3 bg-red-50 border-red-200 text-xs text-red-700 font-medium">
          ⚠️ Two consecutive High-risk readings — an extended rest is recommended.
        </div>
      )}

      {session.session_mode === "Baseline" && (
        <p className="text-xs text-slate-400">
          Baseline Mode: fatigue risk is recorded for research but rest suggestions are not shown.
        </p>
      )}
    </div>
  );
}
