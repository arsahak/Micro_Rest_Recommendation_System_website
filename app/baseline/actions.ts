"use server";

import { revalidatePath } from "next/cache";
import { ApiError, createBaselineEntry, recalculateBaselineSummary } from "@/lib/api";

export interface BaselineFormState {
  success: boolean;
  message: string;
}

export async function createBaselineEntryAction(data: {
  participant_id: string;
  time_point: string;
  hr: number;
  fatigue_score: number;
  kss_score: number;
  eye_strain_score: number;
  body_discomfort_score: number;
  sitting_duration_min: number;
  rest_behavior?: string;
}): Promise<BaselineFormState> {
  try {
    await createBaselineEntry(data);
    await recalculateBaselineSummary(data.participant_id);
    revalidatePath("/baseline");
    return { success: true, message: "Baseline entry saved and summary recalculated." };
  } catch (error) {
    return { success: false, message: error instanceof ApiError ? error.message : "Failed to save baseline entry." };
  }
}
