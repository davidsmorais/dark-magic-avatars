export const BODY_IDS = ['round', 'tall', 'pear', 'squat', 'ghost', 'drop'] as const;
export const HAT_IDS = ['pointy', 'floppy', 'tall', 'wide', 'hood', 'crown'] as const;
export const EYES_IDS = ['round', 'dots', 'sleepy', 'wide', 'wink', 'stern'] as const;
export const MOUTH_IDS = ['smile', 'grin', 'o', 'flat', 'beard', 'mustache'] as const;
export const STAFF_IDS = ['orb', 'crystal', 'crook', 'star', 'moon', 'branch'] as const;
export const CAPE_IDS = ['classic', 'tattered', 'long', 'short', 'collar', 'starry'] as const;

export type BodyId = (typeof BODY_IDS)[number];
export type HatId = (typeof HAT_IDS)[number];
export type EyesId = (typeof EYES_IDS)[number];
export type MouthId = (typeof MOUTH_IDS)[number];
export type StaffId = (typeof STAFF_IDS)[number];
export type CapeId = (typeof CAPE_IDS)[number];

export type Part<Id extends string> = { id: Id | 'none'; color: string };

export interface WizardAvatar {
  v: 1;
  body: { id: BodyId; color: string };
  hat: Part<HatId>;
  eyes: Part<EyesId>;
  mouth: Part<MouthId>;
  staff: Part<StaffId>;
  cape: Part<CapeId>;
}

export type OptionalPartKey = 'hat' | 'eyes' | 'mouth' | 'staff' | 'cape';
export type PartKey = 'body' | OptionalPartKey;

export const PART_IDS: { [K in PartKey]: readonly string[] } = {
  body: BODY_IDS,
  hat: HAT_IDS,
  eyes: EYES_IDS,
  mouth: MOUTH_IDS,
  staff: STAFF_IDS,
  cape: CAPE_IDS,
};

export const DRAW_ORDER: readonly PartKey[] = ['cape', 'staff', 'body', 'eyes', 'mouth', 'hat'];

export const EDIT_ORDER: readonly PartKey[] = ['body', 'hat', 'eyes', 'mouth', 'staff', 'cape'];

export const PART_LABELS: Record<PartKey, string> = {
  body: 'Body',
  hat: 'Hat',
  eyes: 'Eyes',
  mouth: 'Mouth',
  staff: 'Staff',
  cape: 'Cape',
};

export interface PartColors {
  main: string;
  dark: string;
}

export interface BodyAnchor {
  cx: number;
  top: number;
  bottom: number;
  left: number;
  right: number;
  eyeY: number;
  eyeGap: number;
  mouthY: number;
  shoulderY: number;
}
