import Link from "next/link";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-6">

        <div className="text-center space-y-3">
          <span className="icon-badge mx-auto block w-fit">💤</span>
          <h1 className="text-2xl font-bold text-slate-900">Participant Sign In</h1>
          <p className="text-sm text-slate-500">
            Access your fatigue monitoring dashboard with your study ID and PIN.
          </p>
        </div>

        <div className="card p-6">
          <LoginForm />
        </div>

        <div className="text-center space-y-1.5">
          <p className="text-xs text-slate-400">
            Researcher?{" "}
            <Link href="/dashboard" className="text-teal-600 hover:text-teal-800 font-medium">
              Go to Research Dashboard →
            </Link>
          </p>
          <p className="text-xs text-slate-400">
            <Link href="/guide" className="text-teal-600 hover:text-teal-800">
              How to use this system
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
