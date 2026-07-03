"use client";

import { useState, useEffect } from "react";
import { createBaselineEntryAction } from "./actions";

const TIME_PRESETS = ["Before Work", "11:00 AM", "1:00 PM", "3:00 PM", "After Work"];

function fmt24to12(hhmm: string): string {
  if (!hhmm) return "";
  const [h, m] = hhmm.split(":").map(Number);
  if (isNaN(h) || isNaN(m)) return hhmm;
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${ampm}`;
}

function presetToHHMM(preset: string): string {
  const match = preset.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
  if (!match) return "";
  let h = parseInt(match[1]);
  const m = match[2];
  const ampm = match[3].toUpperCase();
  if (ampm === "PM" && h !== 12) h += 12;
  if (ampm === "AM" && h === 12) h = 0;
  return `${h.toString().padStart(2, "0")}:${m}`;
}

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
              value === n ? "bg-teal-600 border-teal-600 text-white" : "bg-white border-slate-200 text-slate-600 hover:border-teal-300"
            }`}>
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function BaselineForm({ participantId, onSaved }: { participantId: string; onSaved?: () => void }) {
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [timeInput, setTimeInput] = useState("11:00"); // HH:MM for <input type="time">
  const [form, setForm] = useState({
    time_point: "11:00 AM", // overwritten on mount with real local time
    hr: "",
    fatigue_score: 0,
    kss_score: 0,
    eye_strain_score: 0,
    body_discomfort_score: 0,
    sitting_duration_min: "",
    rest_behavior: "Free rest",
  });
  const set = (k: string, v: string | number) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    const now = new Date();
    const hhmm = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
    setTimeInput(hhmm);
    setForm((f) => ({ ...f, time_point: fmt24to12(hhmm) }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);
    const res = await createBaselineEntryAction({
      participant_id: participantId,
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
    if (res.success) onSaved?.();
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

        {/* Locked participant display */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Participant ID</label>
          <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2 bg-slate-50">
            <span className="w-6 h-6 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
              {participantId[0]}
            </span>
            <span className="text-sm font-semibold text-slate-800">{participantId}</span>
            <span className="ml-auto text-xs text-slate-400">Logged in</span>
          </div>
        </div>

        {/* Time Point — preset chips + custom time picker */}
        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <label className="text-sm font-medium text-slate-700">Time Point</label>
            {form.time_point && (
              <span className="text-xs font-semibold text-teal-600">{form.time_point}</span>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {TIME_PRESETS.map((t) => (
              <button key={t} type="button"
                onClick={() => {
                  set("time_point", t);
                  const hhmm = presetToHHMM(t);
                  if (hhmm) setTimeInput(hhmm);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  form.time_point === t
                    ? "bg-teal-600 border-teal-600 text-white"
                    : "bg-white border-slate-200 text-slate-600 hover:border-teal-300 hover:text-teal-700"
                }`}>
                {t}
              </button>
            ))}
          </div>
          <input
            type="time"
            value={timeInput}
            onChange={(e) => {
              const val = e.target.value;
              setTimeInput(val);
              set("time_point", fmt24to12(val));
            }}
            className={`w-full border rounded-lg px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 ${
              !TIME_PRESETS.includes(form.time_point) ? "border-teal-400" : "border-slate-200"
            }`}
          />
          <p className="text-xs text-slate-400">Auto-set to now — select a preset or pick any custom time.</p>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Rest Behaviour</label>
          <select value={form.rest_behavior} onChange={(e) => set("rest_behavior", e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500">
            {["Free rest", "No rest", "Normal rest"].map((r) => <option key={r}>{r}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Heart Rate (bpm)</label>
            <input type="number" min={40} max={200} required placeholder="e.g. 72" value={form.hr}
              onChange={(e) => set("hr", e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Sitting Duration (min)</label>
            <input type="number" min={0} required placeholder="e.g. 50" value={form.sitting_duration_min}
              onChange={(e) => set("sitting_duration_min", e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500" />
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
        className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white font-semibold py-3 rounded-lg transition-colors text-sm">
        {submitting ? "Saving..." : "Save Baseline Entry"}
      </button>
    </form>
  );
}
