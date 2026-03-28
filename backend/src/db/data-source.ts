import 'dotenv/config';
import { DataSource } from 'typeorm';
import { join } from 'path';
import { getTypeOrmConfig } from './typeorm.config';

export const AppDataSource = new DataSource({
  ...getTypeOrmConfig(),
  entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
  migrations: [join(__dirname, '..', 'migrations', '*.{ts,js}')],
});
