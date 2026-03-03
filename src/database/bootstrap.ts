import { knex as createKnex } from "knex";
import { getDatabaseConfig } from "./config";

export async function bootstrapDatabase() {
  const useSourceFiles = __filename.endsWith(".ts");
  const bootstrapKnex = createKnex(getDatabaseConfig(useSourceFiles));

  try {
    await bootstrapKnex.migrate.latest();
    await bootstrapKnex.seed.run();
  } finally {
    await bootstrapKnex.destroy();
  }
}
