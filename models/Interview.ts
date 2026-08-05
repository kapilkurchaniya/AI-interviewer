import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IInterviewConfig {
  type: "technical" | "hr" | "behavioral";
  role: string;
  companyStyle: string | null;
  difficultyStart: "easy" | "medium" | "hard";
  totalQuestions: number;
}

export interface IInterview extends Document {
  userId: Types.ObjectId;
  resumeId: Types.ObjectId | null;
  config: IInterviewConfig;
  status: "in_progress" | "completed" | "abandoned";
  currentDifficulty: "easy" | "medium" | "hard";
  topicsCovered: string[];
  memorySummary: string[];
  currentTurn: number;
  startedAt: Date;
  completedAt: Date | null;
}

const InterviewSchema = new Schema<IInterview>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  resumeId: { type: Schema.Types.ObjectId, ref: "Resume", default: null },
  config: {
    type: {
      type: String,
      enum: ["technical", "hr", "behavioral"],
      required: true,
    },
    role: { type: String, required: true },
    companyStyle: { type: String, default: null },
    difficultyStart: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    totalQuestions: { type: Number, default: 8, min: 3, max: 15 },
  },
  status: {
    type: String,
    enum: ["in_progress", "completed", "abandoned"],
    default: "in_progress",
    index: true,
  },
  currentDifficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    default: "medium",
  },
  topicsCovered: { type: [String], default: [] },
  // Compact turn summaries for Interview Agent & Follow-up Agent context
  // Each entry: "topic | difficulty | score | 5-8 word gist"
  memorySummary: { type: [String], default: [] },
  currentTurn: { type: Number, default: 0 },
  startedAt: { type: Date, default: Date.now },
  completedAt: { type: Date, default: null },
});

const Interview: Model<IInterview> =
  mongoose.models.Interview ||
  mongoose.model<IInterview>("Interview", InterviewSchema);

export default Interview;
