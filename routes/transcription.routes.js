import express from "express";
import uploadAudio from "../middlewares/uploadS3.middleware.js";
import { startTranscription } from "../controllers/transcription.controller.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "Transcription API is running" });
});

router.post("/transcribe", uploadAudio.single("audio"), startTranscription);

export { router as transcript };
