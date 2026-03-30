import { DataSourceOptions } from 'typeorm';

const isProd = process.env.NODE_ENV === 'production';

export function getTypeOrmConfig(): DataSourceOptions {
  if (isProd) {
    return {
      type: 'postgres',
      url: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      synchronize: false,
    };
  }

  return {
    type: 'sqlite',
    database: 'db.sqlite',
    synchronize: true,
  };
}
