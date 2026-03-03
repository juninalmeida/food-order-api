import { bootstrapDatabase } from "../database/bootstrap";

async function start() {
  await bootstrapDatabase();
  await import("../server.js");
}

void start().catch((error) => {
  console.error("Application startup failed:", error);
  process.exit(1);
});
