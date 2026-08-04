// Voice-over for media/tirai-remotion.mp4. Cues are placed at the second the
// picture changes, so the words land on the beat they belong to rather than
// drifting across it.
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import { mkdir, rm } from 'node:fs/promises';

const VOICE = process.env.VOICE ?? 'en-GB-RyanNeural';
const OUT = new URL('./cues/', import.meta.url).pathname.replace(/^\//, '');

// Each line belongs to a scene of the film. Placement is computed from the real
// audio lengths rather than guessed, so nothing overlaps and nothing runs past
// the picture: [scene, text].
export const SCENES = {
  problem:    [0.9, 10.6],
  privacy:    [11.2, 26.6],
  proof:      [27.2, 36.8],
  settlement: [37.4, 48.3],
  close:      [48.6, 56.6],
};
export const CUES = [
  ['problem',    'A desk asks dealers for a price. The question moves the market.'],
  ['problem',    'Privacy, or proof. Never both.'],
  ['privacy',    'Tirai gives you both. One request, two dealers, their own sessions.'],
  ['privacy',    'Dealer A sees its sealed ask. Dealer B sees no price.'],
  ['privacy',    'Its node never received the contract.'],
  ['proof',      'The desk counts what each node actually holds.'],
  ['proof',      'And proves best execution, with no public order book.'],
  ['settlement', 'Six trades settled in Canton Coin. Two more in C B T C.'],
  ['settlement', 'Issuers I do not control.'],
  ['close',      'Forty nine settled trades, seeded by me.'],
  ['close',      'Tirai. Price discovery behind the curtain.'],
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
    const { audioFilePath } = await tts.toFile(dir, text);
    console.log(`  cue-${String(i).padStart(2, '0')}  ${text.slice(0, 54)}`);
  }
  console.log(`\n${CUES.length} cues written to ${OUT}`);
}
