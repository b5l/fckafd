import { autoInjectable } from 'tsyringe';
import FacebookPage from '~db/entity/FacebookPage';
import Database from '~db/Database';

@autoInjectable()
export default class FacebookPageService {
    constructor(
        private database: Database
    ) {}

    private get repository() {
        return this.database.connection.getRepository(FacebookPage);
    }

    async addPage(pageId: string): Promise<void> {
        await this.repository.insert({
            pageId
        });
    }

    async getAllPages(): Promise<FacebookPage[]> {
        return this.repository.find();
    }

    async getPage(pageId: string): Promise<FacebookPage> {
        return this.repository.findOne({ pageId });
    }
}
