import CheckinForm from "./CheckinForm";

export default function CheckinPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Check-in</h1>
        <p className="text-sm text-slate-500 mt-1">Enter your current readings. Calculated fields are shown on the next screen.</p>
      </div>
      <CheckinForm />
    </div>
  );
}
