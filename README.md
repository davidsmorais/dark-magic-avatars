<p align="center">
  <img src="https://raw.githubusercontent.com/davidsmorais/dark-magic-avatars/main/assets/banner.svg" alt="dark-magic-avatars: a row of eight wizard avatars under a night sky" width="100%">
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@dsmorais/dark-magic-avatars"><img src="https://img.shields.io/npm/v/@dsmorais/dark-magic-avatars?color=8C15F9" alt="npm version"></a>
  <a href="https://bundlephobia.com/package/@dsmorais/dark-magic-avatars"><img src="https://img.shields.io/bundlephobia/minzip/@dsmorais/dark-magic-avatars?color=8C15F9" alt="bundle size"></a>
  <a href="https://github.com/davidsmorais/dark-magic-avatars/actions/workflows/ci.yml"><img src="https://github.com/davidsmorais/dark-magic-avatars/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <img src="https://img.shields.io/npm/l/@dsmorais/dark-magic-avatars?color=8C15F9" alt="MIT license">
</p>

Give every user, bot or AI agent their own little wizard. Six bodies, six hats, six pairs of eyes, six mouths, six staffs and six capes. Every part except the body can be switched off, and each one takes its own color. That's over 100,000 shape combinations before colors come in. The output is a crisp 64×64 SVG, React is the only dependency, and it renders on the server.

Extracted from [gitmoire](https://github.com/dark-magic-studios/gitmoire), where each AI coding agent gets a wizard.

```bash
npm install @dsmorais/dark-magic-avatars
```

## A wizard per seed

Hand it any string (a user id, an email, an agent name) and you get the same wizard every time. The second argument is the accent color for the hat and cape.

```tsx
import { WizardAvatar, seededWizardAvatar } from '@dsmorais/dark-magic-avatars';

<WizardAvatar avatar={seededWizardAvatar('merlin', '#8C15F9')} size={96} />
```

<p align="center">
  <img src="https://raw.githubusercontent.com/davidsmorais/dark-magic-avatars/main/assets/seeds.svg" alt="Eight seeded wizards labelled merlin, morgana, gandalf, rincewind, radagast, saruman, prospero and zatanna">
</p>

Same seed, different accent. Brand your wizards and keep their faces:

<p align="center">
  <img src="https://raw.githubusercontent.com/davidsmorais/dark-magic-avatars/main/assets/accents.svg" alt="The merlin wizard repeated in eight accent colors">
</p>

## The wardrobe

Each part has six variants. Everything but the body also has `none`.

**Body:** `body.id`

<img src="https://raw.githubusercontent.com/davidsmorais/dark-magic-avatars/main/assets/part-body.svg" alt="Body variants: round, tall, pear, squat, ghost, drop">

**Hat:** `hat.id`

<img src="https://raw.githubusercontent.com/davidsmorais/dark-magic-avatars/main/assets/part-hat.svg" alt="Hat variants: none, pointy, floppy, tall, wide, hood, crown">

**Eyes:** `eyes.id`

<img src="https://raw.githubusercontent.com/davidsmorais/dark-magic-avatars/main/assets/part-eyes.svg" alt="Eye variants: none, round, dots, sleepy, wide, wink, stern">

**Mouth:** `mouth.id`

<img src="https://raw.githubusercontent.com/davidsmorais/dark-magic-avatars/main/assets/part-mouth.svg" alt="Mouth variants: none, smile, grin, o, flat, beard, mustache">

**Staff:** `staff.id`

<img src="https://raw.githubusercontent.com/davidsmorais/dark-magic-avatars/main/assets/part-staff.svg" alt="Staff variants: none, orb, crystal, crook, star, moon, branch">

**Cape:** `cape.id`

<img src="https://raw.githubusercontent.com/davidsmorais/dark-magic-avatars/main/assets/part-cape.svg" alt="Cape variants: none, classic, tattered, long, short, collar, starry">

## Dress one by hand

An avatar is plain JSON, so you can store it in a database, in `localStorage` or in a URL. Colors are `#RRGGBB`. The outline shade of each part is derived from its main color.

```tsx
import { WizardAvatar } from '@dsmorais/dark-magic-avatars';

const wizard: WizardAvatar = {
  v: 1,
  body: { id: 'ghost', color: '#E2E8F0' },
  hat: { id: 'crown', color: '#F59E0B' },
  eyes: { id: 'wink', color: '#1E293B' },
  mouth: { id: 'mustache', color: '#64748B' },
  staff: { id: 'moon', color: '#06B6D4' },
  cape: { id: 'starry', color: '#4796E3' },
};

<WizardAvatar avatar={wizard} size={48} title="Your wizard" />
```

`WizardAvatar` props:

| Prop        | Type               | Default | |
| ----------- | ------------------ | ------- | - |
| `avatar`    | `WizardAvatar`     | —       | The wizard to draw. |
| `size`      | `number \| string` | `64`    | Width and height; any CSS length works. |
| `title`     | `string`           | auto    | Accessible name. Defaults to a description like "round wizard with pointy hat, orb staff". |
| `className` | `string`           | —       | Passed to the root `<svg>`. |

## Let users build their own

`WizardBuilder` is a controlled editor with a live preview, Randomize and Reset buttons, a keyboard-navigable radio group per part (arrow keys, Home, End), color swatches and a hex input.

```tsx
import { useState } from 'react';
import { WizardBuilder, seededWizardAvatar } from '@dsmorais/dark-magic-avatars';
import '@dsmorais/dark-magic-avatars/builder.css';

function WizardEditor({ userId }: { userId: string }) {
  const [wizard, setWizard] = useState(() => seededWizardAvatar(userId));
  return <WizardBuilder value={wizard} onChange={setWizard} seed={userId} />;
}
```

| Prop          | Default                | |
| ------------- | ---------------------- | - |
| `value`       | —                      | Current avatar. |
| `onChange`    | —                      | Called with the next avatar. |
| `seed`        | `'wizard'`             | What Reset goes back to. |
| `accent`      | `#8C15F9`              | Hat and cape color used by Reset. |
| `colors`      | `WIZARD_COLOR_CHOICES` | Swatches offered for every part. |
| `previewSize` | `112`                  | Size of the large preview. `0` hides it. |
| `name`        | `'Wizard'`             | Used in the preview's accessible name. |
| `className`   | —                      | Added to the root element. |

The stylesheet is optional. Without it you get bare markup with `wa-*` class names to style however you like. With it, theme the builder through CSS variables on `.wa-builder`: `--wa-accent`, `--wa-border`, `--wa-surface`, `--wa-surface-hover` and `--wa-radius`.

## Store safely

Saved avatars come back from places you don't control. `sanitizeWizardAvatar` turns untrusted input into a valid wizard. Unknown part ids and bad colors fall back to defaults, and anything without `v: 1` returns `undefined`, so you can fall back to something else.

```ts
import { sanitizeWizardAvatar, seededWizardAvatar } from '@dsmorais/dark-magic-avatars';

const wizard =
  sanitizeWizardAvatar(JSON.parse(localStorage.getItem('wizard') ?? 'null')) ?? seededWizardAvatar(user.id);
```

## Render on the server

Rendering touches no browser APIs, so it works in RSC, SSR, edge functions and build scripts. This README's images come from [`scripts/render-assets.mjs`](scripts/render-assets.mjs):

```tsx
import { renderToStaticMarkup } from 'react-dom/server';

const svg = renderToStaticMarkup(<WizardAvatar avatar={wizard} size={128} />);
```

## API

| Export | |
| ------ | - |
| `WizardAvatar` | Component, and the avatar type of the same name. |
| `WizardBuilder` | Editor component. |
| `seededWizardAvatar(seed, accent?)` | Deterministic wizard for a string. |
| `randomWizardAvatar(rng?)` | Random wizard. Pass your own `() => number` for reproducible results. |
| `sanitizeWizardAvatar(value)` | Untrusted input → `WizardAvatar \| undefined`. |
| `describeWizardAvatar(avatar)` | Short description, used as the default `aria-label`. |
| `DEFAULT_WIZARD_AVATAR` | The default wizard. |
| `BODY_IDS` `HAT_IDS` `EYES_IDS` `MOUTH_IDS` `STAFF_IDS` `CAPE_IDS` `PART_IDS` | Variant lists. |
| `WIZARD_COLOR_CHOICES` `WIZARD_ACCENT_CHOICES` `WIZARD_TONE_CHOICES` | Built-in palettes. |
| `shadeColor` `partColors` `normalizeHexDraft` `sanitizeHexColor` | Color helpers. |
| `PARTS` `BODY_ANCHORS` | Raw part renderers, for drawing your own compositions. |

ESM only. Requires React 17 or newer.

## License

MIT © David Morais
