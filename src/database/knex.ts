import { knex as knexConfig } from "knex";

import { getDatabaseConfig } from "./config";

const useSourceFiles = __filename.endsWith(".ts");

export const knex = knexConfig(getDatabaseConfig(useSourceFiles));
