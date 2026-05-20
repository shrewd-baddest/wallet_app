"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verify = exports.sign = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const EXPIRES = process.env.JWT_EXPIRES_IN || '7d';
const sign = (payload) => jsonwebtoken_1.default.sign(payload, SECRET, { expiresIn: EXPIRES });
exports.sign = sign;
const verify = (token) => jsonwebtoken_1.default.verify(token, SECRET);
exports.verify = verify;
