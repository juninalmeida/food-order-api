import { TablesRepository } from "@/repositories/tables-repository";

class TablesService {
  constructor(private readonly tablesRepository: TablesRepository) {}

  async index() {
    return this.tablesRepository.findAllOrderedByNumber();
  }
}

export { TablesService };
