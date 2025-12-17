import multer from "multer";
import multerS3 from "multer-s3";
import s3 from "../config/s3.config.js";

const uploadAudio = multer({
  storage: multerS3({
    s3,
    bucket: process.env.S3_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      cb(null, `audio/${Date.now()}-${file.originalname}`);
    },
  }),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
});

export default uploadAudio;
