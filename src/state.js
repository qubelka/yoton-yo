// src/state.js

export const state = {
  // Game state status: 'START', 'PLAYING', 'GAMEOVER', 'VICTORY'
  status: 'START',
  
  // Game parameters
  gameTime: 180, // Countdown in seconds
  score: 0,
  cozyMeter: 100, // Health (drains if mosquitoes > 5)
  saunaHeat: 70, // Ideal range is 60 - 80. Above 90 starts overheat. Drops by 1/s
  bonfireFuel: 80, // Drops by 1.5/s. If reaches 0, you lose.
  flowersCollected: 0, // Target: 7
  hasLog: false, // Player currently carrying a log

  // Entities
  activeMosquitoes: [],
  activeFlowers: [],
  
  // Visual effects
  particles: [],
  floatingTexts: [],
  screenShake: 0,
  
  // Audio state
  muted: false,

  // UI state
  lastFlowerSpawnTime: 0,
  lastMosquitoSpawnTime: 0,
  
  // Track woodpile and other interactive coordinates
  // (Will be initialized or matched in click coordinates)
  woodpilePos: { x: 80, y: 450, w: 90, h: 60 },
  bonfirePos: { x: 450, y: 510, w: 100, h: 80 },
  saunaPos: { x: 740, y: 320, w: 160, h: 180 },
  lakePos: { y: 220, h: 180 },
  cottagePos: { x: 120, y: 260, w: 180, h: 160 }
};

export function initState() {
  state.status = 'START';
  resetState();
}

export function resetState() {
  state.gameTime = 180;
  state.score = 0;
  state.cozyMeter = 100;
  state.saunaHeat = 70;
  state.bonfireFuel = 80;
  state.flowersCollected = 0;
  state.hasLog = false;
  state.activeMosquitoes = [];
  state.activeFlowers = [];
  state.particles = [];
  state.floatingTexts = [];
  state.screenShake = 0;
  state.lastFlowerSpawnTime = 0;
  state.lastMosquitoSpawnTime = 0;
}
