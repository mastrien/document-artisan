import React from 'react';
import {
  BookMarked,
  Code,
  Image,
  Link,
  MessageSquareQuote,
  Sigma,
  Sparkles,
  Table,
} from 'lucide-react';
import { useI18n } from '../../i18n/LanguageContext';
import { useTemplate } from '../../state/TemplateContext';
import {
  AbntCitationCase,
  CaptionSeparator,
  CitationStyle,
  DialogueStyle,
  SimpleAlign,
  TableStyle,
  TextAlign,
} from '../../types/template';
import {
  ColorPickerField,
  SegmentedControl,
  SelectField,
  SliderField,
  ToggleSwitch,
} from '../ui/Controls';
import { EditorialModulesSection } from './modules/EditorialModulesSection';
import { ModuleCard } from './modules/ModuleCard';

export const ModulesPanel: React.FC = () => {
  const { t } = useI18n();
  const { config, updateConfig } = useTemplate();
  const m = config.modules;

  const sepOptions: { value: CaptionSeparator; label: string }[] = [
    { value: 'colon', label: t.modules.separators.colon },
    { value: 'endash', label: t.modules.separators.endash },
    { value: 'emdash', label: t.modules.separators.emdash },
    { value: 'period', label: t.modules.separators.period },
  ];

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[var(--studio-muted)]">
          {t.modules.title}
        </h3>
        <p className="text-[11px] text-[var(--studio-muted)] mt-0.5 leading-snug">
          {t.modules.subtitle}
        </p>
      </div>

      {/* Images */}
      <ModuleCard
        icon={<Image className="w-4 h-4" />}
        title={t.modules.images.name}
        desc={t.modules.images.desc}
        enabled={m.images.enabled}
        onToggle={(enabled) =>
          updateConfig('modules', { ...m, images: { ...m.images, enabled } })
        }
      >
        <div className="space-y-2">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--studio-muted)]">
            {t.modules.images.appearanceGroup}
          </div>
          <SliderField
            label={t.modules.images.width}
            value={m.images.defaultWidthRatio}
            min={0.3}
            max={1.0}
            step={0.05}
            decimals={2}
            unit="×"
            onChange={(defaultWidthRatio) =>
              updateConfig('modules', { ...m, images: { ...m.images, defaultWidthRatio } })
            }
          />
          <SliderField
            label={t.modules.images.verticalSpace}
            value={m.images.spacingVerticalPt}
            min={0}
            max={24}
            step={2}
            unit=" pt"
            onChange={(spacingVerticalPt) =>
              updateConfig('modules', { ...m, images: { ...m.images, spacingVerticalPt } })
            }
          />
          <ToggleSwitch
            label={t.modules.images.border}
            checked={m.images.border}
            onChange={(border) =>
              updateConfig('modules', { ...m, images: { ...m.images, border } })
            }
          />
          {m.images.border && (
            <div className="space-y-2 pl-2 border-l-2 border-amber-600/30">
              <SliderField
                label={t.modules.images.borderWidth}
                value={m.images.borderWidthPt}
                min={0.3}
                max={3}
                step={0.1}
                decimals={1}
                unit=" pt"
                onChange={(borderWidthPt) =>
                  updateConfig('modules', { ...m, images: { ...m.images, borderWidthPt } })
                }
              />
              <SliderField
                label={t.modules.images.padding}
                value={m.images.paddingPt}
                min={0}
                max={12}
                step={1}
                unit=" pt"
                onChange={(paddingPt) =>
                  updateConfig('modules', { ...m, images: { ...m.images, paddingPt } })
                }
              />
              <ColorPickerField
                label={t.modules.images.borderColor}
                value={m.images.borderColor}
                swatches={['#d1d5db', '#9ca3af', '#111827', '#92400e', '#0f766e']}
                onChange={(borderColor) =>
                  updateConfig('modules', { ...m, images: { ...m.images, borderColor } })
                }
              />
            </div>
          )}
        </div>

        <div className="space-y-2 pt-2 border-t border-[var(--studio-border)]">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--studio-muted)]">
            {t.modules.images.captionGroup}
          </div>
          <SegmentedControl<'bottom' | 'top'>
            value={m.images.captionPosition}
            onChange={(captionPosition) =>
              updateConfig('modules', { ...m, images: { ...m.images, captionPosition } })
            }
            options={[
              { value: 'top', label: t.modules.images.top },
              { value: 'bottom', label: t.modules.images.bottom },
            ]}
          />
          <SegmentedControl<TextAlign>
            value={m.images.captionAlign}
            onChange={(captionAlign) =>
              updateConfig('modules', { ...m, images: { ...m.images, captionAlign } })
            }
            options={[
              { value: 'left', label: 'Esq' },
              { value: 'center', label: 'Centro' },
              { value: 'right', label: 'Dir' },
              { value: 'justify', label: 'Just' },
            ]}
          />
          <div className="grid grid-cols-2 gap-2">
            <label className="block space-y-1">
              <span className="text-[11px] font-medium text-[var(--studio-muted)] block">
                {t.modules.images.captionPrefix}
              </span>
              <input
                type="text"
                value={m.images.captionPrefix}
                onChange={(e) =>
                  updateConfig('modules', {
                    ...m,
                    images: { ...m.images, captionPrefix: e.target.value },
                  })
                }
                className="w-full rounded-md border border-[var(--studio-border)] bg-[var(--studio-bg)] px-2 py-1 text-xs text-[var(--studio-text)]"
              />
            </label>
            <SelectField
              label={t.modules.images.captionSep}
              value={m.images.captionSeparator}
              options={sepOptions}
              onChange={(v) =>
                updateConfig('modules', {
                  ...m,
                  images: { ...m.images, captionSeparator: v as CaptionSeparator },
                })
              }
            />
          </div>
          <SliderField
            label={t.modules.images.captionFontSize}
            value={m.images.captionFontSizePt}
            min={7.5}
            max={12}
            step={0.5}
            decimals={1}
            unit=" pt"
            onChange={(captionFontSizePt) =>
              updateConfig('modules', { ...m, images: { ...m.images, captionFontSizePt } })
            }
          />
          <ToggleSwitch
            label={t.modules.images.captionLabelBold}
            checked={m.images.captionLabelBold}
            onChange={(captionLabelBold) =>
              updateConfig('modules', { ...m, images: { ...m.images, captionLabelBold } })
            }
          />
          <ToggleSwitch
            label={t.modules.images.captionLabelUpper}
            checked={m.images.captionLabelUppercase}
            onChange={(captionLabelUppercase) =>
              updateConfig('modules', { ...m, images: { ...m.images, captionLabelUppercase } })
            }
          />
          <ToggleSwitch
            label={t.modules.images.captionItalic}
            checked={m.images.captionItalic}
            onChange={(captionItalic) =>
              updateConfig('modules', { ...m, images: { ...m.images, captionItalic } })
            }
          />
          <ColorPickerField
            label={t.modules.images.captionColor}
            value={m.images.captionColor}
            swatches={['#111827', '#475569', '#57534e', '#92400e', '#0f766e']}
            onChange={(captionColor) =>
              updateConfig('modules', { ...m, images: { ...m.images, captionColor } })
            }
          />
          <ToggleSwitch
            label={t.modules.images.showSource}
            checked={m.images.showSourceLine}
            onChange={(showSourceLine) =>
              updateConfig('modules', { ...m, images: { ...m.images, showSourceLine } })
            }
          />
          {m.images.showSourceLine && (
            <div className="grid grid-cols-2 gap-2">
              <label className="block space-y-1">
                <span className="text-[11px] font-medium text-[var(--studio-muted)] block">
                  {t.modules.images.sourcePrefix}
                </span>
                <input
                  type="text"
                  value={m.images.sourcePrefix}
                  onChange={(e) =>
                    updateConfig('modules', {
                      ...m,
                      images: { ...m.images, sourcePrefix: e.target.value },
                    })
                  }
                  className="w-full rounded-md border border-[var(--studio-border)] bg-[var(--studio-bg)] px-2 py-1 text-xs text-[var(--studio-text)]"
                />
              </label>
              <div className="space-y-1">
                <span className="text-[11px] font-medium text-[var(--studio-muted)] block">
                  {t.modules.images.sourceAlign}
                </span>
                <SegmentedControl<'left' | 'center'>
                  value={m.images.sourceAlign}
                  onChange={(sourceAlign) =>
                    updateConfig('modules', { ...m, images: { ...m.images, sourceAlign } })
                  }
                  options={[
                    { value: 'left', label: 'Esq' },
                    { value: 'center', label: 'Centro' },
                  ]}
                />
              </div>
            </div>
          )}
        </div>
      </ModuleCard>

      {/* Tables */}
      <ModuleCard
        icon={<Table className="w-4 h-4" />}
        title={t.modules.tables.name}
        desc={t.modules.tables.desc}
        enabled={m.tables.enabled}
        onToggle={(enabled) =>
          updateConfig('modules', { ...m, tables: { ...m.tables, enabled } })
        }
      >
        <div className="space-y-2">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--studio-muted)]">
            {t.modules.tables.styleGroup}
          </div>
          <SelectField
            label={t.modules.tables.style}
            value={m.tables.style}
            options={[
              { value: 'booktabs', label: t.modules.tables.booktabs },
              { value: 'abnt-open', label: t.modules.tables.abntOpen },
              { value: 'striped', label: t.modules.tables.striped },
              { value: 'grid', label: t.modules.tables.grid },
              { value: 'horizontal', label: t.modules.tables.horizontal },
            ]}
            onChange={(v) =>
              updateConfig('modules', { ...m, tables: { ...m.tables, style: v as TableStyle } })
            }
          />
          <SliderField
            label={t.modules.tables.fontSize}
            value={m.tables.fontSizePt}
            min={7.5}
            max={12}
            step={0.5}
            decimals={1}
            unit=" pt"
            onChange={(fontSizePt) =>
              updateConfig('modules', { ...m, tables: { ...m.tables, fontSizePt } })
            }
          />
          <SliderField
            label={t.modules.tables.rowStretch}
            value={m.tables.rowStretch}
            min={1.0}
            max={1.8}
            step={0.05}
            decimals={2}
            unit="×"
            onChange={(rowStretch) =>
              updateConfig('modules', { ...m, tables: { ...m.tables, rowStretch } })
            }
          />
          <SliderField
            label={t.modules.tables.cellPadding}
            value={m.tables.cellPaddingPt}
            min={2}
            max={12}
            step={1}
            unit=" pt"
            onChange={(cellPaddingPt) =>
              updateConfig('modules', { ...m, tables: { ...m.tables, cellPaddingPt } })
            }
          />
          <SliderField
            label={t.modules.tables.borderWidth}
            value={m.tables.borderWidthPt}
            min={0.3}
            max={2}
            step={0.1}
            decimals={1}
            unit=" pt"
            onChange={(borderWidthPt) =>
              updateConfig('modules', { ...m, tables: { ...m.tables, borderWidthPt } })
            }
          />
          <ColorPickerField
            label={t.modules.tables.borderColor}
            value={m.tables.borderColor}
            swatches={['#111827', '#475569', '#cbd5e1', '#92400e', '#0f766e']}
            onChange={(borderColor) =>
              updateConfig('modules', { ...m, tables: { ...m.tables, borderColor } })
            }
          />
          {m.tables.style === 'striped' && (
            <ColorPickerField
              label={t.modules.tables.stripeColor}
              value={m.tables.stripeColor}
              swatches={['#f9fafb', '#f0fdfa', '#eff6ff', '#fffbeb', '#f5f5f4']}
              onChange={(stripeColor) =>
                updateConfig('modules', { ...m, tables: { ...m.tables, stripeColor } })
              }
            />
          )}
        </div>

        <div className="space-y-2 pt-2 border-t border-[var(--studio-border)]">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--studio-muted)]">
            {t.modules.tables.headerGroup}
          </div>
          <ToggleSwitch
            label={t.modules.tables.headerTint}
            checked={m.tables.headerTint}
            onChange={(headerTint) =>
              updateConfig('modules', { ...m, tables: { ...m.tables, headerTint } })
            }
          />
          {m.tables.headerTint && (
            <>
              <ColorPickerField
                label={t.modules.tables.headerBg}
                value={m.tables.headerBgColor}
                swatches={['#0f766e', '#1d4ed8', '#92400e', '#1e293b', '#f3f4f6']}
                onChange={(headerBgColor) =>
                  updateConfig('modules', { ...m, tables: { ...m.tables, headerBgColor } })
                }
              />
              <ColorPickerField
                label={t.modules.tables.headerText}
                value={m.tables.headerTextColor}
                swatches={['#ffffff', '#111827', '#1e3a8a', '#92400e']}
                onChange={(headerTextColor) =>
                  updateConfig('modules', { ...m, tables: { ...m.tables, headerTextColor } })
                }
              />
            </>
          )}
          <div className="grid grid-cols-2 gap-2">
            <ToggleSwitch
              label={t.modules.tables.headerBold}
              checked={m.tables.headerBold}
              onChange={(headerBold) =>
                updateConfig('modules', { ...m, tables: { ...m.tables, headerBold } })
              }
            />
            <ToggleSwitch
              label={t.modules.tables.headerUpper}
              checked={m.tables.headerUppercase}
              onChange={(headerUppercase) =>
                updateConfig('modules', { ...m, tables: { ...m.tables, headerUppercase } })
              }
            />
          </div>
          <SegmentedControl<SimpleAlign>
            value={m.tables.headerAlign}
            onChange={(headerAlign) =>
              updateConfig('modules', { ...m, tables: { ...m.tables, headerAlign } })
            }
            options={[
              { value: 'left', label: 'Esq' },
              { value: 'center', label: 'Centro' },
              { value: 'right', label: 'Dir' },
            ]}
          />
        </div>

        <div className="space-y-2 pt-2 border-t border-[var(--studio-border)]">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--studio-muted)]">
            {t.modules.tables.captionGroup}
          </div>
          <SegmentedControl<'top' | 'bottom'>
            value={m.tables.captionPosition}
            onChange={(captionPosition) =>
              updateConfig('modules', { ...m, tables: { ...m.tables, captionPosition } })
            }
            options={[
              { value: 'top', label: t.modules.images.top },
              { value: 'bottom', label: t.modules.images.bottom },
            ]}
          />
          <div className="grid grid-cols-2 gap-2">
            <label className="block space-y-1">
              <span className="text-[11px] font-medium text-[var(--studio-muted)] block">
                {t.modules.tables.captionPrefix}
              </span>
              <input
                type="text"
                value={m.tables.captionPrefix}
                onChange={(e) =>
                  updateConfig('modules', {
                    ...m,
                    tables: { ...m.tables, captionPrefix: e.target.value },
                  })
                }
                className="w-full rounded-md border border-[var(--studio-border)] bg-[var(--studio-bg)] px-2 py-1 text-xs text-[var(--studio-text)]"
              />
            </label>
            <SelectField
              label={t.modules.tables.captionSep}
              value={m.tables.captionSeparator}
              options={sepOptions}
              onChange={(v) =>
                updateConfig('modules', {
                  ...m,
                  tables: { ...m.tables, captionSeparator: v as CaptionSeparator },
                })
              }
            />
          </div>
          <SliderField
            label={t.modules.tables.captionFontSize}
            value={m.tables.captionFontSizePt}
            min={7.5}
            max={12}
            step={0.5}
            decimals={1}
            unit=" pt"
            onChange={(captionFontSizePt) =>
              updateConfig('modules', { ...m, tables: { ...m.tables, captionFontSizePt } })
            }
          />
          <ToggleSwitch
            label={t.modules.tables.captionLabelBold}
            checked={m.tables.captionLabelBold}
            onChange={(captionLabelBold) =>
              updateConfig('modules', { ...m, tables: { ...m.tables, captionLabelBold } })
            }
          />
          <ToggleSwitch
            label={t.modules.tables.showSource}
            checked={m.tables.showSourceLine}
            onChange={(showSourceLine) =>
              updateConfig('modules', { ...m, tables: { ...m.tables, showSourceLine } })
            }
          />
        </div>
      </ModuleCard>

      {/* Citations */}
      <ModuleCard
        icon={<BookMarked className="w-4 h-4" />}
        title={t.modules.citations.name}
        desc={t.modules.citations.desc}
        enabled={m.citations.enabled}
        onToggle={(enabled) =>
          updateConfig('modules', { ...m, citations: { ...m.citations, enabled } })
        }
      >
        <SelectField
          label={t.modules.citations.style}
          value={m.citations.style}
          options={[
            { value: 'abnt', label: 'ABNT (biblatex-abnt)' },
            { value: 'apa', label: 'APA' },
            { value: 'ieee', label: 'IEEE' },
            { value: 'vancouver', label: 'Vancouver' },
            { value: 'authoryear', label: 'Author-Year' },
            { value: 'numeric', label: 'Numeric [1]' },
          ]}
          onChange={(v) =>
            updateConfig('modules', {
              ...m,
              citations: { ...m.citations, style: v as CitationStyle },
            })
          }
        />
        {m.citations.style === 'abnt' && (
          <div className="space-y-1">
            <span className="text-xs font-medium text-[var(--studio-text)] block">
              {t.modules.citations.abntCase}
            </span>
            <SegmentedControl<AbntCitationCase>
              value={m.citations.abntCiteCase}
              onChange={(abntCiteCase) =>
                updateConfig('modules', {
                  ...m,
                  citations: { ...m.citations, abntCiteCase },
                })
              }
              options={[
                { value: 'titlecase', label: t.modules.citations.abntTitlecase },
                { value: 'uppercase', label: t.modules.citations.abntUppercase },
              ]}
            />
          </div>
        )}
      </ModuleCard>

      {/* Editorial Extra Modules (Long Quotes, Lists, Footnotes) */}
      <EditorialModulesSection />

      {/* Dialogues */}
      <ModuleCard
        icon={<MessageSquareQuote className="w-4 h-4" />}
        title={t.modules.dialogues.name}
        desc={t.modules.dialogues.desc}
        enabled={m.dialogues.enabled}
        onToggle={(enabled) =>
          updateConfig('modules', { ...m, dialogues: { ...m.dialogues, enabled } })
        }
      >
        <SelectField
          label={t.modules.dialogues.style}
          value={m.dialogues.style}
          options={[
            { value: 'literary', label: t.modules.dialogues.literary },
            { value: 'script', label: t.modules.dialogues.script },
            { value: 'interview', label: t.modules.dialogues.interview },
          ]}
          onChange={(v) =>
            updateConfig('modules', {
              ...m,
              dialogues: { ...m.dialogues, style: v as DialogueStyle },
            })
          }
        />
        <ToggleSwitch
          label={t.modules.dialogues.speakerBold}
          checked={m.dialogues.speakerBold}
          onChange={(speakerBold) =>
            updateConfig('modules', { ...m, dialogues: { ...m.dialogues, speakerBold } })
          }
        />
        <SliderField
          label={t.modules.dialogues.indent}
          value={m.dialogues.indentMm}
          min={0}
          max={16}
          step={1}
          unit=" mm"
          onChange={(indentMm) =>
            updateConfig('modules', { ...m, dialogues: { ...m.dialogues, indentMm } })
          }
        />
      </ModuleCard>

      {/* Math */}
      <ModuleCard
        icon={<Sigma className="w-4 h-4" />}
        title={t.modules.math.name}
        desc={t.modules.math.desc}
        enabled={m.math.enabled}
        onToggle={(enabled) =>
          updateConfig('modules', { ...m, math: { ...m.math, enabled } })
        }
      >
        <ToggleSwitch
          label={t.modules.math.numbered}
          checked={m.math.numberedEquations}
          onChange={(numberedEquations) =>
            updateConfig('modules', { ...m, math: { ...m.math, numberedEquations } })
          }
        />
        <ToggleSwitch
          label={t.modules.math.theorems}
          checked={m.math.theoremBoxes}
          onChange={(theoremBoxes) =>
            updateConfig('modules', { ...m, math: { ...m.math, theoremBoxes } })
          }
        />
      </ModuleCard>

      {/* Code */}
      <ModuleCard
        icon={<Code className="w-4 h-4" />}
        title={t.modules.code.name}
        desc={t.modules.code.desc}
        enabled={m.code.enabled}
        onToggle={(enabled) =>
          updateConfig('modules', { ...m, code: { ...m.code, enabled } })
        }
      >
        <ToggleSwitch
          label={t.modules.code.lineNumbers}
          checked={m.code.lineNumbers}
          onChange={(lineNumbers) =>
            updateConfig('modules', { ...m, code: { ...m.code, lineNumbers } })
          }
        />
        <ToggleSwitch
          label={t.modules.code.frame}
          checked={m.code.frame}
          onChange={(frame) =>
            updateConfig('modules', { ...m, code: { ...m.code, frame } })
          }
        />
        <ToggleSwitch
          label={t.modules.code.tint}
          checked={m.code.backgroundTint}
          onChange={(backgroundTint) =>
            updateConfig('modules', { ...m, code: { ...m.code, backgroundTint } })
          }
        />
      </ModuleCard>

      {/* Callouts */}
      <ModuleCard
        icon={<Sparkles className="w-4 h-4" />}
        title={t.modules.callouts.name}
        desc={t.modules.callouts.desc}
        enabled={m.callouts.enabled}
        onToggle={(enabled) =>
          updateConfig('modules', { ...m, callouts: { ...m.callouts, enabled } })
        }
      >
        <ToggleSwitch
          label={t.modules.callouts.leftOnly}
          checked={m.callouts.borderLeftOnly}
          onChange={(borderLeftOnly) =>
            updateConfig('modules', { ...m, callouts: { ...m.callouts, borderLeftOnly } })
          }
        />
      </ModuleCard>

      {/* Hyperref */}
      <ModuleCard
        icon={<Link className="w-4 h-4" />}
        title={t.modules.hyperref.name}
        desc={t.modules.hyperref.desc}
        enabled={m.hyperref.enabled}
        onToggle={(enabled) =>
          updateConfig('modules', { ...m, hyperref: { ...m.hyperref, enabled } })
        }
      >
        <ToggleSwitch
          label={t.modules.hyperref.coloredLinks}
          checked={m.hyperref.coloredLinks}
          onChange={(coloredLinks) =>
            updateConfig('modules', { ...m, hyperref: { ...m.hyperref, coloredLinks } })
          }
        />
      </ModuleCard>
    </div>
  );
};
