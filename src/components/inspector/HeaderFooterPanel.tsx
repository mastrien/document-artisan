import React, { useRef, useState } from 'react';
import { Image as ImageIcon, Trash2, Upload } from 'lucide-react';
import { useI18n } from '../../i18n/LanguageContext';
import { useTemplate } from '../../state/TemplateContext';
import {
  FirstPageHeaderMode,
  HeaderFooterLogoConfig,
  HeaderFooterToken,
  LogoPlacement,
  LogoSlot,
  PageNumberStyle,
  RuleStyle,
  SectionNumberStyle,
} from '../../types/template';
import {
  ColorPickerField,
  PanelSection,
  SegmentedControl,
  SelectField,
  SliderField,
  ToggleSwitch,
} from '../ui/Controls';

type HFSubTab = 'header' | 'footer' | 'firstPage' | 'numbering';

const LogoEditorCard: React.FC<{
  target: 'header' | 'footer';
  logo: HeaderFooterLogoConfig;
  onChange: (next: HeaderFooterLogoConfig) => void;
}> = ({ target, logo, onChange }) => {
  const { t } = useI18n();
  const { uploadHeaderFooterLogo, removeHeaderFooterLogo } = useTemplate();
  const fileRef = useRef<HTMLInputElement | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadHeaderFooterLogo(target, file);
      e.target.value = '';
    }
  };

  return (
    <div className="p-2.5 rounded-xl border border-[var(--studio-border)] bg-[var(--studio-bg)] space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--studio-muted)] flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
          {t.headerFooter.logoTitle}
        </span>
        <ToggleSwitch
          label=""
          checked={logo.enabled}
          onChange={(enabled) => onChange({ ...logo, enabled })}
        />
      </div>

      {logo.enabled && (
        <div className="space-y-2.5">
          <input
            ref={fileRef}
            type="file"
            accept=".png,.jpg,.jpeg,.webp,.svg"
            onChange={handleUpload}
            className="hidden"
          />

          {logo.dataUrl ? (
            <div className="flex items-center justify-between gap-2 p-2 rounded-lg border border-[var(--studio-border)] bg-[var(--studio-elevated)]">
              <div className="flex items-center gap-2 min-w-0">
                <img
                  src={logo.dataUrl}
                  alt={logo.fileName ?? 'Logo'}
                  className="h-8 max-w-20 object-contain rounded bg-white p-0.5 border border-black/10"
                />
                <span className="text-[11px] font-mono truncate text-[var(--studio-text)]">
                  {logo.fileName}
                </span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="px-2 py-1 rounded text-[10px] font-medium border border-[var(--studio-border)] hover:border-amber-600/50 cursor-pointer"
                >
                  Trocar
                </button>
                <button
                  type="button"
                  onClick={() => removeHeaderFooterLogo(target)}
                  title={t.headerFooter.logoRemove}
                  className="p-1 text-[var(--studio-muted)] hover:text-red-500 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full flex flex-col items-center gap-1 py-2 px-3 rounded-lg border border-dashed border-amber-600/50 bg-[var(--studio-elevated)] hover:bg-amber-500/5 text-xs font-medium text-[var(--studio-text)] cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-amber-600" />
                {t.headerFooter.logoUpload}
              </span>
              <span className="text-[10px] text-[var(--studio-muted)]">
                {t.headerFooter.logoPlaceholderChip}
              </span>
            </button>
          )}

          <div className="space-y-1">
            <span className="text-[11px] font-medium text-[var(--studio-muted)] block">
              {t.headerFooter.logoSlot}
            </span>
            <SegmentedControl<LogoSlot>
              value={logo.slot}
              onChange={(slot) => onChange({ ...logo, slot })}
              options={[
                { value: 'left', label: t.headerFooter.leftSlot },
                { value: 'center', label: t.headerFooter.centerSlot },
                { value: 'right', label: t.headerFooter.rightSlot },
              ]}
            />
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-medium text-[var(--studio-muted)] block">
              {t.headerFooter.logoPlacement}
            </span>
            <SegmentedControl<LogoPlacement>
              value={logo.placement}
              onChange={(placement) => onChange({ ...logo, placement })}
              options={[
                { value: 'beforeText', label: t.headerFooter.placeBefore },
                { value: 'afterText', label: t.headerFooter.placeAfter },
                { value: 'replaceSlot', label: t.headerFooter.placeReplace },
              ]}
            />
          </div>

          <SliderField
            label={t.headerFooter.logoHeight}
            value={logo.heightMm}
            min={4}
            max={24}
            step={0.5}
            decimals={1}
            unit=" mm"
            onChange={(heightMm) => onChange({ ...logo, heightMm })}
          />

          <SliderField
            label={t.headerFooter.logoVOffset}
            value={logo.verticalOffsetMm}
            min={-5}
            max={5}
            step={0.5}
            decimals={1}
            unit=" mm"
            onChange={(verticalOffsetMm) => onChange({ ...logo, verticalOffsetMm })}
          />

          <SliderField
            label={t.headerFooter.logoGap}
            value={logo.gapMm}
            min={0}
            max={12}
            step={0.5}
            decimals={1}
            unit=" mm"
            onChange={(gapMm) => onChange({ ...logo, gapMm })}
          />

          <SliderField
            label={t.headerFooter.logoOpacity}
            value={Math.round(logo.opacity * 100)}
            min={20}
            max={100}
            step={5}
            unit="%"
            onChange={(pct) => onChange({ ...logo, opacity: pct / 100 })}
          />
        </div>
      )}
    </div>
  );
};

export const HeaderFooterPanel: React.FC = () => {
  const { t } = useI18n();
  const { config, updateConfig } = useTemplate();
  const hf = config.headerFooter;
  const num = config.numbering;
  const [subTab, setSubTab] = useState<HFSubTab>('header');

  const tokenOptions: { value: HeaderFooterToken; label: string }[] = (
    Object.keys(t.headerFooter.tokens) as HeaderFooterToken[]
  ).map((key) => ({
    value: key,
    label: t.headerFooter.tokens[key],
  }));

  return (
    <div className="space-y-4">
      <SegmentedControl<HFSubTab>
        value={subTab}
        onChange={setSubTab}
        options={[
          { value: 'header', label: t.headerFooter.subtabs.header },
          { value: 'footer', label: t.headerFooter.subtabs.footer },
          { value: 'firstPage', label: t.headerFooter.subtabs.firstPage },
          { value: 'numbering', label: t.headerFooter.subtabs.numbering },
        ]}
      />

      {subTab === 'header' && (
        <PanelSection title={t.headerFooter.headerTitle}>
          <ToggleSwitch
            label={t.headerFooter.enableHeader}
            checked={hf.headerEnabled}
            onChange={(headerEnabled) => updateConfig('headerFooter', { ...hf, headerEnabled })}
          />

          {hf.headerEnabled && (
            <div className="space-y-3 pt-1">
              <LogoEditorCard
                target="header"
                logo={hf.headerLogo}
                onChange={(headerLogo) => updateConfig('headerFooter', { ...hf, headerLogo })}
              />

              {(
                [
                  ['headerLeft', 'headerCustomLeft', t.headerFooter.leftSlot],
                  ['headerCenter', 'headerCustomCenter', t.headerFooter.centerSlot],
                  ['headerRight', 'headerCustomRight', t.headerFooter.rightSlot],
                ] as const
              ).map(([tokenKey, customKey, slotLabel]) => (
                <div key={tokenKey} className="space-y-1.5">
                  <SelectField
                    label={slotLabel}
                    value={hf[tokenKey]}
                    options={tokenOptions}
                    onChange={(v) =>
                      updateConfig('headerFooter', {
                        ...hf,
                        [tokenKey]: v as HeaderFooterToken,
                      })
                    }
                  />
                  {hf[tokenKey] === 'custom' && (
                    <textarea
                      rows={2}
                      placeholder={t.headerFooter.customTextSlot}
                      value={hf[customKey]}
                      onChange={(e) =>
                        updateConfig('headerFooter', { ...hf, [customKey]: e.target.value })
                      }
                      className="w-full rounded-md border border-[var(--studio-border)] bg-[var(--studio-elevated)] px-2.5 py-1.5 text-xs text-[var(--studio-text)] resize-y"
                    />
                  )}
                </div>
              ))}

              <SliderField
                label={t.headerFooter.fontSize}
                value={hf.headerFontSizePt}
                min={7}
                max={13}
                step={0.5}
                decimals={1}
                unit=" pt"
                onChange={(headerFontSizePt) =>
                  updateConfig('headerFooter', { ...hf, headerFontSizePt })
                }
              />

              <div className="grid grid-cols-3 gap-1.5">
                <ToggleSwitch
                  label={t.headerFooter.bold}
                  checked={hf.headerBold}
                  onChange={(headerBold) => updateConfig('headerFooter', { ...hf, headerBold })}
                />
                <ToggleSwitch
                  label={t.headerFooter.italic}
                  checked={hf.headerItalic}
                  onChange={(headerItalic) => updateConfig('headerFooter', { ...hf, headerItalic })}
                />
                <ToggleSwitch
                  label="CAPS"
                  checked={hf.headerUppercase}
                  onChange={(headerUppercase) =>
                    updateConfig('headerFooter', { ...hf, headerUppercase })
                  }
                />
              </div>

              <ColorPickerField
                label={t.headerFooter.textColor}
                value={hf.headerColor}
                swatches={['#374151', '#6b7280', '#111827', '#92400e', '#0f766e']}
                onChange={(headerColor) => updateConfig('headerFooter', { ...hf, headerColor })}
              />

              <ToggleSwitch
                label={t.headerFooter.bgEnable}
                checked={hf.headerBgEnabled}
                onChange={(headerBgEnabled) =>
                  updateConfig('headerFooter', { ...hf, headerBgEnabled })
                }
              />
              {hf.headerBgEnabled && (
                <ColorPickerField
                  label={t.headerFooter.bgColor}
                  value={hf.headerBgColor}
                  swatches={['#f8fafc', '#f0fdfa', '#fffbeb', '#eff6ff', '#f3f4f6']}
                  onChange={(headerBgColor) =>
                    updateConfig('headerFooter', { ...hf, headerBgColor })
                  }
                />
              )}

              <SliderField
                label={t.headerFooter.ruleThickness}
                value={hf.headerRulePt}
                min={0}
                max={2.5}
                step={0.1}
                decimals={1}
                unit=" pt"
                onChange={(headerRulePt) => updateConfig('headerFooter', { ...hf, headerRulePt })}
              />

              {hf.headerRulePt > 0 && (
                <>
                  <div className="space-y-1">
                    <span className="text-xs font-medium text-[var(--studio-text)] block">
                      {t.headerFooter.ruleStyle}
                    </span>
                    <SegmentedControl<RuleStyle>
                      value={hf.headerRuleStyle}
                      onChange={(headerRuleStyle) =>
                        updateConfig('headerFooter', { ...hf, headerRuleStyle })
                      }
                      options={[
                        { value: 'solid', label: t.headerFooter.ruleSolid },
                        { value: 'double', label: t.headerFooter.ruleDouble },
                        { value: 'dashed', label: t.headerFooter.ruleDashed },
                      ]}
                    />
                  </div>
                  <ColorPickerField
                    label={t.headerFooter.ruleColor}
                    value={hf.headerRuleColor}
                    swatches={['#9ca3af', '#d1d5db', '#111827', '#0f766e', '#b45309']}
                    onChange={(headerRuleColor) =>
                      updateConfig('headerFooter', { ...hf, headerRuleColor })
                    }
                  />
                </>
              )}

              <SliderField
                label={t.headerFooter.headsep}
                value={hf.headerSepMm}
                min={2}
                max={20}
                step={1}
                unit=" mm"
                onChange={(headerSepMm) => updateConfig('headerFooter', { ...hf, headerSepMm })}
              />

              <SliderField
                label={t.headerFooter.headheight}
                value={hf.headHeightMm}
                min={0}
                max={30}
                step={1}
                unit=" mm"
                onChange={(headHeightMm) => updateConfig('headerFooter', { ...hf, headHeightMm })}
              />
            </div>
          )}
        </PanelSection>
      )}

      {subTab === 'footer' && (
        <PanelSection title={t.headerFooter.footerTitle}>
          <ToggleSwitch
            label={t.headerFooter.enableFooter}
            checked={hf.footerEnabled}
            onChange={(footerEnabled) => updateConfig('headerFooter', { ...hf, footerEnabled })}
          />

          {hf.footerEnabled && (
            <div className="space-y-3 pt-1">
              <LogoEditorCard
                target="footer"
                logo={hf.footerLogo}
                onChange={(footerLogo) => updateConfig('headerFooter', { ...hf, footerLogo })}
              />

              {(
                [
                  ['footerLeft', 'footerCustomLeft', t.headerFooter.leftSlot],
                  ['footerCenter', 'footerCustomCenter', t.headerFooter.centerSlot],
                  ['footerRight', 'footerCustomRight', t.headerFooter.rightSlot],
                ] as const
              ).map(([tokenKey, customKey, slotLabel]) => (
                <div key={tokenKey} className="space-y-1.5">
                  <SelectField
                    label={slotLabel}
                    value={hf[tokenKey]}
                    options={tokenOptions}
                    onChange={(v) =>
                      updateConfig('headerFooter', {
                        ...hf,
                        [tokenKey]: v as HeaderFooterToken,
                      })
                    }
                  />
                  {hf[tokenKey] === 'custom' && (
                    <textarea
                      rows={2}
                      placeholder={t.headerFooter.customTextSlot}
                      value={hf[customKey]}
                      onChange={(e) =>
                        updateConfig('headerFooter', { ...hf, [customKey]: e.target.value })
                      }
                      className="w-full rounded-md border border-[var(--studio-border)] bg-[var(--studio-elevated)] px-2.5 py-1.5 text-xs text-[var(--studio-text)] resize-y"
                    />
                  )}
                </div>
              ))}

              <SliderField
                label={t.headerFooter.fontSize}
                value={hf.footerFontSizePt}
                min={7}
                max={13}
                step={0.5}
                decimals={1}
                unit=" pt"
                onChange={(footerFontSizePt) =>
                  updateConfig('headerFooter', { ...hf, footerFontSizePt })
                }
              />

              <div className="grid grid-cols-3 gap-1.5">
                <ToggleSwitch
                  label={t.headerFooter.bold}
                  checked={hf.footerBold}
                  onChange={(footerBold) => updateConfig('headerFooter', { ...hf, footerBold })}
                />
                <ToggleSwitch
                  label={t.headerFooter.italic}
                  checked={hf.footerItalic}
                  onChange={(footerItalic) => updateConfig('headerFooter', { ...hf, footerItalic })}
                />
                <ToggleSwitch
                  label="CAPS"
                  checked={hf.footerUppercase}
                  onChange={(footerUppercase) =>
                    updateConfig('headerFooter', { ...hf, footerUppercase })
                  }
                />
              </div>

              <ColorPickerField
                label={t.headerFooter.textColor}
                value={hf.footerColor}
                swatches={['#4b5563', '#6b7280', '#111827', '#92400e', '#0f766e']}
                onChange={(footerColor) => updateConfig('headerFooter', { ...hf, footerColor })}
              />

              <ToggleSwitch
                label={t.headerFooter.bgEnable}
                checked={hf.footerBgEnabled}
                onChange={(footerBgEnabled) =>
                  updateConfig('headerFooter', { ...hf, footerBgEnabled })
                }
              />
              {hf.footerBgEnabled && (
                <ColorPickerField
                  label={t.headerFooter.bgColor}
                  value={hf.footerBgColor}
                  swatches={['#f8fafc', '#f0fdfa', '#fffbeb', '#eff6ff', '#f3f4f6']}
                  onChange={(footerBgColor) =>
                    updateConfig('headerFooter', { ...hf, footerBgColor })
                  }
                />
              )}

              <SliderField
                label={t.headerFooter.ruleThickness}
                value={hf.footerRulePt}
                min={0}
                max={2.5}
                step={0.1}
                decimals={1}
                unit=" pt"
                onChange={(footerRulePt) => updateConfig('headerFooter', { ...hf, footerRulePt })}
              />

              {hf.footerRulePt > 0 && (
                <>
                  <div className="space-y-1">
                    <span className="text-xs font-medium text-[var(--studio-text)] block">
                      {t.headerFooter.ruleStyle}
                    </span>
                    <SegmentedControl<RuleStyle>
                      value={hf.footerRuleStyle}
                      onChange={(footerRuleStyle) =>
                        updateConfig('headerFooter', { ...hf, footerRuleStyle })
                      }
                      options={[
                        { value: 'solid', label: t.headerFooter.ruleSolid },
                        { value: 'double', label: t.headerFooter.ruleDouble },
                        { value: 'dashed', label: t.headerFooter.ruleDashed },
                      ]}
                    />
                  </div>
                  <ColorPickerField
                    label={t.headerFooter.ruleColor}
                    value={hf.footerRuleColor}
                    swatches={['#9ca3af', '#cbd5e1', '#111827', '#0f766e', '#b45309']}
                    onChange={(footerRuleColor) =>
                      updateConfig('headerFooter', { ...hf, footerRuleColor })
                    }
                  />
                </>
              )}

              <SliderField
                label={t.headerFooter.footskip}
                value={hf.footerSkipMm}
                min={3}
                max={22}
                step={1}
                unit=" mm"
                onChange={(footerSkipMm) => updateConfig('headerFooter', { ...hf, footerSkipMm })}
              />
            </div>
          )}
        </PanelSection>
      )}

      {subTab === 'firstPage' && (
        <div className="space-y-4">
          <PanelSection title={t.headerFooter.firstPageTitle} hint={t.headerFooter.fpHint}>
            <div className="space-y-1">
              <span className="text-xs font-medium text-[var(--studio-text)] block">
                {t.headerFooter.firstPageMode}
              </span>
              <SegmentedControl<FirstPageHeaderMode>
                value={hf.firstPageMode}
                onChange={(firstPageMode) =>
                  updateConfig('headerFooter', {
                    ...hf,
                    firstPageMode,
                    suppressFirstPage: firstPageMode === 'empty',
                  })
                }
                options={[
                  { value: 'same', label: t.headerFooter.fpSame },
                  { value: 'empty', label: t.headerFooter.fpEmpty },
                  { value: 'custom', label: t.headerFooter.fpCustom },
                ]}
              />
            </div>
          </PanelSection>

          {hf.firstPageMode === 'custom' && (
            <>
              <PanelSection title={t.headerFooter.fpHeaderSection}>
                <ToggleSwitch
                  label={t.headerFooter.enableHeader}
                  checked={hf.firstPage.headerEnabled}
                  onChange={(headerEnabled) =>
                    updateConfig('headerFooter', {
                      ...hf,
                      firstPage: { ...hf.firstPage, headerEnabled },
                    })
                  }
                />
                {hf.firstPage.headerEnabled && (
                  <div className="space-y-2.5 pt-1">
                    <ToggleSwitch
                      label={t.headerFooter.fpShowLogo}
                      checked={hf.firstPage.showHeaderLogo}
                      onChange={(showHeaderLogo) =>
                        updateConfig('headerFooter', {
                          ...hf,
                          firstPage: { ...hf.firstPage, showHeaderLogo },
                        })
                      }
                    />
                    <ToggleSwitch
                      label={t.headerFooter.fpShowRule}
                      checked={hf.firstPage.showHeaderRule}
                      onChange={(showHeaderRule) =>
                        updateConfig('headerFooter', {
                          ...hf,
                          firstPage: { ...hf.firstPage, showHeaderRule },
                        })
                      }
                    />
                    {(
                      [
                        ['headerLeft', 'headerCustomLeft', t.headerFooter.leftSlot],
                        ['headerCenter', 'headerCustomCenter', t.headerFooter.centerSlot],
                        ['headerRight', 'headerCustomRight', t.headerFooter.rightSlot],
                      ] as const
                    ).map(([tokenKey, customKey, slotLabel]) => (
                      <div key={tokenKey} className="space-y-1.5">
                        <SelectField
                          label={slotLabel}
                          value={hf.firstPage[tokenKey]}
                          options={tokenOptions}
                          onChange={(v) =>
                            updateConfig('headerFooter', {
                              ...hf,
                              firstPage: {
                                ...hf.firstPage,
                                [tokenKey]: v as HeaderFooterToken,
                              },
                            })
                          }
                        />
                        {hf.firstPage[tokenKey] === 'custom' && (
                          <textarea
                            rows={2}
                            placeholder={t.headerFooter.customTextSlot}
                            value={hf.firstPage[customKey]}
                            onChange={(e) =>
                              updateConfig('headerFooter', {
                                ...hf,
                                firstPage: { ...hf.firstPage, [customKey]: e.target.value },
                              })
                            }
                            className="w-full rounded-md border border-[var(--studio-border)] bg-[var(--studio-elevated)] px-2.5 py-1.5 text-xs text-[var(--studio-text)] resize-y"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </PanelSection>

              <PanelSection title={t.headerFooter.fpFooterSection}>
                <ToggleSwitch
                  label={t.headerFooter.enableFooter}
                  checked={hf.firstPage.footerEnabled}
                  onChange={(footerEnabled) =>
                    updateConfig('headerFooter', {
                      ...hf,
                      firstPage: { ...hf.firstPage, footerEnabled },
                    })
                  }
                />
                {hf.firstPage.footerEnabled && (
                  <div className="space-y-2.5 pt-1">
                    <ToggleSwitch
                      label={t.headerFooter.fpShowLogo}
                      checked={hf.firstPage.showFooterLogo}
                      onChange={(showFooterLogo) =>
                        updateConfig('headerFooter', {
                          ...hf,
                          firstPage: { ...hf.firstPage, showFooterLogo },
                        })
                      }
                    />
                    <ToggleSwitch
                      label={t.headerFooter.fpShowRule}
                      checked={hf.firstPage.showFooterRule}
                      onChange={(showFooterRule) =>
                        updateConfig('headerFooter', {
                          ...hf,
                          firstPage: { ...hf.firstPage, showFooterRule },
                        })
                      }
                    />
                    {(
                      [
                        ['footerLeft', 'footerCustomLeft', t.headerFooter.leftSlot],
                        ['footerCenter', 'footerCustomCenter', t.headerFooter.centerSlot],
                        ['footerRight', 'footerCustomRight', t.headerFooter.rightSlot],
                      ] as const
                    ).map(([tokenKey, customKey, slotLabel]) => (
                      <div key={tokenKey} className="space-y-1.5">
                        <SelectField
                          label={slotLabel}
                          value={hf.firstPage[tokenKey]}
                          options={tokenOptions}
                          onChange={(v) =>
                            updateConfig('headerFooter', {
                              ...hf,
                              firstPage: {
                                ...hf.firstPage,
                                [tokenKey]: v as HeaderFooterToken,
                              },
                            })
                          }
                        />
                        {hf.firstPage[tokenKey] === 'custom' && (
                          <textarea
                            rows={2}
                            placeholder={t.headerFooter.customTextSlot}
                            value={hf.firstPage[customKey]}
                            onChange={(e) =>
                              updateConfig('headerFooter', {
                                ...hf,
                                firstPage: { ...hf.firstPage, [customKey]: e.target.value },
                              })
                            }
                            className="w-full rounded-md border border-[var(--studio-border)] bg-[var(--studio-elevated)] px-2.5 py-1.5 text-xs text-[var(--studio-text)] resize-y"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </PanelSection>
            </>
          )}
        </div>
      )}

      {subTab === 'numbering' && (
        <PanelSection title={t.headerFooter.numberingTitle}>
          <SelectField
            label={t.headerFooter.pageNumberStyle}
            value={num.pageStyle}
            options={(Object.keys(t.headerFooter.pageStyles) as PageNumberStyle[]).map((k) => ({
              value: k,
              label: t.headerFooter.pageStyles[k],
            }))}
            onChange={(v) =>
              updateConfig('numbering', { ...num, pageStyle: v as PageNumberStyle })
            }
          />

          <div className="space-y-1">
            <span className="text-xs font-medium text-[var(--studio-text)] block">
              {t.headerFooter.sectionDepth}
            </span>
            <SegmentedControl<0 | 1 | 2 | 3>
              value={num.sectionDepth}
              onChange={(sectionDepth) => updateConfig('numbering', { ...num, sectionDepth })}
              options={[
                { value: 0, label: '0' },
                { value: 1, label: '1' },
                { value: 2, label: '2' },
                { value: 3, label: '3' },
              ]}
            />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-medium text-[var(--studio-text)] block">
              {t.headerFooter.sectionStyle}
            </span>
            <SegmentedControl<SectionNumberStyle>
              value={num.sectionStyle}
              onChange={(sectionStyle) => updateConfig('numbering', { ...num, sectionStyle })}
              options={[
                { value: 'arabic', label: '1.1' },
                { value: 'roman', label: 'I.1' },
                { value: 'none', label: 'None' },
              ]}
            />
          </div>

          {config.documentType !== 'slides' && (
            <>
              <ToggleSwitch
                label={t.headerFooter.includeToc}
                checked={num.includeToc}
                onChange={(includeToc) => updateConfig('numbering', { ...num, includeToc })}
              />

              {num.includeToc && (
                <div className="space-y-1">
                  <span className="text-xs font-medium text-[var(--studio-text)] block">
                    {t.headerFooter.tocDepth}
                  </span>
                  <SegmentedControl<1 | 2 | 3>
                    value={num.tocDepth}
                    onChange={(tocDepth) => updateConfig('numbering', { ...num, tocDepth })}
                    options={[
                      { value: 1, label: '1' },
                      { value: 2, label: '2' },
                      { value: 3, label: '3' },
                    ]}
                  />
                </div>
              )}
            </>
          )}
        </PanelSection>
      )}
    </div>
  );
};
