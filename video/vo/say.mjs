// Voice-over for media/tirai-demo.mp4 — the film embedded in the deck.
//
// Windows are absolute seconds in the FINISHED film, taken from the composition
// rather than guessed: a caption written at recording-second t appears at frame
// COLD + at(t), and at() stretches 22.4s–28.6s by 1/0.6 for the slow push-in on
// Dealer B's empty PRICE cell. Retime TiraiDemo.tsx and these must move with it.
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import { mkdir, rm } from 'node:fs/promises';

const VOICE = process.env.VOICE ?? 'en-GB-RyanNeural';
const OUT = new URL('./cues/', import.meta.url).pathname.replace(/^\//, '');

// [start, end] of the picture each line belongs to.
export const SCENES = {
  cold:     [0.35, 5.0],   // the title card, which is up from the first frames
  book:     [5.3, 14.6],   // the book, then the request going out
  dealerA:  [15.2, 20.0],  // Dealer A invited
  sealed:   [20.5, 25.5],  // its ask, sealed
  dealerB:  [26.0, 30.3],  // the rival's own session
  noprice:  [30.9, 35.0],  // the thesis shot: no number in the cell
  settle:   [35.3, 40.3],  // back to the buy side
  verify:   [40.8, 46.0],  // the privacy verifier
  rails:    [46.5, 54.1],  // registry-issued assets
  close:    [55.3, 59.8],  // the closing card
};

export const CUES = [
  ['cold',    'A desk asks for a price. The question moves the market.'],
  ['book',    'Signed in as the buy side. One request goes out to a panel of dealers.'],
  ['dealerA', 'Now Dealer A, one of the invited dealers, seals its ask.'],
  ['sealed',  'Sealed to the buyer alone. Nobody else on the network sees the number.'],
  ['dealerB', 'Here is Dealer B, in its own session.'],
  ['noprice', 'Same request. No price.'],
  ['settle',  'Back to the buy side, which can now settle.'],
  ['verify',  "The verifier counts what each party's node actually holds."],
  ['rails',   'And the assets it settles in. Canton Coin, and C B T C, issued by registries I do not control.'],
  ['close',   'Tirai. Price discovery behind the curtain.'],
];

if (process.argv[1]?.endsWith('say.mjs')) {
  await rm(OUT, { recursive: true, force: true });
  await mkdir(OUT, { recursive: true });
  const tts = new MsEdgeTTS();
  // A little slower than default: this is read over a picture, not a podcast.
  await tts.setMetadata(VOICE, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3, { rate: '-4%', pitch: '-2Hz' });
  for (const [i, [, text]] of CUES.entries()) {
    // v2 writes <dir>/audio.mp3 and expects the directory to exist.
    const dir = `${OUT}/cue-${String(i).padStart(2, '0')}`;
    await mkdir(dir, { recursive: true });
    await tts.toFile(dir, text);
    console.log(`  cue-${String(i).padStart(2, '0')}  ${text.slice(0, 54)}`);
  }
  console.log(`\n${CUES.length} cues written to ${OUT}`);
}
