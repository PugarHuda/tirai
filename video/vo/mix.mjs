// Place every cue inside its scene from the real audio lengths, then mux the
// track onto the film. If a scene's speech does not fit its window, say so and
// stop rather than letting the words drift off the picture they describe.
import { execSync } from 'node:child_process';
import { CUES, SCENES } from './say.mjs';

// The silent master, and the narrated cut the deck embeds. Set MEDIA to point
// both at another checkout.
const MEDIA = process.env.MEDIA ?? 'C:/Hackathons/Hackathon Build on Canton/tirai/media';
const VIDEO = `${MEDIA}/tirai-demo-silent.mp4`;
const OUT = `${MEDIA}/tirai-demo.mp4`;
const GAP = 0.18; // a breath between lines

const dur = (f) => Number(execSync(`ffprobe -v error -show_entries format=duration -of csv=p=0 "${f}"`).toString().trim());

const placed = [];
let bad = 0;
for (const scene of Object.keys(SCENES)) {
  const [start, end] = SCENES[scene];
  let at = start;
  for (const [i, [s]] of CUES.entries()) {
    if (s !== scene) continue;
    const file = `cues/cue-${String(i).padStart(2, '0')}/audio.mp3`;
    const d = dur(file);
    placed.push({ i, file, at, end: at + d, scene });
    at += d + GAP;
  }
  // The film cross-dissolves between beats over about two thirds of a second, so
  // a line finishing marginally into the next shot still lands on its own picture.
  const TOLERANCE = 0.6;
  const over = at - GAP - end;
  console.log(`${scene.padEnd(11)} window ${start}s-${end}s   speech ends ${(at - GAP).toFixed(1)}s${over > 0 ? `  (+${over.toFixed(1)}s into the dissolve)` : ''}`);
  if (over > TOLERANCE) bad++;
}
if (bad) { console.error(`\n${bad} scene(s) overrun. Shorten those lines in say.mjs and re-run.`); process.exit(1); }

const inputs = placed.map((c) => `-i "${c.file}"`).join(' ');
const delays = placed.map((c, n) => `[${n + 1}:a]adelay=${Math.round(c.at * 1000)}|${Math.round(c.at * 1000)}[a${n}]`).join(';');
const mixIn = placed.map((_, n) => `[a${n}]`).join('');
// The film ships with a silent track; drop it and use the voice as the only audio.
const filter = `${delays};${mixIn}amix=inputs=${placed.length}:dropout_transition=0,volume=1.6,aresample=48000,apad[vo]`;
const cmd = `ffmpeg -y -i "${VIDEO}" ${inputs} -filter_complex "${filter}" -map 0:v -map "[vo]" -c:v copy -c:a aac -b:a 160k -shortest "${OUT}"`;

execSync(cmd, { stdio: ['ignore', 'ignore', 'pipe'] });
console.log(`\nwrote ${OUT}`);
console.log(execSync(`ffprobe -v error -show_entries format=duration,size -of default=nw=1 "${OUT}"`).toString().trim());
