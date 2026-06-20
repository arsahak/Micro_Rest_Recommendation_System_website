import Link from "next/link";
import { ApiError, getCheckin, getFeedbackLogs } from "@/lib/api";
import FeedbackForm from "./FeedbackForm";

export default async function FeedbackPage({
  searchParams,
}: {
  searchParams: Promise<{ checkin_id?: string }>;
}) {
  const { checkin_id } = await searchParams;

  if (!checkin_id) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <span className="text-4xl">✅</span>
        <h2 className="text-xl font-bold text-slate-900">No Check-in Selected</h2>
        <p className="text-sm text-slate-500">Open a check-in from your history to leave feedback on its micro-rest prompt.</p>
        <Link href="/history" className="inline-block bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors">
          View History →
        </Link>
      </div>
    );
  }

  try {
    const [checkinRes, feedbackRes] = await Promise.all([
      getCheckin(checkin_id),
      getFeedbackLogs({ checkin_id }),
    ]);
    const checkin = checkinRes.data;

    if (feedbackRes.data.length > 0) {
      return (
        <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
          <span className="text-4xl">📝</span>
          <h2 className="text-xl font-bold text-slate-900">Feedback Already Submitted</h2>
          <p className="text-sm text-slate-500">This check-in already has feedback recorded.</p>
          <Link href="/history" className="inline-block bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors">
            View History →
          </Link>
        </div>
      );
    }

    return (
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Micro-Rest Feedback</h1>
          <p className="text-sm text-slate-500 mt-1">
            {checkin.participant_id} · {checkin.time_point} — <strong>{checkin.selected_prompt}</strong> ({checkin.dominant_issue})
          </p>
        </div>
        <FeedbackForm checkinId={checkin.checkin_id} />
      </div>
    );
  } catch (error) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Could Not Load Check-in</h2>
        <p className="text-sm text-slate-500">{error instanceof ApiError ? error.message : "Backend unreachable."}</p>
        <Link href="/history" className="text-sm text-sky-600 hover:text-sky-800 font-medium">← Back to History</Link>
      </div>
    );
  }
}
