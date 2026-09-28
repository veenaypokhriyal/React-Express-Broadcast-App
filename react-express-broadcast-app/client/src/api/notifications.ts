import client from './client';
import { Notification, NotificationReadResponse } from '../types';

export const getNotificationCount = async (): Promise<number> => {
  const { data } = await client.get<{ count: number }>('/notifications/count');
  return data.count;
};

export const getNotifications = async (): Promise<Notification[]> => {
  const { data } = await client.get<Notification[]>('/notifications');
  return data;
};

export const markNotificationAsRead = async (id: number): Promise<NotificationReadResponse> => {
  const { data } = await client.post<NotificationReadResponse>(`/notifications/${id}/read`);
  return data;
};