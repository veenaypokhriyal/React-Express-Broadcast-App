import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { getNotificationCount } from '../api/notifications';

const CHANNEL_NAME = 'notification-sync';
const QUERY_KEY = ['notificationCount'];
const SESSION_KEY = 'notificationCount:session';
const REQUEST_RETRY_DELAY_MS = 350;
const FETCH_FALLBACK_DELAY_MS = 1200;

type NotificationSyncMessage =
  | { type: 'count-request' }
  | { type: 'count-response'; count: number }
  | { type: 'count-update'; count: number };

const readSessionCount = (): number | undefined => {
  const raw = window.sessionStorage.getItem(SESSION_KEY);
  if (raw === null) {
    return undefined;
  }

  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const writeSessionCount = (count: number): void => {
  window.sessionStorage.setItem(SESSION_KEY, String(count));
};

const isDocumentReadyForNetwork = (): boolean => {
  const documentWithPrerender = document as Document & { prerendering?: boolean };
  return document.visibilityState === 'visible' && !documentWithPrerender.prerendering;
};

const useNotificationSync = () => {
  const queryClient = useQueryClient();
  const channelRef = useRef<BroadcastChannel | null>(null);
  const fetchTimerRef = useRef<number | null>(null);
  const requestRetryTimerRef = useRef<number | null>(null);
  const responseReceivedRef = useRef(false);
  const isActiveRef = useRef(true);

  const clearFallbackTimer = useCallback(() => {
    if (fetchTimerRef.current !== null) {
      window.clearTimeout(fetchTimerRef.current);
      fetchTimerRef.current = null;
    }
  }, []);

  const clearRequestRetryTimer = useCallback(() => {
    if (requestRetryTimerRef.current !== null) {
      window.clearTimeout(requestRetryTimerRef.current);
      requestRetryTimerRef.current = null;
    }
  }, []);

  const countQuery = useQuery<number>(QUERY_KEY, getNotificationCount, {
    enabled: false,
    initialData: () => queryClient.getQueryData<number>(QUERY_KEY) ?? readSessionCount(),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  const currentCount = useMemo(() => countQuery.data ?? queryClient.getQueryData<number>(QUERY_KEY), [countQuery.data, queryClient]);

  useEffect(() => {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channelRef.current = channel;
    isActiveRef.current = true;

    const handleBroadcastMessage = (event: MessageEvent) => {
      const payload = event.data as NotificationSyncMessage | undefined;

      if (!payload) {
        return;
      }

      if (payload.type === 'count-update' || payload.type === 'count-response') {
        responseReceivedRef.current = true;
        queryClient.setQueryData(QUERY_KEY, payload.count);
        writeSessionCount(payload.count);
        clearRequestRetryTimer();
        clearFallbackTimer();
        return;
      }

      if (payload.type !== 'count-request') {
        return;
      }

      const existingCount = queryClient.getQueryData<number>(QUERY_KEY) ?? readSessionCount();
      if (typeof existingCount === 'number') {
        channel.postMessage({
          type: 'count-response',
          count: existingCount,
        } satisfies NotificationSyncMessage);
      }
    };

    channel.addEventListener('message', handleBroadcastMessage);

    const existingLocalCount = queryClient.getQueryData<number>(QUERY_KEY) ?? readSessionCount();
    const hasLocalCount = typeof existingLocalCount === 'number';

    if (hasLocalCount) {
      queryClient.setQueryData(QUERY_KEY, existingLocalCount);
    }

    if (!hasLocalCount) {
      // Ask other tabs for the current count before falling back to the backend.
      channel.postMessage({ type: 'count-request' } satisfies NotificationSyncMessage);

      // Retry once to handle tab startup timing/race conditions.
      clearRequestRetryTimer();
      requestRetryTimerRef.current = window.setTimeout(() => {
        if (
          !isActiveRef.current ||
          responseReceivedRef.current ||
          typeof (queryClient.getQueryData<number>(QUERY_KEY) ?? readSessionCount()) === 'number'
        ) {
          return;
        }

        channelRef.current?.postMessage({ type: 'count-request' } satisfies NotificationSyncMessage);
      }, REQUEST_RETRY_DELAY_MS);
    }

    const scheduleFallbackFetch = () => {
      clearFallbackTimer();

      fetchTimerRef.current = window.setTimeout(() => {
        if (
          !isActiveRef.current ||
          responseReceivedRef.current ||
          typeof (queryClient.getQueryData<number>(QUERY_KEY) ?? readSessionCount()) === 'number'
        ) {
          return;
        }

        // Avoid network calls triggered by prerender/hidden documents.
        if (!isDocumentReadyForNetwork()) {
          scheduleFallbackFetch();
          return;
        }

        queryClient
          .fetchQuery<number>(QUERY_KEY, getNotificationCount, { staleTime: Infinity })
          .then((count) => {
            if (!isActiveRef.current || typeof count !== 'number') {
              return;
            }

            responseReceivedRef.current = true;
            queryClient.setQueryData(QUERY_KEY, count);
            writeSessionCount(count);

            if (channelRef.current) {
              channelRef.current.postMessage({
                type: 'count-update',
                count,
              } satisfies NotificationSyncMessage);
            }
          })
          .catch(() => {
            // Ignore here; UI can retry on next action/focus flow.
          });
      }, FETCH_FALLBACK_DELAY_MS);
    };

    scheduleFallbackFetch();

    return () => {
      isActiveRef.current = false;
      clearRequestRetryTimer();
      clearFallbackTimer();
      channel.removeEventListener('message', handleBroadcastMessage);
      channel.close();
      channelRef.current = null;
      responseReceivedRef.current = false;
    };
  }, [clearFallbackTimer, clearRequestRetryTimer, queryClient]);

  const updateNotificationCount = useCallback(
    (nextCount: number) => {
      if (!isActiveRef.current) {
        return;
      }

      queryClient.setQueryData(QUERY_KEY, nextCount);
      writeSessionCount(nextCount);

      if (channelRef.current && isActiveRef.current) {
        channelRef.current.postMessage({
          type: 'count-update',
          count: nextCount,
        } satisfies NotificationSyncMessage);
      }
    },
    [queryClient]
  );

  return {
    notificationCount: currentCount ?? 0,
    isLoading: countQuery.isLoading,
    updateNotificationCount,
  };
};

export default useNotificationSync;
