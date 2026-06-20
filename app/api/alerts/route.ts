import { NextResponse } from "next/server";
import { getCheckins } from "@/lib/api";

export async function GET() {
  try {
    const res = await getCheckins();
    const alerts = res.data
      .filter((c) => c.risk_level !== "Low")
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 20);

    return NextResponse.json({ success: true, data: alerts });
  } catch {
    return NextResponse.json({ success: false, data: [] });
  }
}
