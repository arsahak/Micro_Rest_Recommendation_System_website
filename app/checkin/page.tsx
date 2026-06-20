import { ApiError, getParticipants } from "@/lib/api";
import CheckinForm from "./CheckinForm";

export default async function CheckinPage() {
  let participants: string[] = [];
  let backendError: string | null = null;

  try {
    const res = await getParticipants();
    participants = res.data.map((p) => p.participant_id);
  } catch (error) {
    backendError = error instanceof ApiError ? error.message : "Could not reach backend API.";
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Check-in</h1>
        <p className="text-sm text-slate-500 mt-1">Enter your current readings. Calculated fields are shown on the next screen.</p>
      </div>

      {backendError && (
        <div className="card p-4 bg-amber-50 border-amber-200 text-sm text-amber-700 mb-6">
          Backend unreachable: {backendError}. Make sure the API server is running on port 8000.
        </div>
      )}

      <CheckinForm participants={participants} />
    </div>
  );
}
