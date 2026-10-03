import { Router, Request, Response } from 'express';
import { db } from './db.js';
import { generateHindiWords, HINDI_QUOTES, getRandomQuote } from '../src/utils/hindiDataset.js';

export const router = Router();

// GET /api/words
router.get('/words', (req: Request, res: Response) => {
  const count = parseInt(req.query.count as string) || 50;
  const difficulty = (req.query.difficulty as 'easy' | 'medium' | 'hard') || 'medium';
  const includePunctuation = req.query.punct === 'true';
  const includeNumbers = req.query.nums === 'true';

  const words = generateHindiWords(count, difficulty, includePunctuation, includeNumbers);
  res.json({ words });
});

// GET /api/quotes
router.get('/quotes', (_req: Request, res: Response) => {
  res.json({ quotes: HINDI_QUOTES });
});

// GET /api/quote/random
router.get('/quote/random', (_req: Request, res: Response) => {
  res.json({ quote: getRandomQuote() });
});

// POST /api/results
router.post('/results', (req: Request, res: Response) => {
  try {
    const {
      username = 'अतिथि',
      wpm,
      rawWpm,
      accuracy,
      correctChars,
      incorrectChars,
      totalChars,
      correctWords,
      incorrectWords,
      backspaces,
      duration,
      mode,
      modeValue,
      consistency = 0,
    } = req.body;

    const stmt = db.prepare(`
      INSERT INTO results (
        username, wpm, raw_wpm, accuracy, correct_chars, incorrect_chars,
        total_chars, correct_words, incorrect_words, backspaces, duration,
        mode, mode_value, consistency
      ) VALUES (
        @username, @wpm, @rawWpm, @accuracy, @correctChars, @incorrectChars,
        @totalChars, @correctWords, @incorrectWords, @backspaces, @duration,
        @mode, @modeValue, @consistency
      )
    `);

    const info = stmt.run({
      username,
      wpm,
      rawWpm,
      accuracy,
      correctChars,
      incorrectChars,
      totalChars,
      correctWords,
      incorrectWords,
      backspaces,
      duration,
      mode,
      modeValue: String(modeValue),
      consistency,
    });

    // Check if result qualifies for leaderboard update
    if (wpm >= 20 && accuracy >= 80) {
      const lbStmt = db.prepare(`
        INSERT INTO leaderboard (username, wpm, accuracy, tests, mode)
        VALUES (?, ?, ?, 1, ?)
      `);
      lbStmt.run(username, wpm, accuracy, `${mode} ${modeValue}`);
    }

    res.json({ success: true, id: info.lastInsertRowid });
  } catch (error) {
    console.error('Error saving result:', error);
    res.status(500).json({ error: 'Failed to save result' });
  }
});

// GET /api/stats
router.get('/stats', (_req: Request, res: Response) => {
  try {
    const row = db.prepare(`
      SELECT 
        COUNT(*) as totalTests,
        COALESCE(ROUND(AVG(wpm), 1), 0) as averageWpm,
        COALESCE(MAX(wpm), 0) as bestWpm,
        COALESCE(ROUND(AVG(accuracy), 1), 0) as averageAccuracy,
        COALESCE(MAX(accuracy), 0) as bestAccuracy,
        COALESCE(SUM(correct_words), 0) as totalTypedWords,
        COALESCE(SUM(duration), 0) as totalPracticeTime
      FROM results
    `).get() as Record<string, number>;

    res.json(row);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// GET /api/history
router.get('/history', (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 30;
    const rows = db.prepare(`
      SELECT 
        id, username, wpm, raw_wpm as rawWpm, accuracy,
        correct_chars as correctChars, incorrect_chars as incorrectChars,
        total_chars as totalChars, duration, mode, mode_value as modeValue,
        consistency, created_at as createdAt
      FROM results
      ORDER BY id DESC
      LIMIT ?
    `).all(limit);

    res.json({ history: rows });
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// GET /api/leaderboard
router.get('/leaderboard', (req: Request, res: Response) => {
  try {
    const period = (req.query.period as string) || 'all';

    let dateFilter = '';
    if (period === 'daily') {
      dateFilter = "WHERE created_at >= datetime('now', '-1 day')";
    } else if (period === 'weekly') {
      dateFilter = "WHERE created_at >= datetime('now', '-7 days')";
    } else if (period === 'monthly') {
      dateFilter = "WHERE created_at >= datetime('now', '-30 days')";
    }

    const rows = db.prepare(`
      SELECT 
        username,
        MAX(wpm) as wpm,
        ROUND(AVG(accuracy), 1) as accuracy,
        COUNT(*) as tests,
        mode,
        COALESCE(strftime('%d-%m-%Y', created_at), date('now')) as date
      FROM leaderboard
      ${dateFilter}
      GROUP BY username
      ORDER BY wpm DESC, accuracy DESC
      LIMIT 50
    `).all();

    const ranked = rows.map((r, i) => ({
      rank: i + 1,
      ...r,
    }));

    res.json({ leaderboard: ranked });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// POST /api/custom
router.post('/custom', (req: Request, res: Response) => {
  try {
    const { title = 'कस्टम टेक्स्ट', content } = req.body;
    if (!content || typeof content !== 'string') {
      res.status(400).json({ error: 'Content is required' });
      return;
    }

    const stmt = db.prepare('INSERT INTO custom_texts (title, content) VALUES (?, ?)');
    const info = stmt.run(title, content.trim());
    res.json({ success: true, id: info.lastInsertRowid });
  } catch (error) {
    console.error('Error saving custom text:', error);
    res.status(500).json({ error: 'Failed to save custom text' });
  }
});

// GET /api/custom
router.get('/custom', (_req: Request, res: Response) => {
  try {
    const rows = db.prepare('SELECT id, title, content, created_at as createdAt FROM custom_texts ORDER BY id DESC LIMIT 20').all();
    res.json({ customTexts: rows });
  } catch (error) {
    console.error('Error fetching custom texts:', error);
    res.status(500).json({ error: 'Failed to fetch custom texts' });
  }
});
