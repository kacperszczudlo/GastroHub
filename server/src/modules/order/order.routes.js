import { Router } from "express";
import {
	createOrder,
	getAllOrders,
	getOpenOrders,
	getOpenOrderByTable,
	completeOrder,
	updateOrderStatus
} from "./order.controller.js";
import { protect, authorize } from "../../middlewares/auth.middleware.js";

const router = Router();

router.post("/", protect, createOrder);
router.get("/status/open", protect, authorize(["admin", "waiter"]), getOpenOrders);
router.get("/", protect, authorize(["admin", "waiter"]), getAllOrders);
router.get("/open", protect, authorize(["admin", "waiter"]), getOpenOrderByTable);
router.post("/:id/complete", protect, authorize(["admin", "waiter"]), completeOrder);
router.put("/:id/status", protect, authorize(["admin", "waiter"]), updateOrderStatus);

export default router;