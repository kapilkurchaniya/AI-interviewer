import { callGemini } from "@/lib/gemini";
import { IEvaluation } from "@/models/InterviewTurn";

interface FollowUpAgentInput {
  question: string;
  answer: string;
  evaluation: IEvaluation;
  currentDifficulty: "easy" | "medium" | "hard";
  turnNumber: number;
  totalQuestions: number;
  topicsCovered: string[];
  userId?: string;
  interviewId?: string;
}

interface FollowUpAgentOutput {
  action: "follow_up" | "new_topic";
  difficultyDelta: "increase" | "decrease" | "same";
  reasoning: string;
}

/**
 * Follow-up Agent — Decides whether to dig deeper on the current topic
 * or move to a new topic, and whether to adjust difficulty.
 * This is what makes the interview adaptive rather than a fixed question bank.
 */
export async function runFollowUpAgent(
  input: FollowUpAgentInput
): Promise<FollowUpAgentOutput> {
  const remainingQuestions = input.totalQuestions - input.turnNumber;

  const prompt = `System: Decide the next step in this interview based on the last answer's evaluation.

Last question: ${input.question}
Last answer summary: "${input.answer.substring(0, 200)}${input.answer.length > 200 ? "..." : ""}"
Last evaluation: score=${input.evaluation.score}/10, gaps=[${input.evaluation.gaps.join(", ")}], strengths=[${input.evaluation.strengths.join(", ")}]
Current difficulty: ${input.currentDifficulty}
Turn: ${input.turnNumber} of ${input.totalQuestions} (${remainingQuestions} remaining)
Topics covered so far: ${input.topicsCovered.join(", ") || "none"}

Decide:
- action: "follow_up" (same topic, probe deeper) or "new_topic"
  - Prefer "follow_up" if the score was weak (<=5) and gaps suggest the candidate might do better with a slightly different angle
  - Prefer "new_topic" if the topic is well-covered or if few questions remain (need topic breadth)
  - If only 1-2 questions remain, always choose "new_topic" to ensure breadth
- difficultyDelta: "increase" | "decrease" | "same"
  - "increase" if score >= 8 (candidate is ready for harder questions)
  - "decrease" if score <= 3 (candidate is struggling, drop to build confidence)
  - "same" otherwise — but use judgment on gaps, not just the number

Return JSON: { "action": "follow_up" | "new_topic", "difficultyDelta": "increase" | "decrease" | "same", "reasoning": string (one sentence) }`;

  const result = await callGemini<FollowUpAgentOutput>({
    prompt,
    agentType: "followUp",
    userId: input.userId,
    interviewId: input.interviewId,
    temperature: 0.3,
  });

  return result.data;
}

/**
 * Calculate the next difficulty level based on the Follow-up Agent's decision.
 */
export function calculateNextDifficulty(
  current: "easy" | "medium" | "hard",
  delta: "increase" | "decrease" | "same"
): "easy" | "medium" | "hard" {
  const levels: ("easy" | "medium" | "hard")[] = ["easy", "medium", "hard"];
  const currentIndex = levels.indexOf(current);

  if (delta === "increase") {
    return levels[Math.min(currentIndex + 1, levels.length - 1)];
  }
  if (delta === "decrease") {
    return levels[Math.max(currentIndex - 1, 0)];
  }
  return current;
}
