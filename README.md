# 旺角拳王 — MONG KOK BRAWLER

A Hong Kong-themed 2D side-scrolling beat-em-up in the style of Little
Fighter 2, built with **Phaser 3** (CDN) + **Vite**. Every sprite, background
and sound is generated procedurally at boot — there are no external asset
files.

Fight as 阿強 (Ah Keung) through three neon-lit zones — Mong Kok Market, the
Rooftops, and Lantern Alley — and take down the Triad Boss 三合會頭目.

## Running

```bash
npm install
npm run dev        # dev server at http://localhost:3000
npm run build      # production build to dist/
npm run preview    # serve the production build
```

Optional headless smoke test (uses your installed Chrome via playwright-core):

```bash
npm run preview -- --port 4173 &
node smoke-test.mjs
```

## Controls

| Input | Action |
|---|---|
| ← → / A D | Walk (double-tap to **run**) |
| ↑ / W / SPACE | Jump (press again mid-air to **double jump**) |
| ↓ / S | Crouch (dodges high attacks like punches & knife pokes) |
| Z | Punch — `Z Z Z` is a 3-hit combo |
| X | Kick |
| Z then X | **Launcher** — sends the enemy airborne for juggles |
| X then Z | **Sweep kick** — knocks down |
| ↑ + Z | Uppercut (launcher) |
| Z (air) | Air punch |
| X (air) | Dive kick |
| Z + X | **龍拳 Dragon Fist** — dash punch, costs 1 SP bar |
| ↓ + Z + X | **旋風腿 Hurricane Kick** — 360° multi-hit AOE, costs 2 SP bars |

SP fills from hits dealt and received. Juggled enemies take reduced damage
after 3 air hits; enemies under 20% HP can **combo-break** out of long
strings. Clearing a wave without taking damage doubles the wave bonus.

Items (30% drop on kill): 叉燒包 roast pork bun (+20 HP), 利是 red envelope
(+500 score), 維他奶 energy drink (+1 SP bar). High scores (top 5, with
initials) and zone checkpoints persist in `localStorage`.

## Architecture

```
src/
  main.js                Phaser game config + scene registration
  constants.js           Ground plane, depths, frame timing, storage keys
  scenes/
    BootScene.js         Generates all textures + registers animations
    MenuScene.js         Neon title, high scores, controls
    GameScene.js         Core loop: player, enemies, items, parallax, zones
    HUDScene.js          Parallel scene — HP/SP/lives/score/combo/boss bar
    BossIntroScene.js    Letterboxed boss name card (pauses GameScene)
    GameOverScene.js     Results, initials entry, leaderboard, continue
  entities/
    Player.js            阿強 — input buffering, chains, specials, juggles
    Enemy.js             Base state machine (patrol→detect→engage→attack…)
    Goon.js Enforcer.js KnifeFighter.js Acrobat.js Boss.js
    index.js             type-string → class registry used by the spawner
  systems/
    CombatSystem.js      Hit resolution, hitstop, combo counter, FX hooks
    SpawnerSystem.js     Wave triggers, arena lock, rewards, boss hand-off
    CameraSystem.js      Right-only scroll lock + arena pinning
    AnimationSystem.js   Registers every <char>-<anim> from pose data
    Sfx.js               WebAudio synth (no audio files)
  data/
    moves.js             Player move frame data (startup/active/recovery…)
    enemies.js           Enemy configs, attack moves, palettes, item types
    levels.js            Zone definitions + wave layouts
  ui/
    HealthBar.js SPBar.js ComboDisplay.js
  assets/
    textures.js          All procedural drawing: fighters, zones, items, FX
```

**Combat model.** Attacks are data-driven: each move defines startup/active/
recovery frames (60fps), damage, hitstop (`freeze`), hitstun, knockback and a
hitbox `{fx, fy, w, h}` relative to the fighter's feet. `CombatSystem`
rect-tests active hitboxes against hurtboxes each frame, once per
attack-instance per target (multi-hit moves clear the registry on a `rehit`
interval).

**Fighters.** All characters share one parametric pose library
(`buildPoses()` in `assets/textures.js`); a character is just a palette.
Frames are 48×64 and rendered into canvas spritesheets at boot.

## Extending the game

**New zone** — add an entry to `src/data/levels.js` (name, width, `bg` key,
waves), then add four background generators in `src/assets/textures.js`
producing textures `<bg>_far`, `<bg>_mid`, `<bg>_near`, `<bg>_ground` and
call them from `generateAllTextures()`. GameScene picks the rest up
automatically.

**New enemy** — add a palette + config (HP, speed, points, `moves`) to
`src/data/enemies.js`, create a class in `src/entities/` extending `Enemy`
(override `think(time, dt)` for its AI), and register it in
`src/entities/index.js`. Its full spritesheet set is generated from the
shared pose library automatically.

**New player move** — add the frame data to `PLAYER_MOVES` in
`src/data/moves.js` (reuse an existing `anim`, or add new poses to
`buildPoses()` + a rate in `ANIM_RATES`), then wire its trigger in
`Player.handleAttackInput()` — chains only need a `chains: {Z|X: key}` entry
on the move they cancel from.
