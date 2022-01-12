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
        const facebookPages = await this.facebookPageService.getAllPages();
        for (const facebookPage of facebookPages) {
            const latestPosts = await this.puppeteerService.getLatestPosts(facebookPage);
            for (const post of latestPosts) {
                await this.facebookPostService.screenshotPostAndPersist(post);
            }
        }

        // Check for deletion
        const recentPosts = await this.facebookPostService.getRecentPosts();
        for (const post of recentPosts) {
            if (!await this.facebookPostService.checkStillExists(post)) {
                await this.facebookPostService.markDeleted(post);
            }
        }
    }
}
