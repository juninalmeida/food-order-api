import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { OrdersRepository } from "@/repositories/orders-repository";
import { ProductsRepository } from "@/repositories/products-repository";
import { TablesSessionsRepository } from "@/repositories/tables-sessions-repository";
import { OrdersService } from "@/services/orders-service";

class OrdersController {
  private readonly ordersService: OrdersService;

  constructor() {
    this.ordersService = new OrdersService(
      new OrdersRepository(),
      new ProductsRepository(),
      new TablesSessionsRepository(),
    );
  }

  create = async (
    request: Request,
    response: Response,
    next: NextFunction,
  ) => {
    try {
      const bodySchema = z.object({
        table_session_id: z.number(),
        product_id: z.number(),
        quantity: z.number(),
      });

      const { table_session_id, product_id, quantity } = bodySchema.parse(
        request.body,
      );

      await this.ordersService.create({
        table_session_id,
        product_id,
        quantity,
      });

      return response.status(201).json();
    } catch (error) {
      next(error);
    }
  };

  index = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const tableSessionId = z
        .string()
        .transform((value) => Number(value))
        .refine((value) => !isNaN(value), {
          message: "table_session_id must be a number",
        })
        .parse(request.params.table_session_id);

      const order = await this.ordersService.index(tableSessionId);

      return response.json(order);
    } catch (error) {
      next(error);
    }
  };

  show = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const tableSessionId = z
        .string()
        .transform((value) => Number(value))
        .refine((value) => !isNaN(value), {
          message: "table_session_id must be a number",
        })
        .parse(request.params.table_session_id);

      const order = await this.ordersService.showTotals(tableSessionId);

      return response.json(order);
    } catch (error) {
      next(error);
    }
  };
}

export { OrdersController };
