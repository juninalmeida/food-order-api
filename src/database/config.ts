import path from "node:path";
import type { Knex } from "knex";

function resolveDatabasePath() {
  const configuredPath = process.env.DATABASE_PATH ?? "./src/database/database.db";
  return path.resolve(process.cwd(), configuredPath);
}

function resolveMigrationsDirectory(useSourceFiles: boolean) {
  const directory = useSourceFiles
    ? "./src/database/migrations"
    : "./dist/database/migrations";

  return path.resolve(process.cwd(), directory);
}

function resolveSeedsDirectory(useSourceFiles: boolean) {
  const directory = useSourceFiles
    ? "./src/database/seeds"
    : "./dist/database/seeds";

  return path.resolve(process.cwd(), directory);
}

export function getDatabaseConfig(useSourceFiles: boolean): Knex.Config {
  return {
    client: "sqlite3",
    connection: {
      filename: resolveDatabasePath(),
    },
    pool: {
      afterCreate: (connection: any, done: any) => {
        connection.run("PRAGMA foreign_keys = ON");
        done();
      },
    },
    useNullAsDefault: true,
    migrations: {
      directory: resolveMigrationsDirectory(useSourceFiles),
      loadExtensions: [useSourceFiles ? ".ts" : ".js"],
    },
    seeds: {
      directory: resolveSeedsDirectory(useSourceFiles),
      loadExtensions: [useSourceFiles ? ".ts" : ".js"],
    },
  };
}
