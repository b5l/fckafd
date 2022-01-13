import puppeteer from 'puppeteer';
import { promises as fs } from 'fs';
import path from 'path';
import { inject, singleton } from 'tsyringe';
import FacebookPost from '~db/entity/FacebookPost';
import FacebookPage from '~db/entity/FacebookPage';

const FACEBOOK_URL = 'https://facebook.com';
const COOKIES_PATH = path.resolve(path.basename(require.main.path), '../cookies.txt');

@singleton()
export default class PuppeteerService {
    private browser: puppeteer.Browser;
    private rootPage: puppeteer.Page;

    constructor(
        @inject('facebookCredentials') private credentials: { email: string; password: string }
    ) {}

    async init() {
        this.browser = await puppeteer.launch({
            headless: true,
            args: ['--disable-notifications'],
            defaultViewport: {
                width: 1000,
                height: 800
            }
        });
        this.rootPage = await this.browser.newPage();

        await this.loadCookies();
        await this.rootPage.goto(FACEBOOK_URL, { waitUntil: 'networkidle0' });
        await this.acceptCookies();
        await this.loginIfNeeded();
    }

    async screenshotPost(url: string) {
        const POST_SELECTOR = '[role="article"] > div > div > div > div > div';
        const WATCH_FEED_SELECTOR = '#watch_feed > div > div[class=""] > div[style] > div > div';

        const page = await this.browser.newPage();
        await page.goto(url);
        await page.waitForNetworkIdle();

        const watchFeedElem = await page.$(WATCH_FEED_SELECTOR);
        const postElem = await page.$(POST_SELECTOR);

        if (watchFeedElem) {
            const seeMoreBtn = await watchFeedElem.$('span[dir="auto"] > div[role="button"][tabindex="0"]');
            if (seeMoreBtn) await seeMoreBtn.click();
        }

        let screenshottedElem = watchFeedElem || postElem;
        let top, left, width, height;
        if (screenshottedElem) {
            ({ top, left, width, height } = await screenshottedElem.evaluate(elem => {
                const boundingClientRect = elem.getBoundingClientRect();
                return {
                    top: boundingClientRect.top + window.scrollY,
                    left: boundingClientRect.left + window.scrollX,
                    width: boundingClientRect.width,
                    height: boundingClientRect.height,
                };
            }));
        } else {
            console.error(`Could not screenshot element for ${url}! Taking picture of whole viewport...`);
            ({ top, left, width, height } = {
                top: 0,
                left: 0,
                width: page.viewport().width,
                height: page.viewport().height,
            });
        }

        const screenshot = await page.screenshot({
            captureBeyondViewport: true,
            type: 'png',
            clip: {
                x: left,
                y: top,
                width,
                height
            }
        });
        await page.close();
        return screenshot;
    }

    async getLatestPosts(facebookPage: FacebookPage): Promise<FacebookPost[]> {
        const page = await this.browser.newPage();
        await page.goto(`${FACEBOOK_URL}/${facebookPage.pageId}`);
        await page.waitForNetworkIdle();
        await this.loginIfNeeded(page);
        await page.evaluate(() => window.scrollBy(0, document.body.scrollHeight));
        await page.waitForNetworkIdle();

        const domPosts = await page.$$('[role="article"][aria-labelledby]');
        const posts: FacebookPost[] = [];
        for (const domPost of domPosts) {
            const linkElem = await domPost.$('div > div > div > div > div > div > div > span[dir="auto"] > span > span > span > a[href]');
            const postUrl = await linkElem.evaluate(elem => elem.getAttribute('href'));
            const facebookPost = new FacebookPost();
            const { url, identifier } = cleanUpPostUrl(postUrl);
            facebookPost.url = url;
            facebookPost.identifier = identifier;
            facebookPost.deleted = false;
            facebookPost.facebookPage = facebookPage;
            posts.push(facebookPost);
        }

        await page.close();
        return posts;
    }

    // private functions
    private async loadCookies() {
        try {
            const rawCookies = await fs.readFile(COOKIES_PATH, 'utf-8')
            const cookies = JSON.parse(rawCookies);
            await this.rootPage.setCookie(...cookies);
        } catch (err) {
            // ignore if cookies don't exist
            // todo: check whether it's actually a file not found error or something other
        }
    }

    private async saveCookies() {
        await fs.writeFile(COOKIES_PATH, JSON.stringify(await this.rootPage.cookies()), 'utf-8');
    }

    private async acceptCookies() {
        const acceptButton = await this.rootPage.$('[data-cookiebanner="accept_button"]');
        if (acceptButton == null) return;
        await acceptButton.evaluate(elem => elem.scrollIntoView());
        await acceptButton.click();
    }

    private async loginIfNeeded(page = this.rootPage) {
        if (await page.$('input[name=email]') == null) return;

        await page.type('input[name=email]', this.credentials.email);
        await page.type('input[name=pass]', this.credentials.password);
        await page.click('button[name=login]');

        await page.waitForNavigation({
            waitUntil: 'load'
        });

        if (await page.$('input[name=email]') != null) {
            throw new Error('Login failed');
        }

        await this.saveCookies();
    }

    public async close() {
        await this.saveCookies();
        await this.browser.close();
    }
}

function cleanUpPostUrl(postUrl: string): { url: string; identifier: string } {
    const url = new URL(postUrl);
    url.search = '';
    return {
        url: url.toString(),
        identifier: path.basename(url.pathname)
    };
}
