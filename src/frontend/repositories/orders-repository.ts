import { api } from "../api.js";
import { ApiOrder } from "../types.js";

class OrdersRepository {
  async create(sessionId: number, productId: number, quantity: number) {
    return api.createOrder(sessionId, productId, quantity);
  }

  async findBySessionId(sessionId: number) {
    return api.getOrders(sessionId) as Promise<ApiOrder[] | null>;
  }

  async findSessionTotals(sessionId: number) {
    return api.getOrdersTotal(sessionId) as Promise<
      { total: number; quantity: number } | null
    >;
  }
}

export { OrdersRepository };
