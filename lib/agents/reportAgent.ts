import { callGemini } from "@/lib/gemini";
import { IInterviewTurn } from "@/models/InterviewTurn";

interface ReportAgentInput {
  turns: IInterviewTurn[];
  interviewType: "technical" | "hr" | "behavioral";
  role: string;
  userId?: string;
  interviewId?: string;
}

interface ReportAgentOutput {
  overallScore: number;
  topicBreakdown: { topic: string; avgScore: number }[];
  strengths: string[];
  weakAreas: string[];
  improvementActions: string[];
}

/**
 * Report Agent — Generates the final interview report from all scored turns.
 * Produces actionable, specific improvement recommendations.
 */
export async function runReportAgent(
  input: ReportAgentInput
): Promise<ReportAgentOutput> {
  const turnsData = input.turns.map((turn) => ({
    turnNumber: turn.turnNumber,
    question: turn.question,
    topic: turn.topic,
    difficulty: turn.difficulty,
    isFollowUp: turn.isFollowUp,
    answerPreview: turn.answer.substring(0, 300) + (turn.answer.length > 300 ? "..." : ""),
    evaluation: turn.evaluation,
  }));

  const prompt = `System: Generate a final interview report from the full set of scored turns below. Be honest and specific — this report is used by the candidate to improve, so vague praise or vague criticism is a failure of your task.

This was a ${input.interviewType} interview for a ${input.role} position.

Turns:
${JSON.stringify(turnsData, null, 2)}

Requirements:
1. overallScore: Weighted average of all turn scores (0-10). Weight harder questions slightly more.
2. topicBreakdown: Group turns by topic, calculate average score per topic. Round to 1 decimal.
3. strengths: 2-4 specific strengths demonstrated across the interview. Be precise (e.g., "Clearly explained time complexity of sorting algorithms" not "good at DSA").
4. weakAreas: 2-4 specific weak areas. Be precise (e.g., "Struggled with edge cases in linked list problems" not "needs to improve data structures").
5. improvementActions: 3-5 concrete, actionable improvement steps. Each must be specific enough to act on today (e.g., "Practice explaining time complexity trade-offs out loud, not just stating Big-O" rather than "improve DSA knowledge").

Return JSON: {
  "overallScore": number,
  "topicBreakdown": [{ "topic": string, "avgScore": number }],
  "strengths": string[],
  "weakAreas": string[],
  "improvementActions": string[]
}`;

  const result = await callGemini<ReportAgentOutput>({
    prompt,
    agentType: "report",
    userId: input.userId,
    interviewId: input.interviewId,
    temperature: 0.2,
  });

  // Clamp overall score
  result.data.overallScore = Math.max(
    0,
    Math.min(10, Math.round(result.data.overallScore * 10) / 10)
  );

  return result.data;
}
