"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ApiError, createCheckin } from "@/lib/api";

export interface CheckinFormState {
  success: boolean;
  message: string;
}

export async function createCheckinAction(data: {
  participant_id: string;
  time_point: string;
  current_hr: number;
  fatigue_score: number;
  kss_score: number;
  eye_strain_score: number;
  body_discomfort_score: number;
  sitting_duration_min: number;
  screen_exposure_min?: number;
}): Promise<CheckinFormState> {
  try {
    const res = await createCheckin(data);
    revalidatePath("/user");
    revalidatePath("/history");
    redirect(`/prompt/${res.data.checkin_id}`);
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, message: error.message };
    }
    throw error;
  }
}
