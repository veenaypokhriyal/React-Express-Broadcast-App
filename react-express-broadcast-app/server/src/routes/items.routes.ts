import { Router } from 'express';
import { getNotificationCount, getNotifications, markAsRead } from '../controllers/items.controller';

const router = Router();

router.get('/count', getNotificationCount);
router.get('/', getNotifications);
router.post('/:id/read', markAsRead);

export default router;