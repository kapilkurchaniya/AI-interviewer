export const EXPERIENCE_LEVELS = {
  STUDENT: "student",
  FRESHER: "fresher",
  SDE1: "sde1",
  SDE2: "sde2",
  SENIOR: "senior",
} as const;

export type ExperienceLevel =
  (typeof EXPERIENCE_LEVELS)[keyof typeof EXPERIENCE_LEVELS];

export const EXPERIENCE_LABELS: Record<ExperienceLevel, string> = {
  student: "Student / Intern",
  fresher: "Fresher (0-1 years)",
  sde1: "SDE-1 (1-3 years)",
  sde2: "SDE-2 (3-5 years)",
  senior: "Senior (5+ years)",
};

export const TARGET_ROLES = [
  "Frontend - React",
  "Frontend - Next.js",
  "Backend - Node.js",
  "Backend - Python",
  "Backend - Java",
  "Full Stack - MERN",
  "Full Stack - Next.js",
  "DevOps / Cloud",
  "Mobile - React Native",
  "Mobile - Flutter",
  "Data Science / ML",
  "System Design",
  "QA / Testing",
  "General SDE",
] as const;

export type TargetRole = (typeof TARGET_ROLES)[number];

export const COMPANY_STYLES = [
  "Google",
  "Amazon",
  "Microsoft",
  "Meta",
  "Apple",
  "Netflix",
  "Startup",
  "Consulting (Deloitte/Accenture)",
  "Product Company",
  "Service Company",
  null, // no specific style
] as const;
