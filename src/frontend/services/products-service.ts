import { ProductsRepository } from "../repositories/products-repository.js";

class ProductsService {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async loadProducts() {
    return this.productsRepository.findAll();
  }
}

const productsService = new ProductsService(new ProductsRepository());

export { ProductsService, productsService };
