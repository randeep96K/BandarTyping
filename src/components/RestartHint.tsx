import React from 'react';
import { RotateCcw } from 'lucide-react';

interface RestartHintProps {
  onRestart: () => void;
  isFocused: boolean;
}

export const RestartHint: React.FC<RestartHintProps> = ({ onRestart, isFocused }) => {
  return (
    <div className="restart-hint-container">
      <button
        type="button"
        className="restart-btn"
        onClick={onRestart}
        title="पुनः प्रयास करें (Tab + Enter या क्लिक)"
        aria-label="पुनः प्रयास करें"
      >
        <RotateCcw size={18} className="restart-icon" />
      </button>

      <div className="shortcut-hints">
        <span className="hint-pill">
          <kbd>tab</kbd> + <kbd>enter</kbd> - पुनः प्रयास करें
        </span>
        <span className="hint-pill">
          <kbd>esc</kbd> - रीसेट
        </span>
        <span className="hint-pill">
          <kbd>ctrl</kbd> + <kbd>shift</kbd> + <kbd>p</kbd> - कमांड
        </span>
      </div>

      {!isFocused && (
        <div className="unfocused-banner">
          <span>टाइपिंग शुरू करने के लिए यहाँ क्लिक करें या कोई कुंजी दबाएँ</span>
        </div>
      )}
    </div>
  );
};
