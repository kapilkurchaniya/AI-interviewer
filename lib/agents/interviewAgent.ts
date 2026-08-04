import { callGemini, wrapUserInput } from "@/lib/gemini";

interface InterviewAgentInput {
  interviewType: "technical" | "hr" | "behavioral";
  role: string;
  companyStyle: string | null;
  difficulty: "easy" | "medium" | "hard";
  topicsCovered: string[];
  memorySummary: string[];
  resumeSkillsSummary?: string;
  isFollowUp?: boolean;
  followUpContext?: string;
  userId?: string;
  interviewId?: string;
}

interface InterviewAgentOutput {
  question: string;
  topic: string;
}

/**
 * Interview Agent — Generates the next interview question.
 * Receives compact memory summary (not full transcript) to control token cost.
 */
export async function runInterviewAgent(
  input: InterviewAgentInput
): Promise<InterviewAgentOutput> {
  const resumeContext = input.resumeSkillsSummary
    ? `- Candidate background: ${input.resumeSkillsSummary}`
    : "- No resume provided — ask general questions for the role.";

  const memoryContext =
    input.memorySummary.length > 0
      ? `- Recent turn summary:\n${input.memorySummary.map((s, i) => `  ${i + 1}. ${s}`).join("\n")}`
      : "- This is the first question of the interview.";

  const followUpInstruction = input.isFollowUp
    ? `\nIMPORTANT: This should be a follow-up question probing deeper into the last topic. Context for follow-up:\n${wrapUserInput(input.followUpContext || "")}`
    : "";

  const prompt = `System: You are conducting a live ${input.interviewType} interview for a ${input.role} position${input.companyStyle ? `, in the style of a ${input.companyStyle} interviewer` : ""}. You are a real interviewer, not a chatbot — no filler pleasantries, no "great question", no over-explaining. Ask exactly one question.

Context:
${resumeContext}
- Topics already covered this session: ${input.topicsCovered.length > 0 ? input.topicsCovered.join(", ") : "none yet"}
- Current difficulty: ${input.difficulty}
${memoryContext}
${followUpInstruction}

Rules:
- Do not repeat or closely rephrase any topic already covered unless this is explicitly a follow-up.
${input.companyStyle ? `- Match the question style of ${input.companyStyle} interviewers.` : ""}
- The question must be appropriate for "${input.difficulty}" difficulty level.
- For technical interviews: ask about data structures, algorithms, system design, or technology-specific concepts.
- For behavioral interviews: use STAR-format situational questions.
- For HR interviews: ask about motivation, career goals, salary expectations, or cultural fit.

Return JSON: { "question": string, "topic": string }`;

  const result = await callGemini<InterviewAgentOutput>({
    prompt,
    agentType: "interview",
    userId: input.userId,
    interviewId: input.interviewId,
    temperature: 0.7, // Higher temperature for question variety
  });

  return result.data;
}
