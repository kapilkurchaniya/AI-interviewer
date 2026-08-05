import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IAiUsage extends Document {
  userId: Types.ObjectId | null;
  agentType: "resume" | "interview" | "evaluation" | "followUp" | "report";
  modelName: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  interviewId: Types.ObjectId | null;
  createdAt: Date;
}

const AiUsageSchema = new Schema<IAiUsage>({
  userId: { type: Schema.Types.ObjectId, ref: "User", default: null },
  agentType: {
    type: String,
    enum: ["resume", "interview", "evaluation", "followUp", "report"],
    required: true,
  },
  modelName: { type: String, required: true },
  inputTokens: { type: Number, default: 0 },
  outputTokens: { type: Number, default: 0 },
  latencyMs: { type: Number, default: 0 },
  interviewId: { type: Schema.Types.ObjectId, ref: "Interview", default: null },
  createdAt: { type: Date, default: Date.now },
});

// For daily interview cap: count AI calls per user per day
AiUsageSchema.index({ userId: 1, createdAt: 1 });
// For cost analytics
AiUsageSchema.index({ agentType: 1, createdAt: 1 });

const AiUsage: Model<IAiUsage> =
  mongoose.models.AiUsage || mongoose.model<IAiUsage>("AiUsage", AiUsageSchema);

export default AiUsage;
