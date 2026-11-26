import React, { useRef, useState } from 'react';
import { AlertTriangle, Plus, Trash2, Upload } from 'lucide-react';
import { FONT_CATALOG } from '../../data/fonts';
import { useI18n } from '../../i18n/LanguageContext';
import { useTemplate } from '../../state/TemplateContext';
import { FontVariantKey } from '../../types/template';
import {
  ColorPickerField,
  PanelSection,
  SegmentedControl,
  SelectField,
  SliderField,
  ToggleSwitch,
} from '../ui/Controls';
import { HeadingStyleEditor } from './HeadingStyleEditor';

type TypoSubTab = 'fonts' | 'body' | 'headings' | 'colors';

export const TypographyPanel: React.FC = () => {
  const { t } = useI18n();
  const {
    config,
    updateConfig,
    uploadCustomFontFiles,
    removeCustomFontFamily,
    removeCustomFontVariant,
  } = useTemplate();
  const typo = config.typography;

  const [subTab, setSubTab] = useState<TypoSubTab>('fonts');
  const [systemFontDraft, setSystemFontDraft] = useState('');

  const multiFileRef = useRef<HTMLInputElement | null>(null);
  const variantTargetRef = useRef<{ familyId: string; variant?: FontVariantKey } | null>(null);
  const variantFileRef = useRef<HTMLInputElement | null>(null);

  const handleUploadNewFamily = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const familyId = await uploadCustomFontFiles(e.target.files);
      if (familyId) {
        updateConfig('typography', { ...typo, bodyFontId: familyId });
      }
      e.target.value = '';
    }
  };

  const handleUploadVariant = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = variantTargetRef.current;
    if (e.target.files && e.target.files.length > 0 && target) {
      await uploadCustomFontFiles(e.target.files, target.familyId, target.variant);
      e.target.value = '';
      variantTargetRef.current = null;
    }
  };

  const customOptions = config.customFonts.map((cf) => ({
    value: cf.id,
    label: `★ ${cf.familyName} (Custom)`,
  }));

  const textFonts = [
    ...customOptions,
    ...FONT_CATALOG.filter((f) => f.category !== 'mono').map((f) => ({
      value: f.id,
      label: `${f.label} (${f.sampleTag})`,
    })),
  ];

  const monoFonts = [
    ...customOptions,
    ...FONT_CATALOG.map((f) => ({
      value: f.id,
      label: f.label,
    })),
  ];

  const hasCustomOrSystemFont =
    config.customFonts.length > 0 ||
    [
      typo.bodyFontId,
      typo.titleFontId,
      typo.headingFontId,
      typo.headerFooterFontId,
      typo.captionFontId,
    ].some((id) => id.startsWith('system:') || id.startsWith('custom:'));

  const tb = typo.titleBlock;

  return (
    <div className="space-y-4">
      <SegmentedControl<TypoSubTab>
        value={subTab}
        onChange={setSubTab}
        options={[
          { value: 'fonts', label: t.typography.subtabs.fonts },
          { value: 'body', label: t.typography.subtabs.body },
          { value: 'headings', label: t.typography.subtabs.headings },
          { value: 'colors', label: t.typography.subtabs.colors },
        ]}
      />

      {subTab === 'fonts' && (
        <>
          <PanelSection title={t.typography.customFontsTitle} hint={t.typography.customFontsHint}>
            <input
              ref={multiFileRef}
              type="file"
              multiple
              accept=".ttf,.otf,.woff2"
              onChange={handleUploadNewFamily}
              className="hidden"
            />
            <input
              ref={variantFileRef}
              type="file"
              accept=".ttf,.otf,.woff2"
              onChange={handleUploadVariant}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => multiFileRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border-2 border-dashed border-[var(--studio-border)] bg-[var(--studio-elevated)] hover:border-amber-600/70 text-xs font-semibold text-[var(--studio-text)] transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4 text-amber-600" />
              <span>{t.typography.uploadFilesBtn}</span>
            </button>

            {config.customFonts.map((fam) => {
              const variants: FontVariantKey[] = ['regular', 'bold', 'italic', 'boldItalic'];
              return (
                <div
                  key={fam.id}
                  className="p-2.5 rounded-xl border border-[var(--studio-border)] bg-[var(--studio-elevated)] space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[var(--studio-text)] truncate">
                      {fam.familyName}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => updateConfig('typography', { ...typo, bodyFontId: fam.id })}
                        className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/15 text-amber-800 dark:text-amber-300 cursor-pointer"
                      >
                        {t.typography.assignAsBody}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeCustomFontFamily(fam.id)}
                        className="p-1 text-[var(--studio-muted)] hover:text-red-500 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-1">
                    {variants.map((vk) => {
                      const file = fam.variants[vk];
                      return (
                        <div
                          key={vk}
                          className={`flex items-center justify-between px-1.5 py-1 rounded border text-[10px] ${
                            file
                              ? 'border-emerald-600/30 bg-emerald-500/8 text-[var(--studio-text)]'
                              : 'border-dashed border-[var(--studio-border)] text-[var(--studio-muted)]'
                          }`}
                        >
                          <span className="truncate">{t.typography.variantLabels[vk]}</span>
                          {file ? (
                            <button
                              type="button"
                              onClick={() => removeCustomFontVariant(fam.id, vk)}
                              className="text-[var(--studio-muted)] hover:text-red-500 cursor-pointer ml-1"
                              title={file.fileName}
                            >
                              ×
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                variantTargetRef.current = { familyId: fam.id, variant: vk };
                                variantFileRef.current?.click();
                              }}
                              className="text-amber-700 dark:text-amber-400 hover:underline cursor-pointer ml-1"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            <div className="space-y-1 pt-1">
              <span className="text-[11px] font-medium text-[var(--studio-muted)] block">
                {t.typography.customSystemFont}
              </span>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={systemFontDraft}
                  onChange={(e) => setSystemFontDraft(e.target.value)}
                  placeholder="Garamond, Arial, Palatino..."
                  className="flex-1 rounded-md border border-[var(--studio-border)] bg-[var(--studio-elevated)] px-2 py-1 text-xs text-[var(--studio-text)]"
                />
                <button
                  type="button"
                  onClick={() => {
                    const clean = systemFontDraft.trim();
                    if (!clean) return;
                    updateConfig('typography', {
                      ...typo,
                      bodyFontId: `system:${clean}`,
                    });
                    setSystemFontDraft('');
                  }}
                  className="px-2.5 py-1 rounded-md bg-amber-700 text-white text-[11px] font-semibold cursor-pointer"
                >
                  {t.typography.applyToBody}
                </button>
              </div>
            </div>

            {hasCustomOrSystemFont && config.engine === 'pdflatex' && (
              <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-900 dark:text-amber-200 space-y-1.5">
                <div className="flex items-start gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{t.typography.pdflatexWarning}</span>
                </div>
                <button
                  type="button"
                  onClick={() => updateConfig('engine', 'xelatex')}
                  className="px-2 py-1 rounded bg-amber-700 text-white text-[10px] font-semibold cursor-pointer"
                >
                  {t.typography.switchToXelatex}
                </button>
              </div>
            )}
          </PanelSection>

          <PanelSection title={t.typography.fontsTitle}>
            <SelectField
              label={t.typography.bodyFont}
              value={typo.bodyFontId}
              options={textFonts}
              onChange={(bodyFontId) => updateConfig('typography', { ...typo, bodyFontId })}
            />
            <SelectField
              label={t.typography.titleFont}
              value={typo.titleFontId}
              options={textFonts}
              onChange={(titleFontId) => updateConfig('typography', { ...typo, titleFontId })}
            />
            <SelectField
              label={t.typography.headingFont}
              value={typo.headingFontId}
              options={textFonts}
              onChange={(headingFontId) => updateConfig('typography', { ...typo, headingFontId })}
            />
            <SelectField
              label={t.typography.headerFooterFont}
              value={typo.headerFooterFontId}
              options={textFonts}
              onChange={(headerFooterFontId) =>
                updateConfig('typography', { ...typo, headerFooterFontId })
              }
            />
            <SelectField
              label={t.typography.captionFont}
              value={typo.captionFontId}
              options={textFonts}
              onChange={(captionFontId) => updateConfig('typography', { ...typo, captionFontId })}
            />
            <SelectField
              label={t.typography.monoFont}
              value={typo.monoFontId}
              options={monoFonts}
              onChange={(monoFontId) => updateConfig('typography', { ...typo, monoFontId })}
            />
          </PanelSection>
        </>
      )}

      {subTab === 'body' && (
        <PanelSection title={t.typography.sizeAndSpacingTitle}>
          <SliderField
            label={t.typography.baseSize}
            value={typo.baseFontSizePt}
            min={8}
            max={16}
            step={0.5}
            decimals={1}
            unit=" pt"
            onChange={(baseFontSizePt) => updateConfig('typography', { ...typo, baseFontSizePt })}
          />

          <div className="space-y-1">
            <span className="text-xs font-medium text-[var(--studio-text)] block">
              {t.typography.alignment}
            </span>
            <SegmentedControl
              value={typo.alignment}
              onChange={(alignment) => updateConfig('typography', { ...typo, alignment })}
              options={[
                { value: 'justify', label: t.typography.justify },
                { value: 'left', label: t.typography.left },
                { value: 'center', label: t.typography.center },
                { value: 'right', label: t.typography.right },
              ]}
            />
          </div>

          <SliderField
            label={t.typography.lineSpacing}
            value={typo.lineSpacing}
            min={1.0}
            max={2.2}
            step={0.05}
            decimals={2}
            unit="×"
            onChange={(lineSpacing) => updateConfig('typography', { ...typo, lineSpacing })}
          />

          <div className="grid grid-cols-5 gap-1">
            {[1.0, 1.15, 1.3, 1.5, 2.0].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => updateConfig('typography', { ...typo, lineSpacing: val })}
                className={`py-1 rounded text-[10px] font-mono border cursor-pointer ${
                  Math.abs(typo.lineSpacing - val) < 0.01
                    ? 'border-amber-600 bg-amber-500/10 text-amber-800 dark:text-amber-300 font-semibold'
                    : 'border-[var(--studio-border)] text-[var(--studio-muted)] hover:text-[var(--studio-text)]'
                }`}
              >
                {val}
              </button>
            ))}
          </div>

          <SliderField
            label={t.typography.letterSpacing}
            value={typo.letterSpacingEm}
            min={-0.04}
            max={0.14}
            step={0.005}
            decimals={3}
            unit=" em"
            onChange={(letterSpacingEm) =>
              updateConfig('typography', { ...typo, letterSpacingEm })
            }
          />

          <SliderField
            label={t.typography.headingLetterSpacing}
            value={typo.headingLetterSpacingEm}
            min={-0.04}
            max={0.2}
            step={0.005}
            decimals={3}
            unit=" em"
            onChange={(headingLetterSpacingEm) =>
              updateConfig('typography', { ...typo, headingLetterSpacingEm })
            }
          />

          <SliderField
            label={t.typography.paragraphIndent}
            value={typo.paragraphIndentMm}
            min={0}
            max={20}
            step={0.5}
            decimals={1}
            unit=" mm"
            onChange={(paragraphIndentMm) =>
              updateConfig('typography', { ...typo, paragraphIndentMm })
            }
          />

          <SliderField
            label={t.typography.paragraphSkip}
            value={typo.paragraphSkipPt}
            min={0}
            max={18}
            step={1}
            unit=" pt"
            onChange={(paragraphSkipPt) =>
              updateConfig('typography', { ...typo, paragraphSkipPt })
            }
          />

          <ToggleSwitch
            label={t.typography.hyphenation}
            hint={t.typography.hyphenationHint}
            checked={typo.hyphenation}
            onChange={(hyphenation) => updateConfig('typography', { ...typo, hyphenation })}
          />

          <ToggleSwitch
            label={t.typography.widowOrphan}
            checked={typo.widowOrphanControl}
            onChange={(widowOrphanControl) =>
              updateConfig('typography', { ...typo, widowOrphanControl })
            }
          />
        </PanelSection>
      )}

      {subTab === 'headings' && (
        <>
          <PanelSection title={t.typography.titleBlockTitle}>
            <SliderField
              label={t.typography.titleSize}
              value={tb.fontSizePt}
              min={12}
              max={32}
              step={0.5}
              decimals={1}
              unit=" pt"
              onChange={(fontSizePt) =>
                updateConfig('typography', { ...typo, titleBlock: { ...tb, fontSizePt } })
              }
            />

            <SegmentedControl<'400' | '600' | '700' | '800'>
              value={tb.weight}
              onChange={(weight) =>
                updateConfig('typography', { ...typo, titleBlock: { ...tb, weight } })
              }
              options={[
                { value: '400', label: 'Regular' },
                { value: '600', label: 'Semi' },
                { value: '700', label: 'Bold' },
                { value: '800', label: 'Extra' },
              ]}
            />

            <SegmentedControl<'left' | 'center' | 'right'>
              value={tb.alignment}
              onChange={(alignment) =>
                updateConfig('typography', { ...typo, titleBlock: { ...tb, alignment } })
              }
              options={[
                { value: 'left', label: t.typography.left },
                { value: 'center', label: t.typography.center },
                { value: 'right', label: t.typography.right },
              ]}
            />

            <SegmentedControl<'none' | 'uppercase' | 'smallcaps'>
              value={tb.transform}
              onChange={(transform) =>
                updateConfig('typography', { ...typo, titleBlock: { ...tb, transform } })
              }
              options={[
                { value: 'none', label: t.typography.transformNone },
                { value: 'uppercase', label: t.typography.transformUpper },
                { value: 'smallcaps', label: t.typography.transformSmallcaps },
              ]}
            />

            <ToggleSwitch
              label={t.typography.titleItalic}
              checked={tb.italic}
              onChange={(italic) =>
                updateConfig('typography', { ...typo, titleBlock: { ...tb, italic } })
              }
            />

            <div className="space-y-1">
              <span className="text-xs font-medium text-[var(--studio-text)] block">
                {t.typography.titleMetaLayout}
              </span>
              <SegmentedControl<'inline' | 'stacked'>
                value={tb.metaLayout}
                onChange={(metaLayout) =>
                  updateConfig('typography', { ...typo, titleBlock: { ...tb, metaLayout } })
                }
                options={[
                  { value: 'inline', label: t.typography.metaInline },
                  { value: 'stacked', label: t.typography.metaStacked },
                ]}
              />
            </div>

            <SliderField
              label={t.typography.titleDivider}
              value={tb.dividerWidthPt}
              min={0}
              max={3}
              step={0.5}
              decimals={1}
              unit=" pt"
              onChange={(dividerWidthPt) =>
                updateConfig('typography', { ...typo, titleBlock: { ...tb, dividerWidthPt } })
              }
            />

            <SliderField
              label={t.typography.titleSpaceAfter}
              value={tb.spaceAfterPt}
              min={4}
              max={36}
              step={2}
              unit=" pt"
              onChange={(spaceAfterPt) =>
                updateConfig('typography', { ...typo, titleBlock: { ...tb, spaceAfterPt } })
              }
            />

            <ColorPickerField
              label={t.typography.textColor}
              value={tb.color}
              swatches={['#111827', '#1c1917', '#92400e', '#1d4ed8', '#0f766e']}
              onChange={(color) =>
                updateConfig('typography', { ...typo, titleBlock: { ...tb, color } })
              }
            />
          </PanelSection>

          <HeadingStyleEditor />
        </>
      )}

      {subTab === 'colors' && (
        <PanelSection title={t.typography.colorsTitle}>
          <ColorPickerField
            label={t.typography.textColor}
            value={typo.textColor}
            swatches={['#111827', '#1c1917', '#1e293b', '#27272a', '#3f3f46']}
            onChange={(textColor) => updateConfig('typography', { ...typo, textColor })}
          />
          <ColorPickerField
            label={t.typography.accentColor}
            value={typo.accentColor}
            swatches={['#92400e', '#1d4ed8', '#0f766e', '#7c2d12', '#6d28d9', '#be123c']}
            onChange={(accentColor) => updateConfig('typography', { ...typo, accentColor })}
          />
          <ColorPickerField
            label={t.typography.paperColor}
            value={typo.pageBgColor}
            swatches={['#ffffff', '#fffdf8', '#faf7f0', '#f8fafc', '#18181b']}
            onChange={(pageBgColor) => updateConfig('typography', { ...typo, pageBgColor })}
          />
        </PanelSection>
      )}
    </div>
  );
};
