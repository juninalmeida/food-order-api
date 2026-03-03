import { OrdersRepository } from "@/repositories/orders-repository";
import { ProductsRepository } from "@/repositories/products-repository";
import { TablesSessionsRepository } from "@/repositories/tables-sessions-repository";
import { AppError } from "@/utils/app-error";

interface CreateOrderInput {
  table_session_id: number;
  product_id: number;
  quantity: number;
}

class OrdersService {
  constructor(
    private readonly ordersRepository: OrdersRepository,
    private readonly productsRepository: ProductsRepository,
    private readonly tablesSessionsRepository: TablesSessionsRepository,
  ) {}

  async create(input: CreateOrderInput) {
    const session = await this.tablesSessionsRepository.findById(
      input.table_session_id,
    );

    if (!session) {
      throw new AppError("Table session not found");
    }

    if (session.closed_at) {
      throw new AppError("Table session is closed");
    }

    const product = await this.productsRepository.findById(input.product_id);

    if (!product) {
      throw new AppError("Product not found");
    }

    await this.ordersRepository.create({
      ...input,
      price: Number(product.price),
    });
  }

  async index(tableSessionId: number) {
    return this.ordersRepository.findAllByTableSessionId(tableSessionId);
  }

  async showTotals(tableSessionId: number) {
    return this.ordersRepository.findTotalByTableSessionId(tableSessionId);
  }
}

export { OrdersService };
