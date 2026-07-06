// src/utils/audio.ts

let audioCtx: AudioContext | null = null;
let historicalMin = 10;
let historicalMax = 100;

// 15-note C Major Pentatonic Scale spanning 3 octaves (gentler, lower range)
const PENTATONIC_SCALE = [
  // Octave 3 (Low)
  130.81, 146.83, 164.81, 196.00, 220.00, // C3, D3, E3, G3, A3
  // Octave 4 (Mid)
  261.63, 293.66, 329.63, 392.00, 440.00, // C4, D4, E4, G4, A4
  // Octave 5 (High)
  523.25, 587.33, 659.25, 783.99, 880.00  // C5, D5, E5, G5, A5
];

export const playTone = (
  value: number, 
  type: 'compare' | 'swap' | 'write' | 'visit' | 'lock' | 'success' = 'compare'
) => {
  try {
    // 1. Initialize context lazily on user interaction
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }

    if (!audioCtx) return;
    const ctx = audioCtx; // Local non-null const alias for compiler safety

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    if (type === 'success' || type === 'lock') {
      // Reset bounds for the next execution run
      historicalMin = Infinity;
      historicalMax = -Infinity;

      // Play a beautiful, gentle 3-note ascending major triad arpeggio (C5 -> E5 -> G5)
      const chimeFreqs = [523.25, 659.25, 783.99]; // C5, E5, G5
      chimeFreqs.forEach((f, i) => {
        const o = ctx.createOscillator();
        const filt = ctx.createBiquadFilter();
        const g = ctx.createGain();
        o.connect(filt);
        filt.connect(g);
        g.connect(ctx.destination);
        
        filt.type = 'lowpass';
        filt.frequency.value = 900;
        o.type = 'sine';
        o.frequency.value = f;

        const startTime = ctx.currentTime + i * 0.12;
        const duration = 0.25;

        g.gain.setValueAtTime(0, startTime);
        g.gain.linearRampToValueAtTime(0.015, startTime + 0.005);
        g.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

        o.start(startTime);
        o.stop(startTime + duration);
      });
      return;
    }

    // Update dynamic range bounds based on visualizer values
    if (value < historicalMin) historicalMin = value;
    if (value > historicalMax) historicalMax = value;

    const range = historicalMax - historicalMin;
    const percent = range > 0 ? (value - historicalMin) / range : 0.5;

    // Map percentage to Pentatonic Scale index
    let index = Math.floor(percent * PENTATONIC_SCALE.length);
    index = Math.max(0, Math.min(index, PENTATONIC_SCALE.length - 1));
    const freq = PENTATONIC_SCALE[index];

    // Create oscillator, lowpass filter, and gain node
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    filter.type = 'lowpass';
    filter.frequency.value = 800; // Warm marimba-like filter cutoff
    osc.frequency.value = freq;

    // Define parameters based on operation type (gentle, warm tones)
    let oscType: OscillatorType = 'sine';
    let volume = 0.01;
    let duration = 0.05;

    if (type === 'compare' || type === 'visit') {
      oscType = 'sine';
      volume = type === 'compare' ? 0.01 : 0.008;
      duration = type === 'compare' ? 0.05 : 0.035;
    } else if (type === 'write') {
      oscType = 'sine';
      volume = 0.012;
      duration = 0.06;
    } else if (type === 'swap') {
      // Swaps use triangle wave for a soft woody pluck sound
      oscType = 'triangle';
      volume = 0.015;
      duration = 0.08;
    }

    osc.type = oscType;

    // Anti-click soft envelope (5ms attack, exponential decay)
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    console.warn('Web Audio playback failed or not supported:', e);
  }
};
