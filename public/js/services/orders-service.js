import { OrdersRepository } from "../repositories/orders-repository.js";
class OrdersService {
    ordersRepository;
    constructor(ordersRepository) {
        this.ordersRepository = ordersRepository;
    }
    async createOrderAndSync(sessionId, productId, quantity, statusResolver = () => "preparing") {
        const createResult = await this.ordersRepository.create(sessionId, productId, quantity);
        if (createResult === null) {
            return null;
        }
        const orders = await this.ordersRepository.findBySessionId(sessionId);
        const latestOrder = orders?.at(-1);
        if (!latestOrder) {
            return null;
        }
        const totals = await this.ordersRepository.findSessionTotals(sessionId);
        if (!totals) {
            return null;
        }
        const normalizedOrder = this.normalizeOrder(latestOrder, statusResolver(String(latestOrder.id)));
        return {
            order: normalizedOrder,
            total: Number(totals.total),
            quantity: Number(totals.quantity),
        };
    }
    async syncSessionOrders(sessionId, statusResolver = () => "preparing") {
        const [ordersFromApi, totalsFromApi] = await Promise.all([
            this.ordersRepository.findBySessionId(sessionId),
            this.ordersRepository.findSessionTotals(sessionId),
        ]);
        if (!ordersFromApi && !totalsFromApi) {
            return null;
        }
        const orders = (ordersFromApi ?? []).map((order) => this.normalizeOrder(order, statusResolver(String(order.id))));
        return {
            orders,
            total: Number(totalsFromApi?.total ?? 0),
            quantity: Number(totalsFromApi?.quantity ?? 0),
        };
    }
    normalizeOrder(order, status) {
        return {
            id: String(order.id),
            table_session_id: order.table_session_id,
            product_id: order.product_id,
            name: order.name,
            price: Number(order.price),
            quantity: Number(order.quantity),
            total: Number(order.total),
            status,
            created_at: order.created_at,
            updated_at: order.updated_at,
        };
    }
}
const ordersService = new OrdersService(new OrdersRepository());
export { OrdersService, ordersService };
