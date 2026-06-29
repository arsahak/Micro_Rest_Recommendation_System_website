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

const riskLevels = [
  { level: "Low",    badge: "badge-low",    score: "0–34",  desc: "No micro-rest needed. Continue working normally.", border: "border-l-green-400" },
  { level: "Medium", badge: "badge-medium", score: "35–64", desc: "One targeted micro-rest prompt recommended.", border: "border-l-amber-400" },
  { level: "High",   badge: "badge-high",   score: "65–100", desc: "Immediate micro-rest strongly recommended.", border: "border-l-red-400" },
];

const quickLinks = [
  { href: "/checkin",      label: "New Check-in",    icon: "📋" },
  { href: "/history",      label: "View History",     icon: "📜" },
  { href: "/feedback",     label: "Submit Feedback",  icon: "✅" },
  { href: "/dashboard",    label: "Dashboard",        icon: "📊" },
  { href: "/baseline",     label: "Baseline Entry",   icon: "📏" },
  { href: "/participants", label: "Participants",     icon: "👥" },
  { href: "/guide",        label: "How to Use",       icon: "📖" },
];

export default function HomePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-14">

      <section className="hero-surface px-6 py-12 sm:py-16 text-center space-y-5">
        <span className="eyebrow">Research Prototype</span>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight tracking-tight">
          Smart Wearable Fatigue Monitoring<br />
          <span className="text-teal-600">&amp; Micro-Rest Recommendation</span>
        </h1>
        <p className="text-slate-500 max-w-xl mx-auto text-sm leading-relaxed">
          A semi-automated system for office workers using Fitbit Charge 6 heart-rate data
          and short self-reports to estimate fatigue risk and deliver personalised micro-rest prompts.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2 px-4 sm:px-0">
          <Link href="/checkin" className="btn-primary">
            Start Check-in →
          </Link>
          <Link href="/dashboard" className="btn-secondary">
            Researcher Dashboard
          </Link>
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex items-center gap-2">
          <span className="h-5 w-1 rounded-full bg-teal-500" />
          <h2 className="text-lg font-semibold text-slate-800">How It Works</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map(({ step, title, desc }) => (
            <div key={step} className="card p-4 space-y-2.5">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-teal-600 text-white text-sm font-bold shadow-sm shadow-teal-600/20">{step}</span>
              <h3 className="font-semibold text-slate-800 text-sm">{title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex items-center gap-2">
          <span className="h-5 w-1 rounded-full bg-teal-500" />
          <h2 className="text-lg font-semibold text-slate-800">What We Monitor</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {features.map(({ icon, label, desc }) => (
            <div key={label} className="card p-4 flex gap-4 items-start">
              <span className="icon-badge">{icon}</span>
              <div>
                <h3 className="font-semibold text-slate-800 text-sm">{label}</h3>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex items-center gap-2">
          <span className="h-5 w-1 rounded-full bg-teal-500" />
          <h2 className="text-lg font-semibold text-slate-800">Fatigue Risk Levels</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {riskLevels.map(({ level, badge, score, desc, border }) => (
            <div key={level} className={`card border-l-4 ${border} p-4 space-y-2`}>
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${badge} whitespace-nowrap`}>{level}</span>
              <p className="text-xs font-medium text-slate-600">Total Risk Score {score}</p>
              <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex items-center gap-2">
          <span className="h-5 w-1 rounded-full bg-teal-500" />
          <h2 className="text-lg font-semibold text-slate-800">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {quickLinks.map(({ href, label, icon }) => (
            <Link key={href} href={href} className="card card-link p-4 flex flex-col items-center gap-2.5 text-center">
              <span className="icon-badge-sm">{icon}</span>
              <span className="text-xs font-medium text-slate-600">{label}</span>
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
}
