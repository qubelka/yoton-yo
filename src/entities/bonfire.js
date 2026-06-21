// src/entities/bonfire.js
import { state } from '../state.js';
import { playWood } from '../sound.js';

export function updateBonfire(dt) {
  if (state.status !== 'PLAYING') return;

  // bonfireFuel drops by 1.5 per second
  state.bonfireFuel -= 1.5 * dt;
  if (state.bonfireFuel <= 0) {
    state.bonfireFuel = 0;
    triggerFireOutLoss();
  }

  // Constantly spawn minor flame particles for the bonfire
  // Bonfire coordinate: x: 450, y: 510, w: 100, h: 80
  const fx = state.bonfirePos.x + state.bonfirePos.w / 2;
  const fy = state.bonfirePos.y + state.bonfirePos.h - 10;
  
  if (Math.random() < 0.25 * (state.bonfireFuel / 50 + 0.2)) {
    // Generate sparks
    state.particles.push({
      x: fx + (Math.random() * 40 - 20),
      y: fy,
      vx: (Math.random() * 30 - 15),
      vy: -(Math.random() * 80 + 40),
      color: Math.random() > 0.3 ? '#ff9d00' : '#ff4d00',
      size: Math.random() * 3 + 1,
      life: 0.8 + Math.random() * 0.6,
      maxLife: 1.4,
      type: 'spark'
    });
  }
}

export function pickUpLog() {
  if (state.status !== 'PLAYING') return;
  if (state.hasLog) {
    // Already carrying a log
    return;
  }

  state.hasLog = true;
  playWood(false);

  // Floating text feedback
  state.floatingTexts.push({
    x: state.woodpilePos.x + state.woodpilePos.w / 2,
    y: state.woodpilePos.y - 15,
    text: 'CARRYING LOG',
    color: '#ffbe8f',
    size: 14,
    life: 1.0,
    maxLife: 1.0,
    vy: -25
  });
}

export function feedBonfire() {
  if (state.status !== 'PLAYING') return;
  if (!state.hasLog) return;

  state.bonfireFuel = Math.min(100, state.bonfireFuel + 30);
  state.hasLog = false;
  playWood(true);

  // Spark burst particles
  const fx = state.bonfirePos.x + state.bonfirePos.w / 2;
  const fy = state.bonfirePos.y + state.bonfirePos.h - 10;
  
  for (let i = 0; i < 25; i++) {
    state.particles.push({
      x: fx + (Math.random() * 30 - 15),
      y: fy - 10,
      vx: (Math.random() * 120 - 60),
      vy: -(Math.random() * 100 + 60),
      color: Math.random() > 0.4 ? '#ff5500' : '#ffd000',
      size: Math.random() * 4 + 2,
      life: 0.5 + Math.random() * 0.7,
      maxLife: 1.2,
      type: 'spark'
    });
  }

  // Floating text
  state.floatingTexts.push({
    x: fx,
    y: state.bonfirePos.y - 15,
    text: 'FUEL ADDED +30',
    color: '#ff9d00',
    size: 16,
    life: 1.0,
    maxLife: 1.0,
    vy: -30
  });
}

function triggerFireOutLoss() {
  state.status = 'GAMEOVER';
  
  // Custom loss reason
  const reasonText = document.getElementById('gameover-reason');
  if (reasonText) {
    reasonText.textContent = 'Midsummer night was too cold without the bonfire. The spirits of the forest left.';
  }
}
