// Enemy type registry — the spawner instantiates classes by config key.
// Register new enemy classes here after adding their config to data/enemies.js.

import Goon from './Goon.js';
import Enforcer from './Enforcer.js';
import KnifeFighter from './KnifeFighter.js';
import Acrobat from './Acrobat.js';
import Boss from './Boss.js';

export const ENEMY_CLASSES = {
  goon: Goon,
  enforcer: Enforcer,
  knife: KnifeFighter,
  acrobat: Acrobat,
  boss: Boss,
};
