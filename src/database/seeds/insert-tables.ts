import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  await knex("tables_sessions").del();
  await knex("tables").del();

  const tables = await knex("tables").insert([
    { table_number: 1 },
    { table_number: 2 },
    { table_number: 3 },
    { table_number: 4 },
    { table_number: 5 },
  ]).returning("id");

  // Create an active session for table 2 to test "Occupied" state in UI
  if (tables && tables.length >= 2) {
    const tableId = typeof tables[1] === 'object' ? tables[1].id : tables[1];
    
    await knex("tables_sessions").insert([
        { table_id: tableId, opened_at: Date.now() }
    ]);
  }
}
