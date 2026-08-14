import mongoose from "mongoose";

/**
 * Config + sync log for each connected Microsoft Forms pipeline,
 * matching the "Forms" admin screen (MF01, MF02, MF03...).
 */
const formPipelineSchema = new mongoose.Schema(
  {
    pipelineId: { type: String, unique: true, required: true }, // "MF01"
    documentTitle: String, // "Health Status Declaration"
    targetModule: { type: String, enum: ["EMR", "Live Queue"], required: true },
    status: { type: String, enum: ["Active", "Paused", "Error"], default: "Active" },
    lastSyncedAt: Date,
  },
  { timestamps: true }
);

const syncLogSchema = new mongoose.Schema(
  {
    pipeline: { type: mongoose.Schema.Types.ObjectId, ref: "FormPipeline" },
    formName: String,
    studentIdRaw: String, // as submitted, before matching
    matchedStudent: { type: mongoose.Schema.Types.ObjectId, ref: "Student", default: null },
    syncResult: { type: String, enum: ["matched", "unmatched", "exception"], required: true },
    rawPayload: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

export const FormPipeline = mongoose.model("FormPipeline", formPipelineSchema);
export const SyncLog = mongoose.model("SyncLog", syncLogSchema);
