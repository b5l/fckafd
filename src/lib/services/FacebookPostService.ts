import path from 'path';
import fs from 'fs';
import fetch from 'node-fetch';
import { format } from 'date-fns';

import { autoInjectable } from 'tsyringe';
import FacebookPost from '~db/entity/FacebookPost';
import Database from '~db/Database';
import FacebookPageService from '~services/FacebookPageService';
import PuppeteerService from '~services/PuppeteerService';
import { MoreThan } from 'typeorm';

// Check posts for max 7 days
const MAX_POST_AGE_IN_DAYS = 7;
const POST_IMG_ROOT_DIR = path.resolve(require.main.path, `../posts`);

@autoInjectable()
export default class FacebookPostService {
    constructor(
        private database: Database,
        private facebookPageService: FacebookPageService,
        private puppeteerService: PuppeteerService,
    ) {}

    private get repository() {
        return this.database.connection.getRepository(FacebookPost);
    }

    async screenshotPostAndPersist(post: FacebookPost) {
        const dbPost = await this.getPost(post.facebookPage.pageId, post.identifier);
        if (dbPost) return;

        console.log(`    - Screenshotting ${post.url}`);
        const screenshot = await this.puppeteerService.screenshotPost(post.url);
        const filePath = _getScreenshotLocationForPost(post);
        const baseDir = path.dirname(filePath);
        await fs.promises.mkdir(baseDir, { recursive: true });
        await fs.promises.writeFile(filePath, screenshot);

        return this.repository.insert(post);
    }

    async markDeleted(post: FacebookPost) {
        const oldPath = _getScreenshotLocationForPost(post, 'active');
        const newPath = _getScreenshotLocationForPost(post, 'deleted');
        await fs.promises.mkdir(path.dirname(newPath), { recursive: true });
        await fs.promises.rename(oldPath, newPath);
        await this.repository.update({ id: post.id }, { deleted: true });
    }

    async getRecentPosts() {
        const oldestPostDate = new Date();
        oldestPostDate.setDate(oldestPostDate.getDate() - MAX_POST_AGE_IN_DAYS);
        return this.repository.find({
            where: {
                createdAt: MoreThan(format(oldestPostDate, 'yyyy-MM-dd kk:mm:ss.SSS'))
            },
            relations: ['facebookPage']
        })
    }

    async getPostsForPage(pageId: string) {
        const facebookPage = await this.facebookPageService.getPage(pageId);
        return this.repository.find({
            where: {
                facebookPage: {
                    id: facebookPage.id
                }
            }
        });
    }

    async getPost(pageId: string, identifier: string) {
        const facebookPage = await this.facebookPageService.getPage(pageId);
        return this.repository.findOne({
            where: {
                identifier,
                facebookPage: {
                    id: facebookPage.id
                }
            }
        });
    }
}

function _getScreenshotLocationForPost(post: FacebookPost, subDir: string = 'active') {
    return path.join(
        POST_IMG_ROOT_DIR,
        subDir,
        `./${post.facebookPage.pageId}/${post.identifier}.png`
    );
}
