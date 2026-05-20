"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const path_1 = __importDefault(require("path"));
// Load env from project root when running knex CLI from db directory
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
const base = {
    client: 'mysql2',
    connection: {
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 3306,
        database: process.env.DB_NAME || 'mvp_wallet',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        charset: 'utf8mb4',
    },
    pool: { min: 2, max: 10 },
    migrations: {
        directory: path_1.default.join(__dirname, 'migrations'),
        tableName: 'knex_migrations',
        extension: 'ts',
    },
    seeds: {
        directory: path_1.default.join(__dirname, 'seeds'),
        extension: 'ts',
    },
};
const config = {
    development: { ...base, debug: false },
    test: {
        ...base,
        connection: { ...base.connection, database: 'mvp_wallet_test' },
    },
    production: {
        ...base,
        pool: { min: 2, max: 20 },
        connection: { ...base.connection, ssl: { rejectUnauthorized: false } },
    },
};
exports.default = config;
