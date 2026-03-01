import { NextFunction, Request, Response } from "express";
import { knex } from "@/database/knex";
import { z } from "zod";
import { ProductRepository } from "@/database/types/product-repository";

class ProductsController {
  async index(request: Request, response: Response, next: NextFunction) {
    try {
      return response.json({ message: "Ok" });
    } catch (error) {
      next(error);
    }
  }

  async create(request: Request, response: Response, next: NextFunction) {
    try {
      const bodySchema = z.object({
        name: z.string({ required_error: "Name is required!" }).trim().min(6),
        price: z.number().gt(0, { message: "Price must be greater than 0!" }),
      });

      const { name, price } = bodySchema.parse(request.body);

      await knex<ProductRepository>("products").insert({ name, price });

      return response.status(201).json();
    } catch (error) {
      next(error);
    }
  }
}

export { ProductsController };
