import multer from "multer";

const fileFilter: multer.Options["fileFilter"] = (req, file, callback) => {
  const allowedTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (!allowedTypes.includes(file.mimetype)) {
    return callback(new Error("Only PDF and DOCX resumes are allowed"));
  }

  callback(null, true);
};

export const uploadResume = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});
