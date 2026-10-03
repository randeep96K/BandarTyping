import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Activity, Flame, Clock, Award, Target, BookOpen } from 'lucide-react';
import type { UserStats, TestResult } from '../types';

interface ProfileViewProps {
  onBack: () => void;
  localResults: TestResult[];
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onBack, localResults }) => {
  const [stats, setStats] = useState<UserStats>({
    totalTests: 0,
    averageWpm: 0,
    bestWpm: 0,
    averageAccuracy: 0,
    bestAccuracy: 0,
    totalTypedWords: 0,
    totalPracticeTime: 0,
  });

  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    // Fetch stats from backend API
    fetch('/api/stats')
      .then((res) => (res.ok ? res.json() : null))
      .then((serverStats) => {
        if (serverStats && serverStats.totalTests > 0) {
          setStats(serverStats);
        } else if (localResults.length > 0) {
          // Compute from local results
          const count = localResults.length;
          const totalWpm = localResults.reduce((s, r) => s + r.wpm, 0);
          const bestWpm = Math.max(...localResults.map((r) => r.wpm));
          const totalAcc = localResults.reduce((s, r) => s + r.accuracy, 0);
          const bestAcc = Math.max(...localResults.map((r) => r.accuracy));
          const totalWords = localResults.reduce((s, r) => s + r.correctWords, 0);
          const totalSecs = localResults.reduce((s, r) => s + r.duration, 0);

          setStats({
            totalTests: count,
            averageWpm: Math.round(totalWpm / count),
            bestWpm,
            averageAccuracy: Number((totalAcc / count).toFixed(1)),
            bestAccuracy: bestAcc,
            totalTypedWords: totalWords,
            totalPracticeTime: totalSecs,
          });
        }
      })
      .catch(() => {
        // Fallback to local
        if (localResults.length > 0) {
          const count = localResults.length;
          const totalWpm = localResults.reduce((s, r) => s + r.wpm, 0);
          const bestWpm = Math.max(...localResults.map((r) => r.wpm));
          const totalAcc = localResults.reduce((s, r) => s + r.accuracy, 0);
          const bestAcc = Math.max(...localResults.map((r) => r.accuracy));
          const totalWords = localResults.reduce((s, r) => s + r.correctWords, 0);
          const totalSecs = localResults.reduce((s, r) => s + r.duration, 0);

          setStats({
            totalTests: count,
            averageWpm: Math.round(totalWpm / count),
            bestWpm,
            averageAccuracy: Number((totalAcc / count).toFixed(1)),
            bestAccuracy: bestAcc,
            totalTypedWords: totalWords,
            totalPracticeTime: totalSecs,
          });
        }
      });

    // Fetch history
    fetch('/api/history')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.history && data.history.length > 0) {
          setHistory(data.history);
        } else if (localResults.length > 0) {
          setHistory(
            localResults.map((r) => ({
              id: r.id || r.timestamp,
              mode: r.mode,
              modeValue: r.modeValue,
              wpm: r.wpm,
              accuracy: r.accuracy,
              duration: r.duration,
              createdAt: new Date(r.timestamp).toLocaleDateString('hi-IN'),
            }))
          );
        }
      })
      .catch(() => {
        if (localResults.length > 0) {
          setHistory(
            localResults.map((r) => ({
              id: r.id || r.timestamp,
              mode: r.mode,
              modeValue: r.modeValue,
              wpm: r.wpm,
              accuracy: r.accuracy,
              duration: r.duration,
              createdAt: new Date(r.timestamp).toLocaleDateString('hi-IN'),
            }))
          );
        }
      });
  }, [localResults]);

  const formatDuration = (seconds: number) => {
    if (seconds >= 3600) {
      const hrs = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      return `${hrs} घंटा ${mins} मिनट`;
    }
    if (seconds >= 60) {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins} मिनट ${secs} सेकंड`;
    }
    return `${seconds} सेकंड`;
  };

  return (
    <div className="view-container profile-view">
      <div className="view-header">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>टाइपिंग टेस्ट पर वापस</span>
        </button>

        <div className="view-title-group">
          <User size={24} className="view-header-icon" />
          <h1 className="view-title">टाइपिस्ट प्रोफ़ाइल एवं आँकड़े</h1>
        </div>
        <p className="view-subtitle">आपकी व्यक्तिगत हिंदी टाइपिंग प्रगति और इतिहास</p>
      </div>

      {/* Stats Summary Cards */}
      <div className="profile-stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="card-label">कुल टेस्ट (Tests)</span>
            <Activity size={18} className="card-icon" />
          </div>
          <div className="card-val">{stats.totalTests}</div>
          <div className="card-sub">सम्पन्न परीक्षण</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="card-label">औसत गति (Avg WPM)</span>
            <Clock size={18} className="card-icon" />
          </div>
          <div className="card-val">{stats.averageWpm}</div>
          <div className="card-sub">शब्द प्रति मिनट</div>
        </div>

        <div className="stat-card highlight-card">
          <div className="stat-card-header">
            <span className="card-label">सर्वश्रेष्ठ गति (Best WPM)</span>
            <Flame size={18} className="card-icon gold-icon" />
          </div>
          <div className="card-val gold-text">{stats.bestWpm}</div>
          <div className="card-sub">सर्वोच्च व्यक्तिगत रिकॉर्ड</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="card-label">औसत सटीकता (Avg Acc)</span>
            <Target size={18} className="card-icon" />
          </div>
          <div className="card-val">{stats.averageAccuracy}%</div>
          <div className="card-sub">सटीक कीस्ट्रोक्स</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="card-label">सर्वश्रेष्ठ सटीकता (Best Acc)</span>
            <Award size={18} className="card-icon" />
          </div>
          <div className="card-val">{stats.bestAccuracy}%</div>
          <div className="card-sub">न्यूनतम त्रुटि दर</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="card-label">टाइप किए शब्द</span>
            <BookOpen size={18} className="card-icon" />
          </div>
          <div className="card-val">{stats.totalTypedWords}</div>
          <div className="card-sub">कुल सफल शब्द</div>
        </div>

        <div className="stat-card full-span-card">
          <div className="stat-card-header">
            <span className="card-label">कुल अभ्यास समय</span>
            <Clock size={18} className="card-icon" />
          </div>
          <div className="card-val practice-time-val">{formatDuration(stats.totalPracticeTime)}</div>
          <div className="card-sub">निरंतर अभ्यास से हिंदी टाइपिंग में निपुणता बढ़ती है</div>
        </div>
      </div>

      {/* History Table */}
      <div className="history-section">
        <h2 className="history-heading">परीक्षण इतिहास (Test History)</h2>

        <div className="history-table-wrapper">
          <table className="history-table">
            <thead>
              <tr>
                <th>दिनांक</th>
                <th>मोड</th>
                <th>WPM</th>
                <th>सटीकता (ACC)</th>
                <th>अवधि</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td colSpan={5} className="empty-cell">
                    अभी तक कोई परीक्षण इतिहास नहीं है। एक टेस्ट पूरा करें!
                  </td>
                </tr>
              ) : (
                history.map((item, idx) => (
                  <tr key={idx}>
                    <td className="td-date">{item.createdAt || 'आज'}</td>
                    <td className="td-mode">
                      <span className="mode-pill">
                        {item.mode} {item.modeValue || ''}
                      </span>
                    </td>
                    <td className="td-wpm">{item.wpm}</td>
                    <td className="td-acc">{item.accuracy}%</td>
                    <td className="td-dur">{item.duration}s</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
