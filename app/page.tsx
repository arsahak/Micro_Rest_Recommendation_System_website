import Link from "next/link";

const steps = [
  { step: "1", title: "Before Work", desc: "Record baseline HR, fatigue (Samn-Perelli), and sleepiness (KSS) at the start of your shift." },
  { step: "2", title: "Check-in Points", desc: "At 11:00, 13:00, and 15:00 enter your current HR from Fitbit, eye strain, and body discomfort scores." },
  { step: "3", title: "Get Your Prompt", desc: "The system calculates your fatigue-risk level and recommends a targeted micro-rest action." },
  { step: "4", title: "Give Feedback", desc: "After completing or skipping the micro-rest, rate its usefulness and timing." },
];

const features = [
  { icon: "❤️", label: "HR Monitoring", desc: "Fitbit Charge 6 heart-rate deviation from your personal baseline" },
  { icon: "👁️", label: "Visual Fatigue", desc: "Eye-strain score triggers targeted 60-second eye-break prompts" },
  { icon: "🪑", label: "Posture & Sitting", desc: "Detects prolonged sitting and posture discomfort for movement prompts" },
  { icon: "😴", label: "Sleepiness (KSS)", desc: "Karolinska Sleepiness Scale tracks alertness changes across the day" },
];

export default function HomePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-12">

      <section className="text-center space-y-4">
        <span className="inline-block bg-sky-50 text-sky-700 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide">
          Research Prototype
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
          Smart Wearable Fatigue Monitoring<br />
          <span className="text-sky-600">& Micro-Rest Recommendation</span>
        </h1>
        <p className="text-slate-500 max-w-xl mx-auto text-sm leading-relaxed">
          A semi-automated system for office workers using Fitbit Charge 6 heart-rate data
          and short self-reports to estimate fatigue risk and deliver personalised micro-rest prompts.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2 px-4 sm:px-0">
          <Link href="/checkin" className="bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors text-center">
            Start Check-in →
          </Link>
          <Link href="/dashboard" className="border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors text-center">
            Researcher Dashboard
          </Link>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">How It Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map(({ step, title, desc }) => (
            <div key={step} className="card p-4 space-y-2">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-sky-600 text-white text-xs font-bold">{step}</span>
              <h3 className="font-semibold text-slate-800 text-sm">{title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">What We Monitor</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {features.map(({ icon, label, desc }) => (
            <div key={label} className="card p-4 flex gap-4 items-start">
              <span className="text-2xl">{icon}</span>
              <div>
                <h3 className="font-semibold text-slate-800 text-sm">{label}</h3>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card p-5 space-y-3">
        <h2 className="text-sm font-semibold text-slate-700">Fatigue Risk Levels</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          {[
            { level: "Low",    badge: "badge-low",    score: "0–2", desc: "No micro-rest needed. Continue working normally." },
            { level: "Medium", badge: "badge-medium", score: "3–5", desc: "One targeted micro-rest prompt recommended." },
            { level: "High",   badge: "badge-high",   score: "6–12", desc: "Immediate micro-rest strongly recommended." },
          ].map(({ level, badge, score, desc }) => (
            <div key={level} className="flex-1 flex gap-3 items-start">
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${badge} whitespace-nowrap`}>{level}</span>
              <div>
                <p className="text-xs font-medium text-slate-600">Score {score}</p>
                <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { href: "/checkin",      label: "New Check-in",    icon: "📋" },
          { href: "/history",      label: "View History",     icon: "📜" },
          { href: "/feedback",     label: "Submit Feedback",  icon: "✅" },
          { href: "/dashboard",    label: "Dashboard",        icon: "📊" },
          { href: "/baseline",     label: "Baseline Entry",   icon: "📏" },
          { href: "/participants", label: "Participants",     icon: "👥" },
          { href: "/guide",        label: "How to Use",       icon: "📖" },
        ].map(({ href, label, icon }) => (
          <Link key={href} href={href} className="card p-4 flex flex-col items-center gap-2 text-center hover:border-sky-200 hover:bg-sky-50 transition-colors group">
            <span className="text-2xl">{icon}</span>
            <span className="text-xs font-medium text-slate-600 group-hover:text-sky-700">{label}</span>
          </Link>
        ))}
      </section>

    </div>
  );
}
