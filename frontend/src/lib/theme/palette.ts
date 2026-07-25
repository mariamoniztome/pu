/**
 * Generates a 10-step Tailwind-style color scale (50…900) from a single
 * owner-picked hex, in OKLCH space. OKLCH (not HSL) because HSL-derived
 * ramps drift muddy/neon at the extremes for yellows and blues; OKLCH keeps
 * perceptual lightness consistent across hues.
 *
 * No dependencies — sRGB ⇄ OKLab/OKLCH math implemented inline (Björn
 * Ottosson's reference constants).
 *
 * Output values are "H S% L%" triplet strings (no hsl() wrapper) so they can
 * be assigned to CSS custom properties consumed by Tailwind as
 * `hsl(var(--brand-500) / <alpha-value>)` — putting a full color in the var
 * would silently break every opacity modifier like `shadow-lilac-200/30`.
 */

export type ScaleStep = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
export const SCALE_STEPS: ScaleStep[] = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];

export interface GeneratedScale {
  /** step -> "H S% L%" string ready for a CSS var */
  steps: Record<ScaleStep, string>;
  /** true if the input color had to be adjusted for legibility */
  wasClamped: boolean;
  /** readable foreground ("0 0% 100%" white or "220 13% 18%" near-black) against step 600 */
  onSolid: string;
}

// ---------------------------------------------------------------------------
// sRGB <-> OKLCH
// ---------------------------------------------------------------------------

function srgbToLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function linearToSrgb(c: number): number {
  return c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}

function rgbToOklab(r: number, g: number, b: number): [number, number, number] {
  const lr = srgbToLinear(r);
  const lg = srgbToLinear(g);
  const lb = srgbToLinear(b);

  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);

  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

function oklabToRgb(L: number, a: number, bb: number): [number, number, number] {
  const l = Math.pow(L + 0.3963377774 * a + 0.2158037573 * bb, 3);
  const m = Math.pow(L - 0.1055613458 * a - 0.0638541728 * bb, 3);
  const s = Math.pow(L - 0.0894841775 * a - 1.291485548 * bb, 3);

  const lr = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const lg = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const lb = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;

  return [linearToSrgb(lr), linearToSrgb(lg), linearToSrgb(lb)];
}

interface Oklch {
  L: number;
  C: number;
  h: number; // radians
}

function hexToOklch(hex: string): Oklch | null {
  const match = /^#?([0-9a-fA-F]{6})$/.exec(hex.trim());
  if (!match) return null;
  const n = parseInt(match[1], 16);
  const r = ((n >> 16) & 0xff) / 255;
  const g = ((n >> 8) & 0xff) / 255;
  const b = (n & 0xff) / 255;
  const [L, a, bb] = rgbToOklab(r, g, b);
  return { L, C: Math.sqrt(a * a + bb * bb), h: Math.atan2(bb, a) };
}

function oklchToRgbClamped({ L, C, h }: Oklch): [number, number, number] {
  // Reduce chroma until the color fits in sRGB gamut (binary-search-lite)
  let c = C;
  for (let i = 0; i < 16; i++) {
    const [r, g, b] = oklabToRgb(L, c * Math.cos(h), c * Math.sin(h));
    if (r >= -0.001 && r <= 1.001 && g >= -0.001 && g <= 1.001 && b >= -0.001 && b <= 1.001) {
      return [Math.min(1, Math.max(0, r)), Math.min(1, Math.max(0, g)), Math.min(1, Math.max(0, b))];
    }
    c *= 0.85;
  }
  const [r, g, b] = oklabToRgb(L, 0, 0);
  return [Math.min(1, Math.max(0, r)), Math.min(1, Math.max(0, g)), Math.min(1, Math.max(0, b))];
}

function rgbToHslTriplet(r: number, g: number, b: number): string {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return `${Math.round(h * 360)} ${Math.round(s * 1000) / 10}% ${Math.round(l * 1000) / 10}%`;
}

// ---------------------------------------------------------------------------
// WCAG relative luminance / contrast (for foreground pick)
// ---------------------------------------------------------------------------

function relativeLuminance(r: number, g: number, b: number): number {
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}

function contrastRatio(l1: number, l2: number): number {
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

// ---------------------------------------------------------------------------
// Scale generation
// ---------------------------------------------------------------------------

// Fixed OKLCH lightness ladder tuned to roughly match the app's existing
// primary/lilac scales (very light 50, mid-saturated 500-600, deep 900).
const L_LADDER: Record<ScaleStep, number> = {
  50: 0.975,
  100: 0.945,
  200: 0.89,
  300: 0.81,
  400: 0.73,
  500: 0.655,
  600: 0.565,
  700: 0.475,
  800: 0.395,
  900: 0.33,
};

// Chroma multiplier bell curve: subtle at the ends, full at 500.
const C_CURVE: Record<ScaleStep, number> = {
  50: 0.18,
  100: 0.32,
  200: 0.55,
  300: 0.78,
  400: 0.92,
  500: 1,
  600: 0.95,
  700: 0.85,
  800: 0.75,
  900: 0.68,
};

// Anchor clamps: stop near-white/near-black/neon picks from generating an
// unreadable scale. The picked color's *hue* always survives; only its
// lightness/chroma are pulled into a sane band.
const ANCHOR_L_MIN = 0.42;
const ANCHOR_L_MAX = 0.78;
const ANCHOR_C_MAX = 0.2;

export function generateScale(hex: string): GeneratedScale | null {
  const anchor = hexToOklch(hex);
  if (!anchor) return null;

  const clampedL = Math.min(ANCHOR_L_MAX, Math.max(ANCHOR_L_MIN, anchor.L));
  const clampedC = Math.min(ANCHOR_C_MAX, anchor.C);
  const wasClamped = Math.abs(clampedL - anchor.L) > 0.01 || anchor.C - clampedC > 0.01;

  const steps = {} as Record<ScaleStep, string>;
  for (const step of SCALE_STEPS) {
    const rgb = oklchToRgbClamped({
      L: L_LADDER[step],
      C: clampedC * C_CURVE[step],
      h: anchor.h,
    });
    steps[step] = rgbToHslTriplet(...rgb);
  }

  // Foreground against step 600 (solid button surfaces)
  const rgb600 = oklchToRgbClamped({ L: L_LADDER[600], C: clampedC * C_CURVE[600], h: anchor.h });
  const lum600 = relativeLuminance(...rgb600);
  const whiteContrast = contrastRatio(1, lum600);
  const darkContrast = contrastRatio(relativeLuminance(0.066, 0.094, 0.153), lum600); // gray-900-ish
  const onSolid = whiteContrast >= darkContrast ? '0 0% 100%' : '220 13% 18%';

  return { steps, wasClamped, onSolid };
}
