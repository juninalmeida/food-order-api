import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { TablesSessionsRepository } from "@/repositories/tables-sessions-repository";
import { TablesSessionsService } from "@/services/tables-sessions-service";

class TablesSessionsController {
  private readonly tablesSessionsService: TablesSessionsService;

  constructor() {
    this.tablesSessionsService = new TablesSessionsService(
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
        table_id: z.number(),
      });

      const { table_id } = bodySchema.parse(request.body);

      await this.tablesSessionsService.create(table_id);

      return response.status(201).json();
    } catch (error) {
      next(error);
    }
  };

  index = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const sessions = await this.tablesSessionsService.index();

      return response.json(sessions);
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
        .refine((value) => !isNaN(value), { message: "id must be a number" })
        .parse(request.params.id);

      await this.tablesSessionsService.close(id);

      return response.json();
    } catch (error) {
      next(error);
    }
  };
}

export { TablesSessionsController };
