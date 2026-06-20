"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ApiError, createFeedback } from "@/lib/api";

export interface FeedbackFormState {
  success: boolean;
  message: string;
}

export async function submitFeedbackAction(data: {
  checkin_id: string;
  completed: boolean;
  usefulness_rating?: number;
  timing_appropriate?: number;
  work_disturbance?: number;
  recovered?: number;
  comment?: string;
}): Promise<FeedbackFormState> {
  try {
    await createFeedback(data);
    revalidatePath("/history");
    revalidatePath("/dashboard");
  } catch (error) {
    return { success: false, message: error instanceof ApiError ? error.message : "Failed to submit feedback." };
  }
  redirect("/history");
}
