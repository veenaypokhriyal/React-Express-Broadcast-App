"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const items_controller_1 = require("../controllers/items.controller");
const router = (0, express_1.Router)();
router.get('/count', items_controller_1.getNotificationCount);
router.get('/', items_controller_1.getNotifications);
router.post('/:id/read', items_controller_1.markAsRead);
exports.default = router;
