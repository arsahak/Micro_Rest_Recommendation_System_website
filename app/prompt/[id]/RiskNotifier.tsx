"use client";

import { useEffect } from "react";

const MESSAGES: Record<"Low" | "Medium" | "High", string> = {
  Low: "Low Risk — No immediate rest needed. Keep it up!",
  Medium: "Medium Risk — A short micro-rest is suggested.",
  High: "High Risk — Please take a rest break now.",
};

export default function RiskNotifier({ level }: { level: "Low" | "Medium" | "High" }) {
  useEffect(() => {
    if (typeof window === "undefined" || Notification.permission !== "granted") return;
    new Notification(`Fatigue Check Result: ${level} Risk`, {
      body: MESSAGES[level],
      icon: "/favicon.ico",
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
