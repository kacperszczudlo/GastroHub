import {Router} from "express";
import * as tableController from "./table.controller.js";
import { protect, authorize } from "../../middlewares/auth.middleware.js";

const router = Router();

router.get("/", tableController.getAllTables);
router.get("/:id/", tableController.getTableById);
router.post("/", protect, authorize(["admin"]), tableController.createTable);
// allow admins and waiters to change status/position through update (service will enforce field restrictions)
router.put("/:id/", protect, authorize(["admin", "waiter"]), tableController.updateTable);
// allow waiters and admins to assign/unassign themselves to a table
router.post("/:id/assign", protect, authorize(["admin","waiter"]), tableController.assignWaiter);
router.post("/:id/unassign", protect, authorize(["admin","waiter"]), tableController.unassignWaiter);
router.delete("/:id/", protect, authorize(["admin"]), tableController.deleteTable);

export default router;