import express from "express";
import uploadAudio from "../middlewares/uploadS3.middleware.js";
import { startTranscription } from "../controllers/transcription.controller.js";

const router = express.Router();

router.post("/transcribe", uploadAudio.single("audio"), startTranscription);

export { router as transcript };
