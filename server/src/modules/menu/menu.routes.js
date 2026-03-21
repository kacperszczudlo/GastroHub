import { Router } from "express";
import * as menuController from "./menu.controller.js";
import { protect, authorize } from "../../middlewares/auth.middleware.js";

const router = Router();

router.get("/", menuController.getAllMenuItems);
router.post("/", protect, authorize(["admin"]), menuController.createMenuItem);
router.put("/:id", menuController.updateMenuItem);
router.delete("/:id", menuController.deleteMenuItem);

export default router;