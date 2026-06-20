import Link from "next/link";
import { ApiError, getBaselineEntries, getBaselineSummaries, getParticipants } from "@/lib/api";
import BaselineForm from "./BaselineForm";

export default async function BaselinePage() {
  let participants: string[] = [];
  let summaries: Awaited<ReturnType<typeof getBaselineSummaries>>["data"] = [];
  let entries: Awaited<ReturnType<typeof getBaselineEntries>>["data"] = [];
  let backendError: string | null = null;

  try {
    const [pRes, sRes, eRes] = await Promise.all([getParticipants(), getBaselineSummaries(), getBaselineEntries()]);
    participants = pRes.data.map((p) => p.participant_id);
    summaries = sRes.data;
    entries = eRes.data.slice(0, 10);
  } catch (error) {
    backendError = error instanceof ApiError ? error.message : "Could not reach backend API.";
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div>
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
          <Link href="/" className="hover:text-slate-700">Home</Link> / <span>Baseline Entry</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Phase 1 Baseline Entry</h1>
        <p className="text-sm text-slate-500 mt-1">Record baseline readings during the free-rest observation phase.</p>
      </div>

      {backendError && (
        <div className="card p-4 bg-amber-50 border-amber-200 text-sm text-amber-700">
          Backend unreachable: {backendError}. Make sure the API server is running on port 8000.
        </div>
      )}

      <BaselineForm participants={participants} />

      {summaries.length > 0 && (
        <div className="card p-5 space-y-3">
          <h2 className="text-sm font-semibold text-slate-700">Baseline Summaries</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="text-left py-2 pr-3">Participant</th>
                  <th className="text-left py-2 pr-3">Baseline HR</th>
                  <th className="text-left py-2 pr-3">Fatigue</th>
                  <th className="text-left py-2 pr-3">KSS</th>
                  <th className="text-left py-2 pr-3">Eye</th>
                  <th className="text-left py-2 pr-3">Discomfort</th>
                  <th className="text-left py-2 pr-3">Sitting</th>
                  <th className="text-left py-2">Records</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {summaries.map((s) => (
                  <tr key={s.participant_id}>
                    <td className="py-2 pr-3 font-semibold text-slate-700">{s.participant_id}</td>
                    <td className="py-2 pr-3 text-slate-600">{s.baseline_hr.toFixed(1)} bpm</td>
                    <td className="py-2 pr-3 text-slate-600">{s.baseline_fatigue.toFixed(1)}</td>
                    <td className="py-2 pr-3 text-slate-600">{s.baseline_kss.toFixed(1)}</td>
                    <td className="py-2 pr-3 text-slate-600">{s.baseline_eye_strain.toFixed(1)}</td>
                    <td className="py-2 pr-3 text-slate-600">{s.baseline_discomfort.toFixed(1)}</td>
                    <td className="py-2 pr-3 text-slate-600">{s.baseline_sitting_min.toFixed(0)} min</td>
                    <td className="py-2 text-slate-400">{s.record_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {entries.length > 0 && (
        <div className="card p-5 space-y-3">
          <h2 className="text-sm font-semibold text-slate-700">Recent Baseline Entries</h2>
          <div className="space-y-2">
            {entries.map((e) => (
              <div key={e._id} className="flex items-center justify-between text-xs border-b border-slate-50 last:border-0 pb-2 last:pb-0">
                <span className="font-semibold text-slate-700">{e.participant_id}</span>
                <span className="text-slate-500">{e.time_point}</span>
                <span className="text-slate-500">HR {e.hr}</span>
                <span className="text-slate-400">{new Date(e.date).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
