import { api } from "../api.js";
class OrdersRepository {
    async create(sessionId, productId, quantity) {
        return api.createOrder(sessionId, productId, quantity);
    }
    async findBySessionId(sessionId) {
        return api.getOrders(sessionId);
    }
    async findSessionTotals(sessionId) {
        return api.getOrdersTotal(sessionId);
    }
}
export { OrdersRepository };
