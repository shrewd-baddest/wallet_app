"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../middleware/auth");
const Dashoard_1 = require("../../controllers/Dashoard");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate, auth_1.requireVerified);
router.get('/', Dashoard_1.getDashboard);
exports.default = router;
