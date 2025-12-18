import { AssemblyAI } from "assemblyai";
import Transcript from "../models/transcript.model.js";

const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY,
});

const createTranscript = async (audioUrl, transcriptId) => {
  try {
    // Update status to processing
    await Transcript.findByIdAndUpdate(transcriptId, {
      status: "processing",
    });

    const transcript = await client.transcripts.transcribe({
      audio_url: audioUrl,
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
    
    // Save transcript text to database
    await Transcript.findByIdAndUpdate(transcriptId, {
      status: "completed",
      text: transcript.text,
      confidence: transcript.confidence,
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
