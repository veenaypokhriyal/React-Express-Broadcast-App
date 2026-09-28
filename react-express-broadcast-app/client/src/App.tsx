import React from 'react';
import Header from './components/Header';
import NotificationList from './components/NotificationList';
import useNotificationSync from './hooks/useNotificationSync';

const App: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { notificationCount, updateNotificationCount } = useNotificationSync();

  return (
    <div className="app-shell">
      <Header
        count={notificationCount}
        isOpen={isOpen}
        onToggle={() => setIsOpen((value) => !value)}
      />

      {isOpen ? (
        <NotificationList onNotificationRead={updateNotificationCount} />
      ) : (
        <p className="helper-text">Click the notification count to open the list.</p>
      )}
    </div>
  );
};

export default App;