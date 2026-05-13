import { Router } from "express";
import * as scheduleController from "./schedule.controller.js";
import { protect, authorize } from "../../middlewares/auth.middleware.js";

const router = Router();

router.get("/waiter", scheduleController.getScheduleByWaiter);
router.get("/", protect, authorize(["admin"]), scheduleController.getAllSchedules);
router.post("/", protect, authorize(["admin", "waiter"]), scheduleController.createSchedule);
router.put("/:id", protect, authorize(["admin"]), scheduleController.updateSchedule);
router.delete("/:id", protect, authorize(["admin"]), scheduleController.deleteSchedule);

export default router;
