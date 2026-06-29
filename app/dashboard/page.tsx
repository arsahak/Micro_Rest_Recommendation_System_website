import Link from "next/link";
import {
  ApiError,
  DashboardSummary,
  ParticipantSummaryRow,
  PromptUsageRow,
  RiskTrendRow,
  getDashboardSummary,
  getParticipantSummary,
  getPromptUsageSummary,
  getRiskTrend,
} from "@/lib/api";

export default async function DashboardPage() {
  let summary: DashboardSummary | null = null;
  let participants: ParticipantSummaryRow[] = [];
  let prompts: PromptUsageRow[] = [];
  let trend: RiskTrendRow[] = [];
  let backendError: string | null = null;

  try {
    const [sRes, pRes, prRes, tRes] = await Promise.all([
      getDashboardSummary(),
      getParticipantSummary(),
      getPromptUsageSummary(),
      getRiskTrend(),
    ]);
    summary = sRes.data;
    participants = pRes.data;
    prompts = prRes.data;
    trend = tRes.data;
  } catch (error) {
    backendError = error instanceof ApiError ? error.message : "Could not reach backend API.";
  }

  if (backendError || !summary) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">Researcher Dashboard</h1>
        <div className="card p-4 bg-amber-50 border-amber-200 text-sm text-amber-700">
          Backend unreachable: {backendError}. Make sure the API server is running on port 8000.
        </div>
      </div>
    );
  }

  const stats = [
    { icon: "📋", label: "Total Check-ins", value: String(summary.overview.total_checkins), sub: `across ${summary.overview.participant_count} participants` },
    { icon: "🔥", label: "High Risk Events", value: String(summary.overview.risk_distribution.High), sub: `${summary.overview.high_risk_pct}% of check-ins` },
    { icon: "✅", label: "Prompts Completed", value: String(summary.feedback.completion_count), sub: `${summary.feedback.completion_rate}% completion rate` },
    { icon: "⭐", label: "Avg Usefulness", value: summary.feedback.avg_usefulness ? `${summary.feedback.avg_usefulness} / 5` : "—", sub: `from ${summary.feedback.total_feedback} feedback entries` },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Researcher Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Live Phase 2 data from the fatigue monitor API</p>
        </div>
        <Link href="/checkin" className="btn-primary shrink-0">
          + New Check-in
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ icon, label, value, sub }) => (
          <div key={label} className="card p-4 space-y-2">
            <span className="icon-badge-sm">{icon}</span>
            <p className="text-xs text-slate-500">{label}</p>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            <p className="text-xs text-slate-400">{sub}</p>
          </div>
        ))}
      </div>

      <div className="card p-5 space-y-4">
        <h2 className="text-sm font-semibold text-slate-700">Risk Level Distribution by Time Point</h2>
        {trend.length === 0 ? (
          <p className="text-xs text-slate-400">No check-ins recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {trend.map(({ time_point, Low, Medium, High, total }) => {
              const lowPct = total > 0 ? (Low / total) * 100 : 0;
              const medPct = total > 0 ? (Medium / total) * 100 : 0;
              const highPct = total > 0 ? (High / total) * 100 : 0;
              return (
                <div key={time_point} className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 w-24 shrink-0">{time_point}</span>
                  <div className="flex-1 flex rounded-full overflow-hidden h-5 bg-slate-100">
                    {total === 0 ? null : (
                      <>
                        <div className="bg-green-100 flex items-center justify-center text-xs text-green-700 font-semibold" style={{ width: `${lowPct}%` }}>{lowPct > 10 ? `${lowPct.toFixed(0)}%` : ""}</div>
                        <div className="bg-amber-100 flex items-center justify-center text-xs text-amber-700 font-semibold" style={{ width: `${medPct}%` }}>{medPct > 10 ? `${medPct.toFixed(0)}%` : ""}</div>
                        <div className="bg-red-100 flex items-center justify-center text-xs text-red-700 font-semibold" style={{ width: `${highPct}%` }}>{highPct > 8 ? `${highPct.toFixed(0)}%` : ""}</div>
                      </>
                    )}
                  </div>
                  <span className="text-xs text-slate-400 w-10 text-right">{total}</span>
                </div>
              );
            })}
          </div>
        )}
        <div className="flex gap-4 text-xs text-slate-500 mt-1">
          <span className="flex gap-1.5 items-center"><span className="w-3 h-3 rounded-full bg-green-200 inline-block" />Low</span>
          <span className="flex gap-1.5 items-center"><span className="w-3 h-3 rounded-full bg-amber-200 inline-block" />Medium</span>
          <span className="flex gap-1.5 items-center"><span className="w-3 h-3 rounded-full bg-red-200 inline-block" />High</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-700">Prompt Usage & Completion</h2>
          {prompts.length === 0 ? (
            <p className="text-xs text-slate-400">No prompts issued yet.</p>
          ) : (
            <div className="space-y-3">
              {(() => {
                const maxUsage = Math.max(1, ...prompts.map((p) => p.usage_count));
                return prompts.map(({ prompt, usage_count, completions, total_feedback }) => {
                  const pct = (usage_count / maxUsage) * 100;
                  return (
                    <div key={prompt} className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-600">
                        <span className="font-medium">{prompt}</span>
                        <span className="text-slate-400">{completions}/{total_feedback || usage_count} completed</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="bg-teal-400 rounded-full h-2 transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          )}
        </div>

        <div className="card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-700">Participant Summary</h2>
          {participants.length === 0 ? (
            <p className="text-xs text-slate-400">No check-ins recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {participants.map(({ _id, total_checkins, high_count, medium_count, low_count, avg_total_risk }) => (
                <div key={_id} className="border border-slate-100 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800 text-sm">{_id}</span>
                    <span className="text-xs text-slate-500">{total_checkins} check-ins</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="badge-high px-2 py-0.5 rounded text-xs font-semibold">H:{high_count}</span>
                    <span className="badge-medium px-2 py-0.5 rounded text-xs font-semibold">M:{medium_count}</span>
                    <span className="badge-low px-2 py-0.5 rounded text-xs font-semibold">L:{low_count}</span>
                  </div>
                  <div className="flex gap-4 text-xs text-slate-500">
                    <span>Avg Risk Score: <strong className="text-slate-700">{avg_total_risk.toFixed(1)}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      <div className="card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">Recent Check-ins</h2>
          <Link href="/history" className="text-xs text-teal-600 hover:text-teal-800 font-medium">View all →</Link>
        </div>
        {summary.recent_checkins.length === 0 ? (
          <p className="text-xs text-slate-400">No check-ins yet.</p>
        ) : (
          <div className="space-y-2">
            {summary.recent_checkins.map((c) => (
              <Link key={c.checkin_id} href={`/prompt/${c.checkin_id}`} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0 hover:bg-slate-50 -mx-2 px-2 rounded-lg transition-colors">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">{c.participant_id}</div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-slate-700">{c.time_point} · {new Date(c.date).toLocaleDateString()}</p>
                  <p className="text-xs text-slate-400">{c.selected_prompt}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  c.risk_level === "High" ? "badge-high" : c.risk_level === "Medium" ? "badge-medium" : "badge-low"
                }`}>{c.risk_level}</span>
              </Link>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
