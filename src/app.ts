import 'source-map-support/register';
import 'reflect-metadata';

import { initDependencies } from '~lib/dependencyInjection';
import { container } from 'tsyringe';
import SchedulerService from '~services/SchedulerService';

const CHECK_INTERVAL = 15 * 60 * 1000;

(async () => {
    console.log('Starting up...');
    await initDependencies();
    console.log('Up!')

    const schedulerService = container.resolve(SchedulerService);
    await schedulerService.run();

    setInterval(schedulerService.run.bind(schedulerService), CHECK_INTERVAL);
})().catch(console.error);

