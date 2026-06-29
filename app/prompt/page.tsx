import Link from "next/link";

export default function PromptIndexPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
      <span className="text-4xl">📋</span>
      <h2 className="text-xl font-bold text-slate-900">No Check-in Selected</h2>
      <p className="text-sm text-slate-500">Submit a check-in first to see your calculated fatigue-risk result and recommended micro-rest.</p>
      <Link href="/checkin" className="inline-block bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors">
        Start Check-in →
      </Link>
    </div>
  );
}
