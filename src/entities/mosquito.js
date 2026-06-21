// src/entities/mosquito.js
import { state } from '../state.js';
import { playSwat } from '../sound.js';

export function updateMosquitoes(dt) {
  if (state.status !== 'PLAYING') return;

  // 1. Spawning schedule: Randomly spawn every 2-4 seconds
  const currentTime = Date.now();
  const timeSinceLastSpawn = (currentTime - state.lastMosquitoSpawnTime) / 1000;
  
  // Decide next spawn threshold (between 2.0 and 4.0 seconds)
  // Store the threshold dynamically, or randomize check
  if (state.lastMosquitoSpawnTime === 0 || timeSinceLastSpawn > (2.0 + Math.random() * 2.0)) {
    spawnMosquito();
    state.lastMosquitoSpawnTime = currentTime;
  }

  // 2. Erratic, jittery movement update
  state.activeMosquitoes.forEach(m => {
    // Add jitter forces
    m.vx += (Math.random() * 600 - 300) * dt;
    m.vy += (Math.random() * 600 - 300) * dt;

    // Cap velocity
    const speed = Math.sqrt(m.vx * m.vx + m.vy * m.vy);
    const maxSpeed = 160;
    if (speed > maxSpeed) {
      m.vx = (m.vx / speed) * maxSpeed;
      m.vy = (m.vy / speed) * maxSpeed;
    }

    // Apply movement
    m.x += m.vx * dt;
    m.y += m.vy * dt;

    // Soft bounds check & bounce back
    if (m.x < 30) { m.x = 30; m.vx *= -1; }
    if (m.x > 930) { m.x = 930; m.vx *= -1; }
    if (m.y < 30) { m.y = 30; m.vy *= -1; }
    if (m.y > 610) { m.y = 610; m.vy *= -1; }

    // Wing flap animation frame increment
    m.flapTimer += dt * 30;
  });

  // 3. Cozy Meter drainage penalty check
  // If activeMosquitoes.length > 5, drain cozyMeter by 5 per second
  if (state.activeMosquitoes.length > 5) {
    state.cozyMeter -= 5.0 * dt;
    
    // Low-frequency screen shake when cozy meter drains
    if (Math.random() < 0.1) {
      state.screenShake = Math.max(state.screenShake, 2);
    }

    if (state.cozyMeter <= 0) {
      state.cozyMeter = 0;
      triggerMosquitoLoss();
    }
  }
}

function spawnMosquito() {
  // Spawn at screen edges
  const side = Math.floor(Math.random() * 4);
  let x = 0, y = 0;
  
  if (side === 0) { // Top
    x = Math.random() * 960;
    y = -10;
  } else if (side === 1) { // Right
    x = 970;
    y = Math.random() * 640;
  } else if (side === 2) { // Bottom
    x = Math.random() * 960;
    y = 650;
  } else { // Left
    x = -10;
    y = Math.random() * 640;
  }

  // Erratic properties
  state.activeMosquitoes.push({
    x: x,
    y: y,
    vx: (Math.random() * 100 - 50),
    vy: (Math.random() * 100 - 50),
    flapTimer: Math.random() * 10,
    size: 8 + Math.random() * 6,
    id: Math.random().toString(36).substr(2, 9)
  });
}

export function swatMosquito(clickX, clickY) {
  if (state.status !== 'PLAYING') return false;

  const clickBox = 30; // Intersect bounding box range (30x30 pixels)
  let swattedIndex = -1;

  for (let i = state.activeMosquitoes.length - 1; i >= 0; i--) {
    const m = state.activeMosquitoes[i];
    if (Math.abs(m.x - clickX) <= clickBox && Math.abs(m.y - clickY) <= clickBox) {
      swattedIndex = i;
      break;
    }
  }

  if (swattedIndex !== -1) {
    const swatted = state.activeMosquitoes[swattedIndex];
    state.activeMosquitoes.splice(swattedIndex, 1);
    state.score += 10;
    state.screenShake = 6;
    playSwat();

    // Spawn red/brown splat particles
    for (let i = 0; i < 10; i++) {
      state.particles.push({
        x: swatted.x,
        y: swatted.y,
        vx: (Math.random() * 80 - 40),
        vy: (Math.random() * 80 - 40),
        color: Math.random() > 0.4 ? '#8a1c14' : '#2d1310',
        size: Math.random() * 3 + 1,
        life: 0.4 + Math.random() * 0.4,
        maxLife: 0.8,
        type: 'splat'
      });
    }

    // Floating text
    state.floatingTexts.push({
      x: swatted.x,
      y: swatted.y,
      text: '+10',
      color: '#ff4b4b',
      size: 14,
      life: 0.8,
      maxLife: 0.8,
      vy: -40
    });

    return true;
  }

  return false;
}

function triggerMosquitoLoss() {
  state.status = 'GAMEOVER';
  
  // Custom loss reason
  const reasonText = document.getElementById('gameover-reason');
  if (reasonText) {
    reasonText.textContent = 'The mosquitoes swarmed and drained your Cozy Meter. You retreated inside the cottage in defeat.';
  }
}
