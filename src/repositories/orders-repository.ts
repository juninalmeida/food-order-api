import { knex } from "../database/knex";

export interface OrderRecord {
  id: number;
  table_session_id: number;
  product_id: number;
  quantity: number;
  price: number;
  created_at: string | number;
  updated_at: string | number;
}

interface CreateOrderInput {
  table_session_id: number;
  product_id: number;
  quantity: number;
  price: number;
}

export interface OrderWithProduct {
  id: number;
  table_session_id: number;
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  total: number;
  created_at: string | number;
  updated_at: string | number;
}

export interface OrdersTotal {
  total: number;
  quantity: number;
}

class OrdersRepository {
  async create(input: CreateOrderInput) {
    await knex<OrderRecord>("orders").insert(input);
  }

  async findAllByTableSessionId(tableSessionId: number) {
    return knex("orders")
      .select(
        "orders.id",
        "orders.table_session_id",
        "orders.product_id",
        "products.name",
        "orders.price",
        "orders.quantity",
        knex.raw("(orders.price * orders.quantity) AS total"),
        "orders.created_at",
        "orders.updated_at",
      )
      .join("products", "products.id", "orders.product_id")
      .where({ table_session_id: tableSessionId })
      .orderBy("orders.created_at") as Promise<OrderWithProduct[]>;
  }

  async findTotalByTableSessionId(tableSessionId: number) {
    const result = await knex("orders")
      .select(
        knex.raw("COALESCE(SUM(orders.price * orders.quantity), 0) AS total"),
        knex.raw("COALESCE(SUM(orders.quantity), 0) AS quantity"),
      )
      .where({ table_session_id: tableSessionId })
      .first<OrdersTotal>();

    return {
      total: Number(result?.total ?? 0),
      quantity: Number(result?.quantity ?? 0),
    };
  }
}

export { OrdersRepository };
