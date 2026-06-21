// src/main.js
import { state, resetState, initState } from './state.js';
import { setupInput } from './input.js';
import { draw } from './render.js';
import { updateSauna } from './entities/sauna.js';
import { updateBonfire } from './entities/bonfire.js';
import { updateMosquitoes } from './entities/mosquito.js';
import { updateFlowers } from './entities/flower.js';
import { playWin, playLoss } from './sound.js';

let canvas;
let ctx;
let lastTime = 0;
let soundTriggered = false; // Prevents win/loss sounds from looping

// DOM elements
let uiOverlay;
let startScreen;
let gameoverScreen;
let victoryScreen;
let startBtn;
let restartBtnLoss;
let restartBtnWin;
let finalScoreVal;
let finalFlowersVal;
let victoryScoreVal;

function init() {
  canvas = document.getElementById('gameCanvas');
  ctx = canvas.getContext('2d');

  // Handle High-DPI displays
  setupHighDPI(canvas, ctx);

  // Initialize DOM queries
  uiOverlay = document.getElementById('ui-overlay');
  startScreen = document.getElementById('start-screen');
  gameoverScreen = document.getElementById('gameover-screen');
  victoryScreen = document.getElementById('victory-screen');
  startBtn = document.getElementById('start-btn');
  restartBtnLoss = document.getElementById('restart-btn-loss');
  restartBtnWin = document.getElementById('restart-btn-win');
  finalScoreVal = document.getElementById('final-score');
  finalFlowersVal = document.getElementById('final-flowers');
  victoryScoreVal = document.getElementById('victory-score');

  // Bind UI overlay buttons
  startBtn.addEventListener('click', startGame);
  restartBtnLoss.addEventListener('click', restartGame);
  restartBtnWin.addEventListener('click', restartGame);

  // Set up click/key handlers
  setupInput(canvas);

  // Init state
  initState();

  // Start requestAnimationFrame loop
  lastTime = performance.now();
  requestAnimationFrame(gameLoop);
}

function setupHighDPI(canvas, ctx) {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  
  // Set display size (css)
  canvas.style.width = rect.width + 'px';
  canvas.style.height = rect.height + 'px';
  
  // Set backing store size (canvas width/height attributes)
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  
  // Scale context to make drawings crisp
  ctx.scale(dpr, dpr);
  
  // Reset back to original logical coordinate system for layout computations
  canvas.width = 960;
  canvas.height = 640;
}

function startGame() {
  resetState();
  state.status = 'PLAYING';
  soundTriggered = false;
  uiOverlay.classList.remove('active');
}

function restartGame() {
  resetState();
  state.status = 'PLAYING';
  soundTriggered = false;
  uiOverlay.classList.remove('active');
  // Update screens visibility immediately
  gameoverScreen.classList.add('hidden');
  victoryScreen.classList.add('hidden');
}

function gameLoop(time) {
  // Calculate delta time in seconds
  let dt = (time - lastTime) / 1000;
  
  // Cap dt to avoid large jumps on lag spikes (e.g. background tab)
  if (dt > 0.1) dt = 0.1;
  lastTime = time;

  // Update logic
  update(dt);

  // Render logic
  draw(canvas, ctx);

  requestAnimationFrame(gameLoop);
}

function update(dt) {
  if (state.status === 'PLAYING') {
    // 1. Update Game Countdown
    state.gameTime -= dt;
    if (state.gameTime <= 0) {
      state.gameTime = 0;
      // Time is up. If player hasn't collected 7 flowers, they lose.
      if (state.flowersCollected < 7) {
        state.status = 'GAMEOVER';
        const reasonText = document.getElementById('gameover-reason');
        if (reasonText) {
          reasonText.textContent = 'Dawn broke, and the Midsummer magic faded. You did not collect all 7 flowers in time!';
        }
      }
    }

    // 2. Update entities
    updateSauna(dt);
    updateBonfire(dt);
    updateMosquitoes(dt);
    updateFlowers(dt);

    // 3. Update active particles physics
    state.particles.forEach(p => {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      
      // Additional minor physics effects
      if (p.type === 'spark') {
        p.vy += 10 * dt; // gravity
        p.vx += Math.sin(p.life * 10) * 10 * dt; // wind sway
      } else if (p.type === 'steam') {
        p.size += dt * 8; // expand steam cloud
        p.vx *= 0.98;
      } else if (p.type === 'smoke') {
        p.size += dt * 4;
        p.vx += dt * 15; // wind drifting right
      }
    });
    // Filter dead particles
    state.particles = state.particles.filter(p => p.life > 0);

    // 4. Update floating feedback texts
    state.floatingTexts.forEach(t => {
      t.y += t.vy * dt;
      t.life -= dt;
    });
    // Filter dead texts
    state.floatingTexts = state.floatingTexts.filter(t => t.life > 0);

    // 5. Screen shake decay
    if (state.screenShake > 0) {
      state.screenShake -= dt * 25;
      if (state.screenShake < 0) state.screenShake = 0;
    }
  } else {
    // Update screen state overlays
    uiOverlay.classList.add('active');

    if (state.status === 'START') {
      startScreen.classList.remove('hidden');
      gameoverScreen.classList.add('hidden');
      victoryScreen.classList.add('hidden');
    } else if (state.status === 'GAMEOVER') {
      startScreen.classList.add('hidden');
      gameoverScreen.classList.remove('hidden');
      victoryScreen.classList.add('hidden');

      finalScoreVal.textContent = state.score.toString();
      finalFlowersVal.textContent = `${state.flowersCollected}/7`;

      if (!soundTriggered) {
        playLoss();
        soundTriggered = true;
      }
    } else if (state.status === 'VICTORY') {
      startScreen.classList.add('hidden');
      gameoverScreen.classList.add('hidden');
      victoryScreen.classList.remove('hidden');

      // Multiply score by 2 on collecting all flowers!
      const totalScore = state.score * 2;
      victoryScoreVal.textContent = totalScore.toString();

      if (!soundTriggered) {
        playWin();
        soundTriggered = true;
      }
    }
  }
}

// Window load trigger
window.addEventListener('load', init);
