"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAsRead = exports.getUnreadCount = exports.getNotifications = void 0;
// Mocked in-memory data to keep the backend self-contained for the demo.
const notifications = [
    { id: 1, message: 'Your report is ready to download.', read: false },
    { id: 2, message: 'A teammate mentioned you in a comment.', read: false },
    { id: 3, message: 'Your weekly summary is available.', read: false },
    { id: 4, message: 'System maintenance is scheduled for tonight.', read: false },
];
const getNotifications = () => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] Notification list retrieved`);
    return notifications;
};
exports.getNotifications = getNotifications;
const getUnreadCount = () => {
    const unreadCount = notifications.filter((notification) => !notification.read).length;
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] Unread notification count: ${unreadCount}`);
    return unreadCount;
};
exports.getUnreadCount = getUnreadCount;
const markAsRead = (id) => {
    const notification = notifications.find((item) => item.id === id);
    if (!notification) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] Notification not found: ${id}`);
        return false;
    }
    notification.read = true;
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] Notification marked as read: ${id}`);
    return true;
};
exports.markAsRead = markAsRead;
