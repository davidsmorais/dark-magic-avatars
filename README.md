# @davidsmorais/wizard-avatars

Composable SVG wizard avatars for React. Pick a body, hat, eyes, mouth, staff and cape (six variants each, every part except the body can be `none`), give each part a color, and get a crisp 64×64 SVG. Each part's outline shade is derived from its main color.

Extracted from [gitmoire](https://github.com/dark-magic-studios/gitmoire), where every AI agent gets its own wizard.

```bash
npm install @davidsmorais/wizard-avatars
```

React 17+ is a peer dependency. No other runtime dependencies.

## Render an avatar

```tsx
import { WizardAvatar, seededWizardAvatar } from '@davidsmorais/wizard-avatars';

// Same seed, same wizard. Hat and cape wear the accent color.
const avatar = seededWizardAvatar('user-42', '#D97757');

<WizardAvatar avatar={avatar} size={48} />;
```

`WizardAvatar` props: `avatar`, `size` (number or CSS length, default `64`), `title` (accessible name; defaults to a description such as "round wizard with pointy hat, orb staff"), `className`.

## Avatar data

An avatar is plain JSON, safe to store:

```ts
const avatar: WizardAvatar = {
  v: 1,
  body: { id: 'round', color: '#F5D0A9' },
  hat: { id: 'pointy', color: '#8C15F9' },
  eyes: { id: 'round', color: '#1E293B' },
  mouth: { id: 'beard', color: '#E2E8F0' },
  staff: { id: 'orb', color: '#F59E0B' },
  cape: { id: 'none', color: '#4796E3' },
};
```

| Part  | Variants |
| ----- | -------- |
| body  | `round` `tall` `pear` `squat` `ghost` `drop` |
| hat   | `pointy` `floppy` `tall` `wide` `hood` `crown` |
| eyes  | `round` `dots` `sleepy` `wide` `wink` `stern` |
| mouth | `smile` `grin` `o` `flat` `beard` `mustache` |
| staff | `orb` `crystal` `crook` `star` `moon` `branch` |
| cape  | `classic` `tattered` `long` `short` `collar` `starry` |

Colors are `#RRGGBB`.

## Helpers

| Export | What it does |
| ------ | ------------ |
| `sanitizeWizardAvatar(value)` | Coerces untrusted input (e.g. from `localStorage`) into a valid avatar. Bad ids and colors fall back to defaults; anything without `v: 1` returns `undefined`. |
| `seededWizardAvatar(seed, accent?)` | Deterministic avatar for a string seed. |
| `randomWizardAvatar(rng?)` | Random avatar; pass your own `() => number` for reproducibility. |
| `describeWizardAvatar(avatar)` | Short human description, used as the default `aria-label`. |
| `DEFAULT_WIZARD_AVATAR` | The default wizard. |
| `BODY_IDS`, `HAT_IDS`, … `PART_IDS` | Variant lists. |
| `WIZARD_COLOR_CHOICES` | The default 15-color palette. |
| `shadeColor`, `partColors`, `normalizeHexDraft`, `sanitizeHexColor` | Color utilities. |

## Builder UI

`WizardBuilder` is a controlled editor: live preview, Randomize and Reset, a keyboard-navigable radio group of variants per part (arrows, Home, End), color swatches and a hex input.

```tsx
import { useState } from 'react';
import { WizardBuilder, seededWizardAvatar } from '@davidsmorais/wizard-avatars';
import '@davidsmorais/wizard-avatars/builder.css';

function Editor() {
  const [avatar, setAvatar] = useState(() => seededWizardAvatar('me'));
  return <WizardBuilder value={avatar} onChange={setAvatar} seed="me" />;
}
```

Props: `value`, `onChange`, `seed` and `accent` (used by Reset), `colors` (swatch list), `previewSize` (`0` hides the preview), `name`, `className`.

The stylesheet is optional. Without it you get bare markup with `wa-*` class names to style yourself. With it, tweak `--wa-accent`, `--wa-border`, `--wa-surface`, `--wa-surface-hover` and `--wa-radius` on `.wa-builder`.

## Server rendering

Avatars render to static markup with no browser APIs:

```ts
import { renderToStaticMarkup } from 'react-dom/server';
const svg = renderToStaticMarkup(<WizardAvatar avatar={avatar} />);
```

## License

MIT © David Morais
