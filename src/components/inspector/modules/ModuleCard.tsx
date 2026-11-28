import React from 'react';
import { ToggleSwitch } from '../../ui/Controls';

export const ModuleCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  desc: string;
  enabled: boolean;
  onToggle: (val: boolean) => void;
  children?: React.ReactNode;
}> = ({ icon, title, desc, enabled, onToggle, children }) => (
  <div
    className={`rounded-xl border transition-colors ${
      enabled
        ? 'border-amber-600/40 bg-[var(--studio-elevated)]'
        : 'border-[var(--studio-border)] bg-[var(--studio-surface)] opacity-85'
    }`}
  >
    <div className="p-2.5 flex items-start justify-between gap-2">
      <div className="flex items-start gap-2 min-w-0">
        <div
          className={`p-1.5 rounded-lg shrink-0 ${
            enabled
              ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
              : 'bg-[var(--studio-bg)] text-[var(--studio-muted)]'
          }`}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <div className="text-xs font-semibold text-[var(--studio-text)] leading-tight">{title}</div>
          <div className="text-[10px] font-mono text-[var(--studio-muted)] truncate mt-0.5">
            {desc}
          </div>
        </div>
      </div>
      <ToggleSwitch label="" checked={enabled} onChange={onToggle} />
    </div>
    {enabled && children && (
      <div className="px-3 pb-3 pt-2 border-t border-[var(--studio-border)] space-y-3">
        {children}
      </div>
    )}
  </div>
);
