const express = require("express");
const router = express.Router();
const uploadAudio = require("../middlewares/uploadS3.middleware");
const { startTranscription } = require("../controllers/transcription.controller");

router.post("/transcribe", uploadAudio.single("audio"), startTranscription);

module.exports = router;
