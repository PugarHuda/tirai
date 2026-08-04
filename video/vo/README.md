# Voice-over

`media/tirai-remotion.mp4` is the silent film. `media/tirai-remotion-vo.mp4` is the same
picture with a narration track.

The narration is **synthetic** (Microsoft neural voice, `en-GB-RyanNeural`). That is a
deliberate choice for a supplementary asset and it is not the Grand Final pitch, which is
spoken live. If a rule anywhere requires a human voice on submitted video, submit the silent
cut and speak over it.

## Reproducing it

`msedge-tts` and `ffmpeg` are not repository dependencies; install the first outside the repo
so the desk's dependency list stays at `playwright` alone.

```
mkdir vo-build && cd vo-build
npm init -y && npm i msedge-tts
cp <repo>/video/vo/*.mjs .
node say.mjs      # writes cues/cue-NN/audio.mp3, one per line
node mix.mjs      # places each line inside its scene, then muxes
```

`say.mjs` holds the script as `[scene, text]` pairs and the scene windows in seconds.
`mix.mjs` measures the real length of every rendered line and places it inside its scene
rather than at a guessed timestamp, then fails loudly if a scene's speech would run past the
picture it belongs to. That check is the point: hand-timed narration drifts, and a line that
lands on the wrong shot is worse than no narration.
