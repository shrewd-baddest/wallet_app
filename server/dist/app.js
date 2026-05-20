"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const logger_1 = __importDefault(require("./utils/logger"));
const errorHandler_1 = __importDefault(require("./middleware/errorHandler"));
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const wallet_routes_1 = __importDefault(require("./modules/wallet/wallet.routes"));
const transactions_routes_1 = __importDefault(require("./modules/transactions/transactions.routes"));
const transfers_routes_1 = __importDefault(require("./modules/transfers/transfers.routes"));
const mpesa_routes_1 = __importDefault(require("./modules/mpesa/mpesa.routes"));
const admin_routes_1 = __importDefault(require("./modules/admin/admin.routes"));
const dashboard_routes_1 = __importDefault(require("./modules/dashboard/dashboard.routes"));
const app = (0, express_1.default)();
// ── Security headers ───────────────────────────────────────────────────────
app.use((0, helmet_1.default)());
// ── CORS ───────────────────────────────────────────────────────────────────
app.use((0, cors_1.default)({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    credentials: true,
}));
// ── Body parsing ───────────────────────────────────────────────────────────
app.use(express_1.default.json({ limit: '2mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// ── HTTP logging ───────────────────────────────────────────────────────────
app.use((0, morgan_1.default)('combined', {
    stream: { write: (msg) => logger_1.default.http(msg.trim()) },
    skip: () => process.env.NODE_ENV === 'test',
}));
// ── Global rate limiter ────────────────────────────────────────────────────
app.use((0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: { success: false, message: 'Too many requests, please try again later.' },
}));
app.use('/api/auth', (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { success: false, message: 'Too many auth attempts, please wait.' },
}));
// ── Health check ───────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), env: process.env.NODE_ENV });
});
// ── API routes ─────────────────────────────────────────────────────────────
app.use('/api/auth', auth_routes_1.default);
app.use('/api/wallet', wallet_routes_1.default);
app.use('/api/transactions', transactions_routes_1.default);
app.use('/api/transfers', transfers_routes_1.default);
app.use('/api/mpesa', mpesa_routes_1.default);
app.use('/api/dashboard', dashboard_routes_1.default);
app.use('/api/admin', admin_routes_1.default);
// ── 404 handler ────────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found` });
});
// ── Global error handler ───────────────────────────────────────────────────
app.use(errorHandler_1.default);
exports.default = app;
