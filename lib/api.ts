export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

// Browser: route through Next.js proxy (same origin, avoids CORS / ERR_CONNECTION_REFUSED).
// Server: call backend directly.
function resolveUrl(path: string): string {
  if (typeof window !== "undefined") {
    return path.replace(/^\/api\//, "/api/proxy/");
  }
  const base =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.API_BASE_URL ||
    "http://localhost:8000";
  return `${base}${path}`;
}

// Returns "Bearer <token>" for the current request context, or null if not logged in.
// Client: reads the JWT saved to localStorage at login time ("mrrs_auth" → token).
// Server (Actions, Route Handlers): reads from the "mrrs_token" cookie set at login.
async function getAuthHeader(): Promise<string | null> {
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("mrrs_auth");
      const parsed = JSON.parse(raw ?? "{}") as { token?: string };
      if (parsed.token) return `Bearer ${parsed.token}`;
    } catch {}
    return null;
  }
  // Server-side — only works inside a request context (Action / Route Handler)
  try {
    const { cookies } = await import("next/headers");
    const jar = await cookies();
    const raw = jar.get("mrrs_token")?.value;
    if (raw) return `Bearer ${decodeURIComponent(raw)}`;
  } catch {}
  return null;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const auth = await getAuthHeader();
  const res = await fetch(resolveUrl(path), {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(auth ? { Authorization: auth } : {}),
      ...options.headers,
    },
    cache: "no-store",
  });

  const body = await res.json().catch(() => ({}));

  if (!res.ok || body.success === false) {
    throw new ApiError(body.message || `Request failed: ${res.status}`, res.status);
  }
  return body as T;
}

const get = <T>(path: string) => request<T>(path, { method: "GET" });
const post = <T>(path: string, data: unknown) => request<T>(path, { method: "POST", body: JSON.stringify(data) });
const put = <T>(path: string, data: unknown) => request<T>(path, { method: "PUT", body: JSON.stringify(data) });
const del = <T>(path: string) => request<T>(path, { method: "DELETE" });

// ---------- Participants ----------
export interface Participant {
  _id: string;
  participant_id: string;
  participant_label?: string;
  study_phase: "Baseline" | "Prototype-use" | "Completed";
  notes?: string;
  createdAt: string;
}

export const getParticipants = () => get<{ success: boolean; count: number; data: Participant[] }>("/api/participants");
export const getParticipant = (id: string) => get<{ success: boolean; data: Participant }>(`/api/participants/${id}`);
export const createParticipant = (data: Partial<Participant>) => post<{ success: boolean; data: Participant }>("/api/participants", data);

// ---------- Baseline ----------
export interface BaselineEntry {
  _id: string;
  participant_id: string;
  date: string;
  time_point: string;
  hr: number;
  fatigue_score: number;
  kss_score: number;
  eye_strain_score: number;
  body_discomfort_score: number;
  sitting_duration_min: number;
  rest_behavior?: string;
}

export interface BaselineSummary {
  _id: string;
  participant_id: string;
  baseline_hr: number;
  baseline_fatigue: number;
  baseline_kss: number;
  baseline_eye_strain: number;
  baseline_discomfort: number;
  baseline_sitting_min: number;
  record_count: number;
  last_updated: string;
}

export const getBaselineEntries = (participant_id?: string) =>
  get<{ success: boolean; count: number; data: BaselineEntry[] }>(`/api/baseline/entries${participant_id ? `?participant_id=${participant_id}` : ""}`);
export const createBaselineEntry = (data: Partial<BaselineEntry>) => post<{ success: boolean; data: BaselineEntry }>("/api/baseline/entries", data);
export const getBaselineSummaries = () => get<{ success: boolean; count: number; data: BaselineSummary[] }>("/api/baseline/summaries");
export const getBaselineSummary = (participant_id: string) => get<{ success: boolean; data: BaselineSummary }>(`/api/baseline/summaries/${participant_id}`);
export const recalculateBaselineSummary = (participant_id: string) => post<{ success: boolean; data: BaselineSummary }>(`/api/baseline/summaries/${participant_id}/recalculate`, {});

// ---------- Check-ins ----------
export interface Checkin {
  _id: string;
  checkin_id: string;
  participant_id: string;
  session_id?: string;
  session_mode: "Baseline" | "Intervention";
  date: string;
  time_point: string;
  current_hr: number;
  fatigue_score: number;
  kss_score: number;
  eye_strain_score: number;
  body_discomfort_score: number;
  sitting_duration_min: number;
  screen_exposure_min?: number;
  hr_deviation: number;
  eye_risk: number;
  discomfort_risk: number;
  sitting_risk: number;
  fatigue_risk: number;
  kss_risk: number;
  hr_risk: number;
  total_risk_score: number;
  risk_level: "Low" | "Medium" | "High";
  dominant_issue: string;
  selected_prompt: string;
  instruction: string;
  duration: string;
  createdAt: string;
}

export const getCheckins = (filters?: { participant_id?: string; risk_level?: string }) => {
  const clean = Object.fromEntries(Object.entries(filters ?? {}).filter(([, v]) => v !== undefined));
  const params = new URLSearchParams(clean).toString();
  return get<{ success: boolean; count: number; data: Checkin[] }>(`/api/checkins${params ? `?${params}` : ""}`);
};
export const getCheckin = (checkin_id: string) => get<{ success: boolean; data: Checkin }>(`/api/checkins/${checkin_id}`);
export const createCheckin = (data: Record<string, unknown>) =>
  post<{ success: boolean; data: Checkin; baseline_used: { baseline_hr: number; record_count: number } }>("/api/checkins", data);

// ---------- Feedback ----------
export interface FeedbackLog {
  _id: string;
  feedback_id: string;
  checkin_id: string;
  participant_id: string;
  completed: boolean;
  usefulness_rating?: number;
  timing_appropriate?: number;
  work_disturbance?: number;
  recovered?: number;
  comment?: string;
  createdAt: string;
}

export const getFeedbackLogs = (filters?: { participant_id?: string; checkin_id?: string }) => {
  const params = new URLSearchParams(filters as Record<string, string>).toString();
  return get<{ success: boolean; count: number; data: FeedbackLog[] }>(`/api/feedback${params ? `?${params}` : ""}`);
};
export const createFeedback = (data: Partial<FeedbackLog>) => post<{ success: boolean; data: FeedbackLog }>("/api/feedback", data);

// ---------- Research Dashboard ----------
export interface DashboardSummary {
  overview: {
    total_checkins: number;
    participant_count: number;
    risk_distribution: { Low: number; Medium: number; High: number };
    high_risk_pct: string;
  };
  feedback: {
    total_feedback: number;
    completion_count: number;
    completion_rate: string;
    avg_usefulness: number | null;
    avg_timing: number | null;
    avg_disturbance: number | null;
    avg_recovered: number | null;
  };
  recent_checkins: Checkin[];
}

export interface ParticipantSummaryRow {
  _id: string;
  total_checkins: number;
  high_count: number;
  medium_count: number;
  low_count: number;
  avg_total_risk: number;
  avg_eye: number;
  avg_discomfort: number;
  avg_hr_deviation: number;
}

export interface PromptUsageRow {
  prompt: string;
  usage_count: number;
  dominant_issues: string[];
  completions: number;
  total_feedback: number;
  avg_usefulness: number | null;
}

export interface RiskTrendRow {
  time_point: string;
  Low: number;
  Medium: number;
  High: number;
  total: number;
}

export const getDashboardSummary = () => get<{ success: boolean; data: DashboardSummary }>("/api/research-dashboard/summary");
export const getParticipantSummary = () => get<{ success: boolean; data: ParticipantSummaryRow[] }>("/api/research-dashboard/participants");
export const getPromptUsageSummary = () => get<{ success: boolean; data: PromptUsageRow[] }>("/api/research-dashboard/prompts");
export const getRiskTrend = () => get<{ success: boolean; data: RiskTrendRow[] }>("/api/research-dashboard/risk-trend");

// ---------- Sessions ----------
export interface Session {
  _id: string;
  session_id: string;
  participant_id: string;
  session_date: string;
  session_mode: "Baseline" | "Intervention";
  status: "active" | "ended";
  start_time: string;
  end_time?: string;
  sitting_duration_min: number;
  screen_exposure_min: number;
  last_checkin_time?: string;
  last_rest_time?: string;
  previous_risk_level?: "Low" | "Medium" | "High";
  previous_dominant_issue?: string;
  previous_rest_status?: "completed" | "completed_worse" | "skipped" | "snoozed";
  checkin_snooze_count: number;
  consecutive_high_risk_count: number;
  total_checkins: number;
  total_rest_actions: number;
}

export interface CheckinStatus {
  due: boolean;
  trigger_reason: string[];
  suggested_interval_minutes: number;
  escalate: boolean;
}

export const startSession = (participant_id: string) => post<{ success: boolean; data: Session }>("/api/sessions", { participant_id });
export const getActiveSession = (participant_id: string) => get<{ success: boolean; data: Session }>(`/api/sessions/active/${participant_id}`);
export const sendHeartbeat = (session_id: string, active_minutes: number) =>
  put<{ success: boolean; data: Session }>(`/api/sessions/${session_id}/heartbeat`, { active_minutes });
export const recordRest = (session_id: string) => put<{ success: boolean; data: Session }>(`/api/sessions/${session_id}/rest`, {});
export const endSession = (session_id: string) => put<{ success: boolean; data: Session }>(`/api/sessions/${session_id}/end`, {});
export const getCheckinStatus = (session_id: string) => get<{ success: boolean; data: CheckinStatus }>(`/api/sessions/${session_id}/checkin-status`);
export const snoozeCheckin = (session_id: string) => put<{ success: boolean; data: { notification: unknown; session: Session } }>(`/api/sessions/${session_id}/snooze`, {});

// ---------- Participant Auth ----------
export interface ParticipantAuthResponse {
  token: string;
  participant_id: string;
  participant_label: string | null;
  study_phase: string;
}

export const participantLogin = (participant_id: string, pin: string) =>
  post<{ success: boolean; data: ParticipantAuthResponse }>("/api/participant-auth/login", { participant_id, pin });

export { put, del };
