// Headless smoke test: boots the game, fights the first wave, then
// fast-forwards to the boss to verify the intro cinematic, phase
// transitions and the victory flow. Not part of the game build.
import { chromium } from 'playwright-core';

const errors = [];
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1024, height: 600 } });

page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`);
});
page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));

await page.goto('http://localhost:4173/', { waitUntil: 'load' });
await page.waitForTimeout(2500);

console.log('boot:', JSON.stringify(await page.evaluate(() => ({
  scenes: window.__game.scene.scenes.filter((s) => s.scene.isActive()).map((s) => s.scene.key),
  textures: window.__game.textures.getTextureKeys().length,
  anims: window.__game.anims.anims.size,
}))));

await page.keyboard.press('z');
await page.waitForTimeout(1200);

// --- Phase A: walk into wave 1 and fight for real ---
await page.keyboard.down('ArrowRight');
await page.waitForTimeout(2600);
await page.keyboard.up('ArrowRight');

// wait until an enemy is in punching range
let near = false;
for (let i = 0; i < 40 && !near; i++) {
  await page.waitForTimeout(250);
  near = await page.evaluate(() => {
    const gs = window.__game.scene.getScene('Game');
    return gs.enemies.getChildren().some(
      (e) => e.active && !e.isDead && Math.abs(e.x - gs.player.x) < 55,
    );
  });
}
console.log('enemy in range:', near);

for (let i = 0; i < 24; i++) {
  await page.keyboard.press(i % 4 === 3 ? 'x' : 'z');
  await page.waitForTimeout(160);
}
await page.waitForTimeout(800);

const fight = await page.evaluate(() => {
  const gs = window.__game.scene.getScene('Game');
  return {
    playerHp: gs.player.hp,
    sp: +gs.player.sp.toFixed(2),
    score: gs.score,
    bestCombo: gs.combat.bestCombo,
    enemiesLeft: gs.enemies.getChildren().filter((e) => e.active && !e.isDead).length,
    waveActive: !!gs.spawner.activeWave,
  };
});
console.log('after fight:', JSON.stringify(fight));
await page.screenshot({ path: 'smoke-fight.png' });

// --- Phase B: jump to the boss zone and trigger the boss ---
await page.evaluate(() => {
  const gs = window.__game.scene.getScene('Game');
  gs.scene.restart({ zoneIndex: 2, score: 12345, lives: 3 });
});
await page.waitForTimeout(1000);
await page.evaluate(() => {
  const gs = window.__game.scene.getScene('Game');
  // clear the pre-boss waves and move up to the boss trigger
  gs.spawner.waves.forEach((w) => { if (!w.boss) w.state = 'cleared'; });
  gs.player.x = 3400;
  gs.cameraSystem.minScrollX = 3000;
});
await page.keyboard.down('ArrowRight');
await page.waitForTimeout(1500);
await page.keyboard.up('ArrowRight');

const intro = await page.evaluate(() => ({
  scenes: window.__game.scene.scenes.filter((s) => s.scene.isActive()).map((s) => s.scene.key),
  gamePaused: window.__game.scene.isPaused('Game'),
}));
console.log('boss intro:', JSON.stringify(intro));

await page.waitForTimeout(3200); // intro plays out
const bossUp = await page.evaluate(() => {
  const gs = window.__game.scene.getScene('Game');
  const boss = gs.enemies.getChildren().find((e) => e.type === 'boss');
  return {
    resumed: !window.__game.scene.isPaused('Game'),
    bossExists: !!boss,
    bossHp: boss?.hp,
    bossState: boss?.state,
  };
});
console.log('boss spawned:', JSON.stringify(bossUp));
await page.screenshot({ path: 'smoke-boss.png' });

// hammer the boss through its phases via the real damage API
const phases = await page.evaluate(async () => {
  const gs = window.__game.scene.getScene('Game');
  const boss = gs.enemies.getChildren().find((e) => e.type === 'boss');
  const hit = { damage: 4, freeze: 8, hitstun: 16, knockback: { x: 60, y: 0 } };
  const seen = [];
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  for (let i = 0; i < 12 && !boss.isDead; i++) {
    boss.invulnUntil = 0;
    boss.comboHitsTaken = 0; // bypass combo breaker for the test
    boss.takeHit(hit, boss.x - 50, gs.time.now);
    seen.push(boss.phase);
    await wait(350);
  }
  return { phasesSeen: [...new Set(seen)], bossDead: boss.isDead, minions: gs.enemies.getChildren().filter((e) => e.active && !e.isDead && e.type !== 'boss').length };
});
console.log('boss phases:', JSON.stringify(phases));

await page.waitForTimeout(3500); // K.O. -> victory transition
const end = await page.evaluate(() => ({
  scenes: window.__game.scene.scenes.filter((s) => s.scene.isActive()).map((s) => s.scene.key),
}));
console.log('after boss death:', JSON.stringify(end));
await page.screenshot({ path: 'smoke-end.png' });

if (errors.length) {
  console.log('\nERRORS:');
  errors.slice(0, 12).forEach((e) => console.log(' -', e));
  process.exitCode = 1;
} else {
  console.log('\nNo console or page errors.');
}
await browser.close();
