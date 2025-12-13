const multer = require("multer");
const multerS3 = require("multer-s3");
const s3 = require("../config/s3.config");

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

module.exports = uploadAudio;
