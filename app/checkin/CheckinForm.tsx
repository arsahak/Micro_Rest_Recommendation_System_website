"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCheckinAction } from "./actions";
import SessionPanel from "@/component/session/SessionPanel";
import { useAuth } from "@/context/AuthContext";
import type { Session } from "@/lib/api";

const TIME_POINTS = [
  "Before Work",
  "11:00 AM",
  "1:00 PM",
  "3:00 PM",
  "After Work",
];

function ScaleInput({
  label,
  value,
  min,
  max,
  onChange,
  hint,
}: {
  label: string;
  min: number;
  max: number;
  value: number;
  onChange: (v: number) => void;
  hint?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-0.5">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        <span className="text-xs text-slate-400">{hint}</span>
      </div>
      <div className="flex gap-1 sm:gap-1.5">
        {Array.from({ length: max - min + 1 }, (_, i) => i + min).map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`flex-1 h-8 sm:h-9 rounded-md text-xs sm:text-sm font-semibold border transition-colors ${
              value === n
                ? "bg-teal-600 border-teal-600 text-white"
                : "bg-white border-slate-200 text-slate-600 hover:border-teal-300 hover:text-teal-700"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function CheckinForm() {
  const { participantId, isLoggedIn, mounted } = useAuth();
  const router = useRouter();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    time_point: "11:00 AM",
    current_hr: "",
    fatigue_score: 0,
    kss_score: 0,
    eye_strain_score: 0,
    body_discomfort_score: 0,
    sitting_duration_min: "",
    screen_exposure_min: "",
  });
  const set = (k: string, v: string | number) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSessionLoaded = (session: Session) => {
    setForm((f) => ({
      ...f,
      sitting_duration_min: String(session.sitting_duration_min),
      screen_exposure_min: String(session.screen_exposure_min),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!participantId) return;
    setSubmitting(true);
    setError(null);
    const result = await createCheckinAction({
      participant_id: participantId,
      time_point: form.time_point,
      current_hr: Number(form.current_hr),
      fatigue_score: form.fatigue_score,
      kss_score: form.kss_score,
      eye_strain_score: form.eye_strain_score,
      body_discomfort_score: form.body_discomfort_score,
      sitting_duration_min: Number(form.sitting_duration_min),
      screen_exposure_min: form.screen_exposure_min
        ? Number(form.screen_exposure_min)
        : undefined,
    });
    if (result && !result.success) {
      setError(result.message);
      setSubmitting(false);
    }
  };

  // Wait for auth to restore from localStorage before rendering
  if (!mounted || !isLoggedIn || !participantId) {
    return (
      <div className="card p-8 text-center text-sm text-slate-400">
        Loading…
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="card p-4 bg-red-50 border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="card p-5 space-y-4">
        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
          Session Context
        </h2>

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

        <SessionPanel
          key={participantId}
          participantId={participantId}
          onSessionLoaded={handleSessionLoaded}
        />

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Time Point</label>
          <select
            value={form.time_point}
            onChange={(e) => set("time_point", e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            {TIME_POINTS.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="card p-5 space-y-4">
        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
          Physiological Reading
        </h2>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">
            Current Heart Rate{" "}
            <span className="text-slate-400 font-normal">(bpm — read from Fitbit)</span>
          </label>
          <input
            type="number"
            min={40}
            max={200}
            required
            placeholder="e.g. 78"
            value={form.current_hr}
            onChange={(e) => set("current_hr", e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <p className="text-xs text-slate-400">
            Check your Fitbit Charge 6 wrist display or the Fitbit app.
          </p>
        </div>
      </div>

      <div className="card p-5 space-y-5">
        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
          Self-Report Scores
        </h2>
        <ScaleInput
          label="Fatigue Score (Samn-Perelli)"
          min={1} max={7}
          value={form.fatigue_score}
          onChange={(v) => set("fatigue_score", v)}
          hint="1 = fully alert · 7 = completely exhausted"
        />
        <ScaleInput
          label="Sleepiness Score (KSS)"
          min={1} max={9}
          value={form.kss_score}
          onChange={(v) => set("kss_score", v)}
          hint="1 = extremely alert · 9 = extremely sleepy"
        />
        <ScaleInput
          label="Eye Strain Score"
          min={1} max={5}
          value={form.eye_strain_score}
          onChange={(v) => set("eye_strain_score", v)}
          hint="1 = no strain · 5 = severe strain"
        />
        <ScaleInput
          label="Body Discomfort Score"
          min={1} max={5}
          value={form.body_discomfort_score}
          onChange={(v) => set("body_discomfort_score", v)}
          hint="1 = no discomfort · 5 = severe discomfort"
        />
      </div>

      <div className="card p-5 space-y-4">
        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
          Work Context
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Sitting Duration (min)</label>
            <input
              type="number"
              min={0}
              required
              placeholder="e.g. 90"
              value={form.sitting_duration_min}
              onChange={(e) => set("sitting_duration_min", e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <p className="text-xs text-slate-400">Minutes since last break</p>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              Screen Exposure (min){" "}
              <span className="text-slate-400 font-normal">optional</span>
            </label>
            <input
              type="number"
              min={0}
              placeholder="e.g. 85"
              value={form.screen_exposure_min}
              onChange={(e) => set("screen_exposure_min", e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full btn-primary py-3 text-sm"
      >
        {submitting ? "Calculating…" : "Calculate Fatigue Risk →"}
      </button>
    </form>
  );
}
