"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ApiError, getCheckins, type Checkin } from "@/lib/api";

const badge: Record<string, string> = {
  Low: "badge-low",
  Medium: "badge-medium",
  High: "badge-high",
};

function HistoryContent() {
  const { participantId, isLoggedIn, mounted } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const risk_level = searchParams.get("risk_level") ?? undefined;

  const [rows, setRows] = useState<Checkin[]>([]);
  const [backendError, setBackendError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (mounted && !isLoggedIn) router.push("/login");
  }, [mounted, isLoggedIn, router]);

  useEffect(() => {
    if (!isLoggedIn || !participantId) return;
    setLoading(true);
    getCheckins({ participant_id: participantId, risk_level })
      .then((res) => { setRows(res.data); setBackendError(null); })
      .catch((err) => setBackendError(err instanceof ApiError ? err.message : "Could not reach backend API."))
      .finally(() => setLoading(false));
  }, [isLoggedIn, participantId, risk_level]);

  if (!mounted || !isLoggedIn || !participantId) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="text-slate-400 text-sm">Loading…</div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Check-in History</h1>
          <p className="text-sm text-slate-500 mt-1">
            All check-ins for{" "}
            <span className="font-semibold text-teal-600">{participantId}</span>
          </p>
        </div>
        <Link
          href="/checkin"
          className="inline-block text-center bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shrink-0"
        >
          + New Check-in
        </Link>
      </div>

      {backendError && (
        <div className="card p-4 bg-amber-50 border-amber-200 text-sm text-amber-700">
          Backend unreachable: {backendError}. Make sure the API server is running on port 8000.
        </div>
      )}

      {/* Risk level filter */}
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

      {loading ? (
        <div className="card p-8 text-center text-sm text-slate-400">Loading check-ins…</div>
      ) : (
        <>
          {/* Mobile card list */}
          <div className="sm:hidden space-y-3">
            {rows.length === 0 ? (
              <div className="card p-8 text-center text-sm text-slate-400">No check-ins found.</div>
            ) : rows.map((row) => (
              <div key={row.checkin_id} className="card p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">{row.time_point}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${badge[row.risk_level]}`}>{row.risk_level}</span>
                </div>
                <p className="text-xs text-slate-400">{new Date(row.date).toLocaleDateString()} · {row.checkin_id}</p>
                <div className="grid grid-cols-4 gap-2 text-xs text-slate-600">
                  <span>HR {row.current_hr}</span>
                  <span>Eye {row.eye_strain_score}</span>
                  <span>Disc {row.body_discomfort_score}</span>
                  <span>Sit {row.sitting_duration_min}m</span>
                </div>
                <p className="text-xs text-slate-600"><strong>{row.dominant_issue}</strong> · {row.selected_prompt}</p>
                <div className="flex gap-4 pt-1">
                  <Link href={`/prompt/${row.checkin_id}`} className="text-xs text-teal-600 hover:text-teal-800 font-medium">View →</Link>
                  <Link href={`/feedback?checkin_id=${row.checkin_id}`} className="text-xs text-teal-600 hover:text-teal-800 font-medium">Feedback →</Link>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    {["ID", "Date", "Time Point", "HR", "Eye", "Discomfort", "Sitting", "Risk Level", "Dominant Issue", "Prompt", ""].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.length === 0 ? (
                    <tr><td colSpan={11} className="px-4 py-8 text-center text-sm text-slate-400">No check-ins found.</td></tr>
                  ) : rows.map((row) => (
                    <tr key={row.checkin_id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-slate-500">{row.checkin_id}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{new Date(row.date).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{row.time_point}</td>
                      <td className="px-4 py-3 text-slate-700">{row.current_hr}</td>
                      <td className="px-4 py-3 text-slate-700">{row.eye_strain_score}</td>
                      <td className="px-4 py-3 text-slate-700">{row.body_discomfort_score}</td>
                      <td className="px-4 py-3 text-slate-700">{row.sitting_duration_min} min</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${badge[row.risk_level]}`}>{row.risk_level}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">{row.dominant_issue}</td>
                      <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{row.selected_prompt}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Link href={`/prompt/${row.checkin_id}`} className="text-xs text-teal-600 hover:text-teal-800 font-medium">View →</Link>
                          <Link href={`/feedback?checkin_id=${row.checkin_id}`} className="text-xs text-teal-600 hover:text-teal-800 font-medium">Feedback →</Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
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
