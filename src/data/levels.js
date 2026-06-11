// Zone / wave layout for Zone 1 (three sub-zones, boss at the end of the third).
//
// To add a new zone: append an entry here with a `bg` key, then add matching
// background generators in src/assets/textures.js named `<bg>_far`, `<bg>_mid`,
// `<bg>_near`, `<bg>_ground` (see generateBackgrounds). The GameScene picks
// everything else up automatically.
//
// Wave: { triggerX, enemies: [{ type, n }], boss? } — the wave spawns when the
// player crosses triggerX; the arena locks until every enemy in it is dead.

export const ZONES = [
  {
    key: 'mongkok',
    name: '旺角街市',
    nameEn: 'MONG KOK MARKET',
    width: 5000,
    bg: 'mongkok',
    rain: false,
    waves: [
      { triggerX: 520, enemies: [{ type: 'goon', n: 3 }] },
      { triggerX: 1320, enemies: [{ type: 'goon', n: 2 }, { type: 'knife', n: 1 }] },
      { triggerX: 2180, enemies: [{ type: 'enforcer', n: 1 }, { type: 'goon', n: 2 }] },
      { triggerX: 3120, enemies: [{ type: 'knife', n: 2 }, { type: 'acrobat', n: 1 }] },
      { triggerX: 4180, enemies: [{ type: 'enforcer', n: 1 }, { type: 'acrobat', n: 1 }, { type: 'goon', n: 2 }] },
    ],
  },
  {
    key: 'rooftop',
    name: '天台',
    nameEn: 'THE ROOFTOPS',
    width: 5000,
    bg: 'rooftop',
    rain: false,
    waves: [
      { triggerX: 600, enemies: [{ type: 'acrobat', n: 2 }] },
      { triggerX: 1480, enemies: [{ type: 'goon', n: 2 }, { type: 'knife', n: 1 }, { type: 'acrobat', n: 1 }] },
      { triggerX: 2420, enemies: [{ type: 'enforcer', n: 2 }] },
      { triggerX: 3340, enemies: [{ type: 'knife', n: 2 }, { type: 'acrobat', n: 2 }] },
      { triggerX: 4240, enemies: [{ type: 'enforcer', n: 1 }, { type: 'goon', n: 3 }, { type: 'knife', n: 1 }] },
    ],
  },
  {
    key: 'alley',
    name: '紅燈籠後巷',
    nameEn: 'LANTERN ALLEY',
    width: 4200,
    bg: 'alley',
    rain: true,
    waves: [
      { triggerX: 700, enemies: [{ type: 'goon', n: 3 }, { type: 'knife', n: 1 }] },
      { triggerX: 1720, enemies: [{ type: 'enforcer', n: 1 }, { type: 'acrobat', n: 2 }] },
      { triggerX: 2720, enemies: [{ type: 'knife', n: 2 }, { type: 'enforcer', n: 1 }, { type: 'goon', n: 1 }] },
      { triggerX: 3560, boss: true, enemies: [{ type: 'boss', n: 1 }] },
    ],
  },
];
