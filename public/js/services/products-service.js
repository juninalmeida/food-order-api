import { ProductsRepository } from "../repositories/products-repository.js";
class ProductsService {
    productsRepository;
    constructor(productsRepository) {
        this.productsRepository = productsRepository;
    }
    async loadProducts() {
        return this.productsRepository.findAll();
    }
}
const productsService = new ProductsService(new ProductsRepository());
export { ProductsService, productsService };
