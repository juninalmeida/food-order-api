import { ProductsRepository } from "../repositories/products-repository";
import { AppError } from "../utils/app-error";

interface UpdateProductInput {
  name: string;
  price: number;
}

class ProductsService {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async index(name: string) {
    return this.productsRepository.findAllByName(name);
  }

  async create(name: string, price: number) {
    await this.productsRepository.create(name, price);
  }

  async update(id: number, input: UpdateProductInput) {
    const product = await this.productsRepository.findById(id);

    if (!product) {
      throw new AppError("Product not found!", 404);
    }

    await this.productsRepository.updateById(id, input);
  }

  async remove(id: number) {
    const product = await this.productsRepository.findById(id);

    if (!product) {
      throw new AppError("Product not found!", 404);
    }

    await this.productsRepository.removeById(id);
  }
}

export { ProductsService };
