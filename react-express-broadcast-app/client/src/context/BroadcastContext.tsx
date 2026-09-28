import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useQueryClient } from 'react-query';

interface BroadcastContextType {
  notificationCount: number;
  setNotificationCount: (count: number) => void;
}

const BroadcastContext = createContext<BroadcastContextType | undefined>(undefined);

export const BroadcastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notificationCount, setNotificationCount] = useState(0);
  const queryClient = useQueryClient();
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    const channel = new BroadcastChannel('notification-sync');
    channelRef.current = channel;

    channel.onmessage = (event) => {
      if (event.data?.type === 'notification-count') {
        setNotificationCount(event.data.count);
        queryClient.setQueryData(['notificationCount'], event.data.count);
      }
    };

    return () => {
      channel.close();
      channelRef.current = null;
    };
  }, [queryClient]);

  useEffect(() => {
    const stored = window.localStorage.getItem('notificationCount');
    if (stored) {
      const count = Number(stored);
      if (Number.isFinite(count)) {
        setNotificationCount(count);
        queryClient.setQueryData(['notificationCount'], count);
      }
    }
  }, [queryClient]);

  return (
    <BroadcastContext.Provider value={{ notificationCount, setNotificationCount }}>
      {children}
    </BroadcastContext.Provider>
  );
};

export const useBroadcast = () => {
  const context = useContext(BroadcastContext);
  if (context === undefined) {
    throw new Error('useBroadcast must be used within a BroadcastProvider');
  }
  return context;
};