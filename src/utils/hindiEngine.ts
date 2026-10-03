// Hindi typing engine with Devanagari grapheme segmentation, metrics, and sound synthesis

// Create Intl.Segmenter for Hindi graphemes
let hindiSegmenter: Intl.Segmenter | null = null;
try {
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    hindiSegmenter = new Intl.Segmenter('hi', { granularity: 'grapheme' });
  }
} catch {
  hindiSegmenter = null;
}

/**
 * Accurately segments Hindi / Devanagari text into visual grapheme clusters.
 * Handles संयुक्त अक्षर, मात्राएँ, हलन्त, अनुस्वार, विसर्ग, etc.
 */
export function getGraphemeClusters(text: string): string[] {
  if (!text) return [];
  const normalized = text.normalize('NFC');

  if (hindiSegmenter) {
    return Array.from(hindiSegmenter.segment(normalized)).map((s) => s.segment);
  }

  // Fallback Devanagari cluster regex if Intl.Segmenter is unavailable
  // Matches base letter followed by optional virama + letter combos, matras, nuktas, anusvara, visarga
  const devanagariClusterRegex = /[\u0900-\u097F](?:[\u093C]?[\u094D][\u0900-\u097F]|[\u093E-\u094C\u0962\u0963]|[\u0901-\u0903]|[\u093C])*/gu;
  const matches = normalized.match(devanagariClusterRegex);
  return matches || Array.from(normalized);
}

export type ClusterStatus = 'untyped' | 'correct' | 'incorrect' | 'active' | 'extra';

export interface EvaluatedCluster {
  cluster: string;
  status: ClusterStatus;
  isExtra?: boolean;
}

export interface EvaluatedWord {
  targetWord: string;
  typedText: string;
  clusters: EvaluatedCluster[];
  isFullyTyped: boolean;
  isCorrect: boolean;
  hasErrors: boolean;
}

/**
 * Evaluates the user's typed string against the target Hindi word.
 * Treats Devanagari grapheme clusters as cohesive units so matras and conjuncts
 * are evaluated properly.
 */
export function evaluateHindiWord(
  targetWord: string,
  typedText: string,
  isCurrentWord: boolean
): EvaluatedWord {
  const normTarget = targetWord.normalize('NFC');
  const normTyped = typedText.normalize('NFC');

  const targetClusters = getGraphemeClusters(normTarget);
  const typedClusters = getGraphemeClusters(normTyped);

  const evaluatedClusters: EvaluatedCluster[] = [];
  let hasErrors = false;

  // Compare cluster by cluster
  for (let i = 0; i < targetClusters.length; i++) {
    const tCluster = targetClusters[i];

    if (i < typedClusters.length) {
      const uCluster = typedClusters[i];

      if (uCluster === tCluster) {
        evaluatedClusters.push({
          cluster: tCluster,
          status: 'correct',
        });
      } else {
        // If this is the active cluster in the current word, check if user is mid-typing
        // e.g. target is 'प्रौ' and user typed 'प' or 'प्र'
        const isPrefix = isCurrentWord && i === typedClusters.length - 1 && tCluster.startsWith(uCluster);
        if (isPrefix) {
          evaluatedClusters.push({
            cluster: tCluster,
            status: 'active',
          });
        } else {
          hasErrors = true;
          evaluatedClusters.push({
            cluster: tCluster,
            status: 'incorrect',
          });
        }
      }
    } else {
      // Untyped clusters
      evaluatedClusters.push({
        cluster: tCluster,
        status: 'untyped',
      });
    }
  }

  // Any extra characters typed past target length
  if (typedClusters.length > targetClusters.length) {
    hasErrors = true;
    for (let i = targetClusters.length; i < typedClusters.length; i++) {
      evaluatedClusters.push({
        cluster: typedClusters[i],
        status: 'extra',
        isExtra: true,
      });
    }
  }

  const isFullyTyped = typedClusters.length >= targetClusters.length;
  const isCorrect = normTyped === normTarget;

  return {
    targetWord: normTarget,
    typedText: normTyped,
    clusters: evaluatedClusters,
    isFullyTyped,
    isCorrect,
    hasErrors,
  };
}

/**
 * Standard WPM and Accuracy calculation
 * WPM = (correct characters / 5) / (durationInSeconds / 60)
 */
export function calculateTypingMetrics(
  correctChars: number,
  incorrectChars: number,
  totalKeystrokes: number,
  durationInSeconds: number
) {
  const minutes = Math.max(0.001, durationInSeconds / 60);
  const totalTyped = correctChars + incorrectChars;

  const wpm = Math.max(0, Math.round((correctChars / 5) / minutes));
  const rawWpm = Math.max(0, Math.round((totalKeystrokes / 5) / minutes));
  const accuracy = totalTyped > 0 ? Math.max(0, Math.min(100, (correctChars / totalTyped) * 100)) : 100;

  return {
    wpm,
    rawWpm,
    accuracy: Number(accuracy.toFixed(1)),
  };
}

// Procedural Web Audio Sound Synthesizer
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      audioCtx = new AudioCtx();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export type SoundType = 'off' | 'mechanical' | 'modern' | 'typewriter';

export function playKeySound(type: SoundType, isError: boolean = false) {
  if (type === 'off') return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  if (isError) {
    // Soft error tone
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(70, now + 0.08);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
    return;
  }

  if (type === 'mechanical') {
    // Click + subtle resonance like a mechanical switch (Cherry MX Brown)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    // Randomize pitch slightly for organic typing realism
    const pitchJitter = (Math.random() - 0.5) * 80;
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1200 + pitchJitter, now);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.035);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1600, now);
    filter.Q.setValueAtTime(3, now);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.035);
  } else if (type === 'modern') {
    // Crisp subtle pebble click
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    const pitch = 850 + (Math.random() - 0.5) * 50;
    osc.frequency.setValueAtTime(pitch, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.02);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.02);
  } else if (type === 'typewriter') {
    // Thump and metallic clack
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.04);

    gain.gain.setValueAtTime(0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.04);
  }
}
