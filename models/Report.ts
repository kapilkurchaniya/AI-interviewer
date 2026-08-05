import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ITopicBreakdown {
  topic: string;
  avgScore: number;
}

export interface IReport extends Document {
  interviewId: Types.ObjectId;
  userId: Types.ObjectId;
  overallScore: number;
  topicBreakdown: ITopicBreakdown[];
  strengths: string[];
  weakAreas: string[];
  improvementActions: string[];
  generatedAt: Date;
}

const ReportSchema = new Schema<IReport>({
  interviewId: {
    type: Schema.Types.ObjectId,
    ref: "Interview",
    required: true,
    unique: true,
    index: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  overallScore: { type: Number, required: true, min: 0, max: 10 },
  topicBreakdown: [
    {
      topic: { type: String, required: true },
      avgScore: { type: Number, required: true, min: 0, max: 10 },
    },
  ],
  strengths: { type: [String], default: [] },
  weakAreas: { type: [String], default: [] },
  improvementActions: { type: [String], default: [] },
  generatedAt: { type: Date, default: Date.now },
});

const Report: Model<IReport> =
  mongoose.models.Report || mongoose.model<IReport>("Report", ReportSchema);

export default Report;
