import { Router } from "express";
import { ProductsController } from "../controllers/products-controller";
import { requireAdminApiKey } from "../middlewares/require-admin-api-key";
import { writeRateLimit } from "../middlewares/write-rate-limit";

const productsRoutes = Router();
const productsController = new ProductsController();

productsRoutes.get("/", productsController.index);
productsRoutes.post(
  "/",
  writeRateLimit,
  requireAdminApiKey,
  productsController.create,
);
productsRoutes.put(
  "/:id",
  writeRateLimit,
  requireAdminApiKey,
  productsController.update,
);
productsRoutes.delete(
  "/:id",
  writeRateLimit,
  requireAdminApiKey,
  productsController.remove,
);

export { productsRoutes };
