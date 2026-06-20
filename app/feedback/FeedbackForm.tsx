"use client";

import { useState } from "react";
import Link from "next/link";
import { submitFeedbackAction } from "./actions";

function RatingRow({ label, value, onChange, lowLabel, highLabel }: {
  label: string; value: number; onChange: (v: number) => void; lowLabel: string; highLabel: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <div className="flex gap-1 sm:gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" onClick={() => onChange(n)}
            className={`flex-1 h-8 sm:h-9 rounded-md text-xs sm:text-sm font-semibold border transition-colors ${
              value === n ? "bg-sky-600 border-sky-600 text-white" : "bg-white border-slate-200 text-slate-600 hover:border-sky-300 hover:text-sky-700"
            }`}>
            {n}
          </button>
        ))}
      </div>
      <div className="flex justify-between gap-2 text-xs text-slate-400">
        <span>{lowLabel}</span>
        <span className="text-right">{highLabel}</span>
      </div>
    </div>
  );
}

export default function FeedbackForm({ checkinId }: { checkinId: string }) {
  const [completed, setCompleted] = useState<boolean | null>(null);
  const [usefulness, setUsefulness] = useState(0);
  const [timing, setTiming] = useState(0);
  const [disturbance, setDisturbance] = useState(0);
  const [recovered, setRecovered] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (completed === null) return;
    setSubmitting(true);
    setError(null);
    const res = await submitFeedbackAction({
      checkin_id: checkinId,
      completed,
      usefulness_rating: usefulness || undefined,
      timing_appropriate: timing || undefined,
      work_disturbance: disturbance || undefined,
      recovered: recovered || undefined,
      comment: comment || undefined,
    });
    if (res && !res.success) {
      setError(res.message);
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="card p-4 bg-red-50 border-red-200 text-sm text-red-700">{error}</div>}

      <div className="card p-5 space-y-4">
        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Completion</h2>
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-2">Did you complete the micro-rest?</label>
          <div className="flex gap-3">
            {[true, false].map((val) => (
              <button key={String(val)} type="button" onClick={() => setCompleted(val)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold border transition-colors ${
                  completed === val ? (val ? "bg-green-600 border-green-600 text-white" : "bg-red-500 border-red-500 text-white") : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                }`}>
                {val ? "Yes, completed" : "No, skipped"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card p-5 space-y-5">
        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Ratings</h2>
        <RatingRow label="Usefulness" value={usefulness} onChange={setUsefulness} lowLabel="Not useful" highLabel="Very useful" />
        <RatingRow label="Timing Appropriateness" value={timing} onChange={setTiming} lowLabel="Very poorly timed" highLabel="Perfectly timed" />
        <RatingRow label="Work Disturbance" value={disturbance} onChange={setDisturbance} lowLabel="Not disruptive" highLabel="Very disruptive" />
        <RatingRow label="Perceived Recovery" value={recovered} onChange={setRecovered} lowLabel="Did not help" highLabel="Fully refreshed" />
      </div>

      <div className="card p-5 space-y-2">
        <label className="text-sm font-medium text-slate-700">Additional Comments <span className="text-slate-400 font-normal">(optional)</span></label>
        <textarea rows={3} value={comment} onChange={(e) => setComment(e.target.value)}
          placeholder="Any notes on the prompt, timing, or your experience..."
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none" />
      </div>

      <button type="submit" disabled={completed === null || submitting}
        className="w-full bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors text-sm">
        {submitting ? "Submitting..." : "Submit Feedback"}
      </button>

      <Link href="/history" className="block text-center text-xs text-slate-400 hover:text-slate-600">
        Skip and go to history
      </Link>
    </form>
  );
}
