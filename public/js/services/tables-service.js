import { TablesRepository } from "../repositories/tables-repository.js";
class TablesService {
    tablesRepository;
    constructor(tablesRepository) {
        this.tablesRepository = tablesRepository;
    }
    async loadTablesAndSessions() {
        const [tables, sessions] = await Promise.all([
            this.tablesRepository.findAll(),
            this.tablesRepository.findSessions(),
        ]);
        if (!tables || !sessions) {
            return null;
        }
        return { tables, sessions };
    }
    async openAndResolveSessionId(tableId) {
        const openSessionResult = await this.tablesRepository.openSession(tableId);
        if (openSessionResult === null) {
            return null;
        }
        const sessions = await this.tablesRepository.findSessions();
        if (!sessions) {
            return null;
        }
        const latestSession = [...sessions]
            .reverse()
            .find((session) => session.table_id === tableId && !session.closed_at);
        return latestSession?.id ?? null;
    }
    async closeSession(sessionId) {
        return this.tablesRepository.closeSession(sessionId);
    }
    getActiveSessions(sessions) {
        return sessions.filter((session) => !session.closed_at);
    }
    findSessionForTable(tableId, activeSessions) {
        return activeSessions.find((session) => session.table_id === tableId);
    }
    findPreferredTable(tables, tableNumber) {
        return tables.find((table) => table.table_number === tableNumber) ?? tables[0];
    }
}
const tablesService = new TablesService(new TablesRepository());
export { TablesService, tablesService };
