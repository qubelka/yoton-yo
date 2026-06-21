// src/input.js
import { state } from './state.js';
import { throwWater } from './entities/sauna.js';
import { pickUpLog, feedBonfire } from './entities/bonfire.js';
import { swatMosquito } from './entities/mosquito.js';
import { collectFlower } from './entities/flower.js';
import { toggleMute } from './sound.js';

export function setupInput(canvas) {
  // 1. Keyboard event listeners
  window.addEventListener('keydown', (e) => {
    if (state.status !== 'PLAYING') return;

    if (e.code === 'Space') {
      e.preventDefault(); // Prevent page scrolling
      throwWater();
    }
    
    if (e.code === 'KeyM') {
      const isMuted = toggleMute();
      displayMuteFeedback(isMuted);
    }
  });

  // 2. Mouse/Touch click events on the canvas
  canvas.addEventListener('mousedown', (e) => {
    if (state.status !== 'PLAYING') return;

    // Get mouse coordinates and scale correctly
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    handleGameClick(clickX, clickY);
  });
}

function handleGameClick(x, y) {
  // Check click hierarchy (front-to-back layers)

  // 1. Swat Mosquito (mosquitoes are small and fast, check them first)
  if (swatMosquito(x, y)) {
    return;
  }

  // 2. Collect Flower
  if (collectFlower(x, y)) {
    return;
  }

  // 3. Woodpile (Pick up log)
  if (isInside(x, y, state.woodpilePos)) {
    pickUpLog();
    return;
  }

  // 4. Bonfire (Feed fire)
  if (isInside(x, y, state.bonfirePos)) {
    if (state.hasLog) {
      feedBonfire();
    } else {
      // Prompt player they need a log
      state.floatingTexts.push({
        x: state.bonfirePos.x + state.bonfirePos.w / 2,
        y: state.bonfirePos.y - 15,
        text: 'NEED LOG FROM WOODPILE!',
        color: '#ffdd77',
        size: 14,
        life: 1.0,
        maxLife: 1.0,
        vy: -20
      });
    }
    return;
  }

  // 5. Sauna (Throw water)
  if (isInside(x, y, state.saunaPos)) {
    throwWater();
    return;
  }

  // 6. Cottage click (Easter Egg: blow chimney smoke)
  if (isInside(x, y, state.cottagePos)) {
    const smokeX = state.cottagePos.x + 35;
    const smokeY = state.cottagePos.y - 20;
    
    // Spawn chimney smoke
    for (let i = 0; i < 5; i++) {
      state.particles.push({
        x: smokeX,
        y: smokeY,
        vx: (Math.random() * 20 - 5),
        vy: -(Math.random() * 40 + 20),
        color: 'rgba(160, 160, 160, 0.4)',
        size: Math.random() * 8 + 4,
        life: 1.5 + Math.random() * 0.5,
        maxLife: 2.0,
        type: 'smoke'
      });
    }

    state.floatingTexts.push({
      x: state.cottagePos.x + state.cottagePos.w / 2,
      y: state.cottagePos.y + 40,
      text: 'MÖKKI',
      color: '#ffffff',
      size: 12,
      life: 0.8,
      maxLife: 0.8,
      vy: -15
    });
    return;
  }
}

function isInside(x, y, box) {
  return x >= box.x && x <= box.x + box.w && y >= box.y && y <= box.y + box.h;
}

function displayMuteFeedback(isMuted) {
  // Spawn a floating text at the top center
  state.floatingTexts.push({
    x: 480,
    y: 80,
    text: isMuted ? 'AUDIO MUTED 🔇' : 'AUDIO ACTIVE 🔊',
    color: isMuted ? '#aaaaaa' : '#00f2fe',
    size: 16,
    life: 1.2,
    maxLife: 1.2,
    vy: -15
  });
}
