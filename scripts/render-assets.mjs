// Regenerates the README art in assets/ from the built package: `npm run build && npm run assets`.
import { mkdirSync, writeFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { EDIT_ORDER, PART_IDS, PART_LABELS, WizardAvatar, seededWizardAvatar } from '../dist/index.js';

const OUT = new URL('../assets/', import.meta.url);
mkdirSync(OUT, { recursive: true });

const FONT = "font-family=\"ui-sans-serif, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif\"";
const MONO = "font-family=\"ui-monospace, SFMono-Regular, Menlo, Consolas, monospace\"";

/** Renders an avatar and re-anchors its root <svg> at (x, y) so it nests inside a larger SVG. */
function nested(avatar, x, y, size) {
  const markup = renderToStaticMarkup(createElement(WizardAvatar, { avatar, size }));
  return markup.replace('<svg ', `<svg x="${x}" y="${y}" `);
}

function write(name, svg) {
  writeFileSync(new URL(name, OUT), svg);
  console.log(`assets/${name}`);
}

const CAST = [
  ['merlin', '#8C15F9'],
  ['morgana', '#EC4899'],
  ['gandalf', '#64748B'],
  ['rincewind', '#EF4444'],
  ['radagast', '#84CC16'],
  ['saruman', '#06B6D4'],
  ['prospero', '#F59E0B'],
  ['zatanna', '#4796E3'],
].map(([seed, accent]) => ({ seed, accent, avatar: seededWizardAvatar(seed, accent) }));

// Banner -------------------------------------------------------------------
{
  const W = 1280;
  const H = 400;
  const size = 116;
  const stars = Array.from({ length: 70 }, (_, i) => {
    const x = (i * 197.3) % W;
    const y = (i * 89.7) % (H - 40);
    const r = ((i * 7) % 3) * 0.5 + 0.6;
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="#fff" opacity="${(0.15 + ((i * 13) % 10) / 25).toFixed(2)}"/>`;
  }).join('');
  const lineup = CAST.map(({ avatar }, i) => {
    const x = 70 + i * 145;
    const y = 238 + (i % 2 === 0 ? 0 : -18);
    return `<ellipse cx="${x + size / 2}" cy="${y + size - 6}" rx="40" ry="7" fill="#000" opacity="0.35"/>${nested(avatar, x, y, size)}`;
  }).join('');
  write(
    'banner.svg',
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
<defs>
  <linearGradient id="sky" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#1A0B2E"/><stop offset="0.55" stop-color="#2D1155"/><stop offset="1" stop-color="#0F172A"/>
  </linearGradient>
  <radialGradient id="glow" cx="0.5" cy="0.9" r="0.6">
    <stop offset="0" stop-color="#8C15F9" stop-opacity="0.45"/><stop offset="1" stop-color="#8C15F9" stop-opacity="0"/>
  </radialGradient>
</defs>
<rect width="${W}" height="${H}" rx="24" fill="url(#sky)"/>
<rect width="${W}" height="${H}" rx="24" fill="url(#glow)"/>
${stars}
<path d="M1150 52a34 34 0 1 0 34 46a27 27 0 1 1 -34 -46z" fill="#FDE68A" opacity="0.9"/>
<text x="70" y="112" ${FONT} font-size="64" font-weight="800" fill="#F5F3FF" letter-spacing="-1.5">dark-magic-avatars</text>
<text x="72" y="160" ${FONT} font-size="26" fill="#C4B5FD">Composable SVG wizard avatars for React.</text>
<text x="72" y="200" ${MONO} font-size="20" fill="#A78BFA">npm i @dsmorais/dark-magic-avatars</text>
${lineup}
</svg>
`,
  );
}

// Seeded lineup --------------------------------------------------------------
{
  const size = 96;
  const gap = 24;
  const W = CAST.length * (size + gap) - gap;
  const cells = CAST.map(({ seed, avatar }, i) => {
    const x = i * (size + gap);
    return `${nested(avatar, x, 0, size)}<text x="${x + size / 2}" y="${size + 22}" text-anchor="middle" ${MONO} font-size="13" fill="#8B8B9E">'${seed}'</text>`;
  }).join('');
  write(
    'seeds.svg',
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${size + 32}" width="${W}" height="${size + 32}">${cells}</svg>\n`,
  );
}

// One strip per part --------------------------------------------------------
const BASE = seededWizardAvatar('merlin', '#8C15F9');
for (const part of EDIT_ORDER) {
  const ids = part === 'body' ? [...PART_IDS.body] : ['none', ...PART_IDS[part]];
  const size = 72;
  const gap = 20;
  const W = ids.length * (size + gap) - gap;
  const cells = ids
    .map((id, i) => {
      const avatar = { ...BASE, [part]: { ...BASE[part], id } };
      const x = i * (size + gap);
      return `${nested(avatar, x, 0, size)}<text x="${x + size / 2}" y="${size + 20}" text-anchor="middle" ${MONO} font-size="12" fill="#8B8B9E">${id}</text>`;
    })
    .join('');
  write(
    `part-${part}.svg`,
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${size + 28}" width="${W}" height="${size + 28}" aria-label="${PART_LABELS[part]} variants">${cells}</svg>\n`,
  );
}

// Same wizard, every accent -----------------------------------------------------
{
  const accents = ['#D97757', '#10A37F', '#4796E3', '#8C15F9', '#EC4899', '#EF4444', '#F59E0B', '#06B6D4'];
  const size = 72;
  const gap = 16;
  const W = accents.length * (size + gap) - gap;
  const cells = accents.map((accent, i) => nested(seededWizardAvatar('merlin', accent), i * (size + gap), 0, size)).join('');
  write('accents.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${size}" width="${W}" height="${size}">${cells}</svg>\n`);
}
