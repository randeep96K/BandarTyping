import React, { useState, useEffect, useRef } from 'react';
import { Search, RotateCcw, Clock, Type, Palette, Trophy, User, BookOpen, X } from 'lucide-react';
import type { TestMode, ThemeId, TimeDuration } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onRestart: () => void;
  onSetMode: (mode: TestMode) => void;
  onSetDuration: (duration: TimeDuration) => void;
  onSetTheme: (theme: ThemeId) => void;
  onOpenLeaderboard: () => void;
  onOpenProfile: () => void;
  onOpenGuide: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onRestart,
  onSetMode,
  onSetDuration,
  onSetTheme,
  onOpenLeaderboard,
  onOpenProfile,
  onOpenGuide,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const allCommands = [
    {
      id: 'restart',
      label: 'टेस्ट पुनः आरंभ करें (Restart Test)',
      icon: <RotateCcw size={16} />,
      action: () => {
        onRestart();
        onClose();
      },
    },
    {
      id: 'mode-time',
      label: 'मोड बदलें: समय (Time Mode)',
      icon: <Clock size={16} />,
      action: () => {
        onSetMode('time');
        onClose();
      },
    },
    {
      id: 'mode-words',
      label: 'मोड बदलें: शब्द (Words Mode)',
      icon: <Type size={16} />,
      action: () => {
        onSetMode('words');
        onClose();
      },
    },
    {
      id: 'mode-quote',
      label: 'मोड बदलें: उद्धरण (Quote Mode)',
      icon: <BookOpen size={16} />,
      action: () => {
        onSetMode('quote');
        onClose();
      },
    },
    {
      id: 'time-15',
      label: 'समय: 15 सेकंड (15s)',
      icon: <Clock size={16} />,
      action: () => {
        onSetDuration(15);
        onClose();
      },
    },
    {
      id: 'time-30',
      label: 'समय: 30 सेकंड (30s)',
      icon: <Clock size={16} />,
      action: () => {
        onSetDuration(30);
        onClose();
      },
    },
    {
      id: 'time-60',
      label: 'समय: 60 सेकंड (60s)',
      icon: <Clock size={16} />,
      action: () => {
        onSetDuration(60);
        onClose();
      },
    },
    {
      id: 'theme-bandar',
      label: 'थीम: बंदर डार्क (Bandar Dark)',
      icon: <Palette size={16} />,
      action: () => {
        onSetTheme('bandar-dark');
        onClose();
      },
    },
    {
      id: 'theme-monokai',
      label: 'थीम: मोनोकाई (Monokai)',
      icon: <Palette size={16} />,
      action: () => {
        onSetTheme('monokai');
        onClose();
      },
    },
    {
      id: 'theme-midnight',
      label: 'थीम: मिडनाइट (Midnight)',
      icon: <Palette size={16} />,
      action: () => {
        onSetTheme('midnight');
        onClose();
      },
    },
    {
      id: 'view-leaderboard',
      label: 'लीडरबोर्ड देखें (Leaderboard)',
      icon: <Trophy size={16} />,
      action: () => {
        onOpenLeaderboard();
        onClose();
      },
    },
    {
      id: 'view-profile',
      label: 'प्रोफ़ाइल एवं आँकड़े (Profile & Stats)',
      icon: <User size={16} />,
      action: () => {
        onOpenProfile();
        onClose();
      },
    },
    {
      id: 'view-guide',
      label: 'हिंदी टाइपिंग गाइड (Typing Guide)',
      icon: <BookOpen size={16} />,
      action: () => {
        onOpenGuide();
        onClose();
      },
    },
  ];

  const filtered = allCommands.filter((cmd) =>
    cmd.label.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="command-palette-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="command-palette-search">
          <Search size={18} className="search-icon" />
          <input
            ref={inputRef}
            type="text"
            className="command-search-input"
            placeholder="कमांड खोजें या विकल्प टाइप करें... (उदा. समय, थीम, रीसेट)"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
          />
          <button className="command-close-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="command-results-list">
          {filtered.length === 0 ? (
            <div className="empty-command-result">कोई मेल खाने वाला कमांड नहीं मिला।</div>
          ) : (
            filtered.map((cmd, idx) => (
              <div
                key={cmd.id}
                className={`command-item ${idx === selectedIndex ? 'selected' : ''}`}
                onClick={cmd.action}
                onMouseEnter={() => setSelectedIndex(idx)}
              >
                <div className="cmd-icon-box">{cmd.icon}</div>
                <span className="cmd-label">{cmd.label}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
