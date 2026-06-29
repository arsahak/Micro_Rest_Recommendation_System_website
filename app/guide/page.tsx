import Link from "next/link";

const participantSteps = [
  {
    step: "1",
    title: "Get added as a participant",
    desc: "Ask the researcher to add you on the Participants page with an ID like P01. This anonymous ID is used everywhere instead of your name.",
    link: { href: "/participants", label: "Go to Participants" },
  },
  {
    step: "2",
    title: "Record your baseline (once)",
    desc: "Before the prototype phase starts, go to Baseline Entry and log your heart rate and self-report scores at a few time points (Before Work, After Work, etc.) while resting normally. The app averages these into your personal baseline.",
    link: { href: "/baseline", label: "Go to Baseline Entry" },
  },
  {
    step: "3",
    title: "Check in at fixed times",
    desc: "At each scheduled point (Before Work, 11:00 AM, 1:00 PM, 3:00 PM, After Work), check your Fitbit Charge 6 for your current heart rate, then fill in the Check-in form: HR, fatigue, sleepiness, eye strain, body discomfort, and sitting duration.",
    link: { href: "/checkin", label: "Go to Check-in" },
  },
  {
    step: "4",
    title: "See your result instantly",
    desc: "After submitting, the app compares your reading against your baseline and shows a Risk Level (Low / Medium / High), the dominant issue, and a recommended micro-rest action with instructions and duration.",
  },
  {
    step: "5",
    title: "Do the micro-rest, then give feedback",
    desc: "If a prompt is shown, do the suggested action (e.g. a 60-second eye break), then tap “Start Micro-Rest” to rate whether you completed it, how useful it was, the timing, and how disruptive it felt.",
  },
];

const researcherSteps = [
  { title: "Participants", desc: "Add/view participants and their study phase (Baseline, Prototype-use, Completed).", href: "/participants" },
  { title: "Baseline Entry", desc: "Review baseline averages computed per participant from their Phase 1 readings.", href: "/baseline" },
  { title: "History", desc: "Browse every check-in with its calculated risk, filterable by participant or risk level.", href: "/history" },
  { title: "Dashboard", desc: "See aggregate stats: risk distribution by time of day, prompt usage, completion rates, and per-participant summaries.", href: "/dashboard" },
];

const riskLevels = [
  { level: "Low", badge: "badge-low", score: "Total score 0–34", desc: "No micro-rest needed — keep working.", border: "border-l-green-400" },
  { level: "Medium", badge: "badge-medium", score: "Total score 35–64", desc: "One targeted micro-rest is recommended.", border: "border-l-amber-400" },
  { level: "High", badge: "badge-high", score: "Total score 65–100", desc: "Take the micro-rest now — risk is elevated.", border: "border-l-red-400" },
];

const scoreInputs = [
  { name: "Fatigue (Samn-Perelli)", range: "1 (alert) – 7 (exhausted)" },
  { name: "Sleepiness (KSS)", range: "1 (alert) – 9 (sleepy)" },
  { name: "Eye Strain", range: "1 (none) – 5 (severe)" },
  { name: "Body Discomfort", range: "1 (none) – 5 (severe)" },
  { name: "Heart Rate", range: "Read directly from your Fitbit Charge 6" },
  { name: "Sitting Duration", range: "Minutes since your last break" },
];

export default function GuidePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-10">

      <div className="hero-surface text-center space-y-2 px-6 py-10">
        <span className="eyebrow">User Guide</span>
        <h1 className="text-2xl font-bold text-slate-900">How to Use Micro_Rest_Recommendation_System</h1>
        <p className="text-sm text-slate-500 max-w-xl mx-auto">
          A quick walkthrough of the full workflow — from baseline setup to getting a micro-rest prompt and giving feedback.
        </p>
      </div>

      {/* Participant workflow */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="h-5 w-1 rounded-full bg-teal-500" />
          <h2 className="text-lg font-semibold text-slate-800">For Participants</h2>
        </div>
        <div className="space-y-3">
          {participantSteps.map(({ step, title, desc, link }) => (
            <div key={step} className="card p-4 flex gap-4">
              <span className="shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full bg-teal-600 text-white text-xs font-bold mt-0.5">
                {step}
              </span>
              <div className="space-y-1.5">
                <h3 className="font-semibold text-slate-800 text-sm">{title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
                {link && (
                  <Link href={link.href} className="inline-block text-xs text-teal-600 hover:text-teal-800 font-medium">
                    {link.label} →
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* What each score input means */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="h-5 w-1 rounded-full bg-teal-500" />
          <h2 className="text-lg font-semibold text-slate-800">What Each Reading Means</h2>
        </div>
        <div className="card overflow-hidden">
          <div className="divide-y divide-slate-100">
            {scoreInputs.map(({ name, range }) => (
              <div key={name} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 px-4 py-3">
                <span className="text-sm font-medium text-slate-700">{name}</span>
                <span className="text-xs text-slate-500">{range}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Risk levels */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="h-5 w-1 rounded-full bg-teal-500" />
          <h2 className="text-lg font-semibold text-slate-800">Understanding Your Risk Level</h2>
        </div>
        <p className="text-sm text-slate-500">
          Each check-in normalizes six factors (fatigue, sleepiness, eye strain, body discomfort, sitting/screen
          exposure, and heart-rate deviation from your baseline) to a 0–100 scale, then combines them into a single
          weighted total risk score.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {riskLevels.map(({ level, badge, score, desc, border }) => (
            <div key={level} className={`card border-l-4 ${border} p-4 space-y-2`}>
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${badge}`}>{level}</span>
              <p className="text-xs font-medium text-slate-600">{score}</p>
              <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-400">
          If the risk is Medium or High, the app also identifies the <strong>dominant issue</strong> (whichever factor scored
          highest) and recommends a matching micro-rest — e.g. a 60-second eye break for visual fatigue, or a stretch for
          posture discomfort.
        </p>
      </section>

      {/* Researcher workflow */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="h-5 w-1 rounded-full bg-teal-500" />
          <h2 className="text-lg font-semibold text-slate-800">For Researchers</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {researcherSteps.map(({ title, desc, href }) => (
            <Link key={href} href={href} className="card card-link p-4 space-y-1.5">
              <h3 className="font-semibold text-slate-800 text-sm">{title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Notifications */}
      <section className="card p-5 space-y-2">
        <h2 className="text-sm font-semibold text-slate-700">🔔 Risk Alerts</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          The bell icon in the navbar shows recent Medium and High risk check-ins across all participants, refreshed
          automatically every 10 seconds. Click it to jump straight to any alert&apos;s result page.
        </p>
      </section>

      <div className="text-center pt-2">
        <Link href="/checkin" className="btn-primary">
          Start Your First Check-in →
        </Link>
      </div>

    </div>
  );
}
