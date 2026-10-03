import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import { Header } from './components/Header';
import { SettingsBar } from './components/SettingsBar';
import { LanguageSelector } from './components/LanguageSelector';
import { LiveStats } from './components/LiveStats';
import { TypingArea } from './components/TypingArea';
import { RestartHint } from './components/RestartHint';
import { ResultsScreen } from './components/ResultsScreen';
import { CustomTextModal } from './components/CustomTextModal';
import { SettingsModal } from './components/SettingsModal';
import { InfoModal } from './components/InfoModal';
import { NotificationsModal } from './components/NotificationsModal';
import { CommandPalette } from './components/CommandPalette';
import { LeaderboardView } from './components/LeaderboardView';
import { ProfileView } from './components/ProfileView';
import type {
  TestSettings,
  TestResult,
  TestMode,
  TimeDuration,
  WordCount,
  Language,
  NotificationItem,
} from './types';
import { generateHindiWords, getRandomQuote } from './utils/hindiDataset';

const DEFAULT_SETTINGS: TestSettings = {
  mode: 'time',
  timeDuration: 30,
  wordCount: 25,
  includePunctuation: false,
  includeNumbers: false,
  language: 'hindi',
  difficulty: 'medium',
  theme: 'bandar-dark',
  fontSize: 'large',
  fontFamily: 'Noto Sans Devanagari',
  caretStyle: 'line',
  smoothCaret: true,
  sound: 'mechanical',
  showLiveWpm: true,
  showLiveAccuracy: true,
  showTimer: true,
};

export const App: React.FC = () => {
  // Navigation View
  const [currentView, setCurrentView] = useState<'test' | 'leaderboard' | 'profile'>('test');

  // Settings State
  const [settings, setSettings] = useState<TestSettings>(() => {
    try {
      const saved = localStorage.getItem('bandartyping_settings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Test State
  const [words, setWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number>(settings.timeDuration);
  const [isTestActive, setIsTestActive] = useState(false);
  const [isFocused, setIsFocused] = useState(true);
  const [liveWpm, setLiveWpm] = useState(0);
  const [liveAccuracy, setLiveAccuracy] = useState(100);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [customText, setCustomText] = useState<string>('');

  // Modals
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // History & Notifications
  const [localResults, setLocalResults] = useState<TestResult[]>(() => {
    try {
      const saved = localStorage.getItem('bandartyping_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: '1',
      title: 'BandarTyping 1.0 में आपका स्वागत है!',
      description: 'आधुनिक और तीव्र गति वाला हिंदी टाइपिंग अभ्यास प्लेटफॉर्म। Monkeytype से प्रेरित न्यूनतम डार्क इंटरफ़ेस।',
      timestamp: 'अभी-अभी',
      read: false,
    },
    {
      id: '2',
      title: 'देवनागरी ग्रैफ़ीम क्लस्टर सपोर्ट',
      description: 'अब संयुक्त अक्षर (क्ष, त्र, ज्ञ, श्र) एवं मात्राएँ बिना किसी त्रुटि के स्वाभाविक रूप से टाइप करें।',
      timestamp: 'आज',
      read: false,
    },
    {
      id: '3',
      title: 'विंडोज हिंदी कीबोर्ड सपोर्ट',
      description: 'Windows InScript एवं Hindi Phonetic कीबोर्ड से सीधे टाइपिंग का आनंद लें।',
      timestamp: 'नया',
      read: false,
    },
  ]);

  // Apply Theme to <body> attribute
  useEffect(() => {
    document.body.setAttribute('data-theme', settings.theme);
    localStorage.setItem('bandartyping_settings', JSON.stringify(settings));
  }, [settings]);

  // Generate words for a new test
  const initTest = useCallback(() => {
    setIsTestActive(false);
    setCurrentWordIndex(0);
    setTimeLeft(settings.timeDuration);
    setLiveWpm(0);
    setLiveAccuracy(100);
    setTestResult(null);

    let generated: string[] = [];

    if (settings.mode === 'quote') {
      const quote = getRandomQuote();
      generated = quote.text.trim().split(/\s+/);
    } else if (settings.mode === 'custom' && customText.trim()) {
      generated = customText.trim().split(/\s+/);
    } else if (settings.mode === 'words') {
      generated = generateHindiWords(
        settings.wordCount + 10,
        settings.difficulty,
        settings.includePunctuation,
        settings.includeNumbers
      );
    } else {
      // time or zen mode
      generated = generateHindiWords(
        120,
        settings.difficulty,
        settings.includePunctuation,
        settings.includeNumbers
      );
    }

    setWords(generated);
  }, [
    settings.mode,
    settings.timeDuration,
    settings.wordCount,
    settings.difficulty,
    settings.includePunctuation,
    settings.includeNumbers,
    customText,
  ]);

  // Initialize test on first mount or mode change
  useEffect(() => {
    initTest();
  }, [initTest]);

  // Handle Test Finish
  const handleTestFinish = (result: TestResult) => {
    setTestResult(result);

    // Save locally
    const updated = [result, ...localResults];
    setLocalResults(updated);
    try {
      localStorage.setItem('bandartyping_history', JSON.stringify(updated.slice(0, 50)));
    } catch {
      // Ignore storage errors
    }

    // Post result to backend API
    fetch('/api/results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result),
    }).catch(() => {
      // Offline fallback: saved locally
    });
  };

  // Keyboard Shortcuts (Tab + Enter, Esc, Ctrl + Shift + P)
  useEffect(() => {
    let tabPressed = false;
    let tabTimeout: ReturnType<typeof setTimeout> | null = null;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + Shift + P -> Command Palette
      if (e.ctrlKey && e.shiftKey && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
        return;
      }

      // Esc -> Exit modals or reset test
      if (e.key === 'Escape') {
        if (
          isCustomModalOpen ||
          isSettingsModalOpen ||
          isInfoModalOpen ||
          isNotificationsModalOpen ||
          isCommandPaletteOpen
        ) {
          setIsCustomModalOpen(false);
          setIsSettingsModalOpen(false);
          setIsInfoModalOpen(false);
          setIsNotificationsModalOpen(false);
          setIsCommandPaletteOpen(false);
          return;
        }

        if (currentView !== 'test') {
          setCurrentView('test');
          return;
        }

        initTest();
        return;
      }

      // Tab tracking for Tab + Enter
      if (e.key === 'Tab') {
        e.preventDefault();
        tabPressed = true;
        if (tabTimeout) clearTimeout(tabTimeout);
        tabTimeout = setTimeout(() => {
          tabPressed = false;
        }, 1200);
        return;
      }

      // Enter while Tab was pressed -> Restart test
      if (e.key === 'Enter' && tabPressed) {
        e.preventDefault();
        tabPressed = false;
        initTest();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (tabTimeout) clearTimeout(tabTimeout);
    };
  }, [
    isCustomModalOpen,
    isSettingsModalOpen,
    isInfoModalOpen,
    isNotificationsModalOpen,
    isCommandPaletteOpen,
    currentView,
    initTest,
  ]);

  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="app-container">
      {/* 1. Header */}
      <Header
        currentView={currentView}
        onViewChange={(v) => {
          setCurrentView(v);
          setTestResult(null);
        }}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenInfo={() => setIsInfoModalOpen(true)}
        onOpenNotifications={() => setIsNotificationsModalOpen(true)}
        unreadCount={unreadNotifsCount}
      />

      {/* Main Views */}
      <main className="main-content">
        {currentView === 'leaderboard' ? (
          <LeaderboardView onBack={() => setCurrentView('test')} />
        ) : currentView === 'profile' ? (
          <ProfileView onBack={() => setCurrentView('test')} localResults={localResults} />
        ) : testResult ? (
          /* Results Screen */
          <ResultsScreen
            result={testResult}
            onRestart={initTest}
            onNewTest={initTest}
          />
        ) : (
          /* Primary Typing Test View */
          <>
            {/* 2. Test Settings Bar */}
            <SettingsBar
              mode={settings.mode}
              timeDuration={settings.timeDuration}
              wordCount={settings.wordCount}
              includePunctuation={settings.includePunctuation}
              includeNumbers={settings.includeNumbers}
              onModeChange={(m: TestMode) => {
                setSettings((prev) => ({ ...prev, mode: m }));
              }}
              onTimeChange={(t: TimeDuration) => {
                setSettings((prev) => ({ ...prev, timeDuration: t }));
                setTimeLeft(t);
              }}
              onWordCountChange={(wc: WordCount) => {
                setSettings((prev) => ({ ...prev, wordCount: wc }));
              }}
              onTogglePunctuation={() => {
                setSettings((prev) => ({ ...prev, includePunctuation: !prev.includePunctuation }));
              }}
              onToggleNumbers={() => {
                setSettings((prev) => ({ ...prev, includeNumbers: !prev.includeNumbers }));
              }}
              onOpenCustomModal={() => setIsCustomModalOpen(true)}
              disabled={isTestActive}
            />

            {/* 3. Language Selector */}
            <LanguageSelector
              language={settings.language}
              onLanguageChange={(lang: Language) => {
                let diff = settings.difficulty;
                if (lang === 'hindi-easy') diff = 'easy';
                if (lang === 'hindi-hard') diff = 'hard';
                setSettings((prev) => ({ ...prev, language: lang, difficulty: diff }));
              }}
              disabled={isTestActive}
            />

            {/* 4. Large Hindi Typing Area */}
            {words.length > 0 && (
              <TypingArea
                words={words}
                settings={settings}
                onFinish={handleTestFinish}
                onRestartRequest={initTest}
                isFocused={isFocused}
                setIsFocused={setIsFocused}
                currentWordIndex={currentWordIndex}
                setCurrentWordIndex={setCurrentWordIndex}
                timeLeft={timeLeft}
                setTimeLeft={setTimeLeft}
                liveWpm={liveWpm}
                setLiveWpm={setLiveWpm}
                liveAccuracy={liveAccuracy}
                setLiveAccuracy={setLiveAccuracy}
                isTestActive={isTestActive}
                setIsTestActive={setIsTestActive}
              />
            )}

            {/* 5. Live Statistics */}
            <LiveStats
              mode={settings.mode}
              timeLeft={timeLeft}
              currentWordIndex={currentWordIndex}
              totalWords={settings.mode === 'words' ? settings.wordCount : words.length}
              wpm={liveWpm}
              accuracy={liveAccuracy}
              showLiveWpm={settings.showLiveWpm}
              showLiveAccuracy={settings.showLiveAccuracy}
              isActive={isTestActive}
            />

            {/* 6. Restart Hint */}
            <RestartHint onRestart={initTest} isFocused={isFocused} />
          </>
        )}
      </main>

      {/* Modals & Drawers */}
      <CustomTextModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onSubmit={(text) => {
          setCustomText(text);
          setSettings((prev) => ({ ...prev, mode: 'custom' }));
          initTest();
        }}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onUpdateSettings={(newSettings) => {
          setSettings((prev) => ({ ...prev, ...newSettings }));
        }}
      />

      <InfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
      />

      <NotificationsModal
        isOpen={isNotificationsModalOpen}
        onClose={() => setIsNotificationsModalOpen(false)}
        notifications={notifications}
        onMarkAllRead={() => {
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        }}
      />

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onRestart={initTest}
        onSetMode={(m) => setSettings((prev) => ({ ...prev, mode: m }))}
        onSetDuration={(d) => setSettings((prev) => ({ ...prev, timeDuration: d }))}
        onSetTheme={(t) => setSettings((prev) => ({ ...prev, theme: t }))}
        onOpenLeaderboard={() => setCurrentView('leaderboard')}
        onOpenProfile={() => setCurrentView('profile')}
        onOpenGuide={() => setIsInfoModalOpen(true)}
      />
    </div>
  );
};
export default App;
