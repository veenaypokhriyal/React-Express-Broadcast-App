import { Request, Response } from 'express';
import * as itemService from '../services/items.service';
import { Notification } from '../types';

export const getNotifications = (_req: Request, res: Response): void => {
    const notifications: Notification[] = itemService.getNotifications();
    res.json(notifications);
};

export const getNotificationCount = (_req: Request, res: Response): void => {
    res.json({ count: itemService.getUnreadCount() });
};

export const markAsRead = (req: Request, res: Response): void => {
    const id = Number(req.params.id);

    if (!Number.isFinite(id)) {
        res.status(400).json({ message: 'Invalid notification id' });
        return;
    }

    const status = itemService.markAsRead(id);
    res.json(status);
};