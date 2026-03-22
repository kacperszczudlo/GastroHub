import {Router} from "express";
import * as tableController from "./table.controller.js";
import { protect, authorize } from "../../middlewares/auth.middleware.js";

const router = Router();

router.get("/", tableController.getAllTables);
router.post("/", protect, authorize(["admin"]), tableController.createTable);
router.put("/:id/", protect, authorize(["admin"]), tableController.updateTable);
router.delete("/:id/", protect, authorize(["admin"]), tableController.deleteTable);

export default router;