import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { mkdirSync } from 'fs';
import path from 'path';

import { DATABASE_PATH } from '@/utils/variables';
import { DiscordModel } from './discord';

mkdirSync(path.dirname(DATABASE_PATH), { recursive: true });
export const DB = new DataSource({
  type: 'sqlite',
  database: DATABASE_PATH,
  synchronize: true,
  logging: false,
  entities: [DiscordModel],
});
