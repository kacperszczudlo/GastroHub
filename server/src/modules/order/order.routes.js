import { Router } from "express";
import * as orderController from "./order.controller.js";
import { protect, authorize } from "../../middlewares/auth.middleware.js";

const router = Router();

router.post("/", protect, orderController.createOrder);
router.get("/", protect, authorize(["admin", "waiter"]), orderController.getAllOrders);
router.put("/:id/status", protect, authorize(["admin", "waiter"]), orderController.updateOrderStatus);

export default router;