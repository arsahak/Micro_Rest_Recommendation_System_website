import { NextResponse } from "next/server";
import { getMyNotifications } from "@/lib/api";

export async function GET() {
  try {
    const res = await getMyNotifications();
    return NextResponse.json({ success: true, data: res.data }, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
    });
  } catch {
    return NextResponse.json({ success: false, data: [] }, {
      headers: { "Cache-Control": "no-store" },
    });
  }
}
