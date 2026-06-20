"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBaselineEntryAction } from "./actions";

const TIME_POINTS = ["Before Work", "11:00 AM", "1:00 PM", "3:00 PM", "After Work"];

function Scale({ label, min, max, value, onChange, hint }: {
  label: string; min: number; max: number; value: number; onChange: (v: number) => void; hint?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-0.5">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        <span className="text-xs text-slate-400">{hint}</span>
      </div>
      <div className="flex gap-1 sm:gap-1.5">
        {Array.from({ length: max - min + 1 }, (_, i) => i + min).map((n) => (
          <button key={n} type="button" onClick={() => onChange(n)}
            className={`flex-1 h-8 sm:h-9 rounded-md text-xs sm:text-sm font-semibold border transition-colors ${
              value === n ? "bg-sky-600 border-sky-600 text-white" : "bg-white border-slate-200 text-slate-600 hover:border-sky-300"
            }`}>
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function BaselineForm({ participants }: { participants: string[] }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [form, setForm] = useState({
    participant_id: participants[0] ?? "P01",
    time_point: "Before Work",
    hr: "",
    fatigue_score: 0,
    kss_score: 0,
    eye_strain_score: 0,
    body_discomfort_score: 0,
    sitting_duration_min: "",
    rest_behavior: "Free rest",
  });
  const set = (k: string, v: string | number) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);
    const res = await createBaselineEntryAction({
      participant_id: form.participant_id,
      time_point: form.time_point,
      hr: Number(form.hr),
      fatigue_score: form.fatigue_score,
      kss_score: form.kss_score,
      eye_strain_score: form.eye_strain_score,
      body_discomfort_score: form.body_discomfort_score,
      sitting_duration_min: Number(form.sitting_duration_min),
      rest_behavior: form.rest_behavior,
    });
    setResult(res);
    setSubmitting(false);
    if (res.success) {
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {result && (
        <div className={`p-3 rounded-lg text-sm font-medium ${result.success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {result.message}
        </div>
      )}

      <div className="card p-5 space-y-4">
        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Context</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Participant ID</label>
            <select value={form.participant_id} onChange={(e) => set("participant_id", e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500">
              {participants.length === 0 ? <option>P01</option> : participants.map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Time Point</label>
            <select value={form.time_point} onChange={(e) => set("time_point", e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500">
              {TIME_POINTS.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Heart Rate (bpm)</label>
          <input type="number" min={40} max={200} required placeholder="e.g. 72" value={form.hr}
            onChange={(e) => set("hr", e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Sitting Duration (min)</label>
            <input type="number" min={0} required placeholder="e.g. 50" value={form.sitting_duration_min}
              onChange={(e) => set("sitting_duration_min", e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Rest Behaviour</label>
            <select value={form.rest_behavior} onChange={(e) => set("rest_behavior", e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500">
              {["Free rest", "No rest", "Normal rest"].map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="card p-5 space-y-5">
        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Self-Report Scores</h2>
        <Scale label="Fatigue (Samn-Perelli)" min={1} max={7} value={form.fatigue_score} onChange={(v) => set("fatigue_score", v)} hint="1 = alert · 7 = exhausted" />
        <Scale label="Sleepiness (KSS)" min={1} max={9} value={form.kss_score} onChange={(v) => set("kss_score", v)} hint="1 = alert · 9 = sleepy" />
        <Scale label="Eye Strain" min={1} max={5} value={form.eye_strain_score} onChange={(v) => set("eye_strain_score", v)} hint="1 = none · 5 = severe" />
        <Scale label="Body Discomfort" min={1} max={5} value={form.body_discomfort_score} onChange={(v) => set("body_discomfort_score", v)} hint="1 = none · 5 = severe" />
      </div>

      <button type="submit" disabled={submitting}
        className="w-full bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 text-white font-semibold py-3 rounded-lg transition-colors text-sm">
        {submitting ? "Saving..." : "Save Baseline Entry"}
      </button>
    </form>
  );
}
