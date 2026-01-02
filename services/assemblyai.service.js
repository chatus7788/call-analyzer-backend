import { AssemblyAI } from "assemblyai";
import Transcript from "../models/transcript.model.js";

const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY,
});

/**
 * Calculate overall sentiment from sentence-level sentiments
 */
const calculateOverallSentiment = (sentiments) => {
  if (!sentiments || sentiments.length === 0) {
    return { label: "unknown", score: 0.0 };
  }

  let score = 0.0;
  let totalConf = 0.0;

  for (const s of sentiments) {
    let val = 0;
    if (s.sentiment === "POSITIVE") {
      val = 1;
    } else if (s.sentiment === "NEGATIVE") {
      val = -1;
    }

    score += val * s.confidence;
    totalConf += s.confidence;
  }

  const final = totalConf ? score / totalConf : 0.0;

  let label;
  if (final > 0.2) {
    label = "positive";
  } else if (final < -0.2) {
    label = "negative";
  } else {
    label = "neutral";
  }

  return { label, score: Math.round(final * 1000) / 1000 };
};

/**
 * Classify tone based on sentiment and content safety
 */
const classifyTone = (transcript) => {
  // Check content safety first
  if (transcript.content_safety_labels && transcript.content_safety_labels.results && 
      transcript.content_safety_labels.results.length > 0) {
    return { label: "aggressive", confidence: 0.9, isAggressive: true };
  }

  const sentiments = transcript.sentiment_analysis_results;
  if (!sentiments || sentiments.length === 0) {
    return { label: "unknown", confidence: 0.0, isAggressive: false };
  }

  const pos = sentiments.filter(s => s.sentiment === "POSITIVE").length;
  const neg = sentiments.filter(s => s.sentiment === "NEGATIVE").length;
  const total = sentiments.length;

  const posRatio = pos / total;
  const negRatio = neg / total;

  if (negRatio >= 0.35) {
    return { label: "aggressive", confidence: Math.round(negRatio * 100) / 100, isAggressive: true };
  }
  if (posRatio >= 0.25 && negRatio < 0.1) {
    return { label: "polite", confidence: Math.round(posRatio * 100) / 100, isAggressive: false };
  }

  return { label: "neutral", confidence: 0.5, isAggressive: false };
};

const createTranscript = async (audioUrl, transcriptId) => {
  try {
    // Update status to processing
    await Transcript.findByIdAndUpdate(transcriptId, {
      status: "processing",
    });

    const transcript = await client.transcripts.transcribe({
      audio_url: audioUrl,
      sentiment_analysis: true,
      content_safety: true,
    });
    
    if (transcript.status === "error") {
      console.error("AssemblyAI transcription error:", transcript.error);
      
      // Update DB with error
      await Transcript.findByIdAndUpdate(transcriptId, {
        status: "error",
        errorMessage: transcript.error,
      });
      
      throw new Error(`Transcription failed: ${transcript.error}`);
    }
    
    console.log("AssemblyAI transcript created:", transcript.text, transcript.id);
    
    // Process sentiment analysis
    const sentimentAnalysis = transcript.sentiment_analysis_results?.map(s => ({
      text: s.text,
      sentiment: s.sentiment,
      confidence: s.confidence,
    })) || [];

    const overallSentiment = calculateOverallSentiment(sentimentAnalysis);
    const tone = classifyTone(transcript);

    // Save transcript with analysis to database
    await Transcript.findByIdAndUpdate(transcriptId, {
      status: "completed",
      text: transcript.text,
      confidence: transcript.confidence,
      sentimentAnalysis,
      overallSentiment,
      tone,
      contentSafety: transcript.content_safety_labels || null,
      completedAt: new Date(),
    });
    
    return transcript;
  } catch (error) {
    // Update DB with error if not already done
    await Transcript.findByIdAndUpdate(transcriptId, {
      status: "error",
      errorMessage: error.message,
    });
    throw error;
  }
};

export { createTranscript };
