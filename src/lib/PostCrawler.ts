import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import { PublicPostJSON } from '~@types/crawler/PublicPost';
import FacebookPost from '~db/entity/FacebookPost';
import FacebookPage from '~db/entity/FacebookPage';

const PAGE_URL_PREFIX = 'https://facebook.com';

// TODO: This worked once, then the next day it didn't. We should find out why, since this is a much more elegant and
//       robust solution than using puppeteer.
export default class PostCrawler {
    constructor(
        public facebookPage: FacebookPage
    ) {}

    async getLatestPosts() {
        const url = `${PAGE_URL_PREFIX}/${this.facebookPage.pageId}`;
        const response = await fetch(url);
        const body = await response.text();

        const $ = cheerio.load(body);
        const ldJsons = $('script[type="application/ld+json"]');

        const postObjs = [];
        ldJsons.each((_, elem) => {
            const postObj = JSON.parse($(elem).contents().first().text());
            if (postObj['@type'] === 'SocialMediaPosting') postObjs.push(postObj);
        });

        console.log(postObjs);
        return postObjs.map(postJson => parsePublicPost(postJson));
    }
}

export function parsePublicPost(publicPost: PublicPostJSON): FacebookPost {
    return Object.assign(new FacebookPost(), {
        url: publicPost.url,
        identifier: publicPost.identifier,
        articleBody: publicPost.articleBody,
        dateCreated: new Date(publicPost.dateCreated),
        dateModified: new Date(publicPost.dateModified),
        facebookPage: this.facebookPage
    });
}

// export class FacebookPost {
//     public url: string;
//     public identifier: string;
//     public articleBody: string;
//     public dateCreated: Date;
//     public dateModified: Date;
//
//     constructor(publicPost: PublicPostJSON | string) {
//         this.parsePublicPost(publicPost);
//     }
//
//     public async checkStillExists() {
//         const response = await fetch(this.url, { method: 'HEAD' });
//         return response.status === 200;
//     }
//
//     private parsePublicPost(publicPost: PublicPostJSON | string) {
//         if (typeof publicPost === 'string')
//             return this.parsePublicPost(JSON.parse(publicPost));
//
//         this.url = publicPost.url;
//         this.identifier = publicPost.identifier;
//         this.articleBody = publicPost.articleBody;
//         this.dateCreated = new Date(publicPost.dateCreated);
//         this.dateModified = new Date(publicPost.dateModified);
//     }
// }

