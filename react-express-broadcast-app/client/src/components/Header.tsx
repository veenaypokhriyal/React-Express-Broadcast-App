import React from 'react';

interface HeaderProps {
  count: number;
  isOpen: boolean;
  onToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ count, isOpen, onToggle }) => {
  return (
    <header className="header">
      <div>
        <p className="eyebrow">Cross-tab notification demo</p>
        <h1>Notifications</h1>
      </div>
      <div>
        <a target='_blank' href="http://localhost:3000/">New Tab</a>
      </div>

      <button className="count-button" type="button" onClick={onToggle}>
        <span>{count}</span>
        <span>{isOpen ? 'Hide list' : 'Show list'}</span>
      </button>
    </header>
  );
};

export default Header;