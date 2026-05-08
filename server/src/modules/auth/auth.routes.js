import { Router } from "express";
import * as authController from "./auth.controller.js";

const router = Router();

router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);
router.post("/change-password", authController.changePassword);
router.get("/waiters", authController.getWaiters);

export default router;