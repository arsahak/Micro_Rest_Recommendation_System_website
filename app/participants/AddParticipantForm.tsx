"use client";

import { useActionState } from "react";
import { createParticipantAction, ParticipantFormState } from "./actions";

const initialState: ParticipantFormState = { success: false, message: "" };

export default function AddParticipantForm() {
  const [state, formAction, pending] = useActionState(createParticipantAction, initialState);

  return (
    <form action={formAction} className="card p-4 flex flex-col sm:flex-row sm:flex-wrap sm:items-end gap-3">
      <div className="space-y-1 w-full sm:w-28">
        <label className="text-xs font-medium text-slate-600">Participant ID</label>
        <input name="participant_id" required placeholder="P06"
          className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
      </div>
      <div className="space-y-1 w-full sm:w-40">
        <label className="text-xs font-medium text-slate-600">Label</label>
        <input name="participant_label" placeholder="Participant 6"
          className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
      </div>
      <div className="space-y-1 w-full sm:w-auto">
        <label className="text-xs font-medium text-slate-600">Study Phase</label>
        <select name="study_phase" defaultValue="Baseline"
          className="w-full sm:w-auto border border-slate-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500">
          {["Baseline", "Prototype-use", "Completed"].map((p) => <option key={p}>{p}</option>)}
        </select>
      </div>
      <button type="submit" disabled={pending}
        className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors">
        {pending ? "Adding..." : "+ Add Participant"}
      </button>
      {state.message && (
        <span className={`text-xs font-medium ${state.success ? "text-green-600" : "text-red-600"}`}>{state.message}</span>
      )}
    </form>
  );
}
