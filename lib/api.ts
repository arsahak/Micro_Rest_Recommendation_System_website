const BASE_URL = process.env.API_BASE_URL || "http://localhost:8000";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
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
  const params = new URLSearchParams(filters as Record<string, string>).toString();
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

export { put, del };
