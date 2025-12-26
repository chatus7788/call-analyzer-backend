import Transcript from "../models/transcript.model.js";
import { createTranscript } from "../services/assemblyai.service.js";
import { getPresignedUrl } from "../utils/s3PresignedUrl.js";

const startTranscription = async (req, res) => {
  try {

    const s3Key = req.file.key;
    // 1️⃣ File uploaded to S3 by multer-s3
    const audioUrl = await getPresignedUrl(s3Key);

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

const getTranscript = async (req, res) => {
  try {
    const { id } = req.params;

    const transcript = await Transcript.findById(id);

    if (!transcript) {
      return res.status(404).json({ message: "Transcript not found" });
    }

    res.status(200).json({
      transcriptId: transcript._id,
      status: transcript.status,
      text: transcript.text,
      confidence: transcript.confidence,
      sentimentAnalysis: transcript.sentimentAnalysis,
      overallSentiment: transcript.overallSentiment,
      tone: transcript.tone,
      contentSafety: transcript.contentSafety,
      createdAt: transcript.createdAt,
      completedAt: transcript.completedAt,
      errorMessage: transcript.errorMessage,
    });
  } catch (error) {
    console.error("Get transcript failed:", error);
    res.status(500).json({ message: "Failed to retrieve transcript" });
  }
};

const getAllTranscripts = async (req, res) => {
  try {
    const { status, limit = 50, skip = 0 } = req.query;

    const filter = {};
    if (status) {
      filter.status = status;
    }

    const transcripts = await Transcript.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Transcript.countDocuments(filter);

    res.status(200).json({
      transcripts,
      total,
      limit: parseInt(limit),
      skip: parseInt(skip),
    });
  } catch (error) {
    console.error("Get all transcripts failed:", error);
    res.status(500).json({ message: "Failed to retrieve transcripts" });
  }
};

const getTranscriptAnalysis = async (req, res) => {
  try {
    const { id } = req.params;

    const transcript = await Transcript.findById(id);

    if (!transcript) {
      return res.status(404).json({ message: "Transcript not found" });
    }

    if (transcript.status !== "completed") {
      return res.status(400).json({ 
        message: "Analysis not available",
        status: transcript.status 
      });
    }

    res.status(200).json({
      transcriptId: transcript._id,
      overallSentiment: transcript.overallSentiment,
      tone: transcript.tone,
      sentimentAnalysis: transcript.sentimentAnalysis,
      contentSafety: transcript.contentSafety,
    });
  } catch (error) {
    console.error("Get analysis failed:", error);
    res.status(500).json({ message: "Failed to retrieve analysis" });
  }
};

export { 
  startTranscription, 
  getTranscript, 
  getAllTranscripts, 
  getTranscriptAnalysis 
};
