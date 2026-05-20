"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("../utils/logger"));
const response_1 = require("../utils/response");
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const errorHandler = (err, req, res, _next) => {
    logger_1.default.error(err.message, { stack: err.stack, path: req.path });
    const statusCode = err.statusCode || 500;
    const message = err.isOperational
        ? err.message
        : 'Something went wrong. Please try again.';
    (0, response_1.error)(res, message, statusCode);
};
exports.default = errorHandler;
