import { knex } from "@/database/knex";

export interface TableRecord {
  id: number;
  table_number: number;
  created_at: string | number;
  updated_at: string | number;
}

class TablesRepository {
  async findAllOrderedByNumber() {
    return knex<TableRecord>("tables").select().orderBy("table_number");
  }
}

export { TablesRepository };
