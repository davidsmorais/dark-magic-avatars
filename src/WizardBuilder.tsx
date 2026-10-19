import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { WIZARD_COLOR_CHOICES, WIZARD_FALLBACK_COLOR, normalizeHexDraft } from './palette.js';
import { randomWizardAvatar, seededWizardAvatar } from './avatar.js';
import { WizardAvatar } from './WizardAvatar.js';
import { EDIT_ORDER, PART_IDS, PART_LABELS, type PartKey, type WizardAvatar as WizardAvatarData } from './types.js';

export interface WizardBuilderProps {
  value: WizardAvatarData;
  onChange: (next: WizardAvatarData) => void;
  /** Seed for the Reset button (defaults to `'wizard'`). */
  seed?: string;
  /** Accent color used by Reset for hat and cape. */
  accent?: string;
  /** Swatches offered for every part. */
  colors?: readonly string[];
  /** Size in px of the large preview; 0 hides it. */
  previewSize?: number;
  /** Accessible name for the preview. */
  name?: string;
  className?: string;
}

/**
 * Unstyled-by-default avatar editor. Import `@davidsmorais/wizard-avatars/builder.css`
 * for the default look, or target the `wa-*` class names yourself.
 */
export function WizardBuilder({
  value,
  onChange,
  seed = 'wizard',
  accent,
  colors = WIZARD_COLOR_CHOICES,
  previewSize = 112,
  name = 'Wizard',
  className,
}: WizardBuilderProps) {
  return (
    <div className={className ? `wa-builder ${className}` : 'wa-builder'}>
      <div className="wa-header">
        {previewSize > 0 && (
          <div className="wa-preview">
            <WizardAvatar avatar={value} size={previewSize} title={`${name} preview`} />
          </div>
        )}
        <div className="wa-actions">
          <button type="button" className="wa-button" onClick={() => onChange(randomWizardAvatar())}>
            Randomize
          </button>
          <button
            type="button"
            className="wa-button wa-button-ghost"
            onClick={() => onChange(seededWizardAvatar(seed, accent))}
          >
            Reset
          </button>
        </div>
      </div>
      {EDIT_ORDER.map((key) => (
        <PartRow key={key} part={key} avatar={value} colors={colors} onChange={onChange} />
      ))}
    </div>
  );
}

function withPart(avatar: WizardAvatarData, key: PartKey, patch: { id?: string; color?: string }): WizardAvatarData {
  return { ...avatar, [key]: { ...avatar[key], ...patch } } as WizardAvatarData;
}

function PartRow({
  part,
  avatar,
  colors,
  onChange,
}: {
  part: PartKey;
  avatar: WizardAvatarData;
  colors: readonly string[];
  onChange: (next: WizardAvatarData) => void;
}) {
  const labelId = useId();
  const options = part === 'body' ? [...PART_IDS.body] : ['none', ...PART_IDS[part]];
  const current = avatar[part];
  return (
    <div className="wa-part" data-part={part}>
      <span id={labelId} className="wa-part-label">
        {PART_LABELS[part]}
      </span>
      <VariantPicker
        labelId={labelId}
        part={part}
        options={options}
        selected={current.id}
        avatar={avatar}
        onSelect={(id) => onChange(withPart(avatar, part, { id }))}
      />
      <ColorPicker
        label={PART_LABELS[part]}
        color={current.color}
        colors={colors}
        disabled={current.id === 'none'}
        onChange={(color) => onChange(withPart(avatar, part, { color }))}
      />
    </div>
  );
}

function VariantPicker({
  labelId,
  part,
  options,
  selected,
  avatar,
  onSelect,
}: {
  labelId: string;
  part: PartKey;
  options: string[];
  selected: string;
  avatar: WizardAvatarData;
  onSelect: (id: string) => void;
}) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const selectedIndex = Math.max(0, options.indexOf(selected));

  const move = (event: KeyboardEvent<HTMLDivElement>) => {
    const last = options.length - 1;
    const step: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    let next: number | null = null;
    if (event.key in step) next = (selectedIndex + step[event.key] + options.length) % options.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = last;
    if (next === null) return;
    event.preventDefault();
    onSelect(options[next]);
    refs.current[next]?.focus();
  };

  return (
    <div role="radiogroup" aria-labelledby={labelId} className="wa-variants" onKeyDown={move}>
      {options.map((id, index) => {
        const checked = index === selectedIndex;
        return (
          <button
            key={id}
            ref={(el) => {
              refs.current[index] = el;
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            aria-label={`${PART_LABELS[part]}: ${id}`}
            title={id}
            tabIndex={checked ? 0 : -1}
            onClick={() => onSelect(id)}
            className="wa-variant"
          >
            <WizardAvatar avatar={withPart(avatar, part, { id })} size={32} title={id} />
          </button>
        );
      })}
    </div>
  );
}

function ColorPicker({
  label,
  color,
  colors,
  disabled,
  onChange,
}: {
  label: string;
  color: string;
  colors: readonly string[];
  disabled: boolean;
  onChange: (color: string) => void;
}) {
  return (
    <div className="wa-colors" aria-disabled={disabled || undefined}>
      {colors.map((choice) => {
        const active = choice.toUpperCase() === color.toUpperCase();
        return (
          <button
            key={choice}
            type="button"
            title={choice}
            disabled={disabled}
            aria-label={`${label} color ${choice}`}
            aria-pressed={active}
            onClick={() => onChange(choice)}
            className="wa-swatch"
            style={{ backgroundColor: choice }}
          />
        );
      })}
      <HexInput label={label} color={color} disabled={disabled} onChange={onChange} />
    </div>
  );
}

function HexInput({
  label,
  color,
  disabled,
  onChange,
}: {
  label: string;
  color: string;
  disabled: boolean;
  onChange: (color: string) => void;
}) {
  const [draft, setDraft] = useState(color);

  useEffect(() => {
    setDraft(color);
  }, [color]);

  return (
    <input
      className="wa-hex"
      value={draft}
      disabled={disabled}
      aria-label={`${label} hex color`}
      spellCheck={false}
      placeholder={WIZARD_FALLBACK_COLOR}
      onChange={(event) => {
        setDraft(event.target.value);
        const next = normalizeHexDraft(event.target.value);
        if (next) onChange(next);
      }}
      onBlur={() => setDraft(color)}
    />
  );
}
