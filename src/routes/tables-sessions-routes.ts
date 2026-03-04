import { Router } from "express";
import { TablesSessionsController } from "../controllers/tables-sessions-controller";
import { writeRateLimit } from "../middlewares/write-rate-limit";

const tablesSessionsRoutes = Router();
const tablesSessionsController = new TablesSessionsController();

tablesSessionsRoutes.get("/", tablesSessionsController.index);
tablesSessionsRoutes.post("/", writeRateLimit, tablesSessionsController.create);
tablesSessionsRoutes.patch("/:id", writeRateLimit, tablesSessionsController.update);
tablesSessionsRoutes.post(
  "/:id/close-on-exit",
  writeRateLimit,
  tablesSessionsController.update,
);

export { tablesSessionsRoutes };
