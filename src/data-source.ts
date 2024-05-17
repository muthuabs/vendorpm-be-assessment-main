import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import { join } from 'path';
import { config } from 'dotenv';
import { User } from './entities/User';
import { Post } from './entities/Post';
import { OptimisticLockingSubscriber } from './entities/subscribers/OptimisticLockingSubscriber';

config({ path: '.env' });

const testConfig: Partial<DataSourceOptions> = {
  database: ':memory:',
  migrationsRun: true,
};

const prodConfig: Partial<DataSourceOptions> = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
  username: process.env.DB_USER || 'pmvendor',
  password: process.env.DB_PASSWORD || 'pmvendor',
  database: process.env.DB_NAME || 'pmvendor',
  migrationsRun: false,
  synchronize: true,
};

const mainConfig: DataSourceOptions = {
  type: 'sqlite',
  database: 'database.sqlite',
  synchronize: false,
  logging: false,
  entities: [User, Post],
  // We use dirname here to prevent it attempting to load the ts files after compilation in js mode
  migrations: [join(__dirname, 'migrations/*.{ts,js}')],
  migrationsRun: false,
  migrationsTransactionMode: 'each',
  metadataTableName: 'typeorm-migrations',
  subscribers: [OptimisticLockingSubscriber],
};

const getDataSourceOptions = (): DataSourceOptions => {
  if (process.env.NODE_ENV === 'test') {
    return { ...mainConfig, ...testConfig } as DataSourceOptions;
  }
  if (process.env.NODE_ENV === 'production') {
    return { ...mainConfig, ...prodConfig } as DataSourceOptions;
  }
  return mainConfig;
};

export const AppDataSource = new DataSource(getDataSourceOptions());

let dataSource: DataSource | null = null;

/**
 * Since DataSource's are meant to be only initialized once but our lambdas are called many times, we need to make sure
 * we don't call initialize multiple times
 */
export async function getDataSource(): Promise<DataSource> {
  if (dataSource) {
    return dataSource;
  }

  dataSource = await AppDataSource.initialize();

  return dataSource;
}

/**
 * Closes the data source if it has been initialized
 */
export async function closeDataSource(): Promise<void> {
  if (dataSource) {
    await dataSource.destroy();

    dataSource = null;
  }
}
