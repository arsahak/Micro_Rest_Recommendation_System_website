import Link from "next/link";
import { notFound } from "next/navigation";
import { ApiError, getCheckin } from "@/lib/api";

const riskColor: Record<string, string> = { Low: "badge-low", Medium: "badge-medium", High: "badge-high" };

const ICONS: Record<string, string> = {
  "60-second Eye Break": "👁️",
  "Stretch or Posture Reset": "🧘",
  "Stand or Light Movement": "🚶",
  "Breathing / Recovery Prompt": "💨",
  "Posture Reset or Breathing": "😮‍💨",
  "No Immediate Prompt": "✅",
};

export default async function PromptOutputPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let checkin;
  try {
    const res = await getCheckin(id);
    checkin = res.data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-3">
        <h2 className="text-xl font-bold text-slate-900">Could Not Load Result</h2>
        <p className="text-sm text-slate-500">{error instanceof ApiError ? error.message : "Backend unreachable."}</p>
        <Link href="/checkin" className="text-sm text-sky-600 hover:text-sky-800 font-medium">← Back to Check-in</Link>
      </div>
    );
  }

  const scoreRows = [
    { label: "Eye Strain", raw: checkin.eye_strain_score, risk: checkin.eye_risk },
    { label: "Body Discomfort", raw: checkin.body_discomfort_score, risk: checkin.discomfort_risk },
    { label: "Sitting Duration", raw: `${checkin.sitting_duration_min} min`, risk: checkin.sitting_risk },
    { label: "Fatigue (Samn-Perelli)", raw: checkin.fatigue_score, risk: checkin.fatigue_risk },
    { label: "Sleepiness (KSS)", raw: checkin.kss_score, risk: checkin.kss_risk },
    { label: "HR Deviation", raw: `${checkin.hr_deviation > 0 ? "+" : ""}${checkin.hr_deviation.toFixed(1)} bpm`, risk: checkin.hr_risk },
  ];

  const icon = ICONS[checkin.selected_prompt] ?? "📋";
  const feedbackHref = `/feedback?checkin_id=${checkin.checkin_id}`;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Fatigue Risk Result</h1>
          <p className="text-sm text-slate-500 mt-0.5">{checkin.participant_id} · {checkin.time_point}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-bold ${riskColor[checkin.risk_level]}`}>
          {checkin.risk_level} Risk
        </span>
      </div>

      <div className={`card p-6 space-y-4 border-l-4 ${
        checkin.risk_level === "High" ? "border-l-red-500" : checkin.risk_level === "Medium" ? "border-l-amber-500" : "border-l-green-500"
      }`}>
        <div className="flex items-center gap-3">
          <span className="text-3xl">{icon}</span>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">{checkin.dominant_issue}</p>
            <h2 className="text-lg font-bold text-slate-900">{checkin.selected_prompt}</h2>
          </div>
        </div>
        <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 rounded-lg p-3">{checkin.instruction}</p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">Duration: <strong className="text-slate-700">{checkin.duration}</strong></span>
          <span className="text-xs text-slate-500">Total Risk Score: <strong className="text-slate-700">{checkin.total_risk_score} / 12</strong></span>
        </div>
        {checkin.risk_level !== "Low" && (
          <Link href={feedbackHref}
            className="block w-full text-center bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 rounded-lg transition-colors text-sm mt-2">
            Start Micro-Rest →
          </Link>
        )}
      </div>

      <div className="card p-5 space-y-3">
        <h3 className="text-sm font-semibold text-slate-700">Risk Score Breakdown</h3>
        <div className="space-y-2">
          {scoreRows.map(({ label, raw, risk: r }) => (
            <div key={label} className="flex items-center gap-3">
              <span className="text-xs text-slate-500 w-44 shrink-0">{label}</span>
              <div className="flex gap-1">
                {[0, 1, 2].map((dot) => (
                  <span key={dot} className={`w-3 h-3 rounded-full ${dot < r ? (r === 2 ? "bg-red-500" : "bg-amber-400") : "bg-slate-100"}`} />
                ))}
              </div>
              <span className={`text-xs font-semibold ml-1 ${r === 2 ? "text-red-600" : r === 1 ? "text-amber-600" : "text-slate-400"}`}>
                {r === 2 ? "High" : r === 1 ? "Medium" : "Low"} ({raw})
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-5 space-y-2">
        <h3 className="text-sm font-semibold text-slate-700">Reading Details ({checkin.participant_id})</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div className="flex justify-between bg-slate-50 rounded px-3 py-2">
            <span className="text-slate-500">Current HR</span>
            <span className="font-semibold text-slate-700">{checkin.current_hr} bpm</span>
          </div>
          <div className="flex justify-between bg-slate-50 rounded px-3 py-2">
            <span className="text-slate-500">HR Deviation</span>
            <span className={`font-semibold ${checkin.hr_deviation >= 15 ? "text-red-600" : checkin.hr_deviation >= 8 ? "text-amber-600" : "text-green-600"}`}>
              {checkin.hr_deviation > 0 ? "+" : ""}{checkin.hr_deviation.toFixed(1)} bpm
            </span>
          </div>
          <div className="flex justify-between bg-slate-50 rounded px-3 py-2">
            <span className="text-slate-500">Check-in ID</span>
            <span className="font-mono text-slate-500">{checkin.checkin_id}</span>
          </div>
          <div className="flex justify-between bg-slate-50 rounded px-3 py-2">
            <span className="text-slate-500">Dominant Issue</span>
            <span className="font-semibold text-slate-700 text-right">{checkin.dominant_issue}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Link href="/checkin" className="flex-1 text-center border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold py-2.5 rounded-lg transition-colors">
          ← New Check-in
        </Link>
        <Link href={feedbackHref} className="flex-1 text-center border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold py-2.5 rounded-lg transition-colors">
          Skip & Give Feedback
        </Link>
      </div>

    </div>
  );
}
