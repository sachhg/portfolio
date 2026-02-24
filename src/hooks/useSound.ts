import { useState, useCallback, useRef } from 'react';

const STORAGE_KEY = 'sn-sound-enabled';

// Module-level AudioContext — shared across all hook instances
let audioCtx: AudioContext | null = null;

function getContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  // Resume if suspended (browser autoplay policy)
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function isMuted(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// ── Station select: two-tone metro door chime ──

function chime() {
  const ctx = getContext();
  const now = ctx.currentTime;

  const playTone = (freq: number, start: number) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.08, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.08);
    osc.connect(gain).connect(ctx.destination);
    osc.start(start);
    osc.stop(start + 0.1);
  };

  playTone(880, now);        // A5
  playTone(1108, now + 0.08); // C#6
}

// ── Tour ambient hum ──

let ambientOsc: OscillatorNode | null = null;
let ambientGain: GainNode | null = null;

function startAmbient() {
  const ctx = getContext();
  if (ambientOsc) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.value = 55; // A1 — deep, barely audible
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.03, ctx.currentTime + 1);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  ambientOsc = osc;
  ambientGain = gain;
}

function stopAmbient() {
  if (!ambientGain || !ambientOsc) return;
  const ctx = getContext();
  ambientGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
  const osc = ambientOsc;
  setTimeout(() => {
    try { osc.stop(); } catch { /* already stopped */ }
  }, 600);
  ambientOsc = null;
  ambientGain = null;
}

// ── Hook ──

export function useSound() {
  const [soundEnabled, setSoundEnabled] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored === null ? true : stored === 'true';
    } catch {
      return true;
    }
  });

  const soundEnabledRef = useRef(soundEnabled);
  soundEnabledRef.current = soundEnabled;

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      try { localStorage.setItem(STORAGE_KEY, String(next)); } catch { /* noop */ }
      // Stop ambient hum immediately when muting
      if (!next) stopAmbient();
      return next;
    });
  }, []);

  const playStationSelect = useCallback(() => {
    if (!soundEnabledRef.current || isMuted()) return;
    chime();
  }, []);

  const playTourAmbient = useCallback(() => {
    if (!soundEnabledRef.current || isMuted()) return;
    startAmbient();
  }, []);

  const stopTourAmbient = useCallback(() => {
    stopAmbient();
  }, []);

  return {
    soundEnabled,
    toggleSound,
    playStationSelect,
    playTourAmbient,
    stopTourAmbient,
  };
}
