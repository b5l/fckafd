import fs from 'fs';
import path from 'path';
import { container } from 'tsyringe';

import Database from '~db/Database';
import PuppeteerService from '~services/PuppeteerService';

export async function initDependencies() {
    // Register everything BEFORE first resolve
    const credentialsPath = path.resolve(require.main.path, '../credentials.json');
    const credentialsRaw = await fs.promises.readFile(credentialsPath, 'utf-8');
    await container.register('facebookCredentials', {
        useValue: JSON.parse(credentialsRaw)
    });

    // Initialize
    await container.resolve(Database).init();
    await container.resolve(PuppeteerService).init();
}
