"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ApiError, getCheckins, getBaselineEntries, type Checkin, type BaselineEntry } from "@/lib/api";

const badge: Record<string, string> = {
  Low: "badge-low",
  Medium: "badge-medium",
  High: "badge-high",
};

function fmtDateTime(iso: string) {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString(),
    time: d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };
}

// ── Check-ins tab ──────────────────────────────────────────────────────────────
function CheckinsTab({ participantId, riskFilter }: { participantId: string; riskFilter?: string }) {
  const [rows, setRows] = useState<Checkin[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getCheckins({ participant_id: participantId, risk_level: riskFilter })
      .then((res) => { setRows(res.data); setError(null); })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Could not reach backend."))
      .finally(() => setLoading(false));
  }, [participantId, riskFilter]);

  if (loading) return <div className="card p-8 text-center text-sm text-slate-400">Loading check-ins…</div>;
  if (error) return <div className="card p-4 bg-amber-50 border-amber-200 text-sm text-amber-700">{error}</div>;

  const headers = ["ID", "Date", "Time", "Time Point", "Mode", "HR", "Fatigue", "KSS", "Eye", "Discomfort", "Sitting", "Risk", "Score", "Dominant Issue", "Prompt", ""];

  return (
    <>
      <div className="sm:hidden space-y-3">
        {rows.length === 0 ? (
          <div className="card p-8 text-center text-sm text-slate-400">No check-ins found.</div>
        ) : rows.map((row) => {
          const { date, time } = fmtDateTime(row.createdAt);
          return (
            <div key={row.checkin_id} className="card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800">{row.time_point}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${badge[row.risk_level]}`}>{row.risk_level}</span>
              </div>
              <p className="text-xs text-slate-400">{date} {time} · {row.session_mode}</p>
              <div className="grid grid-cols-5 gap-2 text-xs text-slate-600">
                <span>HR {row.current_hr}</span>
                <span>F {row.fatigue_score}</span>
                <span>K {row.kss_score}</span>
                <span>E {row.eye_strain_score}</span>
                <span>D {row.body_discomfort_score}</span>
              </div>
              <p className="text-xs text-slate-600">Score: <strong>{row.total_risk_score}</strong> · {row.dominant_issue}</p>
              <div className="flex gap-4 pt-1">
                <Link href={`/prompt/${row.checkin_id}`} className="text-xs text-teal-600 hover:text-teal-800 font-medium">View →</Link>
                <Link href={`/feedback?checkin_id=${row.checkin_id}`} className="text-xs text-teal-600 hover:text-teal-800 font-medium">Feedback →</Link>
              </div>
            </div>
          );
        })}
      </div>

      <div className="hidden sm:block card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {headers.map((h) => (
                  <th key={h} className="text-left px-3 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.length === 0 ? (
                <tr><td colSpan={headers.length} className="px-4 py-8 text-center text-sm text-slate-400">No check-ins found.</td></tr>
              ) : rows.map((row) => {
                const { date, time } = fmtDateTime(row.createdAt);
                return (
                  <tr key={row.checkin_id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-3 py-2.5 font-mono text-xs text-slate-500">{row.checkin_id}</td>
                    <td className="px-3 py-2.5 text-slate-500 text-xs">{date}</td>
                    <td className="px-3 py-2.5 text-slate-500 text-xs">{time}</td>
                    <td className="px-3 py-2.5 text-slate-600 whitespace-nowrap">{row.time_point}</td>
                    <td className="px-3 py-2.5 text-xs text-slate-500">{row.session_mode}</td>
                    <td className="px-3 py-2.5 text-slate-700">{row.current_hr}</td>
                    <td className="px-3 py-2.5 text-slate-700">{row.fatigue_score}</td>
                    <td className="px-3 py-2.5 text-slate-700">{row.kss_score}</td>
                    <td className="px-3 py-2.5 text-slate-700">{row.eye_strain_score}</td>
                    <td className="px-3 py-2.5 text-slate-700">{row.body_discomfort_score}</td>
                    <td className="px-3 py-2.5 text-slate-700 whitespace-nowrap">{row.sitting_duration_min} min</td>
                    <td className="px-3 py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${badge[row.risk_level]}`}>{row.risk_level}</span>
                    </td>
                    <td className="px-3 py-2.5 font-semibold text-slate-700">{row.total_risk_score}</td>
                    <td className="px-3 py-2.5 text-xs text-slate-600 whitespace-nowrap">{row.dominant_issue}</td>
                    <td className="px-3 py-2.5 text-xs text-slate-500 whitespace-nowrap">{row.selected_prompt}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex gap-2">
                        <Link href={`/prompt/${row.checkin_id}`} className="text-xs text-teal-600 hover:text-teal-800 font-medium">View</Link>
                        <Link href={`/feedback?checkin_id=${row.checkin_id}`} className="text-xs text-teal-600 hover:text-teal-800 font-medium">Feedback</Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

// ── Baseline entries tab ───────────────────────────────────────────────────────
function BaselineTab({ participantId }: { participantId: string }) {
  const [rows, setRows] = useState<BaselineEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getBaselineEntries(participantId)
      .then((res) => { setRows(res.data); setError(null); })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Could not reach backend."))
      .finally(() => setLoading(false));
  }, [participantId]);

  if (loading) return <div className="card p-8 text-center text-sm text-slate-400">Loading baseline entries…</div>;
  if (error) return <div className="card p-4 bg-amber-50 border-amber-200 text-sm text-amber-700">{error}</div>;

  const headers = ["Date", "Time", "Time Point", "HR", "Fatigue", "KSS", "Eye", "Discomfort", "Sitting", "Rest Behavior"];

  return (
    <>
      <div className="sm:hidden space-y-3">
        {rows.length === 0 ? (
          <div className="card p-8 text-center text-sm text-slate-400">No baseline entries found.</div>
        ) : rows.map((row) => {
          const { date, time } = fmtDateTime(row.date);
          return (
            <div key={row._id} className="card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800">{row.time_point}</span>
                <span className="text-xs text-slate-400">{date} {time}</span>
              </div>
              <div className="grid grid-cols-5 gap-2 text-xs text-slate-600">
                <span>HR {row.hr}</span>
                <span>F {row.fatigue_score}</span>
                <span>K {row.kss_score}</span>
                <span>E {row.eye_strain_score}</span>
                <span>D {row.body_discomfort_score}</span>
              </div>
              <p className="text-xs text-slate-600">Sit: {row.sitting_duration_min} min · Rest: {row.rest_behavior ?? "—"}</p>
            </div>
          );
        })}
      </div>

      <div className="hidden sm:block card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {headers.map((h) => (
                  <th key={h} className="text-left px-3 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.length === 0 ? (
                <tr><td colSpan={headers.length} className="px-4 py-8 text-center text-sm text-slate-400">No baseline entries found.</td></tr>
              ) : rows.map((row) => {
                const { date, time } = fmtDateTime(row.date);
                return (
                  <tr key={row._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-3 py-2.5 text-slate-500 text-xs">{date}</td>
                    <td className="px-3 py-2.5 text-slate-500 text-xs">{time}</td>
                    <td className="px-3 py-2.5 text-slate-600 whitespace-nowrap">{row.time_point}</td>
                    <td className="px-3 py-2.5 text-slate-700">{row.hr}</td>
                    <td className="px-3 py-2.5 text-slate-700">{row.fatigue_score}</td>
                    <td className="px-3 py-2.5 text-slate-700">{row.kss_score}</td>
                    <td className="px-3 py-2.5 text-slate-700">{row.eye_strain_score}</td>
                    <td className="px-3 py-2.5 text-slate-700">{row.body_discomfort_score}</td>
                    <td className="px-3 py-2.5 text-slate-700 whitespace-nowrap">{row.sitting_duration_min} min</td>
                    <td className="px-3 py-2.5 text-xs text-slate-500">{row.rest_behavior ?? "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

// ── Page shell ─────────────────────────────────────────────────────────────────
function HistoryContent() {
  const { participantId, isLoggedIn, mounted } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const risk_level = searchParams.get("risk_level") ?? undefined;
  const [activeTab, setActiveTab] = useState<"checkins" | "baseline">("checkins");

  useEffect(() => {
    if (mounted && !isLoggedIn) router.push("/login");
  }, [mounted, isLoggedIn, router]);

  if (!mounted || !isLoggedIn || !participantId) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="text-slate-400 text-sm">Loading…</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My History</h1>
          <p className="text-sm text-slate-500 mt-1">
            All data for <span className="font-semibold text-teal-600">{participantId}</span>
          </p>
        </div>
        <Link
          href="/checkin"
          className="inline-block text-center bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shrink-0"
        >
          + New Check-in
        </Link>
      </div>

      <div className="border-b border-slate-200">
        <nav className="-mb-px flex gap-6">
          {(["checkins", "baseline"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-teal-600 text-teal-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab === "checkins" ? "Check-ins" : "Baseline Entries"}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === "checkins" && (
        <>
          <div className="card p-3 flex gap-3 flex-wrap items-center">
            <span className="text-xs font-medium text-slate-500">Filter by risk:</span>
            <Link
              href="/history"
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${!risk_level ? "bg-teal-600 border-teal-600 text-white" : "bg-white border-slate-200 text-slate-600 hover:border-teal-300"}`}
            >
              All
            </Link>
            {["High", "Medium", "Low"].map((lvl) => (
              <Link
                key={lvl}
                href={`/history?risk_level=${lvl}`}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${risk_level === lvl ? "bg-teal-600 border-teal-600 text-white" : "bg-white border-slate-200 text-slate-600 hover:border-teal-300"}`}
              >
                {lvl}
              </Link>
            ))}
          </div>
          <CheckinsTab participantId={participantId} riskFilter={risk_level} />
        </>
      )}

      {activeTab === "baseline" && <BaselineTab participantId={participantId} />}

    </div>
  );
}

export default function HistoryPage() {
  return (
    <Suspense fallback={
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="text-slate-400 text-sm">Loading…</div>
      </div>
    }>
      <HistoryContent />
    </Suspense>
  );
}
