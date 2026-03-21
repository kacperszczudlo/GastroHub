import {Router} from "express";
import * as reservationController from "./reservation.controller.js";
import { protect, authorize } from "../../middlewares/auth.middleware.js";

const router = Router();

router.post("/", protect, reservationController.createAllReservations);
router.get("/", protect, authorize(["admin", "waiter"]), reservationController.getAllReservations);
router.delete("/:id/", protect, authorize(["admin", "waiter"]), reservationController.cancelReservation);

export default router;