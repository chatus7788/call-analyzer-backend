import { AssemblyAI } from "assemblyai";

const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY,
});

const createTranscript = async (audioUrl, transcriptId) => {
  return client.transcripts.create({
    audio_url: audioUrl,
    webhook_url: `${process.env.BASE_URL}/webhooks/assemblyai`,
    webhook_auth_header_name: "x-webhook-secret",
    webhook_auth_header_value: process.env.ASSEMBLYAI_WEBHOOK_SECRET,
    speaker_labels: true,
    sentiment_analysis: true,
    punctuate: true,
    format_text: true,
    custom_metadata: { transcriptId },
  });
};

export { createTranscript };
