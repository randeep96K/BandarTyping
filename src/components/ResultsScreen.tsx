import React, { useEffect, useRef } from 'react';
import type { TestResult } from '../types';
import { RotateCcw, ChevronRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ResultsScreenProps {
  result: TestResult;
  onRestart: () => void;
  onNewTest: () => void;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({
  result,
  onRestart,
  onNewTest,
}) => {
  const chartCanvasRef = useRef<HTMLCanvasElement>(null);

  // Trigger celebration confetti on high performance
  useEffect(() => {
    if (result.wpm >= 45 && result.accuracy >= 92) {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#e2b714', '#ffffff', '#ca4754', '#4facfe'],
      });
    }
  }, [result.wpm, result.accuracy]);

  // Draw Monkeytype-style WPM timeline graph on canvas
  useEffect(() => {
    const canvas = chartCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    const data = result.chartData;
    if (data.length < 2) return;

    const padding = { top: 20, right: 30, bottom: 30, left: 40 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const maxWpm = Math.max(
      ...data.map((d) => Math.max(d.wpm, d.rawWpm)),
      result.wpm + 10,
      40
    );

    // Grid lines
    ctx.strokeStyle = 'rgba(100, 102, 105, 0.15)';
    ctx.lineWidth = 1;
    const gridSteps = 4;
    for (let i = 0; i <= gridSteps; i++) {
      const y = padding.top + (chartH / gridSteps) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      const labelVal = Math.round(maxWpm * (1 - i / gridSteps));
      ctx.fillStyle = '#646669';
      ctx.font = '11px JetBrains Mono';
      ctx.textAlign = 'right';
      ctx.fillText(String(labelVal), padding.left - 8, y + 4);
    }

    // X Axis Labels
    ctx.textAlign = 'center';
    const timeStep = Math.max(1, Math.floor(data.length / 5));
    data.forEach((d, idx) => {
      if (idx % timeStep === 0 || idx === data.length - 1) {
        const x = padding.left + (idx / (data.length - 1)) * chartW;
        ctx.fillText(`${d.second}s`, x, height - 10);
      }
    });

    // Helper for smooth Bezier curve
    const drawCurve = (
      points: { x: number; y: number }[],
      color: string,
      lineWidth: number
    ) => {
      if (points.length === 0) return;
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);

      for (let i = 0; i < points.length - 1; i++) {
        const xc = (points[i].x + points[i + 1].x) / 2;
        const yc = (points[i].y + points[i + 1].y) / 2;
        ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
      }
      ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
      ctx.stroke();
    };

    // Calculate coordinates
    const wpmPoints = data.map((d, i) => ({
      x: padding.left + (i / (data.length - 1)) * chartW,
      y: padding.top + chartH - (d.wpm / maxWpm) * chartH,
    }));

    const rawPoints = data.map((d, i) => ({
      x: padding.left + (i / (data.length - 1)) * chartW,
      y: padding.top + chartH - (d.rawWpm / maxWpm) * chartH,
    }));

    // Draw Raw WPM Line (subtle gray)
    drawCurve(rawPoints, '#4c4e52', 2);

    // Draw Actual WPM Line (bright yellow)
    drawCurve(wpmPoints, '#e2b714', 3);

    // Fill under curve
    if (wpmPoints.length > 0) {
      const grad = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
      grad.addColorStop(0, 'rgba(226, 183, 20, 0.2)');
      grad.addColorStop(1, 'rgba(226, 183, 20, 0.0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(wpmPoints[0].x, wpmPoints[0].y);
      for (let i = 0; i < wpmPoints.length - 1; i++) {
        const xc = (wpmPoints[i].x + wpmPoints[i + 1].x) / 2;
        const yc = (wpmPoints[i].y + wpmPoints[i + 1].y) / 2;
        ctx.quadraticCurveTo(wpmPoints[i].x, wpmPoints[i].y, xc, yc);
      }
      ctx.lineTo(wpmPoints[wpmPoints.length - 1].x, height - padding.bottom);
      ctx.lineTo(wpmPoints[0].x, height - padding.bottom);
      ctx.closePath();
      ctx.fill();
    }

    // Draw error points
    data.forEach((d, i) => {
      if (d.errors > 0) {
        const x = padding.left + (i / (data.length - 1)) * chartW;
        const y = padding.top + chartH - (d.wpm / maxWpm) * chartH;
        ctx.fillStyle = '#ca4754';
        ctx.beginPath();
        ctx.arc(x, y, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }, [result]);

  return (
    <div className="results-container">
      {/* Top Banner: Big WPM & Accuracy */}
      <div className="results-hero">
        <div className="hero-stat-block wpm-block">
          <div className="stat-label">WPM</div>
          <div className="stat-val main-stat">{result.wpm}</div>
          <div className="stat-sub">शब्द प्रति मिनट</div>
        </div>

        <div className="hero-stat-block acc-block">
          <div className="stat-label">सटीकता (ACC)</div>
          <div className="stat-val main-stat">{result.accuracy}%</div>
          <div className="stat-sub">सटीक प्रविष्टियाँ</div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="results-chart-wrapper">
        <div className="chart-legend">
          <span className="legend-item wpm">
            <span className="legend-dot" style={{ background: '#e2b714' }} /> WPM
          </span>
          <span className="legend-item raw">
            <span className="legend-dot" style={{ background: '#4c4e52' }} /> Raw WPM
          </span>
          <span className="legend-item errors">
            <span className="legend-dot" style={{ background: '#ca4754' }} /> त्रुटियाँ
          </span>
        </div>
        <canvas ref={chartCanvasRef} className="results-canvas" />
      </div>

      {/* Comprehensive Secondary Metrics Grid */}
      <div className="results-metrics-grid">
        <div className="metric-card">
          <div className="metric-title">परीक्षण मोड</div>
          <div className="metric-value">
            {result.mode} {result.modeValue}
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-title">अक्षर (Characters)</div>
          <div className="metric-value char-breakdown">
            <span className="correct-val" title="सही अक्षर">
              {result.correctChars}
            </span>
            <span className="divider">/</span>
            <span className="incorrect-val" title="गलत अक्षर">
              {result.incorrectChars}
            </span>
            <span className="divider">/</span>
            <span className="total-val" title="कुल अक्षर">
              {result.totalChars}
            </span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-title">समय (Time)</div>
          <div className="metric-value">{result.duration} सेकंड</div>
        </div>

        <div className="metric-card">
          <div className="metric-title">रॉ WPM (Raw)</div>
          <div className="metric-value">{result.rawWpm}</div>
        </div>

        <div className="metric-card">
          <div className="metric-title">शब्द (Words)</div>
          <div className="metric-value">
            <span className="correct-words">{result.correctWords} सही</span>
            <span className="divider"> - </span>
            <span className="incorrect-words">{result.incorrectWords} गलत</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-title">सुसंगति (Consistency)</div>
          <div className="metric-value">{result.consistency}%</div>
        </div>

        <div className="metric-card">
          <div className="metric-title">बैकस्पेस (Backspaces)</div>
          <div className="metric-value">{result.backspaces}</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="results-actions">
        <button
          type="button"
          className="result-action-btn restart-action-btn"
          onClick={onRestart}
          autoFocus
        >
          <RotateCcw size={17} />
          <span>पुनः प्रयास करें</span>
          <kbd className="btn-kbd">Tab + Enter</kbd>
        </button>

        <button
          type="button"
          className="result-action-btn next-action-btn"
          onClick={onNewTest}
        >
          <span>नया टेस्ट</span>
          <ChevronRight size={17} />
        </button>
      </div>
    </div>
  );
};
