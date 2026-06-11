// Enemy archetype configs + character palettes (used by the procedural
// spritesheet generator). Enemy attack moves share the same shape as player
// moves in data/moves.js.
//
// To add a new enemy type: add a palette + config entry here, create a class
// in src/entities/ that extends Enemy, and register it in src/entities/index.js.

export const PALETTES = {
  keung: {
    jacket: '#d32f2f', sleeve: '#ef5350', sleeveDark: '#b71c1c',
    pants: '#263238', pantsDark: '#11181c', shoes: '#f5f5f5',
    skin: '#f1c27d', hair: '#161616', belt: '#ffd54f', band: '#ffd54f',
    aura: 'rgba(80,200,255,0.95)',
  },
  goon: {
    jacket: '#43a047', sleeve: '#66bb6a', sleeveDark: '#2e7d32',
    pants: '#4e342e', pantsDark: '#321f1b', shoes: '#3e2723',
    skin: '#e0ac69', hair: '#1a1a1a',
  },
  enforcer: {
    jacket: '#5e35b1', sleeve: '#7e57c2', sleeveDark: '#4527a0',
    pants: '#212121', pantsDark: '#101010', shoes: '#111111',
    skin: '#d9a066', hair: '#0d0d0d', bulk: 14,
  },
  knife: {
    jacket: '#f9a825', sleeve: '#fbc02d', sleeveDark: '#f57f17',
    pants: '#37474f', pantsDark: '#22313a', shoes: '#222222',
    skin: '#eac086', hair: '#3e2723', knife: true,
  },
  acrobat: {
    jacket: '#00acc1', sleeve: '#26c6da', sleeveDark: '#00838f',
    pants: '#1a237e', pantsDark: '#101743', shoes: '#eeeeee',
    skin: '#f1c27d', hair: '#212121',
  },
  boss: {
    jacket: '#eceff1', sleeve: '#ffffff', sleeveDark: '#b0bec5',
    pants: '#cfd8dc', pantsDark: '#90a4ae', shoes: '#3e2723',
    skin: '#e8b88a', hair: '#263238', belt: '#ffd700', chain: '#ffd700',
    bulk: 14, aura: 'rgba(255,90,80,0.95)',
  },
};

export const ENEMIES = {
  goon: {
    name: '青仔', hp: 3, points: 100, scale: 1.5,
    speed: 95, runSpeed: 185, detect: 300, attackRange: 50,
    moves: {
      punch: {
        anim: 'punch1', startup: 14, active: 4, recovery: 18,
        damage: 6, freeze: 8, knockback: { x: 170, y: 0 },
        hitbox: { fx: 16, fy: 31, w: 24, h: 14 },
        range: 52, cooldown: 850, crouchDodgeable: true, sfx: 'punch',
      },
      kick: {
        anim: 'kick', startup: 18, active: 4, recovery: 22,
        damage: 8, freeze: 9, knockback: { x: 210, y: 0 },
        hitbox: { fx: 18, fy: 30, w: 26, h: 16 },
        range: 58, cooldown: 1400, sfx: 'kick',
      },
    },
  },
  enforcer: {
    name: '大佬', hp: 8, points: 300, scale: 1.72,
    speed: 55, runSpeed: 95, detect: 300, attackRange: 52,
    moves: {
      grab: {
        anim: 'grab', startup: 20, active: 6, recovery: 32,
        damage: 13, freeze: 0, knockback: { x: 320, y: -420 },
        hitbox: { fx: 15, fy: 30, w: 22, h: 28 },
        range: 54, cooldown: 2400, grab: true, sfx: 'hit',
      },
      punch: {
        anim: 'punch3', startup: 19, active: 4, recovery: 26,
        damage: 9, freeze: 10, knockback: { x: 240, y: 0 },
        hitbox: { fx: 17, fy: 30, w: 26, h: 16 },
        range: 56, cooldown: 1600, sfx: 'kick',
      },
    },
  },
  knife: {
    name: '刀手', hp: 5, points: 200, scale: 1.5,
    speed: 125, runSpeed: 210, detect: 320, attackRange: 120,
    keepDistance: [105, 175],
    moves: {
      poke: {
        anim: 'poke', startup: 11, active: 5, recovery: 16,
        damage: 8, freeze: 9, knockback: { x: 150, y: 0 },
        hitbox: { fx: 22, fy: 32, w: 30, h: 10 },
        range: 125, cooldown: 1050, lunge: 320, crouchDodgeable: true, sfx: 'punch',
      },
    },
  },
  acrobat: {
    name: '飛賊', hp: 4, points: 250, scale: 1.5,
    speed: 115, runSpeed: 195, detect: 340, attackRange: 54,
    moves: {
      jumpkick: {
        anim: 'jumpkick', startup: 5, active: 1, recovery: 10,
        damage: 7, freeze: 9, knockback: { x: 190, y: -160 },
        hitbox: { fx: 14, fy: 20, w: 24, h: 22 },
        activeUntilLand: true, cooldown: 1200, sfx: 'kick',
      },
      kick: {
        anim: 'kick', startup: 13, active: 4, recovery: 16,
        damage: 6, freeze: 8, knockback: { x: 180, y: 0 },
        hitbox: { fx: 18, fy: 30, w: 26, h: 16 },
        range: 56, cooldown: 950, sfx: 'kick',
      },
    },
  },
  boss: {
    name: '三合會頭目', title: '龍頭 · 大龍', hp: 40, points: 2000, scale: 2.0,
    speed: 80, runSpeed: 175, detect: 9999, attackRange: 64,
    phases: [0.75, 0.4], // HP fractions where phase transitions occur
    moves: {
      jab: {
        anim: 'punch1', startup: 11, active: 4, recovery: 12,
        damage: 7, freeze: 8, knockback: { x: 190, y: 0 },
        hitbox: { fx: 16, fy: 31, w: 26, h: 14 },
        range: 66, cooldown: 750, crouchDodgeable: true, sfx: 'punch',
      },
      heavy: {
        anim: 'punch3', startup: 17, active: 4, recovery: 20,
        damage: 10, freeze: 10, knockback: { x: 320, y: -240 },
        hitbox: { fx: 18, fy: 30, w: 30, h: 18 },
        range: 70, cooldown: 1900, knockdown: true, sfx: 'kick',
      },
      charge: {
        anim: 'specialA', startup: 18, active: 14, recovery: 22,
        damage: 12, freeze: 11, knockback: { x: 360, y: -240 },
        hitbox: { fx: 16, fy: 31, w: 32, h: 24 },
        cooldown: 4000, dash: 480, knockdown: true, sfx: 'special',
      },
      slam: {
        anim: 'grab', startup: 19, active: 6, recovery: 30,
        damage: 16, freeze: 0, knockback: { x: 360, y: -520 },
        hitbox: { fx: 15, fy: 30, w: 24, h: 30 },
        range: 66, cooldown: 3600, grab: true, sfx: 'hit',
      },
      special: {
        anim: 'specialB', startup: 40, active: 22, recovery: 32,
        damage: 18, freeze: 12, knockback: { x: 420, y: -480 },
        hitbox: { fx: 0, fy: 22, w: 170, h: 34 }, // low + wide: jump to avoid
        cooldown: 6500, knockdown: true, aura: true, sfx: 'special',
      },
    },
  },
};

export const ITEM_TYPES = {
  bun: { texture: 'item_bun', label: '叉燒包 +20HP' },
  hongbao: { texture: 'item_hongbao', label: '利是 +500' },
  drink: { texture: 'item_drink', label: '維他奶 +1SP' },
  coin: { texture: 'item_coin', label: '+100' },
};
