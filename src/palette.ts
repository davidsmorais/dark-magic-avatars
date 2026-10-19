import type { PartColors } from './types.js';

export const WIZARD_ACCENT_CHOICES: string[] = [
  '#D97757',
  '#10A37F',
  '#4796E3',
  '#8C15F9',
  '#EC4899',
  '#EF4444',
  '#F59E0B',
  '#06B6D4',
  '#84CC16',
  '#64748B',
];

export const WIZARD_TONE_CHOICES: string[] = ['#F5D0A9', '#C68B59', '#E2E8F0', '#FDE68A', '#1E293B'];

export const WIZARD_COLOR_CHOICES: string[] = [...WIZARD_ACCENT_CHOICES, ...WIZARD_TONE_CHOICES];

export const WIZARD_FALLBACK_COLOR = '#8C15F9';

const SHADE_FACTOR = 0.62;

/** Returns `value` when it is a `#RRGGBB` hex string, otherwise `fallback`. */
export function sanitizeHexColor(value: unknown, fallback = ''): string {
  if (typeof value !== 'string') return fallback;
  const clean = value.trim();
  return /^#[0-9a-fA-F]{6}$/.test(clean) ? clean : fallback;
}

export function shadeColor(hex: string, factor = SHADE_FACTOR): string {
  const clean = sanitizeHexColor(hex, WIZARD_FALLBACK_COLOR);
  const channel = (offset: number) => {
    const value = Math.round(parseInt(clean.slice(offset, offset + 2), 16) * factor);
    return Math.max(0, Math.min(255, value)).toString(16).padStart(2, '0');
  };
  return `#${channel(1)}${channel(3)}${channel(5)}`.toUpperCase();
}

export function partColors(color: string): PartColors {
  const main = sanitizeHexColor(color, WIZARD_FALLBACK_COLOR);
  return { main, dark: shadeColor(main) };
}

/** Parses user-typed hex (with or without `#`); returns uppercase `#RRGGBB` or null. */
export function normalizeHexDraft(draft: string): string | null {
  const trimmed = draft.trim();
  const clean = sanitizeHexColor(trimmed.startsWith('#') ? trimmed : `#${trimmed}`);
  return clean ? clean.toUpperCase() : null;
}
