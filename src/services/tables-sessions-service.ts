import { TablesSessionsRepository } from "@/repositories/tables-sessions-repository";
import { AppError } from "@/utils/app-error";

class TablesSessionsService {
  constructor(
    private readonly tablesSessionsRepository: TablesSessionsRepository,
  ) {}

  async index() {
    return this.tablesSessionsRepository.findAllOrderedByClosedAt();
  }

  async create(tableId: number) {
    const latestSession =
      await this.tablesSessionsRepository.findLatestByTableId(tableId);

    if (latestSession && !latestSession.closed_at) {
      throw new AppError("There is already an open session for this table.");
    }

    await this.tablesSessionsRepository.create(tableId);
  }

  async close(id: number) {
    const session = await this.tablesSessionsRepository.findById(id);

    if (!session) {
      throw new AppError("Session not found.", 404);
    }

    if (session.closed_at) {
      throw new AppError("Session is already closed.");
    }

    await this.tablesSessionsRepository.closeById(id);
  }
}

export { TablesSessionsService };
