// src/utils/audio.ts

let audioCtx: AudioContext | null = null;

export const playTone = (
  value: number, 
  type: 'compare' | 'swap' | 'write' | 'visit' | 'lock' | 'success' = 'compare'
) => {
  try {
    // 1. Initialize context lazily on user interaction
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    // 2. Create oscillator and gain node
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    // 3. Map value to pitch frequency (higher values -> higher pitches)
    // Map array values (roughly 10 - 100) to frequency range 220Hz - 880Hz
    const minVal = 10;
    const maxVal = 100;
    const minFreq = 220;
    const maxFreq = 880;
    
    let freq = minFreq + ((value - minVal) / (maxVal - minVal)) * (maxFreq - minFreq);
    if (isNaN(freq) || freq < 100 || freq > 2000) freq = 440; // fallback A4

    osc.frequency.value = freq;

    // 4. Configure tone type / waveform
    if (type === 'compare' || type === 'visit') {
      osc.type = 'triangle';
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + 0.1);
    } else if (type === 'swap') {
      osc.type = 'sawtooth';
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + 0.15);
    } else if (type === 'write') {
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);
      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + 0.12);
    } else if (type === 'success' || type === 'lock') {
      // Ascending arpeggio chime!
      const chimeFreqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      chimeFreqs.forEach((f, i) => {
        const o = audioCtx!.createOscillator();
        const g = audioCtx!.createGain();
        o.connect(g);
        g.connect(audioCtx!.destination);
        o.type = 'sine';
        o.frequency.value = f;
        g.gain.setValueAtTime(0.08, audioCtx!.currentTime + i * 0.08);
        g.gain.exponentialRampToValueAtTime(0.001, audioCtx!.currentTime + i * 0.08 + 0.25);
        o.start(audioCtx!.currentTime + i * 0.08);
        o.stop(audioCtx!.currentTime + i * 0.08 + 0.25);
      });
    }
  } catch (e) {
    console.warn('Web Audio playback failed or not supported:', e);
  }
};
