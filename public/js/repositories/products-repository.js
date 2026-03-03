import { api } from "../api.js";
class ProductsRepository {
    async findAll() {
        return api.getProducts();
    }
}
export { ProductsRepository };
