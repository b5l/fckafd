import { autoInjectable, singleton } from 'tsyringe';

import FacebookPageService from '~services/FacebookPageService';
import PuppeteerService from '~services/PuppeteerService';
import FacebookPostService from '~services/FacebookPostService';

@singleton()
export default class SchedulerService {
    private errorCount = 0;

    constructor(
        private puppeteerService: PuppeteerService,
        private facebookPageService: FacebookPageService,
        private facebookPostService: FacebookPostService,
    ) {}

    public async run(): Promise<void> {
        try {
            await this._runJob();
            this.errorCount = 0;
        } catch (err) {
            console.error(err);
            // Quick and dirty mechanism to not run endlessly in case anything gets messed up badly
            if (this.errorCount === 10) throw err;
            this.errorCount++;
        }
    }

    private async _runJob() {
        // Screenshot everything new
        console.log('Scraping Facebook pages')
        const facebookPages = await this.facebookPageService.getAllPages();
        for (const facebookPage of facebookPages) {
            console.log(`  - Fetching posts for ${facebookPage.pageId}`)
            try {
                const latestPosts = await this.puppeteerService.getLatestPosts(facebookPage);
                for (const post of latestPosts) {
                    try {
                        await this.facebookPostService.screenshotPostAndPersist(post);
                    } catch (err) {
                        console.error(`!! Error screenshotting ${post.url}`, err);
                        // ignore so it still goes on with the other posts
                    }
                }
            } catch (err) {
                console.error(`!! Error getting posts of ${facebookPage.pageId}`, err);
                // ignore so it still goes on with the other pages
            }
        }

        // Check for deletion
        console.log('Checking post deletion statuses')
        const recentPosts = await this.facebookPostService.getRecentPosts();
        for (const post of recentPosts) {
            if (await this.puppeteerService.checkPostDeleted(post)) {
                console.log(`  - Deleted post found! ${post.url}`)
                await this.facebookPostService.markDeleted(post);
            }
        }
    }
}
