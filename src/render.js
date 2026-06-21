// src/render.js
import { state } from './state.js';

export function draw(canvas, ctx) {
  // 1. Prepare for screen shake
  ctx.save();
  if (state.screenShake > 0) {
    const dx = (Math.random() * 2 - 1) * state.screenShake;
    const dy = (Math.random() * 2 - 1) * state.screenShake;
    ctx.translate(dx, dy);
  }

  // 2. Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 3. Draw Background Layers (Sky & Lake)
  drawSkyAndLake(ctx, canvas);

  // 4. Draw Land & Grass
  drawLandscape(ctx);

  // 5. Draw Buildings & Structures
  drawCottage(ctx);
  drawSauna(ctx);
  drawDock(ctx);
  drawWoodpile(ctx);

  // 6. Draw Bonfire
  drawBonfire(ctx);

  // 7. Draw Active Flowers
  drawFlowers(ctx);

  // 8. Draw Active Mosquitoes
  drawMosquitoes(ctx);

  // 9. Draw Particle Systems
  drawParticles(ctx);

  // 10. Draw Floating Feedback Texts
  drawFloatingTexts(ctx);

  // 11. Restore screen shake offset
  ctx.restore();

  // 12. Draw Game UI Gauges (on top, unaffected by screen shake)
  drawUI(ctx);
}

// Background: Midsummer twilight sky & reflecting water
function drawSkyAndLake(ctx, canvas) {
  // Sky Gradient: Dark purple/navy to warm golden/orange
  const skyGrad = ctx.createLinearGradient(0, 0, 0, state.lakePos.y);
  skyGrad.addColorStop(0, '#060713'); // Deep space
  skyGrad.addColorStop(0.4, '#1b1429'); // Dusk purple
  skyGrad.addColorStop(0.7, '#431f3e'); // Crimson sunset
  skyGrad.addColorStop(1, '#ff6e40'); // Golden horizon
  
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, canvas.width, state.lakePos.y);

  // Sun drawing (dipping below horizon)
  ctx.beginPath();
  const sunGrad = ctx.createRadialGradient(480, state.lakePos.y, 10, 480, state.lakePos.y, 80);
  sunGrad.addColorStop(0, '#ffffff');
  sunGrad.addColorStop(0.2, '#ffe596');
  sunGrad.addColorStop(0.6, '#ff6e40');
  sunGrad.addColorStop(1, 'rgba(255, 110, 64, 0)');
  ctx.fillStyle = sunGrad;
  ctx.arc(480, state.lakePos.y, 80, Math.PI, 0); // half circle on horizon
  ctx.fill();

  // Lake body
  const lakeGrad = ctx.createLinearGradient(0, state.lakePos.y, 0, state.lakePos.y + state.lakePos.h);
  lakeGrad.addColorStop(0, '#102542'); // Shimmering dark blue
  lakeGrad.addColorStop(1, '#081326');
  ctx.fillStyle = lakeGrad;
  ctx.fillRect(0, state.lakePos.y, canvas.width, state.lakePos.h);

  // Lake reflections & ripples
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 140, 80, 0.25)';
  ctx.lineWidth = 2;
  const time = Date.now() * 0.002;
  for (let i = 5; i < state.lakePos.h; i += 8) {
    const rippleWidth = 140 - i * 0.5;
    const rx = 480 - rippleWidth / 2 + Math.sin(time + i) * 15;
    const ry = state.lakePos.y + i;
    ctx.beginPath();
    ctx.moveTo(rx, ry);
    ctx.lineTo(rx + rippleWidth, ry);
    ctx.stroke();
  }
  ctx.restore();
}

// Grass landscape
function drawLandscape(ctx) {
  // Draw green shoreline/grass (lower part of screen)
  ctx.beginPath();
  ctx.moveTo(0, state.lakePos.y + state.lakePos.h - 10);
  
  // Curved shoreline
  ctx.bezierCurveTo(240, 360, 480, 420, 960, 390);
  ctx.lineTo(960, 640);
  ctx.lineTo(0, 640);
  ctx.closePath();

  const grassGrad = ctx.createLinearGradient(0, 400, 0, 640);
  grassGrad.addColorStop(0, '#123015'); // Forest green
  grassGrad.addColorStop(0.5, '#0a210d'); // Deep grassy shadow
  grassGrad.addColorStop(1, '#041005');
  ctx.fillStyle = grassGrad;
  ctx.fill();

  // Additional detail: grass tufts
  ctx.strokeStyle = '#1d4822';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 40; i++) {
    // Deterministic grass positions based on loop index
    const gx = (i * 27) % 940 + 10;
    const gy = 420 + (i * 13) % 190;
    
    // Don't draw grass over lake
    if (gy < 400 + (gx > 480 ? -10 : 20)) continue;

    ctx.beginPath();
    ctx.moveTo(gx, gy);
    ctx.lineTo(gx - 3, gy - 8);
    ctx.moveTo(gx, gy);
    ctx.lineTo(gx + 2, gy - 10);
    ctx.stroke();
  }
}

// Traditional Finnish Mökki (Cottage)
function drawCottage(ctx) {
  const c = state.cottagePos;
  
  // Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.fillRect(c.x - 10, c.y + c.h - 10, c.w + 20, 20);

  // Red walls (Finnish red-ochre "punamulta")
  ctx.fillStyle = '#8b251e';
  ctx.fillRect(c.x, c.y, c.w, c.h);

  // Horizontal wood pane panel lines
  ctx.strokeStyle = '#731c17';
  ctx.lineWidth = 1;
  for (let y = c.y + 15; y < c.y + c.h; y += 15) {
    ctx.beginPath();
    ctx.moveTo(c.x, y);
    ctx.lineTo(c.x + c.w, y);
    ctx.stroke();
  }

  // Roof (dark grey shingles)
  ctx.beginPath();
  ctx.moveTo(c.x - 20, c.y);
  ctx.lineTo(c.x + c.w / 2, c.y - 70);
  ctx.lineTo(c.x + c.w + 20, c.y);
  ctx.closePath();
  
  const roofGrad = ctx.createLinearGradient(c.x, c.y - 70, c.x, c.y);
  roofGrad.addColorStop(0, '#2d3130');
  roofGrad.addColorStop(1, '#1b1d1c');
  ctx.fillStyle = roofGrad;
  ctx.fill();

  // Chimney
  ctx.fillStyle = '#212529';
  ctx.fillRect(c.x + 30, c.y - 60, 15, 40);
  ctx.fillStyle = '#111314';
  ctx.fillRect(c.x + 27, c.y - 65, 21, 8);

  // White window frames & glowing windows
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(c.x + 30, c.y + 40, 45, 55); // frame
  ctx.fillRect(c.x + 105, c.y + 40, 45, 55);

  ctx.fillStyle = '#ffd54f'; // warm yellow light inside
  ctx.fillRect(c.x + 34, c.y + 44, 37, 47);
  ctx.fillRect(c.x + 109, c.y + 44, 37, 47);

  // Window panes dividers
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(c.x + 52.5, c.y + 44);
  ctx.lineTo(c.x + 52.5, c.y + 91);
  ctx.moveTo(c.x + 34, c.y + 67.5);
  ctx.lineTo(c.x + 71, c.y + 67.5);

  ctx.moveTo(c.x + 127.5, c.y + 44);
  ctx.lineTo(c.x + 127.5, c.y + 91);
  ctx.moveTo(c.x + 109, c.y + 67.5);
  ctx.lineTo(c.x + 146, c.y + 67.5);
  ctx.stroke();

  // White corners/pillars (classic Nordic style)
  ctx.fillStyle = '#f8f9fa';
  ctx.fillRect(c.x - 3, c.y, 8, c.h);
  ctx.fillRect(c.x + c.w - 5, c.y, 8, c.h);
}

// Sauna Building (wooden logs)
function drawSauna(ctx) {
  const s = state.saunaPos;
  
  // Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.fillRect(s.x - 5, s.y + s.h - 5, s.w + 10, 10);

  // Wooden log style logs (stacked horizontal brown blocks)
  ctx.fillStyle = '#5d3d28';
  ctx.fillRect(s.x, s.y, s.w, s.h);

  // Log joints/lines
  ctx.strokeStyle = '#422a1b';
  ctx.lineWidth = 3;
  for (let y = s.y + 20; y < s.y + s.h; y += 20) {
    ctx.beginPath();
    ctx.moveTo(s.x, y);
    ctx.lineTo(s.x + s.w, y);
    ctx.stroke();
    
    // Draw log ends circular rings on corners
    ctx.fillStyle = '#4c311e';
    ctx.beginPath();
    ctx.arc(s.x + 10, y - 10, 7, 0, Math.PI * 2);
    ctx.arc(s.x + s.w - 10, y - 10, 7, 0, Math.PI * 2);
    ctx.fill();
  }

  // Dark pitched roof
  ctx.fillStyle = '#1e2022';
  ctx.beginPath();
  ctx.moveTo(s.x - 10, s.y);
  ctx.lineTo(s.x + s.w / 2, s.y - 40);
  ctx.lineTo(s.x + s.w + 10, s.y);
  ctx.closePath();
  ctx.fill();

  // Small brick chimney
  ctx.fillStyle = '#3a3d40';
  ctx.fillRect(s.x + 35, s.y - 35, 12, 25);
  ctx.fillStyle = '#1c1d1e';
  ctx.fillRect(s.x + 33, s.y - 38, 16, 5);

  // Sauna Door
  ctx.fillStyle = '#3d2514';
  ctx.fillRect(s.x + 55, s.y + 50, 50, 110);
  ctx.strokeStyle = '#27170c';
  ctx.strokeRect(s.x + 55, s.y + 50, 50, 110);
  
  // Tiny sauna window on the door
  ctx.fillStyle = '#ffb300';
  ctx.fillRect(s.x + 68, s.y + 65, 24, 24);
  
  // Door handle
  ctx.fillStyle = '#a1887f';
  ctx.fillRect(s.x + 95, s.y + 105, 5, 15);
}

// Dock (extends into the lake)
function drawDock(ctx) {
  // Dock: starts from wood/grass area and extends out to lake
  // Lake vertical range: 220 to 400.
  // Grass starts around y=400.
  // Dock coordinates: left 640 to 710, y 360 to 430.
  const dx = 650;
  const dy = 370;
  const dw = 60;
  const dh = 110;

  // Support pillars in the water
  ctx.fillStyle = '#221b14';
  ctx.fillRect(dx + 5, dy - 20, 10, 40);
  ctx.fillRect(dx + dw - 15, dy - 20, 10, 40);

  // Horizontal wood boards
  ctx.fillStyle = '#9e7b56';
  ctx.fillRect(dx, dy, dw, dh);

  // Board details
  ctx.strokeStyle = '#785b3e';
  ctx.lineWidth = 2;
  for (let y = dy + 10; y < dy + dh; y += 12) {
    ctx.beginPath();
    ctx.moveTo(dx, y);
    ctx.lineTo(dx + dw, y);
    ctx.stroke();
  }
}

// Woodpile (neat logs stacked)
function drawWoodpile(ctx) {
  const wp = state.woodpilePos;

  // Draw woodpile base logs
  ctx.fillStyle = '#795548';
  ctx.strokeStyle = '#3e2723';
  ctx.lineWidth = 1.5;

  const rows = 4;
  const cols = 5;
  const radius = 7;
  const postWidth = 6;
  
  const innerLeft = wp.x + postWidth / 2;
  const innerRight = wp.x + wp.w - postWidth / 2;
  
  const startXMin = innerLeft + radius;
  const endXMax = innerRight - radius;
  
  // Spacing between bottom row centers
  const spacing = (endXMax - startXMin) / (cols - 1);

  for (let r = 0; r < rows; r++) {
    const y = wp.y + wp.h - 10 - (r * 12);
    const count = cols - r;
    
    // Center each row relative to the bottom row
    const rowWidth = (count - 1) * spacing;
    const startX = (startXMin + endXMax) / 2 - rowWidth / 2;
    
    for (let c = 0; c < count; c++) {
      const x = startX + (c * spacing);
      
      // Draw log end (circle)
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = '#d7ccc8';
      ctx.fill();
      
      // Draw rings
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // Draw details (wooden rack posts)
  ctx.fillStyle = '#5d4037';
  ctx.fillRect(wp.x - postWidth / 2, wp.y, postWidth, wp.h);
  ctx.fillRect(wp.x + wp.w - postWidth / 2, wp.y, postWidth, wp.h);

  // Highlight log outline if carrying log
  if (state.hasLog) {
    ctx.strokeStyle = '#00f2fe';
    ctx.lineWidth = 2;
    ctx.strokeRect(wp.x - 5, wp.y - 5, wp.w + 10, wp.h + 10);
  }
}

// Bonfire (interactive pyre)
function drawBonfire(ctx) {
  const b = state.bonfirePos;

  // Dark coal background
  ctx.fillStyle = 'rgba(30, 20, 15, 0.8)';
  ctx.beginPath();
  ctx.ellipse(b.x + b.w / 2, b.y + b.h - 5, b.w / 2 + 10, 15, 0, 0, Math.PI * 2);
  ctx.fill();

  // Draw logs (pyre sticks crossing)
  ctx.strokeStyle = '#4e342e';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  
  // Diagonal logs
  ctx.beginPath();
  ctx.moveTo(b.x + 15, b.y + b.h - 10);
  ctx.lineTo(b.x + b.w - 15, b.y + 15);
  ctx.moveTo(b.x + b.w - 15, b.y + b.h - 10);
  ctx.lineTo(b.x + 15, b.y + 15);
  // Center log
  ctx.moveTo(b.x + 10, b.y + b.h - 12);
  ctx.lineTo(b.x + b.w - 10, b.y + b.h - 12);
  ctx.stroke();

  // Draw animated flames depending on fuel level
  if (state.bonfireFuel > 0) {
    const fx = b.x + b.w / 2;
    const fy = b.y + b.h - 15;
    const flameHeight = 40 + (state.bonfireFuel / 100) * 80;
    const time = Date.now() * 0.015;

    // Outer flame (orange)
    ctx.fillStyle = '#ff5722';
    ctx.beginPath();
    ctx.moveTo(fx - 40, fy);
    ctx.quadraticCurveTo(fx - 30 + Math.sin(time) * 10, fy - flameHeight * 0.6, fx, fy - flameHeight);
    ctx.quadraticCurveTo(fx + 30 + Math.cos(time) * 10, fy - flameHeight * 0.6, fx + 40, fy);
    ctx.closePath();
    ctx.fill();

    // Mid flame (yellow)
    ctx.fillStyle = '#ffc107';
    ctx.beginPath();
    ctx.moveTo(fx - 25, fy);
    ctx.quadraticCurveTo(fx - 15 + Math.cos(time * 0.7) * 8, fy - flameHeight * 0.5, fx, fy - flameHeight * 0.85);
    ctx.quadraticCurveTo(fx + 15 + Math.sin(time * 0.7) * 8, fy - flameHeight * 0.5, fx + 25, fy);
    ctx.closePath();
    ctx.fill();

    // Inner flame (white-hot)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(fx - 12, fy);
    ctx.quadraticCurveTo(fx - 5, fy - flameHeight * 0.3, fx, fy - flameHeight * 0.55);
    ctx.quadraticCurveTo(fx + 5, fy - flameHeight * 0.3, fx + 12, fy);
    ctx.closePath();
    ctx.fill();
    
    // Spark smoke overlay glowing
    ctx.save();
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#ff6d00';
    ctx.beginPath();
    ctx.arc(fx, fy - 15, 10, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 235, 59, 0.15)';
    ctx.fill();
    ctx.restore();
  }
}

// Draw Active Flowers
function drawFlowers(ctx) {
  state.activeFlowers.forEach(f => {
    ctx.save();
    ctx.translate(f.x, f.y);
    
    // Pulsing size animation
    const scale = 1.0 + Math.sin(f.pulse) * 0.08;
    ctx.scale(scale, scale);

    // Glowing halo
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, Math.PI * 2);
    const fGlow = ctx.createRadialGradient(0, 0, 2, 0, 0, 16);
    fGlow.addColorStop(0, f.color);
    fGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = fGlow;
    ctx.fill();

    // Draw petals (7 petals)
    ctx.fillStyle = f.color;
    for (let i = 0; i < 7; i++) {
      const angle = (i * Math.PI * 2) / 7;
      ctx.beginPath();
      ctx.ellipse(Math.cos(angle) * 7, Math.sin(angle) * 7, 5, 2.5, angle, 0, Math.PI * 2);
      ctx.fill();
    }

    // Yellow core
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#fff9c4';
    ctx.fill();

    ctx.restore();
  });
}

// Draw Active Mosquitoes
function drawMosquitoes(ctx) {
  state.activeMosquitoes.forEach(m => {
    ctx.save();
    ctx.translate(m.x, m.y);

    // Erratic vibration offset
    const vx = Math.sin(m.flapTimer) * 2;
    const vy = Math.cos(m.flapTimer * 1.3) * 2;
    ctx.translate(vx, vy);

    // Mosquito body (dark grey stripe)
    ctx.fillStyle = '#333333';
    ctx.beginPath();
    ctx.ellipse(0, 0, 5, 2, 0, 0, Math.PI * 2); // Body
    ctx.fill();

    // Head & Stinger
    ctx.fillStyle = '#111111';
    ctx.beginPath();
    ctx.arc(-5, 0, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-6, 0);
    ctx.lineTo(-10, 1);
    ctx.stroke();

    // Buzzing Wings (drawing two translucent paths vibrating)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.lineWidth = 1.2;
    
    const wingAngle = Math.sin(m.flapTimer) * 0.4 - 0.7; // flap wings back and forth
    
    ctx.beginPath();
    ctx.ellipse(0, -3, 6, 2, wingAngle, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(2, -3, 5, 1.8, wingAngle - 0.3, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  });
}

// Draw Particles (Sparks, Steam, Splats, Smoke)
function drawParticles(ctx) {
  state.particles.forEach(p => {
    ctx.save();
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);

    if (p.type === 'spark') {
      ctx.fillStyle = p.color;
      // High light aura
      ctx.shadowBlur = 6;
      ctx.shadowColor = p.color;
    } else if (p.type === 'steam') {
      ctx.fillStyle = p.color;
    } else if (p.type === 'smoke') {
      ctx.fillStyle = p.color;
    } else if (p.type === 'splat') {
      ctx.fillStyle = p.color;
    } else if (p.type === 'sparkle') {
      ctx.fillStyle = p.color;
      ctx.shadowBlur = 8;
      ctx.shadowColor = p.color;
    }

    ctx.fill();
    ctx.restore();
  });
}

// Draw Floating Texts
function drawFloatingTexts(ctx) {
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  state.floatingTexts.forEach(t => {
    ctx.font = `bold ${t.size}px 'Outfit', sans-serif`;
    
    // Alpha transparency based on remaining life
    const alpha = Math.min(1.0, t.life / (t.maxLife * 0.3));
    
    // Draw Outline
    ctx.strokeStyle = `rgba(0, 0, 0, ${alpha * 0.85})`;
    ctx.lineWidth = 4;
    ctx.strokeText(t.text, t.x, t.y);

    // Draw Fill
    ctx.fillStyle = t.color;
    ctx.shadowBlur = 4;
    ctx.shadowColor = t.color;
    ctx.fillText(t.text, t.x, t.y);
  });
  ctx.restore();
}

// Draw UI overlays, meters, score, timer on canvas
function drawUI(ctx) {
  // Set Outfit typography font
  ctx.font = `600 16px 'Outfit', sans-serif`;
  ctx.textBaseline = 'top';

  // 1. Top Left: Score & Timer (Glass Container)
  drawGlassRect(ctx, 16, 16, 210, 75);
  
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  ctx.fillText('SCORE:', 30, 28);
  ctx.fillStyle = '#ffd0b8';
  ctx.font = `800 20px 'Outfit', sans-serif`;
  ctx.fillText(state.score.toString(), 95, 25);

  ctx.font = `600 16px 'Outfit', sans-serif`;
  ctx.fillStyle = '#ffffff';
  ctx.fillText('TIME:', 30, 56);
  
  // Timer format: e.g. 02:45
  const mins = Math.floor(state.gameTime / 60);
  const secs = Math.floor(state.gameTime % 60);
  const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  
  ctx.fillStyle = state.gameTime < 30 ? '#ff3b30' : '#ffffff';
  ctx.font = `800 18px 'Outfit', sans-serif`;
  ctx.fillText(timeStr, 95, 54);

  // 2. Bottom Left: Flowers Collected progress indicator (🌸 3 / 7)
  drawGlassRect(ctx, 16, 560, 200, 60);
  ctx.font = `600 15px 'Outfit', sans-serif`;
  ctx.fillStyle = '#ffffff';
  ctx.fillText('FLOWERS:', 30, 572);
  
  ctx.font = `800 18px 'Outfit', sans-serif`;
  ctx.fillStyle = '#ff7bf6';
  ctx.fillText(`🌸 ${state.flowersCollected} / 7`, 115, 570);

  // 3. Top Right: Sauna Heat Meter
  // Gauge Position: x: 740 to 900. Let's place it at x: 800, y: 16, w: 140, h: 80
  drawGlassRect(ctx, 740, 16, 200, 90);
  ctx.font = `600 14px 'Outfit', sans-serif`;
  ctx.fillStyle = '#ffffff';
  ctx.fillText('🧖 SAUNA HEAT', 755, 26);
  
  // Draw slider bar
  const gaugeX = 755;
  const gaugeY = 52;
  const gaugeW = 170;
  const gaugeH = 14;
  
  ctx.fillStyle = '#1c1d29';
  ctx.fillRect(gaugeX, gaugeY, gaugeW, gaugeH);

  // Draw Heat fill color depending on range
  // Ideal: 60 - 80 (Green). Low: <60 (Blue). Hot: >80 (Red).
  let fillGrad = ctx.createLinearGradient(gaugeX, 0, gaugeX + gaugeW, 0);
  fillGrad.addColorStop(0, '#00f2fe'); // Cold (Blue)
  fillGrad.addColorStop(0.6, '#4caf50'); // Ideal (Green)
  fillGrad.addColorStop(0.8, '#ff9800'); // Warning (Orange)
  fillGrad.addColorStop(1, '#f44336'); // Hot (Red)
  ctx.fillStyle = fillGrad;

  // Heat percentage fill
  const fillWidth = (state.saunaHeat / 100) * gaugeW;
  ctx.fillRect(gaugeX, gaugeY, fillWidth, gaugeH);

  // Ideal lines indicators (60% and 80% mark lines)
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(gaugeX + gaugeW * 0.6, gaugeY - 2);
  ctx.lineTo(gaugeX + gaugeW * 0.6, gaugeY + gaugeH + 2);
  ctx.moveTo(gaugeX + gaugeW * 0.8, gaugeY - 2);
  ctx.lineTo(gaugeX + gaugeW * 0.8, gaugeY + gaugeH + 2);
  ctx.stroke();

  // Print value
  ctx.font = `800 15px 'Outfit', sans-serif`;
  ctx.fillStyle = state.saunaHeat >= 60 && state.saunaHeat <= 80 ? '#4caf50' : '#ff9800';
  ctx.fillText(`${Math.round(state.saunaHeat)}°C`, 875, 72);

  // 4. Bottom Right: Bonfire Fuel Meter
  // Position: x: 740, y: 530, w: 200, h: 90
  drawGlassRect(ctx, 740, 530, 200, 90);
  ctx.font = `600 14px 'Outfit', sans-serif`;
  ctx.fillStyle = '#ffffff';
  ctx.fillText('🔥 BONFIRE FUEL', 755, 540);

  const fuelX = 755;
  const fuelY = 566;
  const fuelW = 170;
  const fuelH = 14;

  ctx.fillStyle = '#1c1d29';
  ctx.fillRect(fuelX, fuelY, fuelW, fuelH);

  const fuelGrad = ctx.createLinearGradient(fuelX, 0, fuelX + fuelW, 0);
  fuelGrad.addColorStop(0, '#f44336'); // Critically Low
  fuelGrad.addColorStop(0.3, '#ff9800'); // Low
  fuelGrad.addColorStop(0.8, '#ffeb3b'); // Warm
  fuelGrad.addColorStop(1, '#4caf50'); // Fully stoked
  ctx.fillStyle = fuelGrad;

  const fuelFillWidth = (state.bonfireFuel / 100) * fuelW;
  ctx.fillRect(fuelX, fuelY, fuelFillWidth, fuelH);

  ctx.font = `800 15px 'Outfit', sans-serif`;
  ctx.fillStyle = state.bonfireFuel > 30 ? '#ffd0b8' : '#f44336';
  ctx.fillText(`${Math.round(state.bonfireFuel)}%`, 875, 586);

  // 5. Cozy Meter (Center Top)
  // Displays Player Cozy Health. Drains if mosquitoes swarm
  const cozyX = 380;
  const cozyY = 16;
  const cozyW = 200;
  const cozyH = 90;

  drawGlassRect(ctx, cozyX, cozyY, cozyW, cozyH);

  // Icon & Text
  ctx.font = `600 14px 'Outfit', sans-serif`;
  ctx.fillStyle = '#ffffff';
  ctx.fillText('🦟 COZY METER', cozyX + 15, cozyY + 10);

  // Health fill bar
  const cBarX = cozyX + 15;
  const cBarY = cozyY + 36;
  const cBarW = 170;
  const cBarH = 14;

  ctx.fillStyle = '#1c1d29';
  ctx.fillRect(cBarX, cBarY, cBarW, cBarH);

  ctx.fillStyle = state.cozyMeter > 40 ? '#00f2fe' : '#e65c40';
  const cFillW = (state.cozyMeter / 100) * cBarW;
  ctx.fillRect(cBarX, cBarY, cFillW, cBarH);

  // Print value
  ctx.font = `800 15px 'Outfit', sans-serif`;
  ctx.fillStyle = state.cozyMeter > 40 ? '#00f2fe' : '#e65c40';
  ctx.fillText(`${Math.round(state.cozyMeter)}%`, cozyX + 135, cozyY + 56);

  // 6. Carrying Log and Mosquito Swarm Warnings (dynamic stack under Cozy Meter)
  let warningY = cozyY + cozyH + 16;

  // Warning text if mosquitoes swarming
  if (state.activeMosquitoes.length > 5) {
    ctx.save();
    ctx.font = `bold 13px 'Outfit', sans-serif`;
    ctx.fillStyle = '#ff3b30';
    ctx.textAlign = 'center';
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.lineWidth = 3;
    ctx.strokeText('MOSQUITO SWARM WARNING! COZY METER DRAINING!', 480, warningY);
    ctx.fillText('MOSQUITO SWARM WARNING! COZY METER DRAINING!', 480, warningY);
    ctx.restore();
    warningY += 20;
  }

  // Carrying Log Indicator
  if (state.hasLog) {
    ctx.save();
    ctx.font = `600 13px 'Outfit', sans-serif`;
    ctx.fillStyle = '#ffbe8f';
    ctx.textAlign = 'center';
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.lineWidth = 3;
    ctx.strokeText('🪵 CARRYING A LOG (Click Bonfire to throw)', 480, warningY);
    ctx.fillText('🪵 CARRYING A LOG (Click Bonfire to throw)', 480, warningY);
    ctx.restore();
  }
}

// Utility to draw a glassmorphic background box
function drawGlassRect(ctx, x, y, w, h) {
  ctx.save();
  ctx.fillStyle = 'rgba(13, 17, 39, 0.7)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 1;
  
  // Rounded corners
  const r = 10; // corner radius
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}
