import { productsRoutes } from "../../routes/products-routes";

type ProductRepository = {
  id: number;
  name: string;
  price: number;
  created_at: number;
  updated_at: number;
}
