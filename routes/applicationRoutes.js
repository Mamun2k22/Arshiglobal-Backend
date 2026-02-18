// import express from "express";
// import { listApplications } from "../controller/applicationController.js";

// const router = express.Router();

// router.get("/applications", listApplications);

// export default router;
import express from "express";
import {
  applyToJob,
  getAllApplications,
  updateApplicationStatus,
  getApplicationStats,
} from "../controller/applicationController.js";

const router = express.Router();

// Public apply
router.post("/applications", applyToJob);

// Admin
router.get("/applications", getAllApplications);
router.put("/applications/:id", updateApplicationStatus);

// Dashboard stats
router.get("/applications/stats", getApplicationStats);

export default router;
