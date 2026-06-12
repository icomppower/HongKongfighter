// Glory to Hong Kong (願榮光歸香港) — programmatic melody via Tone.js.
// No external file; all notes are hard-coded, matching the project convention
// of zero external assets.

import * as Tone from 'tone';

const BPM = 72;
const BEAT = 60 / BPM;

// [note, startBeat, durationBeats]  — 32-beat loop (two 16-beat phrases)
const MELODY = [
  // Phrase A — chorus opening "願榮光歸香港"
  ['Bb4', 0,   1.5], ['C5',  1.5, 0.5], ['D5',  2,  2],
  ['Eb5', 4,   1  ], ['D5',  5,   1  ], ['C5',  6,  2],
  ['Bb4', 8,   1.5], ['C5',  9.5, 0.5], ['D5',  10, 2],
  ['F5',  12,  1  ], ['Eb5', 13,  1  ], ['D5',  14, 1], ['C5', 15, 1],
  // Phrase B — second half, resolves back to Bb
  ['Bb4', 16,  1  ], ['G4',  17,  1  ], ['F4',  18, 2],
  ['G4',  20,  1  ], ['Bb4', 21,  1  ], ['C5',  22, 2],
  ['D5',  24,  1  ], ['C5',  25,  1  ], ['Bb4', 26, 2],
  ['F4',  28,  1  ], ['G4',  29,  1  ], ['Bb4', 30, 2],
];

const LOOP_BEATS = 32;
const LOOP_END   = LOOP_BEATS * BEAT;

export class MidiPlayer {
  constructor() {
    this.synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.04, decay: 0.12, sustain: 0.45, release: 1.2 },
      volume: -10,
    }).toDestination();

    this.isMuted = false;
    this._part  = null;
    this._started = false;
  }

  async play() {
    if (this._started) return;
    this._started = true;

    await Tone.start();
    Tone.Transport.bpm.value = BPM;
    Tone.Transport.cancel();

    const events = MELODY.map(([note, startBeat, durBeats]) => ({
      time:     startBeat * BEAT,
      note,
      duration: durBeats  * BEAT,
    }));

    this._part = new Tone.Part((time, ev) => {
      if (!this.isMuted) {
        this.synth.triggerAttackRelease(ev.note, ev.duration, time, 0.55);
      }
    }, events);

    this._part.loop     = true;
    this._part.loopEnd  = LOOP_END;
    this._part.start(0);

    Tone.Transport.loop    = true;
    Tone.Transport.loopEnd = LOOP_END;
    Tone.Transport.start();
  }

  stop() {
    if (this._part) { this._part.stop(); this._part.dispose(); this._part = null; }
    Tone.Transport.stop();
    Tone.Transport.cancel();
    this._started = false;
  }

  // Returns new muted state.
  toggle() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }
}

// Singleton shared across scenes.
export const midiPlayer = new MidiPlayer();
