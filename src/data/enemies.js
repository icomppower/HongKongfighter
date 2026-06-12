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
  dragon: {
    jacket: '#1b5e20', sleeve: '#2e7d32', sleeveDark: '#0d3c11',
    pants: '#212121', pantsDark: '#101010', shoes: '#3e2723',
    skin: '#e8b88a', hair: '#cfd8dc', belt: '#ffd700', chain: '#ffd700',
    bulk: 14, aura: 'rgba(255,90,80,0.95)',
  },
  pirate: {
    jacket: '#1a237e', sleeve: '#283593', sleeveDark: '#0d1257',
    pants: '#263238', pantsDark: '#11181c', shoes: '#1a1a1a',
    skin: '#d9a066', hair: '#211a14', band: '#d32f2f', belt: '#ffd700',
    bulk: 13, aura: 'rgba(77,217,255,0.95)',
  },
  queen: {
    jacket: '#ad1457', sleeve: '#d81b60', sleeveDark: '#78092f',
    pants: '#4a148c', pantsDark: '#2a0b50', shoes: '#212121',
    skin: '#f1c27d', hair: '#1a1a1a', belt: '#ffd54f', knife: true,
    bulk: 11, aura: 'rgba(255,140,60,0.95)',
  },
  shadow: {
    jacket: '#16161d', sleeve: '#22222c', sleeveDark: '#0b0b10',
    pants: '#101016', pantsDark: '#07070b', shoes: '#0a0a0a',
    skin: '#dde3e8', hair: '#050507', knife: true,
    bulk: 11, aura: 'rgba(176,77,255,0.95)',
  },
  clone: {
    jacket: '#23232e', sleeve: '#2e2e3a', sleeveDark: '#15151d',
    pants: '#1a1a22', pantsDark: '#0e0e13', shoes: '#111111',
    skin: '#8c929a', hair: '#0a0a0e', knife: true,
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
  // ---- bosses (cfg.boss marks them for HUD / wave / scoring logic) ----

  dragon: {
    name: '龍叔', title: 'UNCLE DRAGON', boss: true,
    hp: 60, points: 2000, scale: 2.0,
    speed: 78, runSpeed: 170, detect: 9999, attackRange: 64,
    phases: [0.66, 0.33], // P2: shoulder bash · P3: ground pound berserk
    roars: { 2: '後生仔, 唔好咁串!', 3: '城寨係我嘅!!' },
    moves: {
      jab: {
        anim: 'punch1', startup: 11, active: 4, recovery: 12,
        damage: 8, freeze: 8, knockback: { x: 190, y: 0 },
        hitbox: { fx: 16, fy: 31, w: 26, h: 14 },
        range: 66, cooldown: 750, crouchDodgeable: true, sfx: 'punch',
      },
      heavy: {
        anim: 'punch3', startup: 17, active: 4, recovery: 20,
        damage: 12, freeze: 10, knockback: { x: 320, y: -240 },
        hitbox: { fx: 18, fy: 30, w: 30, h: 18 },
        range: 70, cooldown: 1900, knockdown: true, sfx: 'kick',
      },
      slam: {
        anim: 'grab', startup: 19, active: 6, recovery: 30,
        damage: 16, freeze: 0, knockback: { x: 360, y: -520 },
        hitbox: { fx: 15, fy: 30, w: 24, h: 30 },
        range: 66, cooldown: 3600, grab: true, sfx: 'hit',
      },
      bash: { // P2+ shoulder bash
        anim: 'specialA', startup: 18, active: 14, recovery: 22,
        damage: 14, freeze: 11, knockback: { x: 380, y: -260 },
        hitbox: { fx: 16, fy: 31, w: 32, h: 24 },
        cooldown: 3800, dash: 500, knockdown: true, sfx: 'special',
      },
      pound: { // P3 ground pound — low + wide: jump to avoid
        anim: 'specialB', startup: 38, active: 20, recovery: 30,
        damage: 18, freeze: 12, knockback: { x: 420, y: -480 },
        hitbox: { fx: 0, fy: 22, w: 170, h: 34 },
        cooldown: 6000, knockdown: true, aura: true, sfx: 'special',
      },
    },
  },

  pirate: {
    name: '海盜王', title: 'PIRATE KING', boss: true,
    hp: 70, points: 4000, scale: 2.0,
    speed: 82, runSpeed: 180, detect: 9999, attackRange: 66,
    phases: [0.66, 0.33], // P2: wave attack · P3: summons goons
    roars: { 2: '成個海港都係我嘅!', 3: '兄弟們, 上呀!!' },
    moves: {
      hook: {
        anim: 'punch3', startup: 13, active: 4, recovery: 16,
        damage: 10, freeze: 9, knockback: { x: 240, y: 0 },
        hitbox: { fx: 17, fy: 31, w: 28, h: 16 },
        range: 68, cooldown: 1100, crouchDodgeable: true, sfx: 'punch',
      },
      cannonball: { // lobbed arc — crouch under or step out
        anim: 'specialA', startup: 24, active: 4, recovery: 26,
        damage: 12, freeze: 10, knockback: { x: 300, y: -320 },
        hitbox: { fx: 0, fy: 0, w: 0, h: 0 },
        cooldown: 3400, knockdown: true, sfx: 'special',
        projectile: {
          tex: 'proj_cannonball', vx: 360, vy: -480, gravity: 1100,
          damage: 12, knockback: { x: 300, y: -320 }, knockdown: true,
          w: 18, h: 18, fy: 40, groundDies: true,
        },
      },
      wave: { // P2+ traveling ground wave — jump it
        anim: 'specialB', startup: 30, active: 4, recovery: 28,
        damage: 14, freeze: 11, knockback: { x: 360, y: -420 },
        hitbox: { fx: 0, fy: 0, w: 0, h: 0 },
        cooldown: 5200, knockdown: true, aura: true, sfx: 'special',
        projectile: {
          tex: 'proj_wave', vx: 320, vy: 0, gravity: 0,
          damage: 14, knockback: { x: 360, y: -420 }, knockdown: true,
          w: 34, h: 26, fy: 13, low: true,
        },
      },
      kick: {
        anim: 'kick', startup: 15, active: 4, recovery: 18,
        damage: 9, freeze: 9, knockback: { x: 220, y: 0 },
        hitbox: { fx: 18, fy: 30, w: 26, h: 16 },
        range: 64, cooldown: 1500, sfx: 'kick',
      },
    },
  },

  queen: {
    name: '夜市女王', title: 'MARKET QUEEN', boss: true,
    hp: 65, points: 6000, scale: 1.85,
    speed: 100, runSpeed: 205, detect: 9999, attackRange: 62,
    phases: [0.66, 0.33], // P2: chili powder · P3: multi-projectile
    roars: { 2: '辣死你!', 3: '全部刀, 飛!!' },
    moves: {
      slash: { // cleaver slash — fast two-hit pressure
        anim: 'poke', startup: 9, active: 4, recovery: 12,
        damage: 9, freeze: 9, knockback: { x: 180, y: 0 },
        hitbox: { fx: 20, fy: 32, w: 30, h: 12 },
        range: 70, cooldown: 800, crouchDodgeable: true, lunge: 300, sfx: 'punch',
      },
      heavy: {
        anim: 'punch3', startup: 16, active: 4, recovery: 18,
        damage: 11, freeze: 10, knockback: { x: 300, y: -220 },
        hitbox: { fx: 18, fy: 30, w: 28, h: 16 },
        range: 66, cooldown: 2000, knockdown: true, sfx: 'kick',
      },
      chili: { // P2+ chili powder cloud — stuns on contact
        anim: 'specialA', startup: 20, active: 4, recovery: 22,
        damage: 5, freeze: 8, knockback: { x: 80, y: 0 },
        hitbox: { fx: 0, fy: 0, w: 0, h: 0 },
        cooldown: 4200, sfx: 'special',
        projectile: {
          tex: 'proj_chili', vx: 220, vy: 0, gravity: 0,
          damage: 5, knockback: { x: 80, y: 0 }, stun: 1500,
          w: 30, h: 30, fy: 42, lifetime: 1400,
        },
      },
      throwfan: { // P3 three-cleaver fan
        anim: 'specialB', startup: 26, active: 4, recovery: 26,
        damage: 10, freeze: 9, knockback: { x: 240, y: -180 },
        hitbox: { fx: 0, fy: 0, w: 0, h: 0 },
        cooldown: 4800, knockdown: true, aura: true, sfx: 'special',
        projectile: {
          tex: 'proj_cleaver', vx: 420, vy: -120, gravity: 420, spin: true,
          damage: 10, knockback: { x: 240, y: -180 }, knockdown: true,
          w: 16, h: 16, fy: 46, count: 3, spread: 170, groundDies: true,
        },
      },
    },
  },

  shadow: {
    name: '影', title: 'THE SHADOW', boss: true,
    hp: 100, points: 8000, scale: 1.9,
    speed: 120, runSpeed: 240, detect: 9999, attackRange: 60,
    phases: [0.75, 0.5, 0.25], // P2: clones · P3: darkness · P4: mask off
    roars: { 2: '邊個係真身?', 3: '黑暗就係我嘅武器', 4: '......終於認真了' },
    moves: {
      dagger: { // dagger combo opener
        anim: 'poke', startup: 8, active: 4, recovery: 10,
        damage: 10, freeze: 9, knockback: { x: 170, y: 0 },
        hitbox: { fx: 20, fy: 32, w: 28, h: 12 },
        range: 66, cooldown: 700, crouchDodgeable: true, lunge: 340, sfx: 'punch',
      },
      heavy: {
        anim: 'kick', startup: 13, active: 4, recovery: 15,
        damage: 12, freeze: 10, knockback: { x: 300, y: -240 },
        hitbox: { fx: 18, fy: 30, w: 28, h: 16 },
        range: 64, cooldown: 1700, knockdown: true, sfx: 'kick',
      },
      dash: { // teleport-like dash strike
        anim: 'specialA', startup: 14, active: 10, recovery: 18,
        damage: 14, freeze: 11, knockback: { x: 360, y: -260 },
        hitbox: { fx: 16, fy: 31, w: 32, h: 24 },
        cooldown: 3200, dash: 640, knockdown: true, sfx: 'special',
      },
      knives: { // thrown dagger
        anim: 'specialB', startup: 18, active: 4, recovery: 18,
        damage: 10, freeze: 9, knockback: { x: 200, y: 0 },
        hitbox: { fx: 0, fy: 0, w: 0, h: 0 },
        cooldown: 2800, sfx: 'special',
        projectile: {
          tex: 'proj_dagger', vx: 560, vy: 0, gravity: 0,
          damage: 10, knockback: { x: 200, y: 0 },
          w: 18, h: 8, fy: 34, lifetime: 1600,
        },
      },
    },
  },

  // 影分身 — Shadow's clones: fragile but aggressive copies.
  clone: {
    name: '影分身', hp: 3, points: 150, scale: 1.9,
    speed: 130, runSpeed: 230, detect: 9999, attackRange: 58,
    moves: {
      dagger: {
        anim: 'poke', startup: 10, active: 4, recovery: 14,
        damage: 7, freeze: 8, knockback: { x: 150, y: 0 },
        hitbox: { fx: 20, fy: 32, w: 26, h: 12 },
        range: 62, cooldown: 1100, crouchDodgeable: true, lunge: 280, sfx: 'punch',
      },
    },
  },
};

export const ITEM_TYPES = {
  bun: { texture: 'item_bun', label: '叉燒包 +25HP' },
  hongbao: { texture: 'item_hongbao', label: '利是 +500' },
  drink: { texture: 'item_drink', label: '維他奶 +1SP' },
  coin: { texture: 'item_coin', label: '+100' },
  claypot: { texture: 'item_claypot', label: '煲仔飯 全回復!' },
};
