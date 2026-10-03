import React from 'react';
import { Keyboard, Trophy, Info, Settings, Bell, User } from 'lucide-react';

interface HeaderProps {
  currentView: 'test' | 'leaderboard' | 'profile';
  onViewChange: (view: 'test' | 'leaderboard' | 'profile') => void;
  onOpenSettings: () => void;
  onOpenInfo: () => void;
  onOpenNotifications: () => void;
  unreadCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onViewChange,
  onOpenSettings,
  onOpenInfo,
  onOpenNotifications,
  unreadCount = 0,
}) => {
  return (
    <header className="header-container">
      {/* Left: Brand Logo & Title */}
      <div 
        className="brand-logo" 
        onClick={() => onViewChange('test')}
        title="BandarTyping - होम"
      >
        <div className="logo-icon-wrapper">
          <svg className="logo-svg" viewBox="0 0 32 32" fill="none">
            <rect x="2" y="2" width="28" height="28" rx="6" fill="#2c2e31" stroke="var(--main-color)" strokeWidth="2" />
            <text x="16" y="22" fontFamily="'Noto Sans Devanagari', sans-serif" fontSize="16" fontWeight="bold" fill="var(--main-color)" textAnchor="middle">
              बं
            </text>
          </svg>
        </div>
        <div className="brand-text">
          <span className="brand-title">BandarTyping</span>
          <span className="brand-subtitle">बंदरटाइपिंग</span>
        </div>
      </div>

      {/* Center Navigation Icons */}
      <nav className="header-nav">
        <button
          className={`nav-btn ${currentView === 'test' ? 'active' : ''}`}
          onClick={() => onViewChange('test')}
          title="टाइपिंग टेस्ट (Keyboard)"
          aria-label="टाइपिंग टेस्ट"
        >
          <Keyboard size={19} />
        </button>

        <button
          className={`nav-btn ${currentView === 'leaderboard' ? 'active' : ''}`}
          onClick={() => onViewChange('leaderboard')}
          title="लीडरबोर्ड (Leaderboard)"
          aria-label="लीडरबोर्ड"
        >
          <Trophy size={19} />
        </button>

        <button
          className="nav-btn"
          onClick={onOpenInfo}
          title="हिंदी टाइपिंग गाइड (Guide)"
          aria-label="जानकारी एवं गाइड"
        >
          <Info size={19} />
        </button>

        <button
          className="nav-btn"
          onClick={onOpenSettings}
          title="सेटिंग्स (Settings)"
          aria-label="सेटिंग्स"
        >
          <Settings size={19} />
        </button>
      </nav>

      {/* Right Icons: Notifications & User Profile */}
      <div className="header-right">
        <button
          className="nav-btn notif-btn"
          onClick={onOpenNotifications}
          title="सूचनाएँ (Notifications)"
          aria-label="सूचनाएँ"
        >
          <Bell size={19} />
          {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
        </button>

        <button
          className={`nav-btn user-btn ${currentView === 'profile' ? 'active' : ''}`}
          onClick={() => onViewChange('profile')}
          title="प्रोफ़ाइल एवं आँकड़े (Profile & Stats)"
          aria-label="प्रोफ़ाइल"
        >
          <User size={19} />
        </button>
      </div>
    </header>
  );
};
