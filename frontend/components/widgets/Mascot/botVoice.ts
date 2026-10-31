"use client";

/**
 * Lightweight, zero-asset Web Audio API synthesizer for Visor Pod Mascot.
 * Produces soft, warm, non-intrusive sci-fi companion blips (Astro Bot / Wall-E vibe).
 */

let audioCtx: AudioContext | null = null;
let lastBlipTime = 0;

// Dreamy C-major / A-minor pentatonic frequencies (soft & musical, never harsh)
const PENTATONIC_SCALE = [440.0, 523.25, 587.33, 659.25, 783.99, 880.0];

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!audioCtx) {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!Ctx) return null;
      audioCtx = new Ctx();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  } catch {
    return null;
  }
}

/**
 * Plays a soft syllable murmur synced to text streaming.
 * Automatically throttled to ~62ms so speech sounds natural and warm.
 */
export function playSyllableBlip(charCode: number, isQuestion = false): void {
  const ctx = getAudioContext();
  if (!ctx || ctx.state !== 'running') return;

  const now = performance.now();
  if (now - lastBlipTime < 62) return;
  lastBlipTime = now;

  try {
    const t = ctx.currentTime;
    const baseFreq = PENTATONIC_SCALE[charCode % PENTATONIC_SCALE.length];
    const jitter = ((charCode * 13) % 18) - 9;
    const startFreq = baseFreq + jitter;
    const endFreq = isQuestion ? startFreq * 1.12 : startFreq * 0.96;

    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(startFreq, t);
    osc.frequency.exponentialRampToValueAtTime(endFreq, t + 0.046);

    // Warm low-pass filter strips any sharp digital buzz
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1350, t);
    filter.Q.setValueAtTime(1.2, t);

    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(0.024, t + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.048);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.052);
  } catch {
    // Ignore audio errors gracefully
  }
}

/**
 * Friendly two-note ascending chirp when the mascot wakes up to chat.
 */
export function playWakeChime(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const t = ctx.currentTime;
    const notes = [523.25, 783.99]; // C5 -> G5

    notes.forEach((freq, idx) => {
      const start = t + idx * 0.065;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.04, start + 0.07);

      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.linearRampToValueAtTime(0.028, start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.09);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + 0.095);
    });
  } catch {
    // Ignore audio errors gracefully
  }
}

/**
 * Subtle soft acknowledgment blip when the user sends a prompt.
 */
export function playSendBlip(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(659.25, t);
    osc.frequency.exponentialRampToValueAtTime(880.0, t + 0.055);

    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(0.022, t + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.065);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.07);
  } catch {
    // Ignore audio errors gracefully
  }
}
