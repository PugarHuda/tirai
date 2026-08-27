import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
} from 'remotion';
import {Caption, clampFade, FONT_CSS, useManrope} from './parts';
import {StatCell} from './Tirai';
import {ACCENT_HI, MONO, RAIL, RAIL_2, RAIL_INK, RAIL_LINE, RAIL_MUTED, SANS} from './theme';

// ---- the material -----------------------------------------------------------
// media/tirai-live-capture.mp4: 1600x900, 48.68s, one continuous screen
// recording. media/tirai-live-capture.marks.json says what is on screen when;
// every timestamp below is one of those marks, not a guess.
const SRC = 'tirai-live-capture.mp4';
const VW = 1600;
const VH = 900;

const FPS = 30;
const COLD = 105; // cold open, 3.5s
const CLOSE = 145; // closing card, 4.83s

// The recording plays at 1x either side of the thesis shot, and at 0.6x across
// it, so the rival dealer's empty price cell is on screen long enough to read.
const SLOW_FROM = 22.4;
const SLOW_TO = 28.6;
const RATE = 0.6;
const TAIL = 47.6; // the recorder's own "end" mark, cutting the dead frames

const S1 = Math.round(SLOW_FROM * FPS); // 672
const S2 = Math.round(((SLOW_TO - SLOW_FROM) / RATE) * FPS); // 310
const S3 = Math.round((TAIL - SLOW_TO) * FPS); // 570
const FOOTAGE = S1 + S2 + S3; // 1552 = 51.7s of film from 47.6s of recording

export const DEMO_DURATION = COLD + FOOTAGE + CLOSE; // 1802 = 60.07s

/** A time in the recording, in seconds, to a frame of the footage sequence. */
const at = (t: number) => {
  if (t <= SLOW_FROM) return Math.round(t * FPS);
  if (t <= SLOW_TO) return Math.round(S1 + ((t - SLOW_FROM) / RATE) * FPS);
  return Math.round(S1 + S2 + (t - SLOW_TO) * FPS);
};

// ---- the frame the recording sits in ----------------------------------------
// 1600x900 played at its native size, in a bezel, sitting high so the band
// underneath belongs to the captions rather than being an unexplained margin.
const CARD_X = 144;
const CARD_Y = 16;
const PAD = 16;

// ---- the thesis shot --------------------------------------------------------
// Dealer B's session, video seconds 24 to 27.9: the same request, with the
// PRICE cell reading a dash and SEALED QUOTES reading 0. Coordinates are pixels
// of the 1600x900 recording.
const SPOT = {x: 1036, y: 308, w: 240, h: 50};
const SPOT_CX = SPOT.x + SPOT.w / 2;
const SPOT_CY = SPOT.y + SPOT.h / 2;

type Cap = {
  at: number;
  lead: string;
  sub?: string;
  subAt?: number;
  end: number;
};

// Verbatim from the marks file, except where one mark carries two sentences and
// is split over the caption's two lines.
const CAPS: Cap[] = [
  {
    at: 1.81,
    lead: 'The book. Signed in as the buy side.',
    sub: 'Open a request to a dealer panel.',
    subAt: 3.22,
    end: 11.3,
  },
  {at: 11.66, lead: 'Sign in as Dealer A, one of the invited dealers.', end: 16.6},
  {at: 16.95, lead: 'Its ask is sealed to the buyer alone.', end: 22.1},
  {at: 22.48, lead: 'Now Dealer B, in its own session.', end: 25.1},
  {
    at: 25.42,
    lead: 'Same request. No price.',
    sub: 'Its node never received the quote.',
    end: 27.9,
  },
  {at: 28.02, lead: 'Back to the buyer, who can now settle.', end: 32.8},
  {at: 33.17, lead: 'The verifier counts what each node actually holds.', end: 38.5},
  {at: 38.87, lead: 'And the assets it can settle in, issued by other registries.', end: 46.6},
];

const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div style={{position: 'absolute', left: 160, top: 968, width: 1520}}>
      {CAPS.map((c) => {
        const inAt = at(c.at);
        const outAt = at(c.end) - 12;
        const o = clampFade(frame, inAt, 10, outAt, 12);
        if (o <= 0) return null;
        return (
          <div key={c.at} style={{position: 'absolute', left: 0, top: 0, width: '100%'}}>
            <Caption
              lead={c.lead}
              sub={c.sub}
              opacity={o}
              subOpacity={c.subAt === undefined ? 1 : clampFade(frame, at(c.subAt), 10)}
            />
          </div>
        );
      })}
    </div>
  );
};

/**
 * The recording, in its bezel. The push in and the dim both live inside the
 * scaled layer, so the highlight stays glued to the cell it is about.
 */
const Stage: React.FC = () => {
  const frame = useCurrentFrame();
  const scale = interpolate(
    frame,
    [at(24.4), at(25.6), at(27.6), at(28.5)],
    [1, 1.32, 1.32, 1],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
  );
  const dim = clampFade(frame, at(25.0), 14, at(27.5), 16);

  return (
    <AbsoluteFill style={{backgroundColor: RAIL}}>
      <div
        style={{
          position: 'absolute',
          left: CARD_X,
          top: CARD_Y,
          padding: PAD,
          background: RAIL_2,
          border: `1px solid ${RAIL_LINE}`,
          borderRadius: 14,
          boxShadow: '0 26px 70px rgba(0,0,0,.55)',
        }}
      >
        <div
          style={{
            width: VW,
            height: VH,
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 8,
            boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.35)',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              transform: `scale(${scale})`,
              transformOrigin: `${SPOT_CX}px ${SPOT_CY}px`,
            }}
          >
            <Sequence from={0} durationInFrames={S1} layout="none">
              <OffthreadVideo src={staticFile(SRC)} muted style={{width: VW, height: VH}} />
            </Sequence>
            <Sequence from={S1} durationInFrames={S2} layout="none">
              <OffthreadVideo
                src={staticFile(SRC)}
                muted
                trimBefore={S1}
                playbackRate={RATE}
                style={{width: VW, height: VH}}
              />
            </Sequence>
            <Sequence from={S1 + S2} durationInFrames={S3} layout="none">
              <OffthreadVideo
                src={staticFile(SRC)}
                muted
                trimBefore={Math.round(SLOW_TO * FPS)}
                style={{width: VW, height: VH}}
              />
            </Sequence>

            {dim > 0 ? (
              <div
                style={{
                  position: 'absolute',
                  left: SPOT.x,
                  top: SPOT.y,
                  width: SPOT.w,
                  height: SPOT.h,
                  borderRadius: 6,
                  border: `2px solid ${ACCENT_HI}`,
                  boxShadow: '0 0 0 4000px rgba(10,13,18,.62)',
                  opacity: dim,
                }}
              />
            ) : null}
          </div>
        </div>
      </div>
      <Captions />
    </AbsoluteFill>
  );
};

// ---- cold open --------------------------------------------------------------
const ColdOpen: React.FC = () => {
  const frame = useCurrentFrame();
  const s = interpolate(frame, [0, COLD], [0.99, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <AbsoluteFill
      style={{
        backgroundColor: RAIL,
        justifyContent: 'center',
        alignItems: 'center',
        opacity: clampFade(frame, 4, 20, COLD - 2, 12),
      }}
    >
      <div
        style={{
          transform: `scale(${s})`,
          font: `700 132px/1 ${MONO}`,
          letterSpacing: '.02em',
        }}
      >
        <span style={{color: RAIL_INK}}>tirai</span>
        <span style={{color: ACCENT_HI}}>.</span>
      </div>
      <div
        style={{
          marginTop: 44,
          font: `700 42px/1.3 ${SANS}`,
          letterSpacing: '-.015em',
          color: RAIL_INK,
          opacity: clampFade(frame, 26, 20),
        }}
      >
        Confidential price discovery, provable settlement.
      </div>
    </AbsoluteFill>
  );
};

// ---- closing card -----------------------------------------------------------
// Every figure here is checkable in the repo: README.md line 176 for the
// validator state, test/daml for the script count, scripts/devnet.mjs for the
// attestations and the two cash rails.
const STATS: [string, string][] = [
  ['50', 'settled trades'],
  ['5', 'atomic baskets'],
  ['42', 'Daml test scripts'],
  ['16', 'best execution attestations'],
];

const Close: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        backgroundColor: RAIL,
        justifyContent: 'center',
        paddingLeft: 150,
        paddingRight: 150,
        opacity: clampFade(frame, 0, 12, CLOSE - 8, 18),
      }}
    >
      <div
        style={{
          display: 'flex',
          borderTop: `1px solid ${RAIL_LINE}`,
          borderBottom: `1px solid ${RAIL_LINE}`,
        }}
      >
        {STATS.map(([n, label], i) => (
          <StatCell key={label} n={n} label={label} at={4 + i * 6} first={i === 0} />
        ))}
      </div>
      <div
        style={{
          marginTop: 44,
          font: `600 30px/1.4 ${SANS}`,
          color: RAIL_INK,
          maxWidth: 1440,
          opacity: clampFade(frame, 30, 18),
        }}
      >
        Six settlements in real Canton Coin and two in real CBTC, on the Canton DevNet validator.
      </div>
      <div
        style={{
          marginTop: 20,
          font: `400 23px/1.5 ${SANS}`,
          color: RAIL_MUTED,
          maxWidth: 1440,
          opacity: clampFade(frame, 42, 18),
        }}
      >
        The trading history was seeded by the builder to exercise the flows. It is not customer
        volume.
      </div>
      <div
        style={{
          marginTop: 40,
          font: `600 32px/1 ${MONO}`,
          color: ACCENT_HI,
          opacity: clampFade(frame, 56, 18),
        }}
      >
        tirai.vercel.app
      </div>
    </AbsoluteFill>
  );
};

// ---- the film ---------------------------------------------------------------
export const TiraiDemo: React.FC = () => {
  useManrope();
  return (
    <AbsoluteFill style={{backgroundColor: RAIL, fontFamily: SANS}}>
      <style>{FONT_CSS}</style>

      <Sequence from={COLD} durationInFrames={FOOTAGE}>
        <Stage />
      </Sequence>

      {/* painted over the first frames of the footage, so the cut is a short fade */}
      <Sequence from={0} durationInFrames={COLD + 10}>
        <ColdOpen />
      </Sequence>

      <Sequence from={COLD + FOOTAGE - 10} durationInFrames={CLOSE + 10}>
        <Close />
      </Sequence>
    </AbsoluteFill>
  );
};
