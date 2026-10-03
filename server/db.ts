import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'bandartyping.db');
export const db = new Database(dbPath);

// Enable WAL mode for high concurrency
db.pragma('journal_mode = WAL');

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL DEFAULT 'अतिथि',
    wpm INTEGER NOT NULL,
    raw_wpm INTEGER NOT NULL,
    accuracy REAL NOT NULL,
    correct_chars INTEGER NOT NULL,
    incorrect_chars INTEGER NOT NULL,
    total_chars INTEGER NOT NULL,
    correct_words INTEGER NOT NULL,
    incorrect_words INTEGER NOT NULL,
    backspaces INTEGER NOT NULL,
    duration INTEGER NOT NULL,
    mode TEXT NOT NULL,
    mode_value TEXT NOT NULL,
    consistency REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS leaderboard (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    wpm INTEGER NOT NULL,
    accuracy REAL NOT NULL,
    tests INTEGER NOT NULL,
    mode TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS custom_texts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed initial leaderboard if empty
const countStmt = db.prepare('SELECT COUNT(*) as count FROM leaderboard');
const result = countStmt.get() as { count: number };

if (result.count === 0) {
  const seedLeaderboard = [
    { username: 'अर्जुन_देव', wpm: 78, accuracy: 98.4, tests: 142, mode: 'time 30' },
    { username: 'प्रिया_शर्मा', wpm: 72, accuracy: 97.2, tests: 98, mode: 'time 60' },
    { username: 'रोहित_वर्मा', wpm: 68, accuracy: 96.5, tests: 76, mode: 'words 50' },
    { username: 'अमित_यादव', wpm: 64, accuracy: 99.1, tests: 110, mode: 'time 30' },
    { username: 'नेहा_सिंह', wpm: 61, accuracy: 95.8, tests: 54, mode: 'words 25' },
    { username: 'विक्रम_राठौड़', wpm: 58, accuracy: 97.0, tests: 85, mode: 'time 60' },
    { username: 'काव्या_पटेल', wpm: 55, accuracy: 94.6, tests: 40, mode: 'time 15' },
    { username: 'सुनील_जोशी', wpm: 52, accuracy: 98.0, tests: 62, mode: 'words 100' },
    { username: 'मनीषा_गुप्ता', wpm: 49, accuracy: 93.5, tests: 33, mode: 'time 30' },
    { username: 'दीपक_चौधरी', wpm: 46, accuracy: 95.2, tests: 29, mode: 'quote' },
  ];

  const insertStmt = db.prepare(`
    INSERT INTO leaderboard (username, wpm, accuracy, tests, mode, created_at)
    VALUES (@username, @wpm, @accuracy, @tests, @mode, datetime('now', '-' || (abs(random()) % 15) || ' days'))
  `);

  const insertMany = db.transaction((rows) => {
    for (const row of rows) insertStmt.run(row);
  });

  insertMany(seedLeaderboard);
}
