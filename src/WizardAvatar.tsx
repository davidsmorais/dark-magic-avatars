import { memo } from 'react';
import { BODY_ANCHORS, PARTS } from './parts.js';
import { partColors } from './palette.js';
import { describeWizardAvatar } from './avatar.js';
import { DRAW_ORDER, type WizardAvatar as WizardAvatarData } from './types.js';

export interface WizardAvatarProps {
  avatar: WizardAvatarData;
  size?: number | string;
  title?: string;
  className?: string;
}

function WizardAvatarImpl({ avatar, size = 64, title, className }: WizardAvatarProps) {
  const anchor = BODY_ANCHORS[avatar.body.id] ?? BODY_ANCHORS.round;
  const label = title ?? describeWizardAvatar(avatar);
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      role="img"
      aria-label={label}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {title && <title>{title}</title>}
      {DRAW_ORDER.map((key) => {
        const part = avatar[key];
        if (!part || part.id === 'none') return null;
        const render = PARTS[key][part.id];
        if (!render) return null;
        return <g key={key}>{render(partColors(part.color), anchor)}</g>;
      })}
    </svg>
  );
}

/** The avatar data shape; same name as the component so one import covers both. */
export type WizardAvatar = WizardAvatarData;

export const WizardAvatar = memo(WizardAvatarImpl);
