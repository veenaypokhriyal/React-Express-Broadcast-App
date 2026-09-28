import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { getNotificationCount } from '../api/notifications';

const STORAGE_KEY = 'notificationCount'; 
const CHANNEL_NAME = 'notification-sync';
const QUERY_KEY = ['notificationCount'];

const readStoredCount = (): number | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const value = window.localStorage.getItem(STORAGE_KEY);
  if (value === null) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export const useBroadcastSync = () => {
  const queryClient = useQueryClient();
  const channelRef = useRef<BroadcastChannel | null>(null);

  const storedCount = useMemo(() => readStoredCount(), []);

  const countQuery = useQuery<number>(QUERY_KEY, getNotificationCount, {
    enabled: storedCount === null,
    initialData: storedCount ?? undefined,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    onSuccess: (count) => {
      window.localStorage.setItem(STORAGE_KEY, String(count));
    },
  });

  useEffect(() => {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channelRef.current = channel;

    const handleBroadcastMessage = (event: MessageEvent) => {
      const payload = event.data as { type?: string; count?: number } | undefined;

      if (payload?.type !== 'notification-count' || typeof payload.count !== 'number') {
        return;
      }

      queryClient.setQueryData(QUERY_KEY, payload.count);
      window.localStorage.setItem(STORAGE_KEY, String(payload.count));
    };

    const handleStorageMessage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY || event.newValue === null) {
        return;
      }

      const nextCount = Number(event.newValue);
      if (Number.isFinite(nextCount)) {
        queryClient.setQueryData(QUERY_KEY, nextCount);
      }
    };

    channel.addEventListener('message', handleBroadcastMessage);
    window.addEventListener('storage', handleStorageMessage);

    return () => {
      channel.removeEventListener('message', handleBroadcastMessage);
      channel.close();
      window.removeEventListener('storage', handleStorageMessage);
      channelRef.current = null;
    };
  }, [queryClient]);

  const updateNotificationCount = useCallback(
    (nextCount: number) => {
      queryClient.setQueryData(QUERY_KEY, nextCount);
      window.localStorage.setItem(STORAGE_KEY, String(nextCount));

      if (channelRef.current) {
        channelRef.current.postMessage({
          type: 'notification-count',
          count: nextCount,
        });
      }
    },
    [queryClient]
  );

  return {
    notificationCount: countQuery.data ?? 0,
    isLoading: countQuery.isLoading,
    updateNotificationCount,
  };
};

export default useBroadcastSync;

const useBroadcastSync = (notificationCount: number, setNotificationCount: (count: number) => void) => {
    useEffect(() => {
        const channel = new BroadcastChannel('notification_channel');

        const handleMessage = (event: MessageEvent) => {
            if (event.data.type === 'UPDATE_COUNT') {
                setNotificationCount(event.data.count);
            }
        };

        channel.addEventListener('message', handleMessage);

        return () => {
            channel.removeEventListener('message', handleMessage);