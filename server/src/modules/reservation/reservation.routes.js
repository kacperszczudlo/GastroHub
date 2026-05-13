import {Router} from "express";
import * as reservationController from "./reservation.controller.js";
import { protect, authorize } from "../../middlewares/auth.middleware.js";

const router = Router();

router.post("/", protect, reservationController.createAllReservations);
router.get("/", protect, authorize(["admin", "waiter"]), reservationController.getAllReservations);
router.get("/mine", protect, reservationController.getUserReservations);
router.patch("/:id", protect, authorize(["admin"]), reservationController.updateReservationStatus);
router.post("/:id/check-in", protect, authorize(["admin", "waiter"]), reservationController.checkInReservation);
router.post("/:id/complete", protect, authorize(["admin", "waiter"]), reservationController.completeReservation);
router.delete("/:id/", protect, authorize(["admin", "waiter"]), reservationController.cancelReservation);
router.delete("/:id/hard", protect, authorize(["admin"]), reservationController.hardDeleteReservation);
router.post("/prune", protect, authorize(["admin"]), reservationController.pruneReservations);

export default router;