export type TestMode = 'time' | 'words' | 'quote' | 'zen' | 'custom';
export type TimeDuration = 15 | 30 | 60 | 120;
export type WordCount = 10 | 25 | 50 | 100;
export type QuoteLength = 'all' | 'short' | 'medium' | 'long';
export type ThemeId = 'bandar-dark' | 'monokai' | 'midnight' | 'maroon' | 'matrix' | 'nord';
export type CaretStyle = 'line' | 'block' | 'underline' | 'hidden';
export type SoundType = 'off' | 'mechanical' | 'modern' | 'typewriter';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type Language = 'hindi' | 'hindi-easy' | 'hindi-hard';

export interface TestSettings {
  mode: TestMode;
  timeDuration: TimeDuration;
  wordCount: WordCount;
  includePunctuation: boolean;
  includeNumbers: boolean;
  language: Language;
  difficulty: Difficulty;
  theme: ThemeId;
  fontSize: 'small' | 'medium' | 'large' | 'xlarge';
  fontFamily: string;
  caretStyle: CaretStyle;
  smoothCaret: boolean;
  sound: SoundType;
  showLiveWpm: boolean;
  showLiveAccuracy: boolean;
  showTimer: boolean;
}

export interface ChartDataPoint {
  second: number;
  wpm: number;
  rawWpm: number;
  errors: number;
}

export interface TestResult {
  id?: string | number;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  correctChars: number;
  incorrectChars: number;
  totalChars: number;
  correctWords: number;
  incorrectWords: number;
  backspaces: number;
  duration: number; // seconds
  mode: TestMode;
  modeValue: number | string;
  consistency: number;
  timestamp: number;
  chartData: ChartDataPoint[];
}

export interface UserStats {
  totalTests: number;
  averageWpm: number;
  bestWpm: number;
  averageAccuracy: number;
  bestAccuracy: number;
  totalTypedWords: number;
  totalPracticeTime: number; // in seconds
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  wpm: number;
  accuracy: number;
  tests: number;
  mode: string;
  date: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
}
