// src/entities/sauna.js
import { state } from '../state.js';
import { playSizzle, playOverheat } from '../sound.js';

export function updateSauna(dt) {
  if (state.status !== 'PLAYING') return;

  // saunaHeat drops by 1.0 per second
  state.saunaHeat -= 1.0 * dt;
  if (state.saunaHeat < 0) {
    state.saunaHeat = 0;
  }

  // Overheat Penalty check: if > 90, overheat!
  if (state.saunaHeat > 90) {
    state.saunaHeat = 50;
    state.score = Math.max(0, state.score - 100);
    state.screenShake = 15;
    
    // Add floating text
    state.floatingTexts.push({
      x: state.saunaPos.x + state.saunaPos.w / 2,
      y: state.saunaPos.y + 30,
      text: 'OVERHEAT! -100 PTS',
      color: '#ff3b30',
      size: 20,
      life: 1.5,
      maxLife: 1.5,
      vy: -40
    });

    playOverheat();
  }
}

export function throwWater() {
  if (state.status !== 'PLAYING') return;
  
  state.saunaHeat = Math.min(100, state.saunaHeat + 15);
  playSizzle();

  // Create steam particles rising above the sauna chimney/building
  // Sauna coordinate: state.saunaPos.x (740) to x+w (900). Height 320 to 500.
  // Chimney coordinates roughly: x + 40, y - 20
  const cx = state.saunaPos.x + 40;
  const cy = state.saunaPos.y - 10;
  
  for (let i = 0; i < 20; i++) {
    state.particles.push({
      x: cx + (Math.random() * 20 - 10),
      y: cy,
      vx: (Math.random() * 40 - 20),
      vy: -(Math.random() * 60 + 30),
      color: `rgba(255, 255, 255, ${0.3 + Math.random() * 0.4})`,
      size: Math.random() * 8 + 4,
      life: 1.0 + Math.random() * 1.0,
      maxLife: 2.0,
      type: 'steam'
    });
  }

  // Floating text
  state.floatingTexts.push({
    x: state.saunaPos.x + state.saunaPos.w / 2,
    y: state.saunaPos.y - 20,
    text: 'LÖYLY! +15°C',
    color: '#00f2fe',
    size: 16,
    life: 1.0,
    maxLife: 1.0,
    vy: -30
  });
}
