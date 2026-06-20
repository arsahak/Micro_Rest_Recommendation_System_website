"use server";

import { revalidatePath } from "next/cache";
import { ApiError, createParticipant } from "@/lib/api";

export interface ParticipantFormState {
  success: boolean;
  message: string;
}

export async function createParticipantAction(
  _prev: ParticipantFormState,
  formData: FormData
): Promise<ParticipantFormState> {
  const participant_id = String(formData.get("participant_id") || "").trim();
  const participant_label = String(formData.get("participant_label") || "").trim();
  const study_phase = String(formData.get("study_phase") || "Baseline");

  if (!participant_id) {
    return { success: false, message: "Participant ID is required." };
  }

  try {
    await createParticipant({ participant_id, participant_label, study_phase: study_phase as "Baseline" | "Prototype-use" | "Completed" });
    revalidatePath("/participants");
    return { success: true, message: `${participant_id} added successfully.` };
  } catch (error) {
    return { success: false, message: error instanceof ApiError ? error.message : "Failed to create participant." };
  }
}
