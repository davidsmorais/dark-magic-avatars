import type { ReactElement } from 'react';
import type {
  BodyAnchor,
  BodyId,
  CapeId,
  EyesId,
  HatId,
  MouthId,
  PartColors,
  PartKey,
  StaffId,
} from './types.js';

export type PartRenderer = (c: PartColors, a: BodyAnchor) => ReactElement;

const VIEW_MIN = 2;
const VIEW_MAX = 62;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const outline = (dark: string, width = 1.5) => ({
  stroke: dark,
  strokeWidth: width,
  strokeLinejoin: 'round' as const,
  strokeLinecap: 'round' as const,
});

const line = (color: string, width: number) => ({
  fill: 'none',
  stroke: color,
  strokeWidth: width,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

export function starPath(cx: number, cy: number, r: number): string {
  const points: string[] = [];
  for (let i = 0; i < 10; i += 1) {
    const radius = i % 2 === 0 ? r : r * 0.45;
    const angle = -Math.PI / 2 + (i * Math.PI) / 5;
    points.push(`${(cx + radius * Math.cos(angle)).toFixed(2)} ${(cy + radius * Math.sin(angle)).toFixed(2)}`);
  }
  return `M ${points.join(' L ')} Z`;
}

export const BODY_ANCHORS: Record<BodyId, BodyAnchor> = {
  round: { cx: 32, top: 29, bottom: 57, left: 16, right: 48, eyeY: 40, eyeGap: 6, mouthY: 48, shoulderY: 34 },
  tall: { cx: 32, top: 24, bottom: 57, left: 21, right: 43, eyeY: 34, eyeGap: 5, mouthY: 42, shoulderY: 30 },
  pear: { cx: 32, top: 27, bottom: 56, left: 16, right: 48, eyeY: 35, eyeGap: 5, mouthY: 42, shoulderY: 37 },
  squat: { cx: 32, top: 37, bottom: 57, left: 13, right: 51, eyeY: 45, eyeGap: 7, mouthY: 51, shoulderY: 41 },
  ghost: { cx: 32, top: 25, bottom: 56, left: 18, right: 46, eyeY: 37, eyeGap: 6, mouthY: 45, shoulderY: 32 },
  drop: { cx: 32, top: 31, bottom: 57, left: 18, right: 46, eyeY: 45, eyeGap: 6, mouthY: 51, shoulderY: 39 },
};

export const BODY_PARTS: Record<BodyId, PartRenderer> = {
  round: ({ main, dark }) => <ellipse cx={32} cy={43} rx={16} ry={14} fill={main} {...outline(dark, 2)} />,
  tall: ({ main, dark }) => <rect x={21} y={24} width={22} height={33} rx={11} fill={main} {...outline(dark, 2)} />,
  pear: ({ main, dark }) => (
    <path
      d="M32 27 C26 27 23 32 23 37 C17 41 15 48 16 52 C17 57 47 57 48 52 C49 48 47 41 41 37 C41 32 38 27 32 27 Z"
      fill={main}
      {...outline(dark, 2)}
    />
  ),
  squat: ({ main, dark }) => <ellipse cx={32} cy={47} rx={19} ry={10} fill={main} {...outline(dark, 2)} />,
  ghost: ({ main, dark }) => (
    <path
      d="M18 40 C18 30 24 25 32 25 C40 25 46 30 46 40 L46 56 L42 52 L38 56 L34 52 L30 56 L26 52 L22 56 L18 52 Z"
      fill={main}
      {...outline(dark, 2)}
    />
  ),
  drop: ({ main, dark }) => (
    <path
      d="M32 25 C37 33 46 38 46 46 C46 53 40 57 32 57 C24 57 18 53 18 46 C18 38 27 33 32 25 Z"
      fill={main}
      {...outline(dark, 2)}
    />
  ),
};

function hatFrame(a: BodyAnchor) {
  const brimY = a.top + 3;
  const brimHalf = clamp((a.right - a.left) / 2 + 1, 11, 16);
  return { cx: a.cx, brimY, brimHalf, coneHalf: brimHalf - 4 };
}

function brim(c: PartColors, cx: number, y: number, half: number) {
  return <ellipse cx={cx} cy={y} rx={half} ry={2.6} fill={c.main} {...outline(c.dark)} />;
}

export const HAT_PARTS: Record<HatId, PartRenderer> = {
  pointy: (c, a) => {
    const { cx, brimY, brimHalf, coneHalf } = hatFrame(a);
    const tipY = Math.max(VIEW_MIN, brimY - 22);
    return (
      <g>
        <path d={`M${cx - coneHalf} ${brimY} L${cx + 2} ${tipY} L${cx + coneHalf} ${brimY} Z`} fill={c.main} {...outline(c.dark)} />
        <path d={starPath(cx, brimY - 7, 2.6)} fill={c.dark} />
        {brim(c, cx, brimY, brimHalf)}
      </g>
    );
  },
  floppy: (c, a) => {
    const { cx, brimY, brimHalf, coneHalf } = hatFrame(a);
    const tipY = Math.max(VIEW_MIN + 4, brimY - 19);
    return (
      <g>
        <path
          d={`M${cx - coneHalf} ${brimY} Q${cx - 3} ${brimY - 14} ${cx + 4} ${tipY} L${cx + 12} ${tipY + 6} Q${cx + 5} ${tipY + 6} ${cx + coneHalf} ${brimY} Z`}
          fill={c.main}
          {...outline(c.dark)}
        />
        <circle cx={cx + 12} cy={tipY + 6} r={1.8} fill={c.dark} />
        {brim(c, cx, brimY, brimHalf)}
      </g>
    );
  },
  tall: (c, a) => {
    const { cx, brimY, brimHalf, coneHalf } = hatFrame(a);
    const tipY = Math.max(VIEW_MIN, brimY - 28);
    return (
      <g>
        <path d={`M${cx - coneHalf + 2} ${brimY} L${cx} ${tipY} L${cx + coneHalf - 2} ${brimY} Z`} fill={c.main} {...outline(c.dark)} />
        <path d={`M${cx - coneHalf + 3} ${brimY - 4} L${cx + coneHalf - 3} ${brimY - 4}`} {...line(c.dark, 2)} />
        {brim(c, cx, brimY, brimHalf - 1)}
      </g>
    );
  },
  wide: (c, a) => {
    const { cx, brimY, brimHalf, coneHalf } = hatFrame(a);
    const tipY = Math.max(VIEW_MIN, brimY - 16);
    return (
      <g>
        <path d={`M${cx - coneHalf} ${brimY} L${cx + 1} ${tipY} L${cx + coneHalf} ${brimY} Z`} fill={c.main} {...outline(c.dark)} />
        {brim(c, cx, brimY, Math.min(brimHalf + 4, 20))}
        <path d={`M${cx - coneHalf + 1} ${brimY - 2} L${cx + coneHalf - 1} ${brimY - 2}`} {...line(c.dark, 1.8)} />
      </g>
    );
  },
  hood: (c, a) => {
    const { cx, brimY, brimHalf } = hatFrame(a);
    const half = brimHalf - 1;
    const peakY = Math.max(VIEW_MIN, brimY - 15);
    return (
      <path
        d={`M${cx - half} ${brimY + 5} C${cx - half} ${brimY - 8} ${cx - 4} ${peakY} ${cx + 3} ${peakY} C${cx + 4} ${brimY - 8} ${cx + half} ${brimY - 6} ${cx + half} ${brimY + 5} Q${cx} ${brimY - 3} ${cx - half} ${brimY + 5} Z`}
        fill={c.main}
        {...outline(c.dark)}
      />
    );
  },
  crown: (c, a) => {
    const { cx, brimY } = hatFrame(a);
    const base = brimY + 1;
    const top = base - 10;
    return (
      <g>
        <path
          d={`M${cx - 10} ${base} L${cx - 10} ${top + 2} L${cx - 5} ${top + 6} L${cx} ${top} L${cx + 5} ${top + 6} L${cx + 10} ${top + 2} L${cx + 10} ${base} Z`}
          fill={c.main}
          {...outline(c.dark)}
        />
        <circle cx={cx} cy={base - 3} r={1.6} fill={c.dark} />
      </g>
    );
  },
};

function eyePositions(a: BodyAnchor) {
  return [a.cx - a.eyeGap, a.cx + a.eyeGap] as const;
}

const roundEye = (c: PartColors, x: number, y: number, key: string) => (
  <g key={key}>
    <circle cx={x} cy={y} r={3.2} fill={c.main} />
    <circle cx={x + 0.6} cy={y + 0.4} r={1.5} fill={c.dark} />
  </g>
);

const closedEye = (c: PartColors, x: number, y: number, lift: number, key: string) => (
  <path key={key} d={`M${x - 3} ${y} Q${x} ${y + lift} ${x + 3} ${y}`} {...line(c.main, 1.8)} />
);

export const EYES_PARTS: Record<EyesId, PartRenderer> = {
  round: (c, a) => {
    const [l, r] = eyePositions(a);
    return <g>{[roundEye(c, l, a.eyeY, 'l'), roundEye(c, r, a.eyeY, 'r')]}</g>;
  },
  dots: (c, a) => {
    const [l, r] = eyePositions(a);
    return (
      <g fill={c.main}>
        <circle cx={l} cy={a.eyeY} r={2.2} />
        <circle cx={r} cy={a.eyeY} r={2.2} />
      </g>
    );
  },
  sleepy: (c, a) => {
    const [l, r] = eyePositions(a);
    return <g>{[closedEye(c, l, a.eyeY, 2.6, 'l'), closedEye(c, r, a.eyeY, 2.6, 'r')]}</g>;
  },
  wide: (c, a) => {
    const [l, r] = eyePositions(a);
    return (
      <g>
        {[l, r].map((x) => (
          <g key={x}>
            <ellipse cx={x} cy={a.eyeY} rx={3} ry={4} fill={c.main} {...outline(c.dark, 1.2)} />
            <circle cx={x} cy={a.eyeY + 0.8} r={1.6} fill={c.dark} />
          </g>
        ))}
      </g>
    );
  },
  wink: (c, a) => {
    const [l, r] = eyePositions(a);
    return <g>{[roundEye(c, l, a.eyeY, 'l'), closedEye(c, r, a.eyeY, -2.6, 'r')]}</g>;
  },
  stern: (c, a) => {
    const [l, r] = eyePositions(a);
    return (
      <g>
        <circle cx={l} cy={a.eyeY} r={2.6} fill={c.main} />
        <circle cx={r} cy={a.eyeY} r={2.6} fill={c.main} />
        <path d={`M${l - 3.5} ${a.eyeY - 5} L${l + 3} ${a.eyeY - 3.5}`} {...line(c.dark, 1.8)} />
        <path d={`M${r + 3.5} ${a.eyeY - 5} L${r - 3} ${a.eyeY - 3.5}`} {...line(c.dark, 1.8)} />
      </g>
    );
  },
};

export const MOUTH_PARTS: Record<MouthId, PartRenderer> = {
  smile: (c, { cx, mouthY: y }) => <path d={`M${cx - 4} ${y} Q${cx} ${y + 4} ${cx + 4} ${y}`} {...line(c.main, 2)} />,
  grin: (c, { cx, mouthY: y }) => (
    <path d={`M${cx - 5} ${y - 1} Q${cx} ${y + 6} ${cx + 5} ${y - 1} Z`} fill={c.main} {...outline(c.dark, 1.2)} />
  ),
  o: (c, { cx, mouthY: y }) => <ellipse cx={cx} cy={y} rx={2.2} ry={2.6} fill={c.main} {...outline(c.dark, 1.2)} />,
  flat: (c, { cx, mouthY: y }) => <path d={`M${cx - 3.5} ${y} L${cx + 3.5} ${y}`} {...line(c.main, 2)} />,
  beard: (c, { cx, mouthY: y }) => {
    const bottom = Math.min(y + 12, VIEW_MAX);
    return (
      <g>
        <path
          d={`M${cx - 9} ${y - 3} Q${cx - 8} ${bottom - 2} ${cx} ${bottom} Q${cx + 8} ${bottom - 2} ${cx + 9} ${y - 3} Q${cx} ${y + 1} ${cx - 9} ${y - 3} Z`}
          fill={c.main}
          {...outline(c.dark, 1.2)}
        />
        <path d={`M${cx - 3} ${y - 2.5} Q${cx} ${y - 0.5} ${cx + 3} ${y - 2.5}`} {...line(c.dark, 1.4)} />
      </g>
    );
  },
  mustache: (c, { cx, mouthY: y }) => (
    <path
      d={`M${cx} ${y - 1} Q${cx - 4} ${y - 4} ${cx - 8} ${y} Q${cx - 4} ${y + 1} ${cx} ${y + 1} Q${cx + 4} ${y + 1} ${cx + 8} ${y} Q${cx + 4} ${y - 4} ${cx} ${y - 1} Z`}
      fill={c.main}
      {...outline(c.dark, 1)}
    />
  ),
};

function staffFrame(a: BodyAnchor) {
  const top = { x: clamp(a.right + 6, VIEW_MIN + 6, VIEW_MAX - 5), y: clamp(a.shoulderY - 12, VIEW_MIN + 7, VIEW_MAX) };
  const base = { x: a.right - 4, y: Math.min(VIEW_MAX - 1, a.bottom + 4) };
  return { top, base };
}

function shaft(c: PartColors, a: BodyAnchor, extendTo?: { x: number; y: number }) {
  const { top, base } = staffFrame(a);
  const end = extendTo ?? top;
  return <path d={`M${base.x} ${base.y} L${end.x} ${end.y}`} {...line(c.dark, 2.4)} />;
}

export const STAFF_PARTS: Record<StaffId, PartRenderer> = {
  orb: (c, a) => {
    const { top } = staffFrame(a);
    return (
      <g>
        {shaft(c, a)}
        <circle cx={top.x} cy={top.y} r={4} fill={c.main} {...outline(c.dark)} />
      </g>
    );
  },
  crystal: (c, a) => {
    const { top: t } = staffFrame(a);
    return (
      <g>
        {shaft(c, a)}
        <path d={`M${t.x} ${t.y - 6} L${t.x + 3.5} ${t.y} L${t.x} ${t.y + 5} L${t.x - 3.5} ${t.y} Z`} fill={c.main} {...outline(c.dark)} />
      </g>
    );
  },
  crook: (c, a) => {
    const { top: t } = staffFrame(a);
    return (
      <g>
        {shaft(c, a)}
        <path d={`M${t.x} ${t.y + 4} C${t.x} ${t.y - 6} ${t.x - 8} ${t.y - 6} ${t.x - 7} ${t.y}`} {...line(c.main, 2.6)} />
      </g>
    );
  },
  star: (c, a) => {
    const { top: t } = staffFrame(a);
    return (
      <g>
        {shaft(c, a)}
        <path d={starPath(t.x, t.y, 5)} fill={c.main} {...outline(c.dark, 1.2)} />
      </g>
    );
  },
  moon: (c, a) => {
    const { top: t } = staffFrame(a);
    const x = t.x + 1;
    return (
      <g>
        {shaft(c, a)}
        <path
          d={`M${x} ${t.y - 4.5} A4.5 4.5 0 0 0 ${x} ${t.y + 4.5} A5.5 5.5 0 0 1 ${x} ${t.y - 4.5} Z`}
          fill={c.main}
          {...outline(c.dark, 1.2)}
        />
      </g>
    );
  },
  branch: (c, a) => {
    const { top: t } = staffFrame(a);
    return (
      <g>
        {shaft(c, a, { x: t.x, y: t.y + 3 })}
        <path d={`M${t.x} ${t.y + 3} L${t.x - 3} ${t.y - 4}`} {...line(c.dark, 2.2)} />
        <path d={`M${t.x} ${t.y + 3} L${t.x + 3} ${t.y - 5}`} {...line(c.dark, 2.2)} />
        <ellipse cx={t.x - 3} cy={t.y - 5} rx={1.8} ry={2.6} fill={c.main} />
        <ellipse cx={t.x + 3} cy={t.y - 6} rx={1.8} ry={2.6} fill={c.main} />
      </g>
    );
  },
};

function capeFrame(a: BodyAnchor, flare = 7, bottom = Math.min(VIEW_MAX, a.bottom + 2)) {
  return {
    sy: a.shoulderY,
    sx0: a.left + 3,
    sx1: a.right - 3,
    by: bottom,
    bl: Math.max(VIEW_MIN, a.left - flare),
    br: Math.min(VIEW_MAX, a.right + flare),
  };
}

function capeShape(c: PartColors, f: ReturnType<typeof capeFrame>) {
  return (
    <g>
      <path d={`M${f.sx0} ${f.sy} L${f.bl} ${f.by} L${f.br} ${f.by} L${f.sx1} ${f.sy} Z`} fill={c.main} {...outline(c.dark)} />
      <path d={`M${f.bl + 1} ${f.by - 1} L${f.br - 1} ${f.by - 1}`} {...line(c.dark, 2)} />
    </g>
  );
}

export const CAPE_PARTS: Record<CapeId, PartRenderer> = {
  classic: (c, a) => capeShape(c, capeFrame(a)),
  tattered: (c, a) => {
    const f = capeFrame(a);
    const teeth = 6;
    const step = (f.br - f.bl) / teeth;
    const hem: string[] = [];
    for (let i = teeth; i >= 0; i -= 1) {
      const x = f.bl + step * i;
      hem.push(`L${x.toFixed(2)} ${i % 2 === 0 ? f.by : f.by - 4}`);
    }
    return (
      <path
        d={`M${f.sx1} ${f.sy} L${f.br} ${f.by} ${hem.join(' ')} L${f.sx0} ${f.sy} Z`}
        fill={c.main}
        {...outline(c.dark)}
      />
    );
  },
  long: (c, a) => capeShape(c, capeFrame(a, 9, VIEW_MAX)),
  short: (c, a) => capeShape(c, capeFrame(a, 4, Math.round(a.shoulderY + (a.bottom - a.shoulderY) * 0.6))),
  collar: (c, a) => {
    const f = capeFrame(a);
    return (
      <g>
        {capeShape(c, f)}
        <path d={`M${f.sx0 + 5} ${f.sy} L${f.sx0 - 3} ${f.sy - 7} L${f.sx0} ${f.sy + 3} Z`} fill={c.main} {...outline(c.dark)} />
        <path d={`M${f.sx1 - 5} ${f.sy} L${f.sx1 + 3} ${f.sy - 7} L${f.sx1} ${f.sy + 3} Z`} fill={c.main} {...outline(c.dark)} />
      </g>
    );
  },
  starry: (c, a) => {
    const f = capeFrame(a);
    return (
      <g>
        {capeShape(c, f)}
        <path d={starPath(f.bl + 4, f.by - 5, 2.2)} fill={c.dark} />
        <path d={starPath(f.br - 4, f.by - 6, 2.2)} fill={c.dark} />
      </g>
    );
  },
};

export const PARTS: { [K in PartKey]: Record<string, PartRenderer> } = {
  body: BODY_PARTS,
  hat: HAT_PARTS,
  eyes: EYES_PARTS,
  mouth: MOUTH_PARTS,
  staff: STAFF_PARTS,
  cape: CAPE_PARTS,
};
