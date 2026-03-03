import { api } from "../api.js";
import { Table, TableSession } from "../types.js";

class TablesRepository {
  async findAll() {
    return api.getTables() as Promise<Table[] | null>;
  }

  async findSessions() {
    return api.getSessions() as Promise<TableSession[] | null>;
  }

  async openSession(tableId: number) {
    return api.openSession(tableId);
  }

  async closeSession(sessionId: number) {
    return api.closeSession(sessionId);
  }
}

export { TablesRepository };
