"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ApiError, getBaselineEntries, getBaselineSummary } from "@/lib/api";
import type { BaselineEntry, BaselineSummary } from "@/lib/api";
import BaselineForm from "./BaselineForm";

export default function BaselinePage() {
  const { participantId, isLoggedIn, mounted } = useAuth();
  const router = useRouter();
  const [summary, setSummary] = useState<BaselineSummary | null>(null);
  const [entries, setEntries] = useState<BaselineEntry[]>([]);
  const [backendError, setBackendError] = useState<string | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    if (mounted && !isLoggedIn) router.push("/login");
  }, [mounted, isLoggedIn, router]);

  const loadData = useCallback(() => {
    if (!participantId) return;
    setDataLoaded(false);
    Promise.all([
      getBaselineSummary(participantId).catch(() => null),
      getBaselineEntries(participantId).catch(() => null),
    ]).then(([summaryRes, entriesRes]) => {
      setSummary(summaryRes?.data ?? null);
      setEntries(entriesRes?.data.slice(0, 10) ?? []);
      setBackendError(null);
      setDataLoaded(true);
    }).catch((err) => {
      setBackendError(err instanceof ApiError ? err.message : "Could not reach backend API.");
      setDataLoaded(true);
    });
  }, [participantId]);

  useEffect(() => {
    if (isLoggedIn && participantId) loadData();
  }, [isLoggedIn, participantId, loadData]);

  if (!mounted || !isLoggedIn || !participantId) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="text-slate-400 text-sm">Loading…</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div>
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
          <Link href="/user" className="hover:text-slate-700">Dashboard</Link> / <span>Baseline Entry</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Phase 1 Baseline Entry</h1>
        <p className="text-sm text-slate-500 mt-1">Record baseline readings during the free-rest observation phase.</p>
      </div>

      {backendError && (
        <div className="card p-4 bg-amber-50 border-amber-200 text-sm text-amber-700">
          Backend unreachable: {backendError}. Make sure the API server is running on port 8000.
        </div>
      )}

      <BaselineForm participantId={participantId} onSaved={loadData} />

      {dataLoaded && summary && (
        <div className="card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-700">Your Baseline Summary</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: "Baseline HR",    value: `${summary.baseline_hr.toFixed(1)} bpm` },
              { label: "Avg Fatigue",    value: summary.baseline_fatigue.toFixed(1) },
              { label: "Avg KSS",        value: summary.baseline_kss.toFixed(1) },
              { label: "Avg Eye Strain", value: summary.baseline_eye_strain.toFixed(1) },
              { label: "Avg Discomfort", value: summary.baseline_discomfort.toFixed(1) },
              { label: "Records",        value: String(summary.record_count) },
            ].map(({ label, value }) => (
              <div key={label} className="bg-slate-50 rounded-lg p-3 space-y-1">
                <p className="text-xs text-slate-400">{label}</p>
                <p className="font-bold text-slate-800 text-lg leading-tight">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {dataLoaded && entries.length > 0 && (
        <div className="card p-5 space-y-3">
          <h2 className="text-sm font-semibold text-slate-700">Recent Baseline Entries</h2>
          <div className="space-y-2">
            {entries.map((e) => (
              <div key={e._id} className="flex items-center justify-between text-xs border-b border-slate-50 last:border-0 pb-2 last:pb-0">
                <span className="font-medium text-slate-600">{e.time_point}</span>
                <span className="text-slate-500">HR {e.hr} bpm</span>
                <span className="text-slate-400">{new Date(e.date).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {dataLoaded && !summary && !backendError && (
        <div className="card p-5 bg-amber-50 border-amber-200 text-sm text-amber-700 text-center">
          No baseline data recorded yet. Add your first entry above.
        </div>
      )}
    </div>
  );
}
