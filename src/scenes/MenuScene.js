// Title screen: flickering neon sign over a slowly drifting Mong Kok
// skyline, high-score table, controls reference.

import { GAME_W, GAME_H, GROUND_Y, STORAGE } from '../constants.js';
import { Sfx } from '../systems/Sfx.js';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('Menu');
  }

  create() {
    this.far = this.add.tileSprite(0, 0, GAME_W, GAME_H, 'mongkok_far').setOrigin(0);
    this.mid = this.add.tileSprite(0, 0, GAME_W, GAME_H, 'mongkok_mid').setOrigin(0).setAlpha(0.8);
    this.add.tileSprite(0, GROUND_Y - 8, GAME_W, 80, 'mongkok_ground').setOrigin(0);
    this.add.rectangle(0, 0, GAME_W, GAME_H, 0x07070f, 0.45).setOrigin(0);

    // Neon title
    this.title = this.add.text(GAME_W / 2, 150, '旺角拳王', {
      fontFamily: '"PingFang HK", "Hiragino Sans", sans-serif',
      fontSize: '96px', color: '#ff3d7f', fontStyle: 'bold',
    }).setOrigin(0.5);
    this.title.setShadow(0, 0, '#ff3d7f', 24, true, true);

    const sub = this.add.text(GAME_W / 2, 222, 'MONG KOK BRAWLER', {
      fontFamily: 'Arial Black, sans-serif', fontSize: '26px',
      color: '#4dd9ff', fontStyle: 'bold', letterSpacing: 6,
    }).setOrigin(0.5);
    sub.setShadow(0, 0, '#4dd9ff', 14, true, true);

    // Neon flicker
    this.time.addEvent({
      delay: 120,
      loop: true,
      callback: () => {
        const a = Math.random() < 0.08 ? 0.35 : 1;
        this.title.setAlpha(a);
      },
    });

    this.start = this.add.text(GAME_W / 2, 300, '按 Z 開始 — PRESS Z TO START', {
      fontFamily: 'monospace', fontSize: '20px', color: '#ffe14d', fontStyle: 'bold',
    }).setOrigin(0.5);
    this.tweens.add({
      targets: this.start, alpha: 0.25, duration: 600, yoyo: true, repeat: -1,
    });

    // High scores
    const scores = this.loadScores();
    const sx = GAME_W / 2 - 290;
    this.add.text(sx, 350, '龍虎榜 HIGH SCORES', {
      fontFamily: 'monospace', fontSize: '15px', color: '#ff8a65', fontStyle: 'bold',
    });
    if (scores.length === 0) {
      this.add.text(sx, 378, '— no champions yet —', {
        fontFamily: 'monospace', fontSize: '13px', color: '#9e9e9e',
      });
    }
    scores.slice(0, 5).forEach((s, i) => {
      this.add.text(sx, 378 + i * 20,
        `${i + 1}. ${s.initials.padEnd(3)}  ${String(s.score).padStart(7, ' ')}`, {
          fontFamily: 'monospace', fontSize: '14px',
          color: i === 0 ? '#ffd54f' : '#e0e0e0',
        });
    });

    // Controls
    const cx = GAME_W / 2 + 60;
    const lines = [
      '移動  ARROWS / WASD   (double-tap to run)',
      '跳    UP / W / SPACE  (double jump)',
      '蹲    DOWN / S        (dodge high attacks)',
      '拳    Z   (Z Z Z combo · Z then X launcher)',
      '腳    X   (X then Z sweep · UP+Z uppercut)',
      '絕招  Z+X 龍拳 (1 SP) · DOWN+Z+X 旋風腿 (2 SP)',
    ];
    this.add.text(cx, 350, '操作 CONTROLS', {
      fontFamily: 'monospace', fontSize: '15px', color: '#4dd9ff', fontStyle: 'bold',
    });
    lines.forEach((l, i) => {
      this.add.text(cx, 378 + i * 20, l, {
        fontFamily: 'monospace', fontSize: '13px', color: '#e0e0e0',
      });
    });

    this.add.text(GAME_W / 2, GAME_H - 18, '香港 · 2D 橫向格鬥 · Phaser 3', {
      fontFamily: 'monospace', fontSize: '12px', color: '#7a7a8c',
    }).setOrigin(0.5);

    this.input.keyboard.once('keydown', () => Sfx.ensure());
    this.input.keyboard.on('keydown-Z', () => this.startGame());
    this.input.keyboard.on('keydown-ENTER', () => this.startGame());
  }

  loadScores() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE.SCORES)) || [];
    } catch {
      return [];
    }
  }

  startGame() {
    Sfx.ensure();
    Sfx.play('select');
    this.scene.start('Game', { zoneIndex: 0, score: 0, lives: 3, fresh: true });
  }

  update(_, delta) {
    this.far.tilePositionX += delta * 0.004;
    this.mid.tilePositionX += delta * 0.012;
  }
}
