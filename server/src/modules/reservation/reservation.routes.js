import {Router} from "express";
import * as reservationController from "./reservation.controller.js";

const router = Router();

router.get("/", reservationController.getAllReservations);
router.post("/", reservationController.createReservation);
router.delete("/:id", reservationController.cancelReservation);

export default router;