import { AssemblyAI } from "assemblyai";

const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY,
});

const createTranscript = async (audioUrl) => {
  const transcript = await client.transcripts.transcribe({
    audio_url: audioUrl,
  });
  
  if (transcript.status === "error") {
    console.error("AssemblyAI transcription error:", transcript.error);
    throw new Error(`Transcription failed: ${transcript.error}`);
  }
  
  console.log("AssemblyAI transcript created:", transcript.text, transcript.id);
  return transcript;
};

export { createTranscript };
