// import express from "express";

// import { uploadCandidateResume } from "../controller/resume.controller";

// import { protect } from "../lib/middleware/auth.middleware";

// import { authorize } from "../lib/middleware/role.middleware";

// import { UserRole } from "../lib/entity/User";

// import { uploadResume } from "../lib/middleware/resumeUpload.middleware";

// const router = express.Router();

// router.post(
//   "/application/:applicationId",
//   protect,
//   authorize(UserRole.CANDIDATE),
//   uploadResume.single("resume"),
//   uploadCandidateResume,
// );

// export default router;
