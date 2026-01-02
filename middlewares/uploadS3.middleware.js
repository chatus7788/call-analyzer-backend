import multer from "multer";
import multerS3 from "multer-s3";
import path from "path";
import s3 from "../config/s3.config.js";

const allowedMimeTypes = [
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-m4a",
];

const uploadAudio = multer({
  storage: multerS3({
    s3,
    bucket: process.env.S3_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,

    metadata: (req, file, cb) => {
      cb(null, {
        fieldName: file.fieldname,
      });
    },

    key: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const safeName = `${Date.now()}-${Math.round(
        Math.random() * 1e9
      )}${ext}`;

      cb(null, `audio/${safeName}`);
    },
  }),

  fileFilter: (req, file, cb) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new Error("Only audio files are allowed"), false);
    }
    cb(null, true);
  },

  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
});

export default uploadAudio;
