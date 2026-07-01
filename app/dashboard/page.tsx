"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  useEffect(() => { router.replace("/user"); }, [router]);
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      <div className="text-slate-400 text-sm">Redirecting to your dashboard…</div>
    </div>
  );
}
