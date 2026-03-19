import { Router } from "express";
import * as menuController from "./menu.controller.js";

const router = Router();

router.get("/", menuController.getAllMenuItems);
router.post("/", menuController.createMenuItem);
router.put("/:id", menuController.updateMenuItem);
router.delete("/:id", menuController.deleteMenuItem);

export default router;