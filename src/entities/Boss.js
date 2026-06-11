// 三合會頭目 — the Triad Boss. Three phases keyed off HP fractions:
//   Phase 1 (100%–75%): grounded jab/heavy combos + charge
//   Phase 2 (75%–40%):  adds grab-and-slam, moves faster
//   Phase 3 (40%–0%):   adds the screen-wide ground special (jump it!) and
//                       summons pairs of Goons
// Phase transitions flash, roar, and grant brief invulnerability.

import Enemy from './Enemy.js';
import { Sfx } from '../systems/Sfx.js';

export default class Boss extends Enemy {
  constructor(scene, x, y) {
    super(scene, x, y, 'boss');
    this.phase = 1;
    this.speedMult = 1;
    this.nextSummonAt = 0;
    this.state = 'engage'; // bosses skip patrol — the intro already played
  }

  get hpFrac() {
    return Math.max(0, this.hp) / this.maxHp;
  }

  onTookHit(time) {
    const [p2, p3] = this.cfg.phases;
    if (this.phase === 1 && this.hpFrac <= p2) this.enterPhase(2, time);
    else if (this.phase === 2 && this.hpFrac <= p3) this.enterPhase(3, time);
  }

  enterPhase(n, time) {
    this.phase = n;
    this.speedMult = n === 2 ? 1.25 : 1.5;
    this.invulnUntil = time + 1100;
    this.state = 'recover';
    this.recoverUntil = time + 900;
    this.setVelocity(0, 0);
    this.playSafe('idle');

    Sfx.play('boss');
    this.scene.cameras.main.shake(300, 0.006);
    this.scene.cameras.main.flash(200, 255, 60, 60);
    const roar = n === 2 ? '夠膽就嚟!' : '你死定了!!';
    this.scene.popText(this.x, this.y - 150, roar, '#ff5252', 24);

    if (n === 3) {
      this.summonGoons(time);
      this.nextSummonAt = time + 14000;
    }
  }

  summonGoons(time) {
    const spawner = this.scene.spawner;
    if (!spawner) return;
    const cam = this.scene.cameras.main;
    spawner.spawnEnemy('goon', cam.scrollX - 40);
    spawner.spawnEnemy('goon', cam.scrollX + 1000);
    this.scene.popText(this.x, this.y - 120, '上呀!', '#ffe14d', 18);
    this.nextSummonAt = time + 14000;
  }

  minionCount() {
    return this.scene.enemies.getChildren()
      .filter((e) => e.active && !e.isDead && e !== this).length;
  }

  think(time) {
    // Phase 3 keeps reinforcements coming.
    if (this.phase >= 3 && time >= this.nextSummonAt && this.minionCount() < 2) {
      this.summonGoons(time);
    }

    this.facePlayer();
    const dist = this.distToPlayer();

    if (dist <= this.cfg.attackRange) {
      this.setVelocityX(0);
      const key = this.pickAttack(time, dist);
      if (key) this.startMove(key, time);
      else this.playSafe('idle');
      return;
    }

    // Mid-range: charge or screen special if available, otherwise advance.
    if (dist > 150) {
      if (this.phase >= 3 && (this.cooldowns.special || 0) <= time && Math.random() < 0.4) {
        this.telegraphSpecial(time);
        return;
      }
      if ((this.cooldowns.charge || 0) <= time && Math.random() < 0.5) {
        return this.startMove('charge', time);
      }
    }

    const speed = (dist > 220 ? this.cfg.runSpeed : this.cfg.speed) * this.speedMult;
    this.setVelocityX(this.facing * speed);
    this.playSafe(dist > 220 ? 'run' : 'walk');
  }

  telegraphSpecial(time) {
    this.scene.popText(this.x, this.y - 150, '!! 跳呀 !!', '#ff5252', 20);
    this.scene.cameras.main.flash(160, 255, 40, 40);
    this.startMove('special', time);
  }

  pickAttack(time, dist) {
    const pool = [];
    const ready = (k) => (this.cooldowns[k] || 0) <= time;

    if (ready('jab')) pool.push('jab', 'jab');
    if (ready('heavy')) pool.push('heavy');
    if (this.phase >= 2 && ready('slam') && dist < this.cfg.attackRange) {
      pool.push('slam', 'slam');
    }
    if (this.phase >= 3 && ready('special') && Math.random() < 0.25) pool.push('special');

    if (!pool.length) return null;
    return Phaser.Utils.Array.GetRandom(pool);
  }

  startMove(key, time) {
    super.startMove(key, time);
    // Faster phases shave the cooldowns set by the base class.
    if (this.cooldowns[key]) {
      this.cooldowns[key] = time
        + (this.cooldowns[key] - time) / this.speedMult;
    }
  }
}
