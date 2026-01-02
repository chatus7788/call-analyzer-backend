import express from "express";
import uploadAudio from "../middlewares/uploadS3.middleware.js";
import { 
  startTranscription, 
  getTranscript, 
  getAllTranscripts, 
  getTranscriptAnalysis 
} from "../controllers/transcription.controller.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "Transcription API is running" });
});

router.post("/transcribe", uploadAudio.single("audio"), startTranscription);

// Get all transcripts (with optional filtering)
router.get("/transcripts", getAllTranscripts);

// Get specific transcript by ID
router.get("/transcripts/:id", getTranscript);

// Get sentiment and tone analysis for a transcript
router.get("/transcripts/:id/analysis", getTranscriptAnalysis);

export { router as transcript };
