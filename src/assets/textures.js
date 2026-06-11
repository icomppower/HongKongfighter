// Procedural asset generation. Everything the game renders is drawn into
// canvases at boot — no external image files.
//
// Fighter spritesheets are built from parametric "poses": each pose is a set
// of joint positions (head, hip, hands, feet) in a 48x64 frame, rendered by
// drawFighter() with a per-character palette. All characters share the same
// pose library, so a new enemy type only needs a palette.

import { PALETTES } from '../data/enemies.js';

const PI2 = Math.PI * 2;
export const FRAME_W = 48;
export const FRAME_H = 64;

const CJK_FONT = '"PingFang HK", "Hiragino Sans", "Microsoft YaHei", sans-serif';

function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

// Register a canvas as a texture and slice horizontal frames out of it.
// Uses addCanvas + manual frame addition (robust across Phaser versions).
function addSheet(scene, key, canvas, frameW, frameH, frameCount) {
  const tex = scene.textures.addCanvas(key, canvas);
  for (let i = 0; i < frameCount; i++) {
    tex.add(i, 0, i * frameW, 0, frameW, frameH);
  }
}

function addTex(scene, key, canvas) {
  scene.textures.addCanvas(key, canvas);
}

/* ------------------------------------------------------------------ */
/* Fighter rendering                                                   */
/* ------------------------------------------------------------------ */

// Two-segment limb: quadratic curve with the control point pushed
// perpendicular to the bone, faking an elbow/knee.
function limbSeg(ctx, x1, y1, x2, y2, bend, width, color) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const ex = mx + (-dy / len) * bend;
  const ey = my + (dx / len) * bend;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.quadraticCurveTo(ex, ey, x2, y2);
  ctx.stroke();
}

// Pose fields: hd=head, hip, fh=front hand, bh=back hand, ff=front foot,
// bf=back foot (all [x, y]); optional: knife, aura. Characters face RIGHT.
export function drawFighter(ctx, p, pal) {
  const [hdx, hdy] = p.hd;
  const [hx, hy] = p.hip;
  const shx = hx + (hdx - hx) * 0.7;
  const shy = hy + (hdy - hy) * 0.68;

  if (p.aura) {
    ctx.shadowColor = p.aura;
    ctx.shadowBlur = 12;
  }

  // back leg + shoe
  limbSeg(ctx, hx - 1, hy, p.bf[0], p.bf[1], 3, 5, pal.pantsDark || pal.pants);
  ctx.fillStyle = pal.shoes;
  ctx.fillRect(p.bf[0] - 3, p.bf[1] - 2, 7, 3.5);
  // back arm + fist
  limbSeg(ctx, shx - 2, shy + 2, p.bh[0], p.bh[1], 3, 4, pal.sleeveDark || pal.jacket);
  ctx.fillStyle = pal.skin;
  ctx.beginPath();
  ctx.arc(p.bh[0], p.bh[1], 2.6, 0, PI2);
  ctx.fill();
  // torso
  ctx.strokeStyle = pal.jacket;
  ctx.lineWidth = pal.bulk || 11;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(hx, hy - 2);
  ctx.lineTo(shx, shy);
  ctx.stroke();
  if (pal.belt) {
    ctx.fillStyle = pal.belt;
    ctx.fillRect(hx - 5, hy - 4, 11, 3);
  }
  if (pal.chain) {
    ctx.strokeStyle = pal.chain;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(shx, shy + 5, 4.5, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
  }
  // front leg + shoe
  limbSeg(ctx, hx + 1, hy, p.ff[0], p.ff[1], -3, 5, pal.pants);
  ctx.fillStyle = pal.shoes;
  ctx.fillRect(p.ff[0] - 3, p.ff[1] - 2, 7, 3.5);
  // head + hair + eye
  ctx.fillStyle = pal.skin;
  ctx.beginPath();
  ctx.arc(hdx, hdy, 6.5, 0, PI2);
  ctx.fill();
  ctx.fillStyle = pal.hair;
  ctx.beginPath();
  ctx.arc(hdx - 0.5, hdy - 1.8, 6.6, Math.PI * 0.95, Math.PI * 2.05);
  ctx.fill();
  if (pal.band) {
    ctx.fillStyle = pal.band;
    ctx.fillRect(hdx - 6.5, hdy - 3.5, 13, 2.5);
  }
  ctx.fillStyle = '#1c1c1c';
  ctx.fillRect(hdx + 2.5, hdy - 1, 1.8, 1.8);
  // front arm + fist
  limbSeg(ctx, shx + 2, shy + 2, p.fh[0], p.fh[1], -3, 4, pal.sleeve || pal.jacket);
  ctx.fillStyle = pal.skin;
  ctx.beginPath();
  ctx.arc(p.fh[0], p.fh[1], 2.8, 0, PI2);
  ctx.fill();
  if (p.knife) {
    ctx.strokeStyle = '#e0e6ea';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(p.fh[0], p.fh[1]);
    ctx.lineTo(p.fh[0] + 9, p.fh[1] - 3);
    ctx.stroke();
  }
  ctx.shadowBlur = 0;
}

function rng(n) {
  return Array.from({ length: n }, (_, i) => i);
}

export function buildPoses() {
  const D = { hd: [23, 13], hip: [22, 40], fh: [30, 33], bh: [15, 33], ff: [29, 61], bf: [16, 61] };
  const B = (o = {}) => ({ ...D, ...o });
  const A = {};

  A.idle = [0, 1, 2, 1].map((k) => B({
    hd: [23, 13 + k], hip: [22, 40 + k * 0.6], fh: [30, 33 + k], bh: [15, 33 + k],
  }));
  A.walk = rng(6).map((i) => {
    const ph = (i / 6) * PI2;
    const s = Math.sin(ph);
    const c = Math.cos(ph);
    return B({
      ff: [23 + 9 * c, 61 - Math.max(0, 4 * s)],
      bf: [23 - 9 * c, 61 - Math.max(0, -4 * s)],
      fh: [23 - 7 * c, 34], bh: [23 + 7 * c, 34],
      hd: [23, 13 + Math.abs(s)], hip: [22, 40 + Math.abs(s) * 0.6],
    });
  });
  A.run = rng(6).map((i) => {
    const ph = (i / 6) * PI2;
    const s = Math.sin(ph);
    const c = Math.cos(ph);
    return B({
      hd: [27, 14 + Math.abs(s)], hip: [21, 41 + Math.abs(s) * 0.5],
      ff: [24 + 12 * c, 59 - Math.max(0, 5 * s)],
      bf: [24 - 12 * c, 59 - Math.max(0, -5 * s)],
      fh: [25 - 9 * c, 31], bh: [23 + 9 * c, 31],
    });
  });
  A.jump = [
    B({ hd: [23, 11], hip: [22, 38], ff: [30, 52], bf: [14, 56], fh: [32, 22], bh: [12, 28] }),
    B({ hd: [23, 13], hip: [22, 40], ff: [31, 50], bf: [15, 50], fh: [31, 28], bh: [13, 30] }),
    B({ hd: [23, 14], hip: [22, 40], ff: [27, 58], bf: [14, 54], fh: [33, 32], bh: [11, 32] }),
  ];
  A.crouch = [
    B({ hd: [25, 29], hip: [21, 50], fh: [31, 42], bh: [13, 42], ff: [31, 61], bf: [12, 61] }),
    B({ hd: [25, 30], hip: [21, 51], fh: [31, 43], bh: [13, 43], ff: [31, 61], bf: [12, 61] }),
  ];
  A.punch1 = [
    B({ fh: [18, 35], bh: [13, 32] }),
    B({ hd: [25, 13], hip: [23, 40], fh: [45, 31], bh: [11, 34], ff: [31, 61], bf: [14, 61] }),
    B({ fh: [33, 33] }),
  ];
  A.punch2 = [
    B({ fh: [27, 34], bh: [17, 30] }),
    B({ hd: [26, 13], hip: [24, 40], bh: [45, 30], fh: [19, 35], ff: [32, 61], bf: [15, 61] }),
    B({ bh: [27, 33] }),
  ];
  A.punch3 = [
    B({ hd: [20, 14], hip: [20, 41], fh: [14, 30], bh: [18, 36] }),
    B({ hd: [28, 14], hip: [26, 40], fh: [46, 29], bh: [9, 36], ff: [35, 61], bf: [11, 61] }),
    B({ fh: [36, 31] }),
  ];
  A.kick = [
    B({ ff: [28, 46], hd: [22, 13] }),
    B({ hd: [19, 14], hip: [21, 39], ff: [46, 33], bf: [17, 61], fh: [14, 28], bh: [26, 34] }),
    B({ hd: [19, 14], hip: [21, 39], ff: [46, 36], bf: [17, 61], fh: [14, 28], bh: [26, 34] }),
    B({ ff: [33, 55] }),
  ];
  A.sweep = [
    B({ hd: [25, 29], hip: [21, 50], fh: [28, 44], bh: [12, 42], ff: [33, 59], bf: [12, 61] }),
    B({ hd: [24, 30], hip: [20, 51], fh: [24, 46], bh: [10, 44], ff: [46, 57], bf: [11, 61] }),
    B({ hd: [25, 30], hip: [21, 51], fh: [28, 45], bh: [12, 44], ff: [38, 59], bf: [12, 61] }),
  ];
  A.launcher = [
    B({ fh: [24, 46], hd: [24, 15], hip: [21, 42] }),
    B({ hd: [24, 11], hip: [23, 38], fh: [40, 17], bh: [12, 36], ff: [32, 61], bf: [14, 61] }),
    B({ fh: [35, 25] }),
  ];
  A.uppercut = [
    B({ hd: [24, 17], hip: [21, 44], fh: [20, 48], bh: [12, 40], ff: [30, 61], bf: [14, 61] }),
    B({ hd: [24, 10], hip: [23, 36], fh: [34, 8], bh: [12, 34], ff: [31, 56], bf: [14, 60] }),
    B({ hd: [24, 11], hip: [23, 37], fh: [34, 12], bh: [12, 35], ff: [31, 58], bf: [14, 61] }),
    B({ fh: [30, 28] }),
  ];
  A.airpunch = [
    B({ hd: [23, 13], hip: [22, 39], fh: [20, 34], bh: [12, 32], ff: [30, 52], bf: [15, 50] }),
    B({ hd: [25, 13], hip: [23, 39], fh: [45, 31], bh: [10, 34], ff: [31, 52], bf: [16, 50] }),
    B({ fh: [32, 33], ff: [30, 52], bf: [15, 50] }),
  ];
  A.divekick = [
    B({ hd: [15, 21], hip: [23, 33], fh: [10, 28], bh: [18, 24], ff: [42, 52], bf: [37, 47] }),
    B({ hd: [14, 22], hip: [22, 34], fh: [9, 30], bh: [17, 25], ff: [44, 54], bf: [39, 49] }),
  ];
  A.specialA = [
    B({ hd: [19, 14], hip: [19, 42], fh: [12, 32], bh: [20, 38], ff: [28, 61], bf: [13, 61] }),
    B({ hd: [29, 15], hip: [26, 42], fh: [47, 30], bh: [7, 38], ff: [37, 60], bf: [7, 61] }),
    B({ hd: [29, 15], hip: [26, 42], fh: [47, 31], bh: [7, 38], ff: [37, 60], bf: [7, 61] }),
    B({ fh: [34, 32] }),
  ];
  A.specialB = rng(6).map((i) => {
    const ph = (i / 6) * PI2;
    const s = Math.sin(ph);
    const c = Math.cos(ph);
    return B({
      hd: [23, 12], hip: [22, 38],
      ff: [23 + 20 * c, 42 - 8 * s], bf: [23 - 20 * c, 42 + 8 * s],
      fh: [23 + 14 * s, 26], bh: [23 - 14 * s, 26],
    });
  });
  A.grab = [
    B({ fh: [30, 30], bh: [28, 36] }),
    B({ hd: [26, 14], hip: [24, 40], fh: [44, 28], bh: [42, 36], ff: [33, 61], bf: [14, 61] }),
    B({ fh: [34, 31], bh: [32, 37] }),
  ];
  A.poke = [
    B({ fh: [24, 34], bh: [12, 34] }),
    B({ hd: [27, 14], hip: [25, 41], fh: [47, 32], bh: [9, 36], ff: [34, 61], bf: [12, 61] }),
    B({ fh: [30, 34] }),
  ];
  A.jumpkick = [
    B({ hd: [20, 15], hip: [22, 36], ff: [44, 46], bf: [18, 46], fh: [12, 26], bh: [26, 30] }),
    B({ hd: [19, 16], hip: [21, 37], ff: [46, 50], bf: [17, 48], fh: [11, 28], bh: [25, 32] }),
  ];
  A.hurt = [
    B({ hd: [17, 14], hip: [21, 41], fh: [27, 28], bh: [9, 31], ff: [28, 61], bf: [14, 61] }),
    B({ hd: [16, 15], hip: [20, 41], fh: [26, 29], bh: [8, 32] }),
  ];
  A.fall = [
    B({ hd: [11, 28], hip: [25, 37], fh: [5, 38], bh: [12, 44], ff: [41, 29], bf: [37, 35] }),
    B({ hd: [9, 42], hip: [25, 47], fh: [5, 50], bh: [13, 52], ff: [42, 42], bf: [38, 46] }),
  ];
  A.down = [
    B({ hd: [7, 56], hip: [24, 58], fh: [13, 60], bh: [17, 59], ff: [42, 59], bf: [38, 60] }),
  ];
  A.getup = [
    B({ hd: [12, 42], hip: [22, 54], fh: [16, 52], bh: [24, 54], ff: [36, 60], bf: [30, 61] }),
    B({ hd: [24, 28], hip: [21, 50], fh: [30, 42], bh: [12, 44], ff: [31, 61], bf: [13, 61] }),
    B({ hd: [23, 16], hip: [22, 42], fh: [29, 34], bh: [14, 34], ff: [29, 61], bf: [16, 61] }),
  ];
  return A;
}

export const POSES = buildPoses();

// [frameRate, repeat] for each animation.
export const ANIM_RATES = {
  idle: [6, -1], walk: [12, -1], run: [16, -1], jump: [10, 0], crouch: [4, -1],
  punch1: [18, 0], punch2: [18, 0], punch3: [14, 0], kick: [16, 0], sweep: [14, 0],
  launcher: [14, 0], uppercut: [16, 0], airpunch: [20, 0], divekick: [14, 0],
  specialA: [14, 0], specialB: [18, -1], grab: [10, 0], poke: [18, 0],
  jumpkick: [12, 0], hurt: [12, 0], fall: [10, 0], down: [1, 0], getup: [10, 0],
};

function generateFighters(scene) {
  for (const [charKey, pal] of Object.entries(PALETTES)) {
    for (const [anim, frames] of Object.entries(POSES)) {
      const canvas = makeCanvas(FRAME_W * frames.length, FRAME_H);
      const ctx = canvas.getContext('2d');
      frames.forEach((p, i) => {
        ctx.save();
        ctx.translate(i * FRAME_W, 0);
        const fp = { ...p };
        if (pal.knife && anim === 'poke') fp.knife = true;
        if ((anim === 'specialA' || anim === 'specialB') && pal.aura) fp.aura = pal.aura;
        drawFighter(ctx, fp, pal);
        ctx.restore();
      });
      addSheet(scene, `${charKey}_${anim}`, canvas, FRAME_W, FRAME_H, frames.length);
    }
  }
}

/* ------------------------------------------------------------------ */
/* Items, particles, misc                                              */
/* ------------------------------------------------------------------ */

function generateItems(scene) {
  // 叉燒包 roast pork bun
  let c = makeCanvas(20, 20);
  let ctx = c.getContext('2d');
  ctx.fillStyle = '#f5e6c8';
  ctx.beginPath();
  ctx.arc(10, 11, 8, 0, PI2);
  ctx.fill();
  ctx.fillStyle = '#e8d2a8';
  ctx.beginPath();
  ctx.arc(10, 8, 5, 0, PI2);
  ctx.fill();
  ctx.fillStyle = '#c62828';
  ctx.fillRect(8.5, 6.5, 3, 3);
  addTex(scene, 'item_bun', c);

  // 利是 red envelope
  c = makeCanvas(20, 20);
  ctx = c.getContext('2d');
  ctx.fillStyle = '#d32f2f';
  ctx.fillRect(4, 2, 12, 16);
  ctx.strokeStyle = '#ffd54f';
  ctx.lineWidth = 1.4;
  ctx.strokeRect(5, 3, 10, 14);
  ctx.fillStyle = '#ffd54f';
  ctx.font = `bold 8px ${CJK_FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('福', 10, 10.5);
  addTex(scene, 'item_hongbao', c);

  // 維他奶 energy drink carton
  c = makeCanvas(20, 20);
  ctx = c.getContext('2d');
  ctx.fillStyle = '#fff8e1';
  ctx.fillRect(5, 3, 10, 15);
  ctx.fillStyle = '#ef6c00';
  ctx.fillRect(5, 3, 10, 5);
  ctx.fillStyle = '#3e2723';
  ctx.font = `bold 7px ${CJK_FONT}`;
  ctx.textAlign = 'center';
  ctx.fillText('奶', 10, 15);
  addTex(scene, 'item_drink', c);

  // coin
  c = makeCanvas(14, 14);
  ctx = c.getContext('2d');
  ctx.fillStyle = '#ffd700';
  ctx.beginPath();
  ctx.arc(7, 7, 6, 0, PI2);
  ctx.fill();
  ctx.strokeStyle = '#b8860b';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(7, 7, 4.4, 0, PI2);
  ctx.stroke();
  addTex(scene, 'item_coin', c);
}

function generateParticles(scene) {
  // 4-point hit star
  let c = makeCanvas(14, 14);
  let ctx = c.getContext('2d');
  ctx.fillStyle = '#fff9c4';
  ctx.beginPath();
  ctx.moveTo(7, 0); ctx.lineTo(9, 5); ctx.lineTo(14, 7); ctx.lineTo(9, 9);
  ctx.lineTo(7, 14); ctx.lineTo(5, 9); ctx.lineTo(0, 7); ctx.lineTo(5, 5);
  ctx.closePath();
  ctx.fill();
  addTex(scene, 'fx_spark', c);

  // soft dust puff
  c = makeCanvas(12, 12);
  ctx = c.getContext('2d');
  let g = ctx.createRadialGradient(6, 6, 1, 6, 6, 6);
  g.addColorStop(0, 'rgba(200,200,210,0.9)');
  g.addColorStop(1, 'rgba(200,200,210,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 12, 12);
  addTex(scene, 'fx_dust', c);

  // cyan energy orb
  c = makeCanvas(16, 16);
  ctx = c.getContext('2d');
  g = ctx.createRadialGradient(8, 8, 1, 8, 8, 8);
  g.addColorStop(0, 'rgba(190,250,255,1)');
  g.addColorStop(0.5, 'rgba(80,200,255,0.8)');
  g.addColorStop(1, 'rgba(80,200,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 16, 16);
  addTex(scene, 'fx_orb', c);

  // rain streak
  c = makeCanvas(3, 16);
  ctx = c.getContext('2d');
  const rg = ctx.createLinearGradient(0, 0, 0, 16);
  rg.addColorStop(0, 'rgba(170,200,255,0)');
  rg.addColorStop(1, 'rgba(170,200,255,0.7)');
  ctx.fillStyle = rg;
  ctx.fillRect(1, 0, 1.5, 16);
  addTex(scene, 'fx_rain', c);

  // 1px white (flashes, barriers)
  c = makeCanvas(2, 2);
  ctx = c.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 2, 2);
  addTex(scene, 'fx_white', c);
}

/* ------------------------------------------------------------------ */
/* Backgrounds                                                         */
/* ------------------------------------------------------------------ */

function vertNeon(ctx, x, y, text, color, size = 18) {
  ctx.save();
  const pad = size * 0.45;
  const h = text.length * (size + 6) + 10;
  ctx.fillStyle = 'rgba(8,7,16,0.92)';
  ctx.fillRect(x - size / 2 - pad, y - 7, size + pad * 2, h);
  ctx.strokeStyle = color;
  ctx.globalAlpha = 0.85;
  ctx.lineWidth = 2;
  ctx.strokeRect(x - size / 2 - pad, y - 7, size + pad * 2, h);
  ctx.globalAlpha = 1;
  ctx.font = `bold ${size}px ${CJK_FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.shadowColor = color;
  ctx.shadowBlur = 12;
  ctx.fillStyle = color;
  [...text].forEach((ch, i) => {
    ctx.fillText(ch, x, y + i * (size + 6));
    ctx.fillText(ch, x, y + i * (size + 6)); // double pass = stronger glow
  });
  ctx.restore();
}

function horizNeon(ctx, x, y, text, color, size = 20) {
  ctx.save();
  ctx.font = `bold ${size}px ${CJK_FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const w = ctx.measureText(text).width + size;
  ctx.fillStyle = 'rgba(8,7,16,0.92)';
  ctx.fillRect(x - w / 2, y - size * 0.75, w, size * 1.5);
  ctx.strokeStyle = color;
  ctx.globalAlpha = 0.85;
  ctx.lineWidth = 2;
  ctx.strokeRect(x - w / 2, y - size * 0.75, w, size * 1.5);
  ctx.globalAlpha = 1;
  ctx.shadowColor = color;
  ctx.shadowBlur = 12;
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
  ctx.fillText(text, x, y);
  ctx.restore();
}

function windows(ctx, bx, by, bw, bh, color, density = 0.5, seedStep = 7) {
  ctx.fillStyle = color;
  let seed = bx * 13 + by * 31;
  for (let wy = by + 6; wy < by + bh - 6; wy += 11) {
    for (let wx = bx + 4; wx < bx + bw - 5; wx += 9) {
      seed = (seed * seedStep + 17) % 100;
      if (seed / 100 < density) ctx.fillRect(wx, wy, 4, 6);
    }
  }
}

function skyGradient(ctx, w, h, stops) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  stops.forEach(([off, col]) => g.addColorStop(off, col));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

function stars(ctx, w, h, n) {
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  for (let i = 0; i < n; i++) {
    const x = (i * 97 + 31) % w;
    const y = (i * 53 + 11) % h;
    ctx.globalAlpha = 0.25 + ((i * 37) % 60) / 100;
    ctx.fillRect(x, y, 1.5, 1.5);
  }
  ctx.globalAlpha = 1;
}

function reflections(ctx, w, y0, h, colors) {
  for (let i = 0; i < 14; i++) {
    const x = (i * 41 + 13) % w;
    const cw = 6 + ((i * 29) % 18);
    const col = colors[i % colors.length];
    const g = ctx.createLinearGradient(0, y0, 0, y0 + h);
    g.addColorStop(0, col.replace('1)', '0.22)'));
    g.addColorStop(1, col.replace('1)', '0)'));
    ctx.fillStyle = g;
    ctx.fillRect(x, y0, cw, h);
  }
}

function genMongkok(scene) {
  // far: sky + distant skyline
  let c = makeCanvas(480, 540);
  let ctx = c.getContext('2d');
  skyGradient(ctx, 480, 540, [[0, '#0a0c26'], [0.55, '#27104e'], [1, '#48195c']]);
  stars(ctx, 480, 260, 60);
  ctx.fillStyle = '#fdf6d8';
  ctx.beginPath();
  ctx.arc(390, 80, 22, 0, PI2);
  ctx.fill();
  ctx.fillStyle = '#0e0e22';
  [[0, 200, 70, 340], [60, 240, 55, 300], [110, 170, 80, 370], [185, 230, 60, 310],
   [240, 150, 75, 390], [310, 210, 65, 330], [370, 180, 70, 360], [435, 250, 45, 290]]
    .forEach(([x, y, w, h]) => {
      ctx.fillRect(x, y, w, h);
      windows(ctx, x, y, w, h, 'rgba(255,220,130,0.5)', 0.32);
    });
  addTex(scene, 'mongkok_far', c);

  // mid: closer buildings + neon signs
  c = makeCanvas(768, 540);
  ctx = c.getContext('2d');
  [[0, 110, 150, 364], [140, 150, 130, 324], [260, 90, 170, 384],
   [420, 140, 140, 334], [550, 100, 160, 374], [700, 160, 68, 314]]
    .forEach(([x, y, w, h], i) => {
      ctx.fillStyle = i % 2 ? '#191430' : '#141026';
      ctx.fillRect(x, y, w, h);
      windows(ctx, x, y, w, h, 'rgba(255,200,120,0.35)', 0.28);
      ctx.fillStyle = '#0d0a1c';
      ctx.fillRect(x, y, w, 8);
    });
  vertNeon(ctx, 60, 150, '茶餐廳', '#ff4d88', 20);
  vertNeon(ctx, 200, 190, '功夫', '#4dd9ff', 22);
  vertNeon(ctx, 330, 130, '麻雀館', '#ffe14d', 18);
  vertNeon(ctx, 480, 180, '大押', '#6dff6d', 22);
  horizNeon(ctx, 620, 170, '香港', '#ff5d4d', 26);
  vertNeon(ctx, 730, 200, '酒家', '#ff9d4d', 18);
  addTex(scene, 'mongkok_mid', c);

  // near: street-level market props
  c = makeCanvas(1024, 540);
  ctx = c.getContext('2d');
  const stall = (x, awnA, awnB) => {
    ctx.fillStyle = '#2c2435';
    ctx.fillRect(x, 380, 110, 90);          // stall body
    ctx.fillStyle = '#1d1828';
    ctx.fillRect(x + 6, 392, 98, 40);       // shaded goods area
    for (let i = 0; i < 5; i++) {           // crates of goods
      ctx.fillStyle = i % 2 ? '#7a4f2b' : '#8d5b31';
      ctx.fillRect(x + 10 + i * 19, 436, 16, 14);
    }
    for (let i = 0; i < 6; i++) {           // striped awning
      ctx.fillStyle = i % 2 ? awnA : awnB;
      ctx.fillRect(x - 8 + i * 21, 362, 21, 18);
    }
    ctx.fillStyle = '#171221';
    ctx.fillRect(x - 8, 378, 126, 4);
  };
  stall(70, '#c62828', '#eeeeee');
  stall(420, '#1565c0', '#eeeeee');
  stall(780, '#2e7d32', '#eeeeee');
  const lamp = (x) => {
    ctx.fillStyle = '#22202c';
    ctx.fillRect(x, 300, 6, 174);
    ctx.fillRect(x - 14, 300, 34, 5);
    const g = ctx.createRadialGradient(x + 3, 312, 2, x + 3, 312, 26);
    g.addColorStop(0, 'rgba(255,236,160,0.85)');
    g.addColorStop(1, 'rgba(255,236,160,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x + 3, 312, 26, 0, PI2);
    ctx.fill();
  };
  lamp(290);
  lamp(650);
  lamp(980);
  vertNeon(ctx, 360, 250, '燒臘', '#ff794d', 16);
  vertNeon(ctx, 720, 240, '小食', '#4dffc3', 16);
  addTex(scene, 'mongkok_near', c);

  // ground: wet asphalt with neon reflections
  c = makeCanvas(256, 74);
  ctx = c.getContext('2d');
  ctx.fillStyle = '#15141d';
  ctx.fillRect(0, 0, 256, 74);
  ctx.fillStyle = '#1f1d2a';
  ctx.fillRect(0, 0, 256, 5);
  reflections(ctx, 256, 5, 60, ['rgba(255,77,136,1)', 'rgba(77,217,255,1)', 'rgba(255,225,77,1)']);
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 1;
  for (let x = 0; x < 256; x += 64) {
    ctx.beginPath();
    ctx.moveTo(x, 6);
    ctx.lineTo(x - 10, 74);
    ctx.stroke();
  }
  addTex(scene, 'mongkok_ground', c);
}

function genRooftop(scene) {
  // far: tall lit skyline + moon
  let c = makeCanvas(480, 540);
  let ctx = c.getContext('2d');
  skyGradient(ctx, 480, 540, [[0, '#060819'], [0.6, '#141b3d'], [1, '#27214f']]);
  stars(ctx, 480, 300, 90);
  ctx.fillStyle = '#fdf6d8';
  ctx.beginPath();
  ctx.arc(110, 70, 26, 0, PI2);
  ctx.fill();
  ctx.fillStyle = 'rgba(6,8,25,0.55)';
  ctx.beginPath();
  ctx.arc(100, 62, 24, 0, PI2);
  ctx.fill();
  ctx.fillStyle = '#0b0e24';
  [[0, 160, 60, 380], [55, 110, 70, 430], [120, 200, 55, 340], [170, 90, 85, 450],
   [250, 170, 60, 370], [305, 130, 75, 410], [375, 190, 55, 350], [425, 120, 55, 420]]
    .forEach(([x, y, w, h]) => {
      ctx.fillRect(x, y, w, h);
      windows(ctx, x, y, w, h, 'rgba(170,220,255,0.45)', 0.4);
    });
  // red aviation beacons
  ctx.fillStyle = '#ff5252';
  [62, 178, 312, 430].forEach((x, i) => ctx.fillRect(x + 20, [108, 88, 128, 118][i], 3, 3));
  addTex(scene, 'rooftop_far', c);

  // mid: neighbouring rooftops + bamboo scaffolding
  c = makeCanvas(768, 540);
  ctx = c.getContext('2d');
  [[0, 300, 200, 174], [230, 330, 180, 144], [450, 290, 190, 184], [660, 340, 108, 134]]
    .forEach(([x, y, w, h]) => {
      ctx.fillStyle = '#171428';
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = '#211c38';
      ctx.fillRect(x, y, w, 10);
      windows(ctx, x, y + 14, w, h - 14, 'rgba(255,210,130,0.3)', 0.22);
    });
  // bamboo scaffolding lattice
  ctx.strokeStyle = '#8d6e4a';
  ctx.lineWidth = 3;
  const bamboo = (x0, y0, w, h) => {
    for (let x = x0; x <= x0 + w; x += 26) {
      ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y0 + h); ctx.stroke();
    }
    for (let y = y0; y <= y0 + h; y += 30) {
      ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x0 + w, y); ctx.stroke();
    }
    ctx.beginPath(); ctx.moveTo(x0, y0 + h); ctx.lineTo(x0 + w, y0); ctx.stroke();
  };
  bamboo(180, 180, 130, 150);
  bamboo(560, 160, 120, 170);
  // antennas
  ctx.strokeStyle = '#39344f';
  ctx.lineWidth = 2;
  [80, 380, 700].forEach((x) => {
    ctx.beginPath(); ctx.moveTo(x, 300); ctx.lineTo(x, 230); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x - 10, 245); ctx.lineTo(x + 10, 245); ctx.stroke();
  });
  horizNeon(ctx, 350, 120, '夜冷', '#b04dff', 22);
  addTex(scene, 'rooftop_mid', c);

  // near: water towers, AC units, railing
  c = makeCanvas(1024, 540);
  ctx = c.getContext('2d');
  const waterTower = (x) => {
    ctx.fillStyle = '#3a3148';
    ctx.fillRect(x + 8, 300, 64, 70);       // tank
    ctx.fillStyle = '#2c2538';
    ctx.beginPath();
    ctx.moveTo(x, 300); ctx.lineTo(x + 40, 274); ctx.lineTo(x + 80, 300);
    ctx.closePath(); ctx.fill();            // conical lid
    ctx.strokeStyle = '#241e30';
    ctx.lineWidth = 4;
    [[x + 14, x + 4], [x + 66, x + 76]].forEach(([tx, bx]) => {
      ctx.beginPath(); ctx.moveTo(tx, 370); ctx.lineTo(bx, 470); ctx.stroke();
    });
    ctx.strokeStyle = 'rgba(255,255,255,0.07)';
    ctx.lineWidth = 2;
    for (let y = 312; y < 366; y += 12) {
      ctx.beginPath(); ctx.moveTo(x + 8, y); ctx.lineTo(x + 72, y); ctx.stroke();
    }
  };
  waterTower(120);
  waterTower(640);
  const acUnit = (x) => {
    ctx.fillStyle = '#494157';
    ctx.fillRect(x, 424, 64, 46);
    ctx.fillStyle = '#352e42';
    ctx.beginPath();
    ctx.arc(x + 32, 447, 16, 0, PI2);
    ctx.fill();
    ctx.strokeStyle = '#241e30';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x + 32, 447, 16, 0, PI2);
    ctx.stroke();
  };
  acUnit(330);
  acUnit(450);
  acUnit(880);
  // safety railing along the roof edge
  ctx.strokeStyle = '#56506b';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(0, 430); ctx.lineTo(1024, 430); ctx.stroke();
  for (let x = 10; x < 1024; x += 40) {
    ctx.beginPath(); ctx.moveTo(x, 430); ctx.lineTo(x, 472); ctx.stroke();
  }
  addTex(scene, 'rooftop_near', c);

  // ground: concrete slabs
  c = makeCanvas(256, 74);
  ctx = c.getContext('2d');
  ctx.fillStyle = '#2a2733';
  ctx.fillRect(0, 0, 256, 74);
  ctx.fillStyle = '#332f3e';
  ctx.fillRect(0, 0, 256, 5);
  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  ctx.lineWidth = 2;
  for (let x = 0; x < 256; x += 85) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x - 14, 74); ctx.stroke();
  }
  ctx.fillStyle = 'rgba(255,255,255,0.04)';
  for (let i = 0; i < 30; i++) ctx.fillRect((i * 47) % 256, 8 + ((i * 31) % 60), 2, 2);
  addTex(scene, 'rooftop_ground', c);
}

function genAlley(scene) {
  // far: oppressive dark walls with a red glow from below
  let c = makeCanvas(480, 540);
  let ctx = c.getContext('2d');
  skyGradient(ctx, 480, 540, [[0, '#0c0510'], [0.5, '#1d0a16'], [1, '#3d101a']]);
  ctx.fillStyle = '#160913';
  [[0, 60, 130, 480], [120, 100, 110, 440], [220, 40, 140, 500], [350, 90, 130, 450]]
    .forEach(([x, y, w, h]) => {
      ctx.fillRect(x, y, w, h);
      windows(ctx, x, y, w, h, 'rgba(255,140,90,0.25)', 0.15);
    });
  const glow = ctx.createLinearGradient(0, 320, 0, 540);
  glow.addColorStop(0, 'rgba(255,60,40,0)');
  glow.addColorStop(1, 'rgba(255,60,40,0.22)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 320, 480, 220);
  addTex(scene, 'alley_far', c);

  // mid: pipes, barred windows, lantern strings
  c = makeCanvas(768, 540);
  ctx = c.getContext('2d');
  ctx.fillStyle = '#1b0e18';
  ctx.fillRect(0, 60, 768, 414);
  ctx.fillStyle = '#241220';
  for (let x = 0; x < 768; x += 96) ctx.fillRect(x, 60, 4, 414);
  // drain pipes
  ctx.fillStyle = '#2e1a28';
  [70, 300, 540, 720].forEach((x) => {
    ctx.fillRect(x, 60, 10, 414);
    ctx.fillRect(x - 4, 130, 18, 8);
    ctx.fillRect(x - 4, 330, 18, 8);
  });
  // barred windows
  [[150, 150], [400, 120], [620, 170]].forEach(([x, y]) => {
    ctx.fillStyle = '#120a12';
    ctx.fillRect(x, y, 56, 70);
    ctx.strokeStyle = '#3a2433';
    ctx.lineWidth = 3;
    for (let i = 1; i < 4; i++) {
      ctx.beginPath(); ctx.moveTo(x + i * 14, y); ctx.lineTo(x + i * 14, y + 70); ctx.stroke();
    }
  });
  // strung lantern lights
  const string = (y0, phase) => {
    ctx.strokeStyle = '#3a2433';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, y0);
    ctx.quadraticCurveTo(384, y0 + 36, 768, y0);
    ctx.stroke();
    for (let i = 0; i < 8; i++) {
      const t = (i + 0.5) / 8;
      const x = t * 768;
      const y = y0 + 36 * 4 * t * (1 - t) * 0.5 + 8;
      ctx.save();
      ctx.shadowColor = '#ff3d2e';
      ctx.shadowBlur = 14;
      ctx.fillStyle = i % 3 === phase ? '#ff6e40' : '#e53935';
      ctx.beginPath();
      ctx.ellipse(x, y, 7, 9, 0, 0, PI2);
      ctx.fill();
      ctx.fillStyle = '#ffd54f';
      ctx.fillRect(x - 1.5, y + 8, 3, 4);
      ctx.restore();
    }
  };
  string(90, 0);
  string(200, 1);
  vertNeon(ctx, 720, 250, '武館', '#ff4d4d', 18);
  addTex(scene, 'alley_mid', c);

  // near: big lanterns, dumpster, crates
  c = makeCanvas(1024, 540);
  ctx = c.getContext('2d');
  const bigLantern = (x, y) => {
    ctx.strokeStyle = '#2a1822';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, y - 26); ctx.stroke();
    ctx.save();
    ctx.shadowColor = '#ff3d2e';
    ctx.shadowBlur = 24;
    ctx.fillStyle = '#d92e2e';
    ctx.beginPath();
    ctx.ellipse(x, y, 22, 27, 0, 0, PI2);
    ctx.fill();
    ctx.restore();
    ctx.strokeStyle = 'rgba(0,0,0,0.25)';
    ctx.lineWidth = 1.5;
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.ellipse(x + i * 8, y, Math.max(2, 22 - Math.abs(i) * 7), 27, 0, 0, PI2);
      ctx.stroke();
    }
    ctx.fillStyle = '#ffd54f';
    ctx.fillRect(x - 3, y - 33, 6, 6);
    ctx.fillRect(x - 3, y + 27, 6, 8);
    ctx.fillStyle = '#5c1010';
    ctx.font = `bold 16px ${CJK_FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('福', x, y);
  };
  bigLantern(120, 120);
  bigLantern(380, 90);
  bigLantern(660, 130);
  bigLantern(930, 100);
  // dumpster
  ctx.fillStyle = '#1f3a2a';
  ctx.fillRect(220, 396, 130, 74);
  ctx.fillStyle = '#16291e';
  ctx.fillRect(214, 386, 142, 14);
  ctx.fillStyle = '#0e1b14';
  ctx.fillRect(232, 410, 26, 8);
  // crates
  [[520, 430], [560, 430], [540, 392]].forEach(([x, y]) => {
    ctx.fillStyle = '#6d4626';
    ctx.fillRect(x, y, 38, 38);
    ctx.strokeStyle = '#4a2f18';
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 2, y + 2, 34, 34);
    ctx.beginPath(); ctx.moveTo(x + 2, y + 2); ctx.lineTo(x + 36, y + 36); ctx.stroke();
  });
  addTex(scene, 'alley_near', c);

  // ground: rain-slick stone, red reflections
  c = makeCanvas(256, 74);
  ctx = c.getContext('2d');
  ctx.fillStyle = '#100e14';
  ctx.fillRect(0, 0, 256, 74);
  ctx.fillStyle = '#1a161e';
  ctx.fillRect(0, 0, 256, 5);
  reflections(ctx, 256, 5, 62, ['rgba(255,61,46,1)', 'rgba(255,110,64,1)', 'rgba(255,213,79,1)']);
  ctx.fillStyle = 'rgba(150,180,255,0.06)';
  [[30, 30, 60, 9], [160, 50, 70, 8]].forEach(([x, y, w, h]) => {
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y, w / 2, h / 2, 0, 0, PI2);
    ctx.fill();
  });
  addTex(scene, 'alley_ground', c);
}

/* ------------------------------------------------------------------ */

export function generateAllTextures(scene) {
  generateFighters(scene);
  generateItems(scene);
  generateParticles(scene);
  genMongkok(scene);
  genRooftop(scene);
  genAlley(scene);
}
