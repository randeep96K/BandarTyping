import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import type {
  TestSettings,
  TestResult,
  ChartDataPoint,
} from '../types';
import {
  evaluateHindiWord,
  calculateTypingMetrics,
  playKeySound,
} from '../utils/hindiEngine';

interface TypingAreaProps {
  words: string[];
  settings: TestSettings;
  onFinish: (result: TestResult) => void;
  onRestartRequest: () => void;
  isFocused: boolean;
  setIsFocused: (focused: boolean) => void;
  currentWordIndex: number;
  setCurrentWordIndex: React.Dispatch<React.SetStateAction<number>>;
  timeLeft: number;
  setTimeLeft: React.Dispatch<React.SetStateAction<number>>;
  liveWpm: number;
  setLiveWpm: (wpm: number) => void;
  liveAccuracy: number;
  setLiveAccuracy: (acc: number) => void;
  isTestActive: boolean;
  setIsTestActive: (active: boolean) => void;
}

export const TypingArea: React.FC<TypingAreaProps> = ({
  words,
  settings,
  onFinish,
  isFocused,
  setIsFocused,
  currentWordIndex,
  setCurrentWordIndex,
  setTimeLeft,
  setLiveWpm,
  setLiveAccuracy,
  isTestActive,
  setIsTestActive,
}) => {
  const [typedBuffer, setTypedBuffer] = useState('');
  const [wordHistory, setWordHistory] = useState<string[]>([]);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [backspacesCount, setBackspacesCount] = useState(0);

  // Caret coordinates
  const [caretPos, setCaretPos] = useState<{ left: number; top: number; height: number }>({
    left: 0,
    top: 0,
    height: 36,
  });

  // Chart data sampled every second
  const chartPointsRef = useRef<ChartDataPoint[]>([]);
  const testStartTimeRef = useRef<number | null>(null);
  const isComposingRef = useRef(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const wordsWrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const activeClusterRef = useRef<HTMLSpanElement | null>(null);
  const activeWordRef = useRef<HTMLDivElement | null>(null);

  // Focus input automatically
  useEffect(() => {
    inputRef.current?.focus();
  }, [words]);

  // Keep focus on input unless user interacts with other modals
  const handleContainerClick = () => {
    inputRef.current?.focus();
    setIsFocused(true);
  };

  // Evaluate all words for rendering
  const evaluatedWords = useMemo(() => {
    return words.map((targetWord, index) => {
      let typed = '';
      if (index < currentWordIndex) {
        typed = wordHistory[index] || '';
      } else if (index === currentWordIndex) {
        typed = typedBuffer;
      }
      return evaluateHindiWord(targetWord, typed, index === currentWordIndex);
    });
  }, [words, currentWordIndex, wordHistory, typedBuffer]);

  // Calculate stats from evaluated words
  const currentStats = useMemo(() => {
    let correctChars = 0;
    let incorrectChars = 0;
    let correctWordsCount = 0;
    let incorrectWordsCount = 0;

    // Completed words
    for (let i = 0; i < currentWordIndex; i++) {
      const ew = evaluatedWords[i];
      if (ew) {
        if (ew.isCorrect) {
          correctWordsCount++;
          correctChars += ew.targetWord.length;
        } else {
          incorrectWordsCount++;
          for (const c of ew.clusters) {
            if (c.status === 'correct') correctChars += c.cluster.length;
            else incorrectChars += c.cluster.length;
          }
        }
        // Count space character
        correctChars += 1;
      }
    }

    // Active word
    const activeEw = evaluatedWords[currentWordIndex];
    if (activeEw) {
      for (const c of activeEw.clusters) {
        if (c.status === 'correct') correctChars += c.cluster.length;
        else if (c.status === 'incorrect' || c.status === 'extra') incorrectChars += c.cluster.length;
      }
    }

    const elapsedSeconds = testStartTimeRef.current
      ? Math.max(1, (Date.now() - testStartTimeRef.current) / 1000)
      : 1;

    const metrics = calculateTypingMetrics(
      correctChars,
      incorrectChars,
      totalKeystrokes,
      elapsedSeconds
    );

    return {
      correctChars,
      incorrectChars,
      totalChars: correctChars + incorrectChars,
      correctWordsCount,
      incorrectWordsCount,
      wpm: metrics.wpm,
      rawWpm: metrics.rawWpm,
      accuracy: metrics.accuracy,
      elapsedSeconds,
    };
  }, [evaluatedWords, currentWordIndex, totalKeystrokes]);

  // Update parent live stats
  useEffect(() => {
    if (isTestActive) {
      setLiveWpm(currentStats.wpm);
      setLiveAccuracy(currentStats.accuracy);
    }
  }, [currentStats, isTestActive, setLiveWpm, setLiveAccuracy]);

  // Timer loop for time mode
  useEffect(() => {
    if (!isTestActive) return;

    const interval = setInterval(() => {
      // Record chart point every second
      const elapsed = testStartTimeRef.current
        ? Math.round((Date.now() - testStartTimeRef.current) / 1000)
        : 1;

      chartPointsRef.current.push({
        second: elapsed,
        wpm: currentStats.wpm,
        rawWpm: currentStats.rawWpm,
        errors: currentStats.incorrectChars,
      });

      if (settings.mode === 'time') {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            finishTest();
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isTestActive, settings.mode, currentStats]);

  // Finish test callback
  const finishTest = useCallback(() => {
    setIsTestActive(false);

    const duration = testStartTimeRef.current
      ? Math.max(1, Math.round((Date.now() - testStartTimeRef.current) / 1000))
      : settings.timeDuration;

    // Calculate consistency based on chart wpm deviation
    const chart = chartPointsRef.current;
    let consistency = 90;
    if (chart.length > 2) {
      const wpms = chart.map((c) => c.wpm);
      const avg = wpms.reduce((a, b) => a + b, 0) / wpms.length;
      const variance = wpms.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / wpms.length;
      const stdDev = Math.sqrt(variance);
      consistency = Math.max(40, Math.min(100, Math.round(100 - (stdDev / (avg || 1)) * 50)));
    }

    const result: TestResult = {
      wpm: currentStats.wpm,
      rawWpm: currentStats.rawWpm,
      accuracy: currentStats.accuracy,
      correctChars: currentStats.correctChars,
      incorrectChars: currentStats.incorrectChars,
      totalChars: currentStats.totalChars,
      correctWords: currentStats.correctWordsCount,
      incorrectWords: currentStats.incorrectWordsCount,
      backspaces: backspacesCount,
      duration,
      mode: settings.mode,
      modeValue: settings.mode === 'time' ? settings.timeDuration : settings.wordCount,
      consistency,
      timestamp: Date.now(),
      chartData: chart.length > 0 ? chart : [
        { second: 1, wpm: currentStats.wpm, rawWpm: currentStats.rawWpm, errors: currentStats.incorrectChars }
      ],
    };

    onFinish(result);
  }, [
    currentStats,
    backspacesCount,
    settings.mode,
    settings.timeDuration,
    settings.wordCount,
    onFinish,
    setIsTestActive,
  ]);

  // Position caret whenever currentWordIndex or typedBuffer changes
  useEffect(() => {
    if (!wordsWrapperRef.current) return;

    // Look for active cluster or active word
    if (activeClusterRef.current) {
      const clusterRect = activeClusterRef.current.getBoundingClientRect();
      const wrapperRect = wordsWrapperRef.current.getBoundingClientRect();

      setCaretPos({
        left: clusterRect.left - wrapperRect.left,
        top: clusterRect.top - wrapperRect.top,
        height: clusterRect.height || 36,
      });
    } else if (activeWordRef.current) {
      const wordRect = activeWordRef.current.getBoundingClientRect();
      const wrapperRect = wordsWrapperRef.current.getBoundingClientRect();

      setCaretPos({
        left: wordRect.left - wrapperRect.left + wordRect.width,
        top: wordRect.top - wrapperRect.top,
        height: wordRect.height || 36,
      });
    }

    // Scroll lines smoothly if active word drops below line 2
    if (activeWordRef.current && containerRef.current) {
      const wordEl = activeWordRef.current;
      const containerEl = containerRef.current;
      const wordTop = wordEl.offsetTop;
      const lineHeight = 48; // approximate line height

      if (wordTop > lineHeight * 1.5) {
        containerEl.scrollTop = wordTop - lineHeight;
      } else {
        containerEl.scrollTop = 0;
      }
    }
  }, [currentWordIndex, typedBuffer, evaluatedWords]);

  // Handle Input typing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const value = rawVal.normalize('NFC');

    // First keypress starts the test!
    if (!isTestActive && value.length > 0) {
      setIsTestActive(true);
      testStartTimeRef.current = Date.now();
    }

    setTotalKeystrokes((prev) => prev + 1);

    // If space is typed (and not composing in IME)
    if (value.endsWith(' ') && !isComposingRef.current) {
      const wordToCommit = value.slice(0, -1).trim();

      // Only advance if there's actually a word or if user pressed space on current word
      if (wordToCommit.length > 0 || typedBuffer.length > 0) {
        playKeySound(settings.sound, false);

        setWordHistory((prev) => [...prev, wordToCommit]);
        setTypedBuffer('');

        const nextWordIndex = currentWordIndex + 1;
        setCurrentWordIndex(nextWordIndex);

        // Check if finished by word count or end of words list
        if (
          (settings.mode === 'words' && nextWordIndex >= settings.wordCount) ||
          (settings.mode === 'quote' && nextWordIndex >= words.length) ||
          (settings.mode === 'custom' && nextWordIndex >= words.length) ||
          nextWordIndex >= words.length
        ) {
          finishTest();
        }
      }
      return;
    }

    // Check for error sound
    const target = words[currentWordIndex] || '';
    const hasTypo = !target.startsWith(value);
    playKeySound(settings.sound, hasTypo);

    setTypedBuffer(value);
  };

  // Handle Backspace and Navigation Keys
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      setBackspacesCount((prev) => prev + 1);

      // If buffer is empty and user presses backspace, jump back to previous word
      if (typedBuffer === '' && currentWordIndex > 0) {
        e.preventDefault();
        const prevIndex = currentWordIndex - 1;
        const prevTyped = wordHistory[prevIndex] || '';

        setCurrentWordIndex(prevIndex);
        setTypedBuffer(prevTyped);
        setWordHistory((prev) => prev.slice(0, prevIndex));
      }
    }
  };

  return (
    <div
      className={`typing-area-container ${isFocused ? 'focused' : 'blurred'}`}
      onClick={handleContainerClick}
      ref={containerRef}
    >
      {/* Hidden input to capture native Hindi keyboard, InScript, and IME */}
      <input
        ref={inputRef}
        type="text"
        className="hidden-typing-input"
        value={typedBuffer}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onCompositionStart={() => {
          isComposingRef.current = true;
        }}
        onCompositionEnd={(e) => {
          isComposingRef.current = false;
          // React synthetic onCompositionEnd
          handleInputChange(e as unknown as React.ChangeEvent<HTMLInputElement>);
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        autoFocus
        autoCapitalize="none"
        autoComplete="off"
        autoCorrect="off"
        spellCheck="false"
        tabIndex={0}
      />

      <div
        className={`words-wrapper text-size-${settings.fontSize}`}
        ref={wordsWrapperRef}
      >
        {/* Render Smooth or Static Caret */}
        {settings.caretStyle !== 'hidden' && isFocused && (
          <div
            className={`typing-caret caret-${settings.caretStyle} ${
              settings.smoothCaret ? 'caret-smooth' : ''
            } ${!isTestActive ? 'caret-blinking' : ''}`}
            style={{
              left: `${caretPos.left}px`,
              top: `${caretPos.top}px`,
              height: `${caretPos.height}px`,
            }}
          />
        )}

        {/* Words Grid */}
        {evaluatedWords.map((ew, wIndex) => {
          const isCurrent = wIndex === currentWordIndex;
          const isPast = wIndex < currentWordIndex;

          return (
            <div
              key={wIndex}
              ref={isCurrent ? activeWordRef : null}
              className={`word-box ${isCurrent ? 'current-word' : ''} ${
                isPast ? (ew.isCorrect ? 'word-correct' : 'word-incorrect') : ''
              }`}
            >
              {ew.clusters.map((c, cIndex) => {
                // Find if this is the active cluster where caret should stand
                const isNextCluster = isCurrent && cIndex === ew.clusters.findIndex((cl) => cl.status === 'untyped' || cl.status === 'active');

                return (
                  <span
                    key={cIndex}
                    ref={isNextCluster ? activeClusterRef : null}
                    className={`cluster-span status-${c.status} ${
                      c.isExtra ? 'cluster-extra' : ''
                    }`}
                  >
                    {c.cluster}
                  </span>
                );
              })}

              {/* Trailing space token */}
              <span className="word-space"> </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
