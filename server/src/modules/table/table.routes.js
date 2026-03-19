import {Router} from "express";
import * as tableController from "./table.controller.js";

const router = Router();

router.get("/", tableController.getAllTables);
router.put("/:id/status", tableController.updateTableStatus);

export default router;