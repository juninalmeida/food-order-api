import { api } from "../api.js";
class TablesRepository {
    async findAll() {
        return api.getTables();
    }
    async findSessions() {
        return api.getSessions();
    }
    async openSession(tableId) {
        return api.openSession(tableId);
    }
    async closeSession(sessionId) {
        return api.closeSession(sessionId);
    }
}
export { TablesRepository };
