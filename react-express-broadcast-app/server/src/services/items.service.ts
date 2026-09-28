import { Notification } from '../types';

// Mocked in-memory data to keep the backend self-contained for the demo.
const notifications: Notification[] = [
    { id: 101, message: 'Your report is ready to download.', read: false },
    { id: 201, message: 'A teammate mentioned you in a comment.', read: false },
    { id: 301, message: 'Your weekly summary is available.', read: false },
    { id: 401, message: 'System maintenance is scheduled for tonight.', read: false },
];

export const getNotifications = (): Notification[] => {
    const timestamp = new Date().toISOString();
    //console.log(`[${timestamp}] Notification list retrieved`);
    return notifications;
};

export const getUnreadCount = (): number => {
    const unreadCount = notifications.filter((notification) => !notification.read).length;
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] API Call - Unread notification count: ${unreadCount}`);
    return unreadCount;
};

export const markAsRead = (id: number): boolean => {
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