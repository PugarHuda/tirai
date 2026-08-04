import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {
  ACCENT_HI,
  LINE,
  MONO,
  RADIUS,
  RAIL_INK,
  RAIL_LINE,
  RAIL_MUTED,
  SANS,
  SHOTS,
  ShotName,
} from './theme';

export const clampFade = (
  frame: number,
  inAt: number,
  inDur: number,
  outAt?: number,
  outDur = 12
) => {
  const rise = interpolate(frame, [inAt, inAt + inDur], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  if (outAt === undefined) return rise;
  const fall = interpolate(frame, [outAt, outAt + outDur], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return Math.min(rise, fall);
};

/** Whole-scene fade, so cuts read as dissolves rather than jumps. */
export const Scene: React.FC<{
  durationInFrames: number;
  children: React.ReactNode;
}> = ({durationInFrames, children}) => {
  const frame = useCurrentFrame();
  const opacity = clampFade(frame, 0, 14, durationInFrames - 16, 16);
  return <AbsoluteFill style={{opacity}}>{children}</AbsoluteFill>;
};

export type Rect = {x: number; y: number; w: number; h: number};

export type Box = Rect & {at: number; label?: string; labelSide?: 'above' | 'below'};

/**
 * A framed crop of one of the real screenshots. `crop` and `boxes` are both in
 * fractions of the source image, so an annotation stays glued to the pixel it
 * points at whatever the crop is.
 */
export const Shot: React.FC<{
  shot: ShotName;
  crop: Rect;
  width: number;
  zoom?: number;
  zoomFrames?: number;
  boxes?: Box[];
  style?: React.CSSProperties;
}> = ({shot, crop, width, zoom = 1.025, zoomFrames = 300, boxes = [], style}) => {
  const frame = useCurrentFrame();
  const {src, w: nw, h: nh} = SHOTS[shot];
  const imgW = width / crop.w;
  const imgH = imgW * (nh / nw);
  const height = crop.h * imgH;
  const scale = interpolate(frame, [0, zoomFrames], [1, zoom], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        width,
        height,
        position: 'relative',
        overflow: 'hidden',
        borderRadius: RADIUS,
        border: `1px solid ${RAIL_LINE}`,
        boxShadow: '0 18px 48px rgba(0,0,0,.45)',
        transform: `scale(${scale})`,
        ...style,
      }}
    >
      <div style={{position: 'absolute', inset: 0}}>
        <Img
          src={staticFile(src)}
          style={{
            position: 'absolute',
            width: imgW,
            height: imgH,
            left: -crop.x * imgW,
            top: -crop.y * imgH,
            maxWidth: 'none',
          }}
        />
        {boxes.map((b, i) => {
          const o = clampFade(frame, b.at, 10);
          const grow = interpolate(frame, [b.at, b.at + 10], [1.08, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: (b.x - crop.x) * imgW,
                top: (b.y - crop.y) * imgH,
                width: b.w * imgW,
                height: b.h * imgH,
                border: `2px solid ${ACCENT_HI}`,
                borderRadius: 6,
                background: 'rgba(18,184,127,.12)',
                opacity: o,
                transform: `scale(${grow})`,
              }}
            >
              {b.label ? (
                <div
                  style={{
                    position: 'absolute',
                    left: -2,
                    [b.labelSide === 'below' ? 'top' : 'bottom']: '100%',
                    [b.labelSide === 'below' ? 'marginTop' : 'marginBottom']: 8,
                    background: ACCENT_HI,
                    color: '#08120d',
                    font: `700 20px/1 ${SANS}`,
                    letterSpacing: '.01em',
                    padding: '8px 12px',
                    borderRadius: 6,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {b.label}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const Eyebrow: React.FC<{children: React.ReactNode; opacity?: number}> = ({
  children,
  opacity = 1,
}) => (
  <div
    style={{
      font: `600 19px/1 ${MONO}`,
      letterSpacing: '.16em',
      textTransform: 'uppercase',
      color: RAIL_MUTED,
      opacity,
    }}
  >
    {children}
  </div>
);

export const Caption: React.FC<{
  lead: string;
  sub?: string;
  opacity?: number;
}> = ({lead, sub, opacity = 1}) => (
  <div style={{opacity}}>
    <div
      style={{
        font: `700 36px/1.25 ${SANS}`,
        letterSpacing: '-.015em',
        color: RAIL_INK,
      }}
    >
      {lead}
    </div>
    {sub ? (
      <div
        style={{
          font: `400 25px/1.4 ${SANS}`,
          color: RAIL_MUTED,
          marginTop: 12,
          maxWidth: 1500,
        }}
      >
        {sub}
      </div>
    ) : null}
  </div>
);

/** The label above a stacked panel, in the app's own rail typography. */
export const PanelLabel: React.FC<{
  name: string;
  note: string;
  tone: 'ink' | 'accent';
  opacity?: number;
}> = ({name, note, tone, opacity = 1}) => (
  <div style={{display: 'flex', alignItems: 'baseline', gap: 16, opacity, marginBottom: 12}}>
    <span style={{font: `800 30px/1 ${SANS}`, color: RAIL_INK, letterSpacing: '-.01em'}}>
      {name}
    </span>
    <span
      style={{
        font: `600 25px/1 ${SANS}`,
        color: tone === 'accent' ? ACCENT_HI : RAIL_MUTED,
      }}
    >
      {note}
    </span>
  </div>
);

export const Hairline: React.FC<{width: number; opacity?: number}> = ({width, opacity = 1}) => (
  <div style={{width, height: 1, background: LINE, opacity: opacity * 0.14}} />
);
