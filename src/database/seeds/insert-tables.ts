import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  const defaultTableNumbers = [1, 2, 3, 4, 5, 6];

  const existingTables = await knex("tables").select<{ table_number: number }[]>("table_number");
  const existingTableNumbers = new Set(existingTables.map((table) => table.table_number));

  const missingTables = defaultTableNumbers
    .filter((tableNumber) => !existingTableNumbers.has(tableNumber))
    .map((tableNumber) => ({ table_number: tableNumber }));

  if (missingTables.length > 0) {
    await knex("tables").insert(missingTables);
  }

  const secondTable = await knex("tables")
    .where({ table_number: 2 })
    .first<{ id: number }>("id");

  if (!secondTable) return;

  const hasAnySession = await knex("tables_sessions").first("id");
  if (!hasAnySession) {
    await knex("tables_sessions").insert({
      table_id: secondTable.id,
      opened_at: knex.fn.now(),
    });
  }
}
