import { api } from "../api.js";
import { Product } from "../types.js";

class ProductsRepository {
  async findAll() {
    return api.getProducts() as Promise<Product[] | null>;
  }
}

export { ProductsRepository };
