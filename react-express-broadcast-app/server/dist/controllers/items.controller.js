"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAsRead = exports.getNotificationCount = exports.getNotifications = void 0;
const itemService = __importStar(require("../services/items.service"));
const getNotifications = (_req, res) => {
    const notifications = itemService.getNotifications();
    res.json(notifications);
};
exports.getNotifications = getNotifications;
const getNotificationCount = (_req, res) => {
    res.json({ count: itemService.getUnreadCount() });
};
exports.getNotificationCount = getNotificationCount;
const markAsRead = (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
        res.status(400).json({ message: 'Invalid notification id' });
        return;
    }
    const status = itemService.markAsRead(id);
    res.json(status);
};
exports.markAsRead = markAsRead;
