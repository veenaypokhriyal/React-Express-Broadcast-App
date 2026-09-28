import React from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { getNotifications, markNotificationAsRead } from '../api/notifications';
import { Notification } from '../types';

interface NotificationListProps {
  onNotificationRead: (count: number) => void;
}

const NotificationList: React.FC<NotificationListProps> = ({ onNotificationRead }) => {
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery<Notification[]>(['notifications'], getNotifications, {
    refetchOnWindowFocus: false,
  });

  const mutation = useMutation(markNotificationAsRead, {
    onSuccess: (status, notificationId) => {
      if (!status) {
        return;
      }

      let shouldDecrementCount = false;

      // Update the list cache locally so the UI changes without a refetch.
      queryClient.setQueryData<Notification[] | undefined>(['notifications'], (current) => {
        if (!current) {
          return current;
        }

        return current.map((notification) => {
          if (notification.id !== notificationId) {
            return notification;
          }

          if (!notification.read) {
            shouldDecrementCount = true;
          }

          return { ...notification, read: true };
        });
      });

      if (!shouldDecrementCount) {
        return;
      }

      const currentCount = queryClient.getQueryData<number>(['notificationCount']) ?? 0;
      const nextCount = Math.max(0, currentCount - 1);
      onNotificationRead(nextCount);
    },
  });

  const handleClick = (id: number) => {
    mutation.mutate(id);
  };

  if (isLoading) {
    return <div className="panel">Loading notifications...</div>;
  }

  if (isError) {
    return <div className="panel error">Failed to load notifications.</div>;
  }

  return (
    <section className="panel">
      <h2>Notification list</h2>
      <ul className="notification-list">
        {data?.map((notification) => (
          <li key={notification.id}>
            <button
              type="button"
              className={`notification-item ${notification.read ? 'read' : 'unread'}`}
              onClick={() => handleClick(notification.id)}
              disabled={mutation.isLoading && mutation.variables === notification.id}
            >
              <span>{notification.message}</span>
              <span>{notification.read ? 'Read' : 'Unread'}</span>
            </button>
          </li>
        ))}
      </ul>
      <p className="hint">Click an unread notification to mark it as read and sync the count across tabs.</p>
    </section>
  );
};

export default NotificationList;