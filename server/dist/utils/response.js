"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = exports.error = exports.success = void 0;
const success = (res, data = {}, message = 'Success', statusCode = 200) => {
    res.status(statusCode).json({ success: true, message, data });
};
exports.success = success;
const error = (res, message = 'An error occurred', statusCode = 500, errors = null) => {
    const body = { success: false, message };
    if (errors)
        body.errors = errors;
    res.status(statusCode).json(body);
};
exports.error = error;
class AppError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
