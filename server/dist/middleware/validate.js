"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const response_1 = require("../utils/response");
const validate = (req, res, next) => {
    const result = (0, express_validator_1.validationResult)(req);
    if (result.isEmpty()) {
        next();
        return;
    }
    const errors = result.array().map((e) => ({ field: e.path, message: e.msg }));
    (0, response_1.error)(res, 'Validation failed', 422, errors);
};
exports.default = validate;
