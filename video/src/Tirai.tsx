import React from 'react';
import {AbsoluteFill, interpolate, Sequence, useCurrentFrame} from 'remotion';
import {
  Caption,
  clampFade,
  Eyebrow,
  FONT_CSS,
  PanelLabel,
  Shot,
  useManrope,
} from './parts';
import {ACCENT_HI, MONO, RAIL, RAIL_INK, RAIL_LINE, RAIL_MUTED, SANS} from './theme';

// ---- timeline (30 fps) ------------------------------------------------------
const S1 = 320; // the problem, in type
const S2 = 480; // sealed quotes: one request, two dealer sessions
const S3 = 305; // the proof
const S4 = 345; // the settlement
const S5 = 260; // the numbers and the close
export const DURATION = S1 + S2 + S3 + S4 + S5; // 1710 frames = 57s

/**
 * One shot of the film. Beats overlap by design: the outgoing one fades over
 * the same frames the incoming one arrives, which is the only transition this
 * video uses.
 */
const Beat: React.FC<{
  from: number;
  duration: number;
  fadeIn?: number;
  fadeOut?: number;
  children: React.ReactNode;
}> = ({from, duration, fadeIn = 18, fadeOut = 20, children}) => (
  <Sequence from={from} durationInFrames={duration}>
    <BeatBody duration={duration} fadeIn={fadeIn} fadeOut={fadeOut}>
      {children}
    </BeatBody>
  </Sequence>
);

const BeatBody: React.FC<{
  duration: number;
  fadeIn: number;
  fadeOut: number;
  children: React.ReactNode;
}> = ({duration, fadeIn, fadeOut, children}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        backgroundColor: RAIL,
        fontFamily: SANS,
        opacity: clampFade(frame, 0, fadeIn, duration - fadeOut, fadeOut),
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

const FadeIn: React.FC<{at: number; children: React.ReactNode}> = ({at, children}) => {
  const frame = useCurrentFrame();
  return <div style={{opacity: clampFade(frame, at, 18)}}>{children}</div>;
};

const At: React.FC<{
  left: number;
  top: number;
  width?: number;
  children: React.ReactNode;
}> = ({left, top, width, children}) => (
  <div style={{position: 'absolute', left, top, width}}>{children}</div>
);

// ---- 1 · the problem --------------------------------------------------------
const TypeBeat: React.FC<{a: string; b: string; size?: number}> = ({a, b, size = 74}) => {
  const frame = useCurrentFrame();
  const dy = interpolate(frame, [0, 34], [16, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const type: React.CSSProperties = {
    font: `800 ${size}px/1.26 ${SANS}`,
    letterSpacing: '-.022em',
  };
  return (
    <AbsoluteFill
      style={{justifyContent: 'center', paddingLeft: 150, paddingRight: 150, transform: `translateY(${dy}px)`}}
    >
      <div style={{...type, color: RAIL_INK}}>{a}</div>
      <div style={{...type, color: RAIL_MUTED}}>{b}</div>
    </AbsoluteFill>
  );
};

// ---- 2 · sealed quotes ------------------------------------------------------
// Crops are fractions of media/x-2-privacy.png (3280x538): each dealer's card,
// and the price column inside it.
const CARD_A = {x: 0.012, y: 0.215, w: 0.484, h: 0.56};
const CARD_B = {x: 0.504, y: 0.215, w: 0.484, h: 0.56};
const PRICE_A = {x: 0.288, y: 0.5, w: 0.082, h: 0.26};
const PRICE_B = {x: 0.78, y: 0.5, w: 0.082, h: 0.26};

// ---- 5 · numbers ------------------------------------------------------------
const STATS: [string, string][] = [
  ['36', 'Daml test scripts'],
  ['49', 'settled trades'],
  ['5', 'atomic baskets'],
  ['16', 'attestations'],
];

export const StatCell: React.FC<{n: string; label: string; at: number; first: boolean}> = ({
  n,
  label,
  at,
  first,
}) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        flex: 1,
        padding: '38px 32px',
        borderLeft: first ? 'none' : `1px solid ${RAIL_LINE}`,
        opacity: clampFade(frame, at, 20),
      }}
    >
      <div style={{font: `700 74px/1 ${MONO}`, color: RAIL_INK, letterSpacing: '-.02em'}}>{n}</div>
      <div
        style={{
          marginTop: 18,
          font: `600 20px/1 ${SANS}`,
          letterSpacing: '.1em',
          textTransform: 'uppercase',
          color: RAIL_MUTED,
        }}
      >
        {label}
      </div>
    </div>
  );
};

const Wordmark: React.FC = () => {
  const frame = useCurrentFrame();
  const s = interpolate(frame, [4, 90], [0.985, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
      <div
        style={{
          opacity: clampFade(frame, 4, 22),
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
          opacity: clampFade(frame, 30, 20),
        }}
      >
        Confidential price discovery, provable settlement.
      </div>
      <div
        style={{
          marginTop: 28,
          font: `600 30px/1 ${MONO}`,
          color: ACCENT_HI,
          opacity: clampFade(frame, 50, 20),
        }}
      >
        https://tirai.vercel.app
      </div>
    </AbsoluteFill>
  );
};

// ---- the film ---------------------------------------------------------------
const A = S1; // scene offsets on the master timeline
const B = S1 + S2;
const C = S1 + S2 + S3;
const D = S1 + S2 + S3 + S4;

export const Tirai: React.FC = () => {
  useManrope();

  return (
    <AbsoluteFill style={{backgroundColor: RAIL}}>
      <style>{FONT_CSS}</style>

      {/* 1 · the problem */}
      <Beat from={0} duration={116} fadeOut={18}>
        <At left={150} top={120}>
          <Eyebrow>Block trading, 2026</Eyebrow>
        </At>
        <TypeBeat a="A desk asks five dealers for a price." b="The question itself moves the market." />
      </Beat>
      <Beat from={110} duration={112} fadeOut={18}>
        <TypeBeat a="A public venue leaks the request." b="A voice broker leaves no proof." />
      </Beat>
      <Beat from={216} duration={110} fadeOut={20}>
        <TypeBeat a="Privacy, or proof." b="Never both." size={92} />
      </Beat>

      {/* 2 · sealed quotes, as published */}
      <Beat from={A} duration={172} fadeOut={22}>
        <At left={96} top={340}>
          <Eyebrow>One request &middot; two dealers, each in its own session</Eyebrow>
        </At>
        <At left={96} top={410}>
          <Shot
            shot="privacy"
            crop={{x: 0.004, y: 0.02, w: 0.992, h: 0.78}}
            width={1728}
            zoom={1.03}
            zoomFrames={172}
          />
        </At>
        <At left={96} top={700} width={1728}>
          <FadeIn at={34}>
            <Caption
              lead="Each quote is signed by that dealer and the buyer. Nobody else."
              sub="The price is present in one session and simply absent in the other."
            />
          </FadeIn>
        </At>
      </Beat>

      {/* 2b · the same two cards, brought up to reading size */}
      <Beat from={A + 152} duration={S2 - 152} fadeIn={22}>
        <At left={140} top={84}>
          <Eyebrow>The same request, the same ledger, the same moment</Eyebrow>
        </At>
        <At left={140} top={150}>
          <PanelLabel name="Dealer A's session" note="its own sealed ask" tone="accent" />
          <Shot
            shot="privacy"
            crop={CARD_A}
            width={1640}
            zoom={1.012}
            zoomFrames={330}
            boxes={[{...PRICE_A, at: 46}]}
          />
        </At>
        <At left={140} top={552}>
          <PanelLabel name="Dealer B's session" note="the number is not there" tone="accent" />
          <Shot
            shot="privacy"
            crop={CARD_B}
            width={1640}
            zoom={1.012}
            zoomFrames={330}
            boxes={[{...PRICE_B, at: 104}]}
          />
        </At>
        <At left={140} top={950} width={1640}>
          <FadeIn at={130}>
            <Caption
              lead="Dealer B is not being shown a redacted view."
              sub="Its participant node never received the quote contract. On Canton that is a signatory and observer declaration, not cryptography bolted on."
            />
          </FadeIn>
        </At>
      </Beat>

      {/* 3 · the proof */}
      <Beat from={B} duration={172} fadeOut={22}>
        <At left={140} top={175}>
          <Eyebrow>Verify privacy &middot; live Canton Devnet state</Eyebrow>
        </At>
        <At left={140} top={255}>
          <Shot
            shot="verify"
            crop={{x: 0.155, y: 0.213, w: 0.74, h: 0.265}}
            width={1640}
            zoom={1.02}
            zoomFrames={172}
            boxes={[
              {x: 0.48, y: 0.276, w: 0.103, h: 0.032, at: 44},
              {x: 0.531, y: 0.416, w: 0.101, h: 0.032, at: 84},
            ]}
          />
        </At>
        <At left={140} top={790} width={1640}>
          <FadeIn at={20}>
            <Caption
              lead="Not a filter. It queries what each party's node actually holds."
              sub="Every dealer holds only its own quotes. The regulator holds zero contracts before settlement."
            />
          </FadeIn>
        </At>
      </Beat>

      <Beat from={B + 152} duration={S3 - 152} fadeIn={22}>
        <At left={140} top={300}>
          <Eyebrow>Best execution &middot; with no public order book</Eyebrow>
        </At>
        <At left={140} top={378}>
          <Shot
            shot="bestexec"
            crop={{x: 0.155, y: 0.178, w: 0.66, h: 0.136}}
            width={1640}
            zoom={1.02}
            zoomFrames={150}
            boxes={[{x: 0.524, y: 0.2735, w: 0.192, h: 0.026, at: 40}]}
          />
        </At>
        <At left={140} top={700} width={1640}>
          <FadeIn at={20}>
            <Caption
              lead="Sixteen best execution attestations on the ledger."
              sub="Either side can open one sealed quote to the regulator on demand. Confidential going in, provable coming out."
            />
          </FadeIn>
        </At>
      </Beat>

      {/* 4 · the settlement */}
      <Beat from={C} duration={227} fadeOut={22}>
        <At left={150} top={110}>
          <Eyebrow>Settlement rails &middot; assets this project does not issue</Eyebrow>
        </At>
        <At left={150} top={185}>
          <Shot
            shot="rails"
            crop={{x: 0.17, y: 0.2, w: 0.815, h: 0.377}}
            width={1620}
            zoom={1.018}
            zoomFrames={227}
            boxes={[
              {x: 0.178, y: 0.4605, w: 0.8, h: 0.05, at: 50},
              {x: 0.178, y: 0.5135, w: 0.8, h: 0.05, at: 92},
            ]}
          />
        </At>
        <At left={150} top={700} width={1620}>
          <FadeIn at={20}>
            <Caption
              lead="The cash leg settles in real Canton Coin and real CBTC."
              sub="Canton Coin through the DSO's registry, CBTC through the DA Utility Registry that BitSafe issues on. Atomic delivery versus payment, or nothing."
            />
          </FadeIn>
        </At>
        <At left={150} top={905}>
          <FadeIn at={118}>
            <div style={{font: `600 27px/1 ${MONO}`, color: ACCENT_HI, letterSpacing: '.02em'}}>
              60,900 CC across six settlements &nbsp;&middot;&nbsp; 0.34 and 0.22 CBTC
            </div>
          </FadeIn>
        </At>
      </Beat>

      <Beat from={C + 212} duration={S4 - 212} fadeIn={22}>
        <At left={150} top={160}>
          <Eyebrow>Portfolio &middot; read from one party's own node</Eyebrow>
        </At>
        <At left={150} top={300}>
          <Shot
            shot="registry"
            crop={{x: 0.155, y: 0.178, w: 0.34, h: 0.4}}
            width={700}
            zoom={1.02}
            zoomFrames={135}
          />
        </At>
        <At left={950} top={450} width={820}>
          <FadeIn at={26}>
            <Caption
              lead="Every balance here is read live off the ledger."
              sub="What the signed-in identity actually holds. Nobody else's book is readable from there."
            />
          </FadeIn>
        </At>
      </Beat>

      {/* 5 · the numbers, then the close */}
      <Beat from={D} duration={137} fadeOut={22}>
        <AbsoluteFill style={{justifyContent: 'center', paddingLeft: 150, paddingRight: 150}}>
          <div
            style={{
              display: 'flex',
              borderTop: `1px solid ${RAIL_LINE}`,
              borderBottom: `1px solid ${RAIL_LINE}`,
            }}
          >
            {STATS.map(([n, label], i) => (
              <StatCell key={label} n={n} label={label} at={12 + i * 9} first={i === 0} />
            ))}
          </div>
          <div style={{marginTop: 46, font: `400 24px/1.5 ${SANS}`, color: RAIL_MUTED, maxWidth: 1420}}>
            <FadeIn at={54}>
              Live on Canton Devnet, on two participants under the same package id. The trading
              history was seeded by the builder to exercise the flows, it is not customer volume.
            </FadeIn>
          </div>
        </AbsoluteFill>
      </Beat>

      <Beat from={D + 122} duration={S5 - 122} fadeIn={22} fadeOut={24}>
        <Wordmark />
      </Beat>
    </AbsoluteFill>
  );
};
