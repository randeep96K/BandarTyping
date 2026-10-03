import React from 'react';
import type { TestMode, TimeDuration, WordCount } from '../types';
import { Clock, Type, Quote, Wind, Sliders } from 'lucide-react';

interface SettingsBarProps {
  mode: TestMode;
  timeDuration: TimeDuration;
  wordCount: WordCount;
  includePunctuation: boolean;
  includeNumbers: boolean;
  onModeChange: (mode: TestMode) => void;
  onTimeChange: (duration: TimeDuration) => void;
  onWordCountChange: (count: WordCount) => void;
  onTogglePunctuation: () => void;
  onToggleNumbers: () => void;
  onOpenCustomModal: () => void;
  disabled?: boolean;
}

export const SettingsBar: React.FC<SettingsBarProps> = ({
  mode,
  timeDuration,
  wordCount,
  includePunctuation,
  includeNumbers,
  onModeChange,
  onTimeChange,
  onWordCountChange,
  onTogglePunctuation,
  onToggleNumbers,
  onOpenCustomModal,
  disabled = false,
}) => {
  return (
    <div className={`settings-bar-container ${disabled ? 'disabled' : ''}`}>
      <div className="settings-bar-inner">
        {/* Left Section: Punctuation & Numbers */}
        <div className="settings-group left-group">
          <button
            type="button"
            className={`settings-btn ${includePunctuation ? 'active' : ''}`}
            onClick={onTogglePunctuation}
            title="विराम चिन्ह शामिल करें (@, #, !, ।)"
          >
            अक्षर / विराम
          </button>
          <button
            type="button"
            className={`settings-btn ${includeNumbers ? 'active' : ''}`}
            onClick={onToggleNumbers}
            title="संख्याएँ शामिल करें (१, २, ३, 4, 5)"
          >
            संख्या
          </button>
        </div>

        <div className="settings-divider" />

        {/* Middle Section: Modes */}
        <div className="settings-group mode-group">
          <button
            type="button"
            className={`settings-btn ${mode === 'time' ? 'active' : ''}`}
            onClick={() => onModeChange('time')}
          >
            <Clock size={14} className="btn-icon" />
            समय
          </button>

          <button
            type="button"
            className={`settings-btn ${mode === 'words' ? 'active' : ''}`}
            onClick={() => onModeChange('words')}
          >
            <Type size={14} className="btn-icon" />
            शब्द
          </button>

          <button
            type="button"
            className={`settings-btn ${mode === 'quote' ? 'active' : ''}`}
            onClick={() => onModeChange('quote')}
          >
            <Quote size={14} className="btn-icon" />
            उद्धरण
          </button>

          <button
            type="button"
            className={`settings-btn ${mode === 'zen' ? 'active' : ''}`}
            onClick={() => onModeChange('zen')}
          >
            <Wind size={14} className="btn-icon" />
            ज़ेन
          </button>

          <button
            type="button"
            className={`settings-btn ${mode === 'custom' ? 'active' : ''}`}
            onClick={() => {
              onModeChange('custom');
              onOpenCustomModal();
            }}
          >
            <Sliders size={14} className="btn-icon" />
            कस्टम
          </button>
        </div>

        <div className="settings-divider" />

        {/* Right Section: Mode Specific Options */}
        <div className="settings-group options-group">
          {mode === 'time' && (
            <>
              {([15, 30, 60, 120] as TimeDuration[]).map((time) => (
                <button
                  key={time}
                  type="button"
                  className={`settings-btn ${timeDuration === time ? 'active' : ''}`}
                  onClick={() => onTimeChange(time)}
                >
                  {time}
                </button>
              ))}
            </>
          )}

          {mode === 'words' && (
            <>
              {([10, 25, 50, 100] as WordCount[]).map((count) => (
                <button
                  key={count}
                  type="button"
                  className={`settings-btn ${wordCount === count ? 'active' : ''}`}
                  onClick={() => onWordCountChange(count)}
                >
                  {count}
                </button>
              ))}
            </>
          )}

          {mode === 'quote' && (
            <span className="quote-mode-label">
              महान हस्तियों के प्रेरक विचार
            </span>
          )}

          {mode === 'zen' && (
            <span className="zen-mode-label">
              शांत एवं अबाध टाइपिंग
            </span>
          )}

          {mode === 'custom' && (
            <button
              type="button"
              className="settings-btn custom-edit-btn"
              onClick={onOpenCustomModal}
            >
              टेक्स्ट बदलें
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
