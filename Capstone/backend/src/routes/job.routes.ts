import { Router } from "express";

import {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
} from "../controller/job.controller";

import { protect } from "../lib/middleware/auth.middleware";
import { authorize } from "../lib/middleware/role.middleware";
import { validate } from "../lib/middleware/validate.middleware";

import { UserRole } from "../lib/entity/User";
import {
  createJobSchema,
  updateJobSchema,
} from "../lib/validation/job.validation";

const router = Router();

router.get("/", getJobs);
router.get("/:id", getJobById);
router.post(
  "/",
  protect,
  authorize(UserRole.HR),
  validate(createJobSchema),
  createJob,
);
router.put(
  "/:id",
  protect,
  authorize(UserRole.HR),
  validate(updateJobSchema),
  updateJob,
);
router.delete("/:id", protect, authorize(UserRole.HR), deleteJob);

export default router;
