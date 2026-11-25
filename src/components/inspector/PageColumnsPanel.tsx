import React from 'react';
import { Link2, Unlink2 } from 'lucide-react';
import { PAPER_SPECS } from '../../data/fonts';
import { useI18n } from '../../i18n/LanguageContext';
import { useTemplate } from '../../state/TemplateContext';
import { PaperSize } from '../../types/template';
import {
  ColorPickerField,
  PanelSection,
  SegmentedControl,
  SelectField,
  SliderField,
  ToggleSwitch,
  UnitNumberInput,
} from '../ui/Controls';

export const PageColumnsPanel: React.FC = () => {
  const { t } = useI18n();
  const { config, updateConfig } = useTemplate();

  const isSlides = config.documentType === 'slides';
  const unit = config.page.unit;

  const paperOptions = Object.values(PAPER_SPECS)
    .filter((spec) =>
      isSlides ? spec.id.startsWith('slide') : !spec.id.startsWith('slide')
    )
    .map((spec) => ({ value: spec.id, label: spec.label }));

  const updateMargin = (side: 'top' | 'bottom' | 'left' | 'right', val: number) => {
    const safe = Math.max(0, Math.min(80, val));
    if (config.page.margins.linked) {
      updateConfig('page', {
        ...config.page,
        margins: { top: safe, bottom: safe, left: safe, right: safe, linked: true },
      });
    } else {
      updateConfig('page', {
        ...config.page,
        margins: { ...config.page.margins, [side]: safe },
      });
    }
  };

  return (
    <div className="space-y-4">
      <PanelSection title={t.page.geometryTitle}>
        <SelectField
          label={t.page.paperSize}
          value={config.page.size}
          options={paperOptions}
          onChange={(v) => updateConfig('page', { ...config.page, size: v as PaperSize })}
        />

        {config.page.size === 'custom' && !isSlides && (
          <div className="grid grid-cols-2 gap-2">
            <UnitNumberInput
              label={t.page.customWidth}
              value={config.page.customWidthMm}
              min={60}
              max={600}
              step={1}
              unit="mm"
              onChange={(customWidthMm) =>
                updateConfig('page', { ...config.page, customWidthMm })
              }
            />
            <UnitNumberInput
              label={t.page.customHeight}
              value={config.page.customHeightMm}
              min={60}
              max={600}
              step={1}
              unit="mm"
              onChange={(customHeightMm) =>
                updateConfig('page', { ...config.page, customHeightMm })
              }
            />
          </div>
        )}

        {!isSlides && (
          <>
            <div className="space-y-1">
              <span className="text-xs font-medium text-[var(--studio-text)] block">
                {t.page.orientation}
              </span>
              <SegmentedControl
                value={config.page.orientation}
                onChange={(v) => updateConfig('page', { ...config.page, orientation: v })}
                options={[
                  { value: 'portrait', label: t.page.portrait },
                  { value: 'landscape', label: t.page.landscape },
                ]}
              />
            </div>

            <ToggleSwitch
              label={t.page.twoside}
              hint={t.page.twosideHint}
              checked={config.page.twoside}
              onChange={(checked) => updateConfig('page', { ...config.page, twoside: checked })}
            />
          </>
        )}

        <div className="space-y-1">
          <span className="text-xs font-medium text-[var(--studio-text)] block">{t.page.unit}</span>
          <SegmentedControl
            value={unit}
            onChange={(nextUnit) => {
              if (nextUnit === unit) return;
              const factor = nextUnit === 'cm' ? 0.1 : 10;
              const m = config.page.margins;
              updateConfig('page', {
                ...config.page,
                unit: nextUnit,
                margins: {
                  ...m,
                  top: Number((m.top * factor).toFixed(1)),
                  bottom: Number((m.bottom * factor).toFixed(1)),
                  left: Number((m.left * factor).toFixed(1)),
                  right: Number((m.right * factor).toFixed(1)),
                },
              });
            }}
            options={[
              { value: 'mm', label: 'mm' },
              { value: 'cm', label: 'cm' },
            ]}
          />
        </div>
      </PanelSection>

      <PanelSection
        title={t.page.marginsTitle}
        hint={isSlides ? t.page.slidesMarginHint : undefined}
      >
        <div className="p-2.5 rounded-xl bg-[var(--studio-bg)] border border-[var(--studio-border)] space-y-2">
          <div className="grid grid-cols-3 gap-2 items-center">
            <div />
            <UnitNumberInput
              label={t.page.top}
              value={config.page.margins.top}
              step={unit === 'cm' ? 0.1 : 1}
              unit={unit}
              onChange={(v) => updateMargin('top', v)}
            />
            <div className="flex justify-end">
              <button
                type="button"
                title={t.page.linkMargins}
                onClick={() =>
                  updateConfig('page', {
                    ...config.page,
                    margins: { ...config.page.margins, linked: !config.page.margins.linked },
                  })
                }
                className={`p-1.5 rounded-md border text-xs cursor-pointer ${
                  config.page.margins.linked
                    ? 'border-amber-600 bg-amber-500/15 text-amber-800 dark:text-amber-300'
                    : 'border-[var(--studio-border)] bg-[var(--studio-elevated)] text-[var(--studio-muted)]'
                }`}
              >
                {config.page.margins.linked ? (
                  <Link2 className="w-3.5 h-3.5" />
                ) : (
                  <Unlink2 className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            <UnitNumberInput
              label={config.page.twoside ? t.page.inner : t.page.left}
              value={config.page.margins.left}
              step={unit === 'cm' ? 0.1 : 1}
              unit={unit}
              onChange={(v) => updateMargin('left', v)}
            />
            <div className="h-10 rounded border border-dashed border-amber-600/40 bg-[var(--studio-elevated)] flex items-center justify-center text-[10px] font-mono text-[var(--studio-muted)]">
              {config.page.size.toUpperCase()}
            </div>
            <UnitNumberInput
              label={config.page.twoside ? t.page.outer : t.page.right}
              value={config.page.margins.right}
              step={unit === 'cm' ? 0.1 : 1}
              unit={unit}
              onChange={(v) => updateMargin('right', v)}
            />

            <div />
            <UnitNumberInput
              label={t.page.bottom}
              value={config.page.margins.bottom}
              step={unit === 'cm' ? 0.1 : 1}
              unit={unit}
              onChange={(v) => updateMargin('bottom', v)}
            />
            <div />
          </div>
        </div>
      </PanelSection>

      {!isSlides && (
        <PanelSection title={t.page.pageFrameTitle}>
          <ToggleSwitch
            label={t.page.pageFrameEnable}
            checked={config.page.pageFrame.enabled}
            onChange={(enabled) =>
              updateConfig('page', {
                ...config.page,
                pageFrame: { ...config.page.pageFrame, enabled },
              })
            }
          />
          {config.page.pageFrame.enabled && (
            <div className="space-y-2.5 pt-1">
              <SliderField
                label={t.page.pageFrameWidth}
                value={config.page.pageFrame.widthPt}
                min={0.3}
                max={3}
                step={0.1}
                decimals={1}
                unit=" pt"
                onChange={(widthPt) =>
                  updateConfig('page', {
                    ...config.page,
                    pageFrame: { ...config.page.pageFrame, widthPt },
                  })
                }
              />
              <SliderField
                label={t.page.pageFrameInset}
                value={config.page.pageFrame.insetMm}
                min={4}
                max={25}
                step={1}
                unit=" mm"
                onChange={(insetMm) =>
                  updateConfig('page', {
                    ...config.page,
                    pageFrame: { ...config.page.pageFrame, insetMm },
                  })
                }
              />
              <ColorPickerField
                label={t.page.pageFrameColor}
                value={config.page.pageFrame.color}
                swatches={['#9ca3af', '#111827', '#92400e', '#0f766e', '#1d4ed8']}
                onChange={(color) =>
                  updateConfig('page', {
                    ...config.page,
                    pageFrame: { ...config.page.pageFrame, color },
                  })
                }
              />
            </div>
          )}
        </PanelSection>
      )}

      <PanelSection title={t.page.columnsTitle}>
        <div className="space-y-1">
          <span className="text-xs font-medium text-[var(--studio-text)] block">
            {t.page.columnCount}
          </span>
          <SegmentedControl<1 | 2 | 3>
            value={config.columns.count}
            onChange={(count) =>
              updateConfig('columns', {
                ...config.columns,
                count,
                mode: count === 3 ? 'multicol' : config.columns.mode,
              })
            }
            options={[
              { value: 1, label: '1' },
              { value: 2, label: '2' },
              { value: 3, label: '3' },
            ]}
          />
        </div>

        {config.columns.count > 1 && (
          <>
            {!isSlides && config.columns.count === 2 && (
              <div className="space-y-1">
                <span className="text-xs font-medium text-[var(--studio-text)] block">
                  {t.page.columnMode}
                </span>
                <SegmentedControl<'native' | 'multicol'>
                  value={config.columns.mode}
                  onChange={(mode) => updateConfig('columns', { ...config.columns, mode })}
                  options={[
                    { value: 'native', label: t.page.nativeMode },
                    { value: 'multicol', label: t.page.multicolMode },
                  ]}
                />
              </div>
            )}

            <SliderField
              label={t.page.columnGap}
              value={config.columns.gapMm}
              min={2}
              max={18}
              step={0.5}
              decimals={1}
              unit=" mm"
              onChange={(gapMm) => updateConfig('columns', { ...config.columns, gapMm })}
            />

            <SliderField
              label={t.page.columnRule}
              value={config.columns.ruleWidthPt}
              min={0}
              max={2}
              step={0.2}
              decimals={1}
              unit=" pt"
              onChange={(ruleWidthPt) =>
                updateConfig('columns', { ...config.columns, ruleWidthPt })
              }
            />

            {config.columns.ruleWidthPt > 0 && (
              <ColorPickerField
                label={t.page.columnRuleColor}
                value={config.columns.ruleColor}
                swatches={['#d6d3d1', '#9ca3af', '#475569', '#92400e', '#1d4ed8']}
                onChange={(ruleColor) =>
                  updateConfig('columns', { ...config.columns, ruleColor })
                }
              />
            )}
          </>
        )}
      </PanelSection>
    </div>
  );
};
