import React from 'react';
import type { TestMode } from '../types';

interface LiveStatsProps {
  mode: TestMode;
  timeLeft: number;
  currentWordIndex: number;
  totalWords: number;
  wpm: number;
  accuracy: number;
  showLiveWpm: boolean;
  showLiveAccuracy: boolean;
  isActive: boolean;
}

export const LiveStats: React.FC<LiveStatsProps> = ({
  mode,
  timeLeft,
  currentWordIndex,
  totalWords,
  wpm,
  accuracy,
  showLiveWpm,
  showLiveAccuracy,
  isActive,
}) => {
  // Format seconds to mm:ss or ss
  const formatTime = (seconds: number) => {
    if (seconds >= 60) {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
    return `${seconds}`;
  };

  return (
    <div className={`live-stats-bar ${isActive ? 'active' : ''}`}>
      {/* Primary Counter (Time or Word Progress) */}
      <div className="stats-main-counter">
        {mode === 'time' && (
          <span className="counter-val" title="शेष समय (Time Left)">
            {formatTime(timeLeft)}
          </span>
        )}

        {mode === 'words' && (
          <span className="counter-val" title="शब्द प्रगति (Word Count)">
            {Math.min(totalWords, currentWordIndex + 1)} / {totalWords}
          </span>
        )}

        {mode === 'quote' && (
          <span className="counter-val quote-mode-val" title="उद्धरण प्रगति">
            {Math.min(totalWords, currentWordIndex + 1)} / {totalWords}
          </span>
        )}

        {mode === 'zen' && (
          <span className="counter-val zen-counter" title="ज़ेन मोड">
            ∞ ज़ेन
          </span>
        )}

        {mode === 'custom' && (
          <span className="counter-val" title="कस्टम प्रगति">
            {Math.min(totalWords, currentWordIndex + 1)} / {totalWords}
          </span>
        )}
      </div>

      {/* Optional subtle live WPM & Accuracy indicators */}
      {(showLiveWpm || showLiveAccuracy) && isActive && (
        <div className="stats-sub-indicators">
          {showLiveWpm && (
            <div className="sub-stat">
              <span className="sub-stat-num">{wpm}</span>
              <span className="sub-stat-label">WPM</span>
            </div>
          )}

          {showLiveAccuracy && (
            <div className="sub-stat">
              <span className="sub-stat-num">{accuracy}%</span>
              <span className="sub-stat-label">सटीकता</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
