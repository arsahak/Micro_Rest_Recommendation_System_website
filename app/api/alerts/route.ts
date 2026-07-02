import { NextResponse, type NextRequest } from "next/server";
import { getCheckins } from "@/lib/api";

export async function GET(request: NextRequest) {
  const participantId = request.nextUrl.searchParams.get("participant_id");
  if (!participantId) {
    return NextResponse.json({ success: true, data: [] });
  }

  try {
    const res = await getCheckins({ participant_id: participantId });
    const alerts = res.data
      .filter((c) => c.risk_level !== "Low")
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 20);

    return NextResponse.json({ success: true, data: alerts }, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
    });
  } catch {
    return NextResponse.json({ success: false, data: [] }, {
      headers: { "Cache-Control": "no-store" },
    });
  }
}
