import Transcript from "../models/transcript.model.js";
import { createTranscript } from "../services/assemblyai.service.js";

const startTranscription = async (req, res) => {
  try {
    // 1️⃣ File uploaded to S3 by multer-s3
    const audioUrl = req.file?.location;

    if (!audioUrl) {
      return res.status(400).json({ message: "Audio file missing" });
    }

    // 2️⃣ Create DB entry (status = queued)
    const transcript = await Transcript.create({
      // userId: "12", // from auth middleware
      audioUrl,
      status: "queued",
    });

    // 3️⃣ Send S3 URL to AssemblyAI
    await createTranscript(audioUrl, transcript._id);

    // 4️⃣ Respond immediately (async processing)
    res.status(202).json({
      message: "Transcription started",
      transcriptId: transcript._id,
    });
  } catch (error) {
    console.error("Transcription start failed:", error);
    res.status(500).json({ message: "Failed to start transcription" });
  }
};

export { startTranscription };
