import mongoose from "mongoose";

const TranscriptSchema = new mongoose.Schema({
  // userId: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "User",
  //   required: true,
  // },

  audioUrl: {
    type: String,
    required: true,
  },

  status: {
    type: String,
    enum: ["queued", "processing", "completed", "error"],
    default: "queued",
  },

  text: {
    type: String,
  },

  confidence: {
    type: Number,
  },

  speakers: {
    type: Array,
  },

  errorMessage: {
    type: String,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  completedAt: {
    type: Date,
  },
});

export default mongoose.model("Transcript", TranscriptSchema);
