// src/sound.js
import { state } from './state.js';

let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function toggleMute() {
  state.muted = !state.muted;
  return state.muted;
}

// Generate white noise for sizzle and swat sounds
let noiseBuffer = null;
function getNoiseBuffer(ctx) {
  if (noiseBuffer) return noiseBuffer;
  const bufferSize = ctx.sampleRate * 2; // 2 seconds
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  noiseBuffer = buffer;
  return noiseBuffer;
}

// 1. Sauna sizzle (löyly steam)
export function playSizzle() {
  if (state.muted) return;
  try {
    const ctx = getAudioContext();
    const noise = ctx.createBufferSource();
    noise.buffer = getNoiseBuffer(ctx);

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1200;
    filter.Q.value = 1.0;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.01, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.6, ctx.currentTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.8);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    // Modulate filter frequency to make it sound like rushing steam
    filter.frequency.setValueAtTime(1200, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(2500, ctx.currentTime + 0.3);
    filter.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 1.8);

    noise.start();
    noise.stop(ctx.currentTime + 1.8);
  } catch (e) {
    console.error(e);
  }
}

// 2. Mosquito Swat (quick pop/splat)
export function playSwat() {
  if (state.muted) return;
  try {
    const ctx = getAudioContext();
    
    // Noise snap
    const noise = ctx.createBufferSource();
    noise.buffer = getNoiseBuffer(ctx);

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1000;

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.3, ctx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    
    noise.start();
    noise.stop(ctx.currentTime + 0.1);

    // Pitched slap
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.08);

    oscGain.gain.setValueAtTime(0.4, ctx.currentTime);
    oscGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  } catch (e) {
    console.error(e);
  }
}

// 3. Log wood pickup or throw sound
export function playWood(isDrop = false) {
  if (state.muted) return;
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    if (!isDrop) {
      // Pick up (short sliding up frequency)
      osc.frequency.setValueAtTime(80, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    } else {
      // Drop/Throw (deep resonance)
      osc.frequency.setValueAtTime(100, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
    }

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  } catch (e) {
    console.error(e);
  }
}

// 4. Magical Flower Collection (glissando / chime)
export function playFlower() {
  if (state.muted) return;
  try {
    const ctx = getAudioContext();
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C4, E4, G4, C5, E5, G5, C6
    const now = ctx.currentTime;
    
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.value = freq;
      
      const time = now + idx * 0.06;
      gain.gain.setValueAtTime(0, now);
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.12, time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.4);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(time);
      osc.stop(time + 0.45);
    });
  } catch (e) {
    console.error(e);
  }
}

// 5. Overheat Penalty (warning beep / buzz)
export function playOverheat() {
  if (state.muted) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.setValueAtTime(100, now + 0.15);
    osc.frequency.setValueAtTime(200, now + 0.3);
    
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(now + 0.5);
  } catch (e) {
    console.error(e);
  }
}

// 6. Win Sound (happy theme)
export function playWin() {
  if (state.muted) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const notes = [
      { f: 261.63, d: 0.15 }, // C4
      { f: 329.63, d: 0.15 }, // E4
      { f: 392.00, d: 0.15 }, // G4
      { f: 523.25, d: 0.3 },  // C5
      { f: 392.00, d: 0.15 }, // G4
      { f: 523.25, d: 0.6 }   // C5 (long)
    ];
    
    let timeAcc = 0;
    notes.forEach((note) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.value = note.f;
      
      const startTime = now + timeAcc;
      gain.gain.setValueAtTime(0, now);
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.25, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + note.d);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(startTime);
      osc.stop(startTime + note.d + 0.05);
      
      timeAcc += note.d;
    });
  } catch (e) {
    console.error(e);
  }
}

// 7. Loss Sound (sad theme)
export function playLoss() {
  if (state.muted) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const notes = [
      { f: 311.13, d: 0.25 }, // Eb4
      { f: 293.66, d: 0.25 }, // D4
      { f: 261.63, d: 0.25 }, // C4
      { f: 196.00, d: 0.8 }   // G3
    ];
    
    let timeAcc = 0;
    notes.forEach((note) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.value = note.f;
      
      const startTime = now + timeAcc;
      gain.gain.setValueAtTime(0, now);
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.2, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + note.d);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(startTime);
      osc.stop(startTime + note.d + 0.05);
      
      timeAcc += note.d;
    });
  } catch (e) {
    console.error(e);
  }
}
