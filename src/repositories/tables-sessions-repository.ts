import { knex } from "@/database/knex";

export interface TableSessionRecord {
  id: number;
  table_id: number;
  opened_at: string | number;
  closed_at: string | number | null;
}

class TablesSessionsRepository {
  async findAllOrderedByClosedAt() {
    return knex<TableSessionRecord>("tables_sessions").orderBy("closed_at");
  }

  async findLatestByTableId(tableId: number) {
    return knex<TableSessionRecord>("tables_sessions")
      .where({ table_id: tableId })
      .orderBy("opened_at", "desc")
      .first();
  }

  async findById(id: number) {
    return knex<TableSessionRecord>("tables_sessions").where({ id }).first();
  }

  async create(tableId: number) {
    await knex<TableSessionRecord>("tables_sessions").insert({
      table_id: tableId,
      opened_at: knex.fn.now(),
    });
  }

  async closeById(id: number) {
    await knex<TableSessionRecord>("tables_sessions")
      .update({
        closed_at: knex.fn.now(),
      })
      .where({ id });
  }
}

export { TablesSessionsRepository };
