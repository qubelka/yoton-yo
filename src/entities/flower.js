// src/entities/flower.js
import { state } from '../state.js';
import { playFlower } from '../sound.js';

export function updateFlowers(dt) {
  if (state.status !== 'PLAYING') return;

  // Max 7 flowers collected
  if (state.flowersCollected >= 7) return;

  // Spawn a flower every 20 seconds
  const currentTime = Date.now();
  const timeSinceLastSpawn = (currentTime - state.lastFlowerSpawnTime) / 1000;
  
  if (state.lastFlowerSpawnTime === 0 || timeSinceLastSpawn > 20.0) {
    // Only spawn if total flowers currently spawned + collected is less than 7
    const totalSpawned = state.activeFlowers.length + state.flowersCollected;
    if (totalSpawned < 7) {
      spawnFlower();
      state.lastFlowerSpawnTime = currentTime;
    }
  }

  // Animate flowers (e.g. glowing scale/rotation pulse)
  state.activeFlowers.forEach(f => {
    f.pulse += dt * 3.0;
  });
}

function spawnFlower() {
  let x = 0;
  let y = 0;
  let attempts = 0;
  let valid = false;

  // Try to find a valid spot in the bottom grass area (y in [430, 600])
  while (!valid && attempts < 100) {
    attempts++;
    x = 40 + Math.random() * 880;
    y = 440 + Math.random() * 160;

    // Check overlaps with other structures:
    // 1. Woodpile: x 80-170, y 450-510
    if (x >= 60 && x <= 190 && y >= 430 && y <= 530) continue;

    // 2. Bonfire: x 450-550, y 510-590
    if (x >= 430 && x <= 570 && y >= 490 && y <= 610) continue;

    // 3. Sauna: x 740-900, y 320-500
    if (x >= 720 && x <= 920 && y >= 300 && y <= 520) continue;

    // 4. Cottage: x 120-300, y 260-420 (flowers are below cottage, but let's be safe)
    if (x >= 100 && x <= 320 && y >= 240 && y <= 440) continue;

    // 5. Check overlay with existing flowers
    let tooClose = false;
    for (let i = 0; i < state.activeFlowers.length; i++) {
      const f = state.activeFlowers[i];
      const dist = Math.sqrt((f.x - x) * (f.x - x) + (f.y - y) * (f.y - y));
      if (dist < 40) {
        tooClose = true;
        break;
      }
    }
    if (tooClose) continue;

    valid = true;
  }

  if (valid) {
    // Generate flower with random rotation and visual pulse offset
    state.activeFlowers.push({
      x: x,
      y: y,
      pulse: Math.random() * Math.PI * 2,
      scale: 1.0,
      color: getRandomFlowerColor()
    });

    // Spawn tiny glow particles around the flower initially
    for (let i = 0; i < 8; i++) {
      state.particles.push({
        x: x,
        y: y,
        vx: (Math.random() * 20 - 10),
        vy: (Math.random() * 20 - 10),
        color: '#ffc5eb',
        size: Math.random() * 2 + 1,
        life: 0.8 + Math.random() * 0.8,
        maxLife: 1.6,
        type: 'sparkle'
      });
    }
  }
}

function getRandomFlowerColor() {
  const colors = [
    '#ff7bf6', // Magic Pink
    '#00f2fe', // Twilight Cyan
    '#ffd066', // Fire Gold
    '#a885ff', // Midnight Lavender
    '#ff5e7e', // Rose Red
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

export function collectFlower(clickX, clickY) {
  if (state.status !== 'PLAYING') return false;

  const clickBox = 25; // flower radius hitcheck
  let collectedIndex = -1;

  for (let i = state.activeFlowers.length - 1; i >= 0; i--) {
    const f = state.activeFlowers[i];
    const dist = Math.sqrt((f.x - clickX) * (f.x - clickX) + (f.y - clickY) * (f.y - clickY));
    if (dist <= clickBox) {
      collectedIndex = i;
      break;
    }
  }

  if (collectedIndex !== -1) {
    const flower = state.activeFlowers[collectedIndex];
    state.activeFlowers.splice(collectedIndex, 1);
    
    state.flowersCollected++;
    state.score += 50;
    
    playFlower();

    // Sparkle fireworks
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 60 + 20;
      state.particles.push({
        x: flower.x,
        y: flower.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: flower.color,
        size: Math.random() * 3 + 2,
        life: 0.6 + Math.random() * 0.6,
        maxLife: 1.2,
        type: 'sparkle'
      });
    }

    // Floating text
    state.floatingTexts.push({
      x: flower.x,
      y: flower.y - 15,
      text: `FLOWER COLLECTED! 🌸 ${state.flowersCollected}/7`,
      color: flower.color,
      size: 16,
      life: 1.5,
      maxLife: 1.5,
      vy: -35
    });

    // Check Victory condition
    if (state.flowersCollected === 7) {
      triggerVictory();
    }

    return true;
  }

  return false;
}

function triggerVictory() {
  state.status = 'VICTORY';
}
