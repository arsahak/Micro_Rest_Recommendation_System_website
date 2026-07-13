"use client";

import { useEffect, useRef } from "react";

const MESSAGES: Record<"Medium" | "High", string> = {
  Medium: "Medium Risk — A short micro-rest is suggested.",
  High: "High Risk — Please take a rest break now.",
};

export default function RiskNotifier({ level }: { level: "Low" | "Medium" | "High" }) {
  const firedRef = useRef(false);

  useEffect(() => {
    // Guards against React Strict Mode's dev-only double-invoke of effects,
    // which would otherwise fire this notification twice per check-in.
    if (firedRef.current) return;
    // Spec Section 7: Low risk is "no_immediate_rest_notification" — only Medium/High notify.
    if (level === "Low") return;
    if (typeof window === "undefined" || Notification.permission !== "granted") return;
    firedRef.current = true;
    new Notification(`Fatigue Check Result: ${level} Risk`, {
      body: MESSAGES[level],
      icon: "/favicon.ico",
      silent: true,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
