import React from 'react';

export const PanelSection: React.FC<{
  title: string;
  hint?: string;
  children: React.ReactNode;
}> = ({ title, hint, children }) => (
  <section className="space-y-2.5 pb-4 border-b border-[var(--studio-border)] last:border-b-0 last:pb-0">
    <div>
      <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[var(--studio-muted)]">
        {title}
      </h3>
      {hint && <p className="text-[11px] text-[var(--studio-muted)] mt-0.5 leading-snug">{hint}</p>}
    </div>
    <div className="space-y-2.5">{children}</div>
  </section>
);

export const SliderField: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  decimals?: number;
  onChange: (value: number) => void;
}> = ({ label, value, min, max, step, unit = '', decimals = 0, onChange }) => (
  <div className="space-y-1">
    <div className="flex items-center justify-between text-xs">
      <span className="font-medium text-[var(--studio-text)]">{label}</span>
      <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-[var(--studio-bg)] border border-[var(--studio-border)] text-[var(--studio-text)]">
        {value.toFixed(decimals)}
        {unit}
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-[var(--studio-border)] accent-amber-600 dark:accent-amber-500"
    />
  </div>
);

export const UnitNumberInput: React.FC<{
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
}> = ({ label, value, min = 0, max = 100, step = 1, unit, onChange }) => (
  <label className="block space-y-1">
    <span className="text-[11px] font-medium text-[var(--studio-muted)] block">{label}</span>
    <div className="flex items-center rounded-md border border-[var(--studio-border)] bg-[var(--studio-elevated)] px-2 py-1 focus-within:ring-1 focus-within:ring-amber-600">
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => {
          const parsed = parseFloat(e.target.value);
          if (!Number.isNaN(parsed)) onChange(parsed);
        }}
        className="w-full bg-transparent text-xs font-mono text-[var(--studio-text)] focus:outline-none"
      />
      {unit && <span className="text-[10px] font-mono text-[var(--studio-muted)] ml-1">{unit}</span>}
    </div>
  </label>
);

export function SegmentedControl<T extends string | number>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="grid grid-flow-col auto-cols-fr gap-1 p-0.5 rounded-lg bg-[var(--studio-bg)] border border-[var(--studio-border)]">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={String(opt.value)}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`px-2 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer truncate ${
              active
                ? 'bg-[var(--studio-elevated)] text-[var(--studio-text)] shadow-xs border border-[var(--studio-border)]'
                : 'text-[var(--studio-muted)] hover:text-[var(--studio-text)]'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export const ToggleSwitch: React.FC<{
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}> = ({ label, hint, checked, onChange }) => (
  <label className="flex items-start justify-between gap-3 cursor-pointer select-none">
    <div>
      <div className="text-xs font-medium text-[var(--studio-text)]">{label}</div>
      {hint && <div className="text-[11px] text-[var(--studio-muted)] leading-snug">{hint}</div>}
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors cursor-pointer ${
        checked ? 'bg-amber-600 dark:bg-amber-500' : 'bg-[var(--studio-border)]'
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-4.5' : 'translate-x-1'
        }`}
      />
    </button>
  </label>
);

export const ColorPickerField: React.FC<{
  label: string;
  value: string;
  swatches?: string[];
  onChange: (value: string) => void;
}> = ({
  label,
  value,
  swatches = ['#1c1917', '#92400e', '#1d4ed8', '#0f766e', '#7c2d12', '#ffffff'],
  onChange,
}) => (
  <div className="space-y-1.5">
    <div className="flex items-center justify-between">
      <span className="text-xs font-medium text-[var(--studio-text)]">{label}</span>
      <span className="text-[11px] font-mono uppercase text-[var(--studio-muted)]">{value}</span>
    </div>
    <div className="flex items-center gap-1.5">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-6 w-7 rounded border border-[var(--studio-border)] bg-transparent cursor-pointer p-0"
      />
      <div className="flex items-center gap-1 flex-wrap">
        {swatches.map((hex) => (
          <button
            key={hex}
            type="button"
            title={hex}
            onClick={() => onChange(hex)}
            style={{ backgroundColor: hex }}
            className={`h-5 w-5 rounded-full border transition-transform cursor-pointer ${
              value.toLowerCase() === hex.toLowerCase()
                ? 'border-amber-600 scale-110 ring-1 ring-amber-500'
                : 'border-black/20 dark:border-white/20 hover:scale-105'
            }`}
          />
        ))}
      </div>
    </div>
  </div>
);

export const SelectField: React.FC<{
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}> = ({ label, value, options, onChange }) => (
  <label className="block space-y-1">
    <span className="text-xs font-medium text-[var(--studio-text)] block">{label}</span>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-md border border-[var(--studio-border)] bg-[var(--studio-elevated)] px-2.5 py-1.5 text-xs text-[var(--studio-text)] focus:outline-none focus:ring-1 focus:ring-amber-600"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  </label>
);
