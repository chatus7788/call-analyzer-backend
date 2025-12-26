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

  // Sentiment Analysis
  sentimentAnalysis: {
    type: Array, // Array of { text, sentiment, confidence }
  },

  overallSentiment: {
    label: {
      type: String,
      enum: ["positive", "negative", "neutral", "unknown"],
    },
    score: {
      type: Number,
    },
  },

  // Tone Classification
  tone: {
    label: {
      type: String,
      enum: ["polite", "aggressive", "neutral", "unknown"],
    },
    confidence: {
      type: Number,
    },
    isAggressive: {
      type: Boolean,
    },
  },

  // Content Safety
  contentSafety: {
    type: Object, // Full content safety results from AssemblyAI
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
