import { GoogleGenAI } from "@google/genai";
import connectDB from "./db";
import AiUsage from "@/models/AiUsage";

// Ensure API key is trimmed (env files sometimes have leading spaces)
const apiKey = (process.env.GEMINI_API_KEY || "").trim();

const ai = new GoogleGenAI({ apiKey });

const MODEL = "gemini-2.5-flash";

type AgentType = "resume" | "interview" | "evaluation" | "followUp" | "report";

/** Sleep helper for retry backoff */
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Wraps user-supplied text in injection-resistant delimiters.
 * All user input (resume text, interview answers) MUST be wrapped with this
 * before being included in any agent prompt.
 */
export function wrapUserInput(text: string): string {
  return `<candidate_input>\n${text}\n</candidate_input>`;
}

/**
 * Sanitize user input by flagging/stripping obvious prompt injection patterns.
 * Logs suspicious content but doesn't block (false positives on resumes are costly).
 */
export function sanitizeInput(text: string): { text: string; flagged: boolean } {
  const injectionPatterns = [
    /ignore\s+(all\s+)?previous\s+instructions/i,
    /you\s+are\s+now/i,
    /^system:/im,
    /forget\s+(all\s+)?previous/i,
    /disregard\s+(all\s+)?prior/i,
  ];

  let flagged = false;
  let sanitized = text;

  for (const pattern of injectionPatterns) {
    if (pattern.test(sanitized)) {
      flagged = true;
      console.warn(
        `[Gemini] Potential prompt injection detected: ${pattern.source}`
      );
      // Replace the suspicious pattern rather than blocking
      sanitized = sanitized.replace(pattern, "[REDACTED]");
    }
  }

  return { text: sanitized, flagged };
}

interface GeminiCallOptions {
  prompt: string;
  agentType: AgentType;
  userId?: string;
  interviewId?: string;
  responseSchema?: Record<string, unknown>;
  temperature?: number;
  maxRetries?: number;
}

interface GeminiResult<T = unknown> {
  data: T;
  usage: {
    inputTokens: number;
    outputTokens: number;
    latencyMs: number;
  };
}

/**
 * Core Gemini API call with retry, backoff, structured JSON output, and usage logging.
 * This is the single entry point for all agent calls.
 */
export async function callGemini<T = unknown>(
  options: GeminiCallOptions
): Promise<GeminiResult<T>> {
  const {
    prompt,
    agentType,
    userId,
    interviewId,
    responseSchema,
    temperature = 0.2,
    maxRetries = 3,
  } = options;

  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not defined or empty in environment variables."
    );
  }

  const startTime = Date.now();

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(
        `[Gemini:${agentType}] Attempt ${attempt}/${maxRetries}`
      );

      const config: Record<string, unknown> = {
        temperature,
        responseMimeType: "application/json",
      };

      if (responseSchema) {
        config.responseSchema = responseSchema;
      }

      const response = await ai.models.generateContent({
        model: MODEL,
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        config,
      });

      const text = response.text;
      if (!text) {
        console.warn(`[Gemini:${agentType}] Empty response on attempt ${attempt}`);
        continue;
      }

      // Clean the response — strip markdown fences if present
      let cleanText = text.trim();
      if (cleanText.startsWith("```")) {
        cleanText = cleanText
          .replace(/^```(?:json)?\s*\n?/, "")
          .replace(/\n?```\s*$/, "");
      }

      const parsed = JSON.parse(cleanText) as T;
      const latencyMs = Date.now() - startTime;

      // Extract token usage from response metadata
      const usageMetadata = response.usageMetadata;
      const inputTokens = usageMetadata?.promptTokenCount || 0;
      const outputTokens = usageMetadata?.candidatesTokenCount || 0;

      const usage = { inputTokens, outputTokens, latencyMs };

      console.log(
        `[Gemini:${agentType}] Success on attempt ${attempt}. ` +
        `Tokens: ${inputTokens} in / ${outputTokens} out. Latency: ${latencyMs}ms`
      );

      // Log usage to database (fire-and-forget, don't block response)
      logUsage(agentType, usage, userId, interviewId).catch((err) =>
        console.error("[Gemini] Failed to log usage:", err)
      );

      return { data: parsed, usage };
    } catch (error: unknown) {
      const err = error as { status?: number; response?: { status?: number }; message?: string };
      const status = err?.status || err?.response?.status;
      const message = err?.message || String(error);

      console.error(
        `[Gemini:${agentType}] Attempt ${attempt}/${maxRetries} failed — status=${status}, message=${message}`
      );

      // Don't retry on auth/permission errors
      if (status === 401 || status === 403) {
        console.error("[Gemini] Authentication error. Check your GEMINI_API_KEY.");
        throw new Error("AI service authentication failed");
      }

      // Retry on transient errors (429, 500, 503)
      if (attempt < maxRetries) {
        const backoff = Math.pow(2, attempt) * 1000; // 2s, 4s
        console.log(`[Gemini:${agentType}] Retrying in ${backoff}ms...`);
        await sleep(backoff);
      }
    }
  }

  throw new Error(
    `AI agent '${agentType}' failed after ${maxRetries} retries. Please try again in a moment.`
  );
}

/**
 * Log AI usage to the AiUsage collection for cost visibility.
 */
async function logUsage(
  agentType: AgentType,
  usage: { inputTokens: number; outputTokens: number; latencyMs: number },
  userId?: string,
  interviewId?: string
) {
  try {
    await connectDB();
    await AiUsage.create({
      userId: userId || null,
      agentType,
      modelName: MODEL,
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
      latencyMs: usage.latencyMs,
      interviewId: interviewId || null,
    });
  } catch (err) {
    console.error("[Gemini] Usage logging failed:", err);
  }
}

export default ai;
