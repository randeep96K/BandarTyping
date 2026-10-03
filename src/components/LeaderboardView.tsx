import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award, ArrowLeft } from 'lucide-react';
import type { LeaderboardEntry } from '../types';

interface LeaderboardViewProps {
  onBack: () => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ onBack }) => {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'all'>('all');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Fallback initial entries
  const defaultEntries: LeaderboardEntry[] = [
    { rank: 1, username: 'अर्जुन_देव', wpm: 78, accuracy: 98.4, tests: 142, mode: 'time 30', date: '03-10-2026' },
    { rank: 2, username: 'प्रिया_शर्मा', wpm: 72, accuracy: 97.2, tests: 98, mode: 'time 60', date: '02-10-2026' },
    { rank: 3, username: 'रोहित_वर्मा', wpm: 68, accuracy: 96.5, tests: 76, mode: 'words 50', date: '02-10-2026' },
    { rank: 4, username: 'अमित_यादव', wpm: 64, accuracy: 99.1, tests: 110, mode: 'time 30', date: '01-10-2026' },
    { rank: 5, username: 'नेहा_सिंह', wpm: 61, accuracy: 95.8, tests: 54, mode: 'words 25', date: '30-09-2026' },
    { rank: 6, username: 'विक्रम_राठौड़', wpm: 58, accuracy: 97.0, tests: 85, mode: 'time 60', date: '29-09-2026' },
    { rank: 7, username: 'काव्या_पटेल', wpm: 55, accuracy: 94.6, tests: 40, mode: 'time 15', date: '28-09-2026' },
    { rank: 8, username: 'सुनील_जोशी', wpm: 52, accuracy: 98.0, tests: 62, mode: 'words 100', date: '28-09-2026' },
    { rank: 9, username: 'मनीषा_गुप्ता', wpm: 49, accuracy: 93.5, tests: 33, mode: 'time 30', date: '27-09-2026' },
    { rank: 10, username: 'दीपक_चौधरी', wpm: 46, accuracy: 95.2, tests: 29, mode: 'quote', date: '25-09-2026' },
  ];

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetch(`/api/leaderboard?period=${period}`)
      .then((res) => {
        if (!res.ok) throw new Error('Network error');
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          if (data.leaderboard && data.leaderboard.length > 0) {
            setEntries(data.leaderboard);
          } else {
            setEntries(defaultEntries);
          }
          setLoading(false);
        }
      })
      .catch((_err) => {
        if (isMounted) {
          setEntries(defaultEntries);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [period]);

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <span className="rank-badge gold"><Trophy size={16} /> 1</span>;
    if (rank === 2) return <span className="rank-badge silver"><Medal size={16} /> 2</span>;
    if (rank === 3) return <span className="rank-badge bronze"><Award size={16} /> 3</span>;
    return <span className="rank-badge standard">{rank}</span>;
  };

  return (
    <div className="view-container leaderboard-view">
      <div className="view-header">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>टाइपिंग टेस्ट पर वापस</span>
        </button>

        <div className="view-title-group">
          <Trophy size={24} className="view-header-icon" />
          <h1 className="view-title">हिंदी टाइपिंग लीडरबोर्ड</h1>
        </div>
        <p className="view-subtitle">सर्वश्रेष्ठ हिंदी टाइपिस्ट और उनकी गति (WPM)</p>
      </div>

      {/* Filter Tabs */}
      <div className="leaderboard-tabs">
        <button
          className={`tab-btn ${period === 'daily' ? 'active' : ''}`}
          onClick={() => setPeriod('daily')}
        >
          दैनिक (Daily)
        </button>
        <button
          className={`tab-btn ${period === 'weekly' ? 'active' : ''}`}
          onClick={() => setPeriod('weekly')}
        >
          साप्ताहिक (Weekly)
        </button>
        <button
          className={`tab-btn ${period === 'monthly' ? 'active' : ''}`}
          onClick={() => setPeriod('monthly')}
        >
          मासिक (Monthly)
        </button>
        <button
          className={`tab-btn ${period === 'all' ? 'active' : ''}`}
          onClick={() => setPeriod('all')}
        >
          सर्वकालिक (All Time)
        </button>
      </div>

      {/* Table */}
      <div className="leaderboard-table-wrapper">
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th className="th-rank">रैंक</th>
              <th className="th-user">उपयोगकर्ता (User)</th>
              <th className="th-wpm">WPM</th>
              <th className="th-acc">सटीकता (ACC)</th>
              <th className="th-tests">टेस्ट</th>
              <th className="th-mode">मोड</th>
              <th className="th-date">दिनांक</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="loading-cell">
                  लीडरबोर्ड लोड हो रहा है...
                </td>
              </tr>
            ) : entries.length === 0 ? (
              <tr>
                <td colSpan={7} className="empty-cell">
                  इस अवधि के लिए कोई रिकॉर्ड उपलब्ध नहीं है।
                </td>
              </tr>
            ) : (
              entries.map((entry) => (
                <tr key={entry.rank} className={entry.rank <= 3 ? `top-row rank-${entry.rank}` : ''}>
                  <td className="td-rank">{getRankBadge(entry.rank)}</td>
                  <td className="td-user">
                    <span className="username-text">{entry.username}</span>
                  </td>
                  <td className="td-wpm">
                    <span className="wpm-highlight">{entry.wpm}</span>
                  </td>
                  <td className="td-acc">{entry.accuracy}%</td>
                  <td className="td-tests">{entry.tests}</td>
                  <td className="td-mode">
                    <span className="mode-pill">{entry.mode}</span>
                  </td>
                  <td className="td-date">{entry.date}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
