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

  const firstTable = await knex("tables")
    .where({ table_number: 1 })
    .first<{ id: number }>("id");

  if (!firstTable) return;

  await knex("tables_sessions")
    .whereNull("closed_at")
    .whereNot({ table_id: firstTable.id })
    .update({ closed_at: knex.fn.now() });

  const openFirstTableSessions = await knex("tables_sessions")
    .where({ table_id: firstTable.id })
    .whereNull("closed_at")
    .orderBy("opened_at", "desc")
    .select<{ id: number }[]>("id");

  if (openFirstTableSessions.length > 1) {
    const staleOpenSessions = openFirstTableSessions.slice(1).map((session) => session.id);
    await knex("tables_sessions")
      .whereIn("id", staleOpenSessions)
      .update({ closed_at: knex.fn.now() });
  }

  if (openFirstTableSessions.length === 0) {
    await knex("tables_sessions").insert({
      table_id: firstTable.id,
      opened_at: knex.fn.now(),
    });
  }
}
