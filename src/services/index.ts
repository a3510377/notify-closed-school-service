import { DataSource } from 'typeorm';

import { setup as setupDiscord } from './discord';
import { Notify } from './notify';
import { DB } from '@/database';
import { CustomClient } from './discord/client';

export class Services {
  readonly DB: DataSource;
  readonly notify: Notify;
  readonly discordClient: CustomClient;

  constructor() {
    this.DB = DB;
    this.notify = new Notify();
    this.discordClient = setupDiscord(this.notify);
  }

  async setup() {
    await this.DB.initialize();

    await this.discordClient.login(process.env.DISCORD_TOKEN).then(async () => {
      return await new Promise((resolve) => {
        // wait discord client connect
        this.discordClient.on('ready', resolve);
      });
    });
  }
}

export const services = new Services();
export default services;
