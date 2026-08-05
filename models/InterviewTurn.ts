import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IEvaluation {
  score: number;
  strengths: string[];
  gaps: string[];
  reasoning: string;
}

export interface IInterviewTurn extends Document {
  interviewId: Types.ObjectId;
  turnNumber: number;
  question: string;
  questionEmbedding: number[];
  topic: string;
  difficulty: "easy" | "medium" | "hard";
  isFollowUp: boolean;
  parentTurnId: Types.ObjectId | null;
  answer: string;
  evaluation: IEvaluation;
  createdAt: Date;
}

const InterviewTurnSchema = new Schema<IInterviewTurn>({
  interviewId: {
    type: Schema.Types.ObjectId,
    ref: "Interview",
    required: true,
    index: true,
  },
  turnNumber: { type: Number, required: true },
  question: { type: String, required: true },
  // Vector embedding for no-repeat-question similarity checks
  questionEmbedding: { type: [Number], default: [] },
  topic: { type: String, required: true },
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    required: true,
  },
  isFollowUp: { type: Boolean, default: false },
  parentTurnId: { type: Schema.Types.ObjectId, ref: "InterviewTurn", default: null },
  answer: { type: String, default: "" },
  evaluation: {
    score: { type: Number, default: 0, min: 0, max: 10 },
    strengths: { type: [String], default: [] },
    gaps: { type: [String], default: [] },
    reasoning: { type: String, default: "" },
  },
  createdAt: { type: Date, default: Date.now },
});

// Compound index for fetching all turns of an interview in order
InterviewTurnSchema.index({ interviewId: 1, turnNumber: 1 });

const InterviewTurn: Model<IInterviewTurn> =
  mongoose.models.InterviewTurn ||
  mongoose.model<IInterviewTurn>("InterviewTurn", InterviewTurnSchema);

export default InterviewTurn;
