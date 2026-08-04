// Colours lifted verbatim from web/style.css. Nothing new is invented here.
export const RAIL = '#0e1116';
export const RAIL_2 = '#151a21';
export const RAIL_LINE = '#232a34';
export const RAIL_INK = '#eef1f5';
export const RAIL_MUTED = '#9aa3b0';
export const ACCENT = '#0e9f6e';
export const ACCENT_HI = '#12b87f';
export const ACCENT_INK = '#07724d';
export const SURFACE = '#f6f7f9';
export const LINE = '#e5e8ec';
export const RADIUS = 10;

export const SANS = "'Manrope', ui-sans-serif, system-ui, sans-serif";
export const MONO = "ui-monospace, 'SFMono-Regular', Menlo, Consolas, monospace";

// Natural pixel sizes of the screenshots in media/, so crops can be expressed
// in fractions of the source image.
export const SHOTS = {
  privacy: {src: 'x-2-privacy.png', w: 3280, h: 538},
  verify: {src: 'x-3-verify.png', w: 3200, h: 2298},
  registry: {src: 'x-4-registry.png', w: 3200, h: 1960},
  bestexec: {src: 'x-5-bestexec.png', w: 3200, h: 1960},
  rails: {src: 'x-6-rails.png', w: 1500, h: 900},
} as const;

export type ShotName = keyof typeof SHOTS;
