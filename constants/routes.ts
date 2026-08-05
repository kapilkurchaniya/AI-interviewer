export const ROUTES = {
  // Public
  HOME: "/",

  // Auth
  SIGN_IN: "/sign-in",
  SIGN_UP: "/sign-up",
  ONBOARDING: "/onboarding",

  // Dashboard
  DASHBOARD: "/dashboard",
  RESUME: "/dashboard/resume",
  NEW_INTERVIEW: "/dashboard/interview/new",
  INTERVIEW: (id: string) => `/dashboard/interview/${id}`,
  REPORT: (id: string) => `/dashboard/report/${id}`,
  HISTORY: "/dashboard/history",

  // API
  API_RESUME_UPLOAD: "/api/v1/resume/upload",
  API_INTERVIEWS: "/api/v1/interviews",
  API_INTERVIEW: (id: string) => `/api/v1/interviews/${id}`,
  API_ANSWER: (id: string) => `/api/v1/interviews/${id}/answer`,
  API_REPORT: (id: string) => `/api/v1/reports/${id}`,
  API_DASHBOARD: "/api/v1/dashboard",
} as const;
