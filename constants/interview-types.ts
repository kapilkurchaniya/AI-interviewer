export const INTERVIEW_TYPES = {
  TECHNICAL: "technical",
  HR: "hr",
  BEHAVIORAL: "behavioral",
} as const;

export type InterviewType = (typeof INTERVIEW_TYPES)[keyof typeof INTERVIEW_TYPES];

export const INTERVIEW_TYPE_LABELS: Record<InterviewType, string> = {
  technical: "Technical Interview",
  hr: "HR Interview",
  behavioral: "Behavioral Interview",
};

export const INTERVIEW_TYPE_DESCRIPTIONS: Record<InterviewType, string> = {
  technical:
    "DSA, system design, coding concepts, and technology-specific questions.",
  hr: "Questions about your background, motivation, salary expectations, and company fit.",
  behavioral:
    "STAR-format situational questions about teamwork, conflict, leadership, and problem-solving.",
};

export const DIFFICULTY_LEVELS = {
  EASY: "easy",
  MEDIUM: "medium",
  HARD: "hard",
} as const;

export type DifficultyLevel = (typeof DIFFICULTY_LEVELS)[keyof typeof DIFFICULTY_LEVELS];

export const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

export const DEFAULT_TOTAL_QUESTIONS = 8;
export const MIN_QUESTIONS = 3;
export const MAX_QUESTIONS = 15;

// Daily interview cap for free plan
export const FREE_PLAN_DAILY_CAP = 2;

// Rate limit: minimum seconds between answer submissions
export const ANSWER_RATE_LIMIT_SECONDS = 3;

// No-repeat question similarity threshold
export const QUESTION_SIMILARITY_THRESHOLD = 0.87;
