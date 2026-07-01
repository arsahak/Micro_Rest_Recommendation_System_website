"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { participantLogin } from "@/lib/api";

export default function LoginForm() {
  const { login, requestNotificationPermission } = useAuth();
  const router = useRouter();
  const [participantId, setParticipantId] = useState("P01");
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await participantLogin(participantId.toUpperCase().trim(), pin);
      login({
        participantId: res.data.participant_id,
        token: res.data.token,
        studyPhase: res.data.study_phase,
        participantLabel: res.data.participant_label,
      });
      // Ask for notification permission right after login
      await requestNotificationPermission();
      router.push("/user");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed. Check your ID and PIN.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="card p-3 bg-red-50 border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Participant ID</label>
        <input
          type="text"
          value={participantId}
          onChange={(e) => setParticipantId(e.target.value.toUpperCase())}
          placeholder="e.g. P01"
          required
          autoFocus
          className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <p className="text-xs text-slate-400">Your anonymous study ID (P01, P02 …)</p>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">PIN</label>
        <input
          type="password"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="Enter your PIN"
          required
          inputMode="numeric"
          className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <p className="text-xs text-slate-400">
          First time? Choose any PIN — it becomes your permanent PIN for this study.
        </p>
      </div>

      <button type="submit" disabled={loading} className="w-full btn-primary py-3 text-sm">
        {loading ? "Signing in…" : "Sign In →"}
      </button>
    </form>
  );
}
