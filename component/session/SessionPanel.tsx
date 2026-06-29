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

const HEARTBEAT_INTERVAL_MS = 60_000;
const DECISION_POINT_INTERVAL_MS = 2 * 60_000;

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
  const loadedForParticipant = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setStatus(null);
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

    const heartbeat = setInterval(() => {
      if (document.visibilityState !== "visible") return;
      sendHeartbeat(session.session_id, 1)
        .then((res) => setSession(res.data))
        .catch(() => {});
    }, HEARTBEAT_INTERVAL_MS);

    const decisionPoint = setInterval(() => {
      getCheckinStatus(session.session_id)
        .then((res) => setStatus(res.data))
        .catch(() => {});
    }, DECISION_POINT_INTERVAL_MS);

    return () => {
      clearInterval(heartbeat);
      clearInterval(decisionPoint);
    };
  }, [session?.session_id, session?.status]);

  const handleStart = async () => {
    setStarting(true);
    try {
      const res = await startSession(participantId);
      setSession(res.data);
      onSessionLoaded?.(res.data);
    } catch (error) {
      // Backend unreachable or participant missing — leave session as not started.
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
          {starting ? "Starting..." : "Start Work Session"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="card p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className={`px-2 py-0.5 rounded-full font-semibold ${session.session_mode === "Baseline" ? "bg-slate-100 text-slate-600" : "bg-teal-100 text-teal-700"}`}>
            {session.session_mode} Mode
          </span>
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
        <div className="card p-4 bg-amber-50 border-amber-200 flex items-center justify-between gap-3">
          <p className="text-sm text-amber-800">Please complete a quick fatigue check-in.</p>
          <button
            type="button"
            onClick={handleSnooze}
            className="text-xs text-amber-700 hover:text-amber-900 font-semibold px-3 py-1.5 rounded-lg border border-amber-300 hover:bg-amber-100 transition-colors shrink-0"
          >
            Snooze
          </button>
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
