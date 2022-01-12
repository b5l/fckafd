import { singleton } from 'tsyringe';
import { Connection, createConnection } from 'typeorm';
import FacebookPost from './entity/FacebookPost';
import FacebookPage from './entity/FacebookPage';

@singleton()
export default class Database {
    public connection: Connection;

    async init() {
        this.connection = await createConnection();
    }

    async close() {
        await this.connection.close();
    }

    public async addPage(pageId) {
        const pagesRepo = this.connection.getRepository(FacebookPage);
        await pagesRepo.insert({ pageId });
    }

    public async getPages() {
        const pagesRepo = this.connection.getRepository(FacebookPage);
        const pages = await pagesRepo.find();
        console.log(pages);
    }

    public savePost(pageId: number, post: FacebookPost) {

    }
}
