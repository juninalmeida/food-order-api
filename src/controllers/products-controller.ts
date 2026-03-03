import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { ProductsRepository } from "@/repositories/products-repository";
import { ProductsService } from "@/services/products-service";

class ProductsController {
  private readonly productsService: ProductsService;

  constructor() {
    this.productsService = new ProductsService(new ProductsRepository());
  }

  index = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const querySchema = z.object({
        name: z.string().optional(),
      });

      const { name } = querySchema.parse(request.query);
      const products = await this.productsService.index(name ?? "");

      return response.json(products);
    } catch (error) {
      next(error);
    }
  };

  create = async (
    request: Request,
    response: Response,
    next: NextFunction,
  ) => {
    try {
      const bodySchema = z.object({
        name: z.string({ required_error: "Name is required!" }).trim().min(6),
        price: z.number().gt(0, { message: "Price must be greater than 0!" }),
      });

      const { name, price } = bodySchema.parse(request.body);

      await this.productsService.create(name, price);

      return response.status(201).json();
    } catch (error) {
      next(error);
    }
  };

  update = async (
    request: Request,
    response: Response,
    next: NextFunction,
  ) => {
    try {
      const id = z
        .string()
        .transform((value) => Number(value))
        .refine((value) => !isNaN(value), { message: "ID must be a number!" })
        .parse(request.params.id);

      const bodySchema = z.object({
        name: z.string().trim().min(6),
        price: z.number().gt(0),
      });

      const { name, price } = bodySchema.parse(request.body);

      await this.productsService.update(id, { name, price });

      return response.json();
    } catch (error) {
      next(error);
    }
  };

  remove = async (
    request: Request,
    response: Response,
    next: NextFunction,
  ) => {
    try {
      const id = z
        .string()
        .transform((value) => Number(value))
        .refine((value) => !isNaN(value), { message: "ID must be a number!" })
        .parse(request.params.id);

      await this.productsService.remove(id);

      return response.json();
    } catch (error) {
      next(error);
    }
  };
}

export { ProductsController };
