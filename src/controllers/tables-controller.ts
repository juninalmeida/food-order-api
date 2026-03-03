import { Request, Response, NextFunction } from "express";
import { TablesRepository } from "../repositories/tables-repository";
import { TablesService } from "../services/tables-service";

class TablesController {
  private readonly tablesService: TablesService;

  constructor() {
    this.tablesService = new TablesService(new TablesRepository());
  }

  index = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const tables = await this.tablesService.index();

      return response.json(tables);
    } catch (error) {
      next(error);
    }
  };
}

export { TablesController };
