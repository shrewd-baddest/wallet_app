"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_1 = __importDefault(require("./app"));
const db_1 = __importDefault(require("./db"));
const logger_1 = __importDefault(require("./utils/logger"));
const PORT = process.env.PORT || 5000;
const start = async () => {
    try {
        await db_1.default.raw('SELECT 1');
        logger_1.default.info('✅ Database connected');
        app_1.default.listen(PORT, () => {
            logger_1.default.info(`🚀 MVP Wallet API running on port ${PORT} [${process.env.NODE_ENV}]`);
        });
    }
    catch (err) {
        logger_1.default.error('❌ Failed to start server:', err.message);
        process.exit(1);
    }
};
process.on('SIGTERM', async () => {
    logger_1.default.info('SIGTERM received — shutting down gracefully');
    await db_1.default.destroy();
    process.exit(0);
});
start();
