import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  BODY_ANCHORS,
  BODY_IDS,
  DEFAULT_WIZARD_AVATAR,
  PART_IDS,
  PARTS,
  WizardAvatar,
  WizardBuilder,
  normalizeHexDraft,
  randomWizardAvatar,
  sanitizeWizardAvatar,
  seededWizardAvatar,
  shadeColor,
  type OptionalPartKey,
  type WizardAvatar as WizardAvatarData,
} from '../src/index.js';

const OPTIONAL: OptionalPartKey[] = ['hat', 'eyes', 'mouth', 'staff', 'cape'];

function bare(bodyId: (typeof BODY_IDS)[number]): WizardAvatarData {
  return {
    v: 1,
    body: { id: bodyId, color: '#F5D0A9' },
    hat: { id: 'none', color: '#8C15F9' },
    eyes: { id: 'none', color: '#1E293B' },
    mouth: { id: 'none', color: '#E2E8F0' },
    staff: { id: 'none', color: '#F59E0B' },
    cape: { id: 'none', color: '#4796E3' },
  };
}

function numbersIn(markup: string): number[] {
  const values: number[] = [];
  for (const match of markup.matchAll(/\s(?:d|cx|cy|x|y)="([^"]+)"/g)) {
    for (const n of match[1].match(/-?\d+(?:\.\d+)?/g) ?? []) values.push(Number(n));
  }
  return values;
}

describe('sanitizeWizardAvatar', () => {
  it('round-trips valid avatars through JSON', () => {
    expect(sanitizeWizardAvatar(DEFAULT_WIZARD_AVATAR)).toStrictEqual(DEFAULT_WIZARD_AVATAR);
    for (let i = 0; i < 25; i += 1) {
      const avatar = randomWizardAvatar();
      expect(sanitizeWizardAvatar(JSON.parse(JSON.stringify(avatar)))).toStrictEqual(avatar);
    }
  });

  it('rejects non-objects and versions other than 1', () => {
    expect(sanitizeWizardAvatar(undefined)).toBeUndefined();
    expect(sanitizeWizardAvatar('wizard')).toBeUndefined();
    expect(sanitizeWizardAvatar([])).toBeUndefined();
    expect(sanitizeWizardAvatar({ ...DEFAULT_WIZARD_AVATAR, v: 2 })).toBeUndefined();
    expect(sanitizeWizardAvatar({ ...DEFAULT_WIZARD_AVATAR, v: '1' })).toBeUndefined();
  });

  it('falls back to defaults for unknown ids, bad colors and missing parts', () => {
    const result = sanitizeWizardAvatar({
      v: 1,
      body: { id: 'none', color: 'red' },
      hat: { id: 'sombrero', color: '#123456' },
      eyes: { id: 'none', color: '#12345' },
      mouth: 'beard',
    });
    expect(result).toStrictEqual({
      v: 1,
      body: { id: DEFAULT_WIZARD_AVATAR.body.id, color: DEFAULT_WIZARD_AVATAR.body.color },
      hat: { id: DEFAULT_WIZARD_AVATAR.hat.id, color: '#123456' },
      eyes: { id: 'none', color: DEFAULT_WIZARD_AVATAR.eyes.color },
      mouth: DEFAULT_WIZARD_AVATAR.mouth,
      staff: DEFAULT_WIZARD_AVATAR.staff,
      cape: DEFAULT_WIZARD_AVATAR.cape,
    });
  });

  it('seeds avatars deterministically and dresses hat and cape in the accent', () => {
    const a = seededWizardAvatar('claude', '#D97757');
    expect(seededWizardAvatar('claude', '#D97757')).toStrictEqual(a);
    expect(a.hat.color).toBe('#D97757');
    expect(a.cape.color).toBe('#D97757');
    expect(seededWizardAvatar('claude', 'bogus').hat.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(sanitizeWizardAvatar(seededWizardAvatar(''))).toBeDefined();
  });
});

describe('palette helpers', () => {
  it('shades a hex color darker and stays a valid hex', () => {
    expect(shadeColor('#FFFFFF')).toMatch(/^#[0-9A-F]{6}$/);
    expect(shadeColor('#FFFFFF')).not.toBe('#FFFFFF');
    expect(shadeColor('#000000')).toBe('#000000');
    expect(shadeColor('not a color')).toMatch(/^#[0-9A-F]{6}$/);
  });

  it('accepts pasted hex with or without # and rejects malformed input', () => {
    expect(normalizeHexDraft(' #d97757 ')).toBe('#D97757');
    expect(normalizeHexDraft('10a37f')).toBe('#10A37F');
    expect(normalizeHexDraft('#12')).toBeNull();
    expect(normalizeHexDraft('#GGGGGG')).toBeNull();
    expect(normalizeHexDraft('rgb(1,2,3)')).toBeNull();
  });
});

describe('WizardAvatar rendering', () => {
  it('renders every body with every part variant without throwing', () => {
    for (const bodyId of BODY_IDS) {
      for (const key of OPTIONAL) {
        for (const id of ['none', ...PART_IDS[key]]) {
          const avatar = { ...bare(bodyId), [key]: { id, color: '#D97757' } } as WizardAvatarData;
          const markup = renderToStaticMarkup(createElement(WizardAvatar, { avatar, size: 16 }));
          expect(markup).toContain('role="img"');
          expect(markup).toContain('aria-label=');
        }
      }
    }
  });

  it('keeps every part inside the 64x64 viewBox for every body', () => {
    for (const bodyId of BODY_IDS) {
      const anchor = BODY_ANCHORS[bodyId];
      for (const key of ['body', ...OPTIONAL] as const) {
        const ids = key === 'body' ? [bodyId] : PART_IDS[key];
        for (const id of ids) {
          const element = PARTS[key][id]({ main: '#D97757', dark: '#7A4130' }, anchor);
          const markup = renderToStaticMarkup(createElement('svg', null, element));
          for (const n of numbersIn(markup)) {
            expect(n, `${bodyId}/${key}/${id}`).toBeGreaterThanOrEqual(0);
            expect(n, `${bodyId}/${key}/${id}`).toBeLessThanOrEqual(64);
          }
        }
      }
    }
  });

  it('leaves no stray elements behind for hidden parts', () => {
    for (const bodyId of BODY_IDS) {
      const markup = renderToStaticMarkup(createElement(WizardAvatar, { avatar: bare(bodyId) }));
      expect(markup.match(/<g>/g) ?? []).toHaveLength(1);
    }
  });

  it('renders the title when one is given', () => {
    const markup = renderToStaticMarkup(
      createElement(WizardAvatar, { avatar: DEFAULT_WIZARD_AVATAR, title: 'Claude <wizard>' }),
    );
    expect(markup).toContain('<title>Claude &lt;wizard&gt;</title>');
    expect(markup).toContain('aria-label="Claude &lt;wizard&gt;"');
  });
});


describe('WizardBuilder', () => {
  it('renders a radio per variant and swatches per part', () => {
    const markup = renderToStaticMarkup(
      createElement(WizardBuilder, { value: DEFAULT_WIZARD_AVATAR, onChange: () => {} }),
    );
    const variants = BODY_IDS.length + OPTIONAL.reduce((n, key) => n + PART_IDS[key].length + 1, 0);
    expect(markup.match(/role="radio"/g)).toHaveLength(variants);
    expect(markup.match(/aria-checked="true"/g)).toHaveLength(6);
    expect(markup).toContain('class="wa-builder"');
  });

  it('hides the preview when previewSize is 0', () => {
    const markup = renderToStaticMarkup(
      createElement(WizardBuilder, { value: DEFAULT_WIZARD_AVATAR, onChange: () => {}, previewSize: 0 }),
    );
    expect(markup).not.toContain('wa-preview');
  });
});
