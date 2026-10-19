import { WIZARD_COLOR_CHOICES, WIZARD_FALLBACK_COLOR, WIZARD_TONE_CHOICES, sanitizeHexColor } from './palette.js';
import {
  BODY_IDS,
  CAPE_IDS,
  EYES_IDS,
  HAT_IDS,
  MOUTH_IDS,
  STAFF_IDS,
  type BodyId,
  type OptionalPartKey,
  type Part,
  type WizardAvatar,
} from './types.js';

export const DEFAULT_WIZARD_AVATAR: WizardAvatar = {
  v: 1,
  body: { id: 'round', color: '#F5D0A9' },
  hat: { id: 'pointy', color: '#8C15F9' },
  eyes: { id: 'round', color: '#1E293B' },
  mouth: { id: 'beard', color: '#E2E8F0' },
  staff: { id: 'orb', color: '#F59E0B' },
  cape: { id: 'classic', color: '#4796E3' },
};

const OPTIONAL_IDS: { [K in OptionalPartKey]: readonly string[] } = {
  hat: HAT_IDS,
  eyes: EYES_IDS,
  mouth: MOUTH_IDS,
  staff: STAFF_IDS,
  cape: CAPE_IDS,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function sanitizePart<K extends OptionalPartKey>(key: K, value: unknown): WizardAvatar[K] {
  const fallback = DEFAULT_WIZARD_AVATAR[key];
  if (!isRecord(value)) return { ...fallback };
  const id = value.id === 'none' || OPTIONAL_IDS[key].includes(value.id as string) ? value.id : fallback.id;
  return { id, color: sanitizeHexColor(value.color, fallback.color) } as WizardAvatar[K];
}

/**
 * Coerces untrusted input (e.g. parsed JSON) into a valid avatar. Unknown part ids and
 * malformed colors fall back to defaults; anything without `v: 1` returns undefined.
 */
export function sanitizeWizardAvatar(value: unknown): WizardAvatar | undefined {
  if (!isRecord(value) || value.v !== 1) return undefined;
  const body = isRecord(value.body) ? value.body : {};
  return {
    v: 1,
    body: {
      id: (BODY_IDS as readonly string[]).includes(body.id as string)
        ? (body.id as BodyId)
        : DEFAULT_WIZARD_AVATAR.body.id,
      color: sanitizeHexColor(body.color, DEFAULT_WIZARD_AVATAR.body.color),
    },
    hat: sanitizePart('hat', value.hat),
    eyes: sanitizePart('eyes', value.eyes),
    mouth: sanitizePart('mouth', value.mouth),
    staff: sanitizePart('staff', value.staff),
    cape: sanitizePart('cape', value.cape),
  };
}

function pick<T>(items: readonly T[], rng: () => number): T {
  return items[Math.floor(rng() * items.length) % items.length];
}

function randomPart<Id extends string>(ids: readonly Id[], rng: () => number, noneChance: number): Part<Id> {
  return { id: rng() < noneChance ? 'none' : pick(ids, rng), color: pick(WIZARD_COLOR_CHOICES, rng) };
}

export function randomWizardAvatar(rng: () => number = Math.random): WizardAvatar {
  return {
    v: 1,
    body: { id: pick(BODY_IDS, rng), color: pick(WIZARD_COLOR_CHOICES, rng) },
    hat: randomPart(HAT_IDS, rng, 0.1),
    eyes: randomPart(EYES_IDS, rng, 0),
    mouth: randomPart(MOUTH_IDS, rng, 0.1),
    staff: randomPart(STAFF_IDS, rng, 0.25),
    cape: randomPart(CAPE_IDS, rng, 0.25),
  };
}

/** Deterministic PRNG (FNV-1a seeded mulberry32) for stable per-seed avatars. */
export function seededRng(seed: string): () => number {
  let state = 2166136261;
  for (const ch of seed) state = Math.imul(state ^ ch.charCodeAt(0), 16777619) >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** The same seed always yields the same wizard; hat and cape wear `accent`. */
export function seededWizardAvatar(seed: string, accent: string = WIZARD_FALLBACK_COLOR): WizardAvatar {
  const rng = seededRng(seed || 'wizard');
  const color = sanitizeHexColor(accent, WIZARD_FALLBACK_COLOR);
  return {
    v: 1,
    body: { id: pick(BODY_IDS, rng), color: pick(WIZARD_TONE_CHOICES.slice(0, 2), rng) },
    hat: { id: pick(HAT_IDS, rng), color },
    eyes: { id: pick(EYES_IDS, rng), color: DEFAULT_WIZARD_AVATAR.eyes.color },
    mouth: { id: pick(MOUTH_IDS, rng), color: DEFAULT_WIZARD_AVATAR.mouth.color },
    staff: { id: pick(STAFF_IDS, rng), color: pick(WIZARD_TONE_CHOICES.slice(3, 4).concat(color), rng) },
    cape: { id: pick(CAPE_IDS, rng), color },
  };
}

export function describeWizardAvatar(avatar: WizardAvatar): string {
  const worn = (['hat', 'staff', 'cape'] as const)
    .filter((key) => avatar[key].id !== 'none')
    .map((key) => `${avatar[key].id} ${key}`);
  const base = `${avatar.body.id} wizard`;
  return worn.length > 0 ? `${base} with ${worn.join(', ')}` : base;
}
