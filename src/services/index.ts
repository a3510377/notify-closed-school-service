import { DataSource } from 'typeorm';
import { Express } from 'express';

import { setup as setupDiscord } from './discord';
import { Notify } from './notify';
import { DB } from '@/database';
import { CustomClient } from './discord/client';
import { createServer } from './server';

export class Services {
  readonly DB: DataSource;
  readonly notify: Notify;
  readonly discordClient: CustomClient;
  readonly server: Express;

  constructor() {
    this.DB = DB;
    this.notify = new Notify();
    this.discordClient = setupDiscord(this.notify);
    this.server = createServer();
  }

  async setup() {
    await this.DB.initialize();

    const port = process.env.PORT ?? 8080;
    this.server.listen(port, () => {
      console.log(`Server is running at http://localhost:${port}`);
    });

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
