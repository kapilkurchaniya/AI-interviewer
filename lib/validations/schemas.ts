import { z } from "zod";

// ============================================================
// Resume Upload
// ============================================================
export const resumeUploadSchema = z.object({
  file: z.any(), // validated at the API route level (multipart)
});

// ============================================================
// Interview Creation
// ============================================================
export const createInterviewSchema = z.object({
  type: z.enum(["technical", "hr", "behavioral"]),
  role: z.string().min(1, "Role is required").max(100),
  companyStyle: z.string().max(50).nullable().optional().default(null),
  resumeId: z.string().optional().nullable(),
  difficultyStart: z.enum(["easy", "medium", "hard"]).default("medium"),
  totalQuestions: z.number().int().min(3).max(15).default(8),
});

export type CreateInterviewInput = z.infer<typeof createInterviewSchema>;

// ============================================================
// Submit Answer
// ============================================================
export const submitAnswerSchema = z.object({
  turnNumber: z.number().int().min(1),
  answer: z.string().min(1, "Answer cannot be empty").max(5000),
});

export type SubmitAnswerInput = z.infer<typeof submitAnswerSchema>;

// ============================================================
// Onboarding
// ============================================================
export const onboardingSchema = z.object({
  targetRoles: z
    .array(z.string())
    .min(1, "Select at least one target role")
    .max(5, "Maximum 5 roles"),
  experienceLevel: z.enum(["student", "fresher", "sde1", "sde2", "senior"]),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
