import { Router } from "express";

import { OrdersController } from "../controllers/orders-controller";
import { writeRateLimit } from "../middlewares/write-rate-limit";

const ordersRoutes = Router();

const ordersController = new OrdersController();

ordersRoutes.post("/", writeRateLimit, ordersController.create);
ordersRoutes.get("/table-session/:table_session_id", ordersController.index);
ordersRoutes.get(
  "/table-session/:table_session_id/total",
  ordersController.show,
);

export { ordersRoutes };
