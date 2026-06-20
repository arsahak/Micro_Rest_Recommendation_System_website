import Link from "next/link";
import { ApiError, getBaselineSummaries, getParticipantSummary, getParticipants } from "@/lib/api";
import AddParticipantForm from "./AddParticipantForm";

const phaseBadge: Record<string, string> = {
  "Prototype-use": "bg-sky-50 text-sky-700",
  "Baseline": "bg-amber-50 text-amber-700",
  "Completed": "bg-slate-100 text-slate-500",
};

export default async function ParticipantsPage() {
  let rows: { id: string; label: string; phase: string; checkins: number; baseline: number; notes: string }[] = [];
  let backendError: string | null = null;

  try {
    const [pRes, bRes, sRes] = await Promise.all([getParticipants(), getBaselineSummaries(), getParticipantSummary()]);
    const baselineMap = new Map(bRes.data.map((b) => [b.participant_id, b.record_count]));
    const checkinMap = new Map(sRes.data.map((s) => [s._id, s.total_checkins]));

    rows = pRes.data.map((p) => ({
      id: p.participant_id,
      label: p.participant_label || p.participant_id,
      phase: p.study_phase,
      checkins: checkinMap.get(p.participant_id) ?? 0,
      baseline: baselineMap.get(p.participant_id) ?? 0,
      notes: p.notes || "",
    }));
  } catch (error) {
    backendError = error instanceof ApiError ? error.message : "Could not reach backend API.";
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Participants</h1>
        <p className="text-sm text-slate-500 mt-1">Study participant registry and phase status.</p>
      </div>

      {backendError && (
        <div className="card p-4 bg-amber-50 border-amber-200 text-sm text-amber-700">
          Backend unreachable: {backendError}. Make sure the API server is running on port 8000.
        </div>
      )}

      <AddParticipantForm />

      {/* Mobile card list */}
      <div className="sm:hidden space-y-3">
        {rows.length === 0 ? (
          <div className="card p-8 text-center text-sm text-slate-400">No participants yet. Add one above.</div>
        ) : rows.map(({ id, label, phase, checkins, baseline, notes }) => (
          <div key={id} className="card p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">{id} <span className="text-slate-500 font-normal">· {label}</span></span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${phaseBadge[phase]}`}>{phase}</span>
            </div>
            <div className="flex gap-4 text-xs text-slate-600">
              <span>Baseline: <strong>{baseline}</strong></span>
              <span>Check-ins: <strong>{checkins}</strong></span>
            </div>
            {notes && <p className="text-xs text-slate-400">{notes}</p>}
            <div className="flex gap-4 pt-1">
              <Link href={`/baseline?pid=${id}`} className="text-xs text-sky-600 hover:text-sky-800 font-medium">Baseline →</Link>
              <Link href={`/checkin?pid=${id}`} className="text-xs text-sky-600 hover:text-sky-800 font-medium">Check-in →</Link>
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
                {["ID", "Label", "Study Phase", "Baseline Records", "Phase 2 Check-ins", "Notes", "Actions"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-400">No participants yet. Add one above.</td></tr>
              ) : rows.map(({ id, label, phase, checkins, baseline, notes }) => (
                <tr key={id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-bold text-slate-800">{id}</td>
                  <td className="px-4 py-3 text-slate-600">{label}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${phaseBadge[phase]}`}>{phase}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{baseline}</td>
                  <td className="px-4 py-3 text-slate-600">{checkins}</td>
                  <td className="px-4 py-3 text-xs text-slate-400">{notes || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link href={`/baseline?pid=${id}`} className="text-xs text-sky-600 hover:text-sky-800 font-medium">Baseline</Link>
                      <Link href={`/checkin?pid=${id}`} className="text-xs text-sky-600 hover:text-sky-800 font-medium">Check-in</Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card p-4 bg-amber-50 border-amber-200">
        <p className="text-xs text-amber-700">
          <strong>Anonymity note:</strong> Participant IDs (P01–P05) replace real names. Do not store identifiable information in the Notes field.
        </p>
      </div>
    </div>
  );
}
