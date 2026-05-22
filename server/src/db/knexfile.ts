import 'dotenv/config';
import path from 'path';
import type { Knex } from 'knex';

// Load env from project root when running knex CLI from db directory
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const base: Knex.Config = {
  client: 'mysql2',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    database: process.env.DB_NAME || 'mvp_wallet',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
      ssl: {
        rejectUnauthorized: false, 
      },
    charset: 'utf8mb4',
  },
  pool: { min: 2, max: 10 },
  migrations: {
    directory: path.join(__dirname, 'migrations'),
    tableName: 'knex_migrations',
    extension: 'ts',
  },
  seeds: {
    directory: path.join(__dirname, 'seeds'),
    extension: 'ts',
  },
};

const config: Record<string, Knex.Config> = {
  development: { ...base, debug: false },
  test: {
    ...base,
    connection: { ...(base.connection as object), database: 'mvp_wallet_test' },
  },
  production: {
    ...base,
    pool: { min: 2, max: 20 },
    connection: { ...(base.connection as object), ssl: { rejectUnauthorized: false } },
  },
};

export default config;
