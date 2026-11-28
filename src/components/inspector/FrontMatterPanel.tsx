import React from 'react';
import { useI18n } from '../../i18n/LanguageContext';
import { useTemplate } from '../../state/TemplateContext';
import { PanelSection, SliderField, ToggleSwitch } from '../ui/Controls';

export const FrontMatterPanel: React.FC = () => {
  const { t } = useI18n();
  const { config, updateConfig } = useTemplate();
  const fm = config.frontMatter;
  const cp = fm.coverPage;
  const ts = fm.titleSheet;
  const ab = fm.abstractBlock;

  const setFrontMatter = (patch: Partial<typeof fm>) =>
    updateConfig('frontMatter', { ...fm, ...patch });

  return (
    <div className="space-y-4">
      {/* Cover Page */}
      <PanelSection title={t.frontMatter.coverTitle}>
        <ToggleSwitch
          label={t.frontMatter.coverEnable}
          checked={cp.enabled}
          onChange={(enabled) => setFrontMatter({ coverPage: { ...cp, enabled } })}
        />
        {cp.enabled && (
          <div className="space-y-2.5 pl-2 border-l-2 border-amber-600/30">
            <ToggleSwitch
              label={t.frontMatter.showInstitution}
              checked={cp.showInstitution}
              onChange={(showInstitution) => setFrontMatter({ coverPage: { ...cp, showInstitution } })}
            />
            <ToggleSwitch
              label={t.frontMatter.showLogo}
              checked={cp.showLogo}
              onChange={(showLogo) => setFrontMatter({ coverPage: { ...cp, showLogo } })}
            />
            {cp.showLogo && (
              <SliderField
                label={t.frontMatter.logoHeight}
                value={cp.logoHeightMm}
                min={8}
                max={40}
                step={1}
                unit=" mm"
                onChange={(logoHeightMm) => setFrontMatter({ coverPage: { ...cp, logoHeightMm } })}
              />
            )}
            <ToggleSwitch
              label={t.frontMatter.showCourse}
              checked={cp.showCourse}
              onChange={(showCourse) => setFrontMatter({ coverPage: { ...cp, showCourse } })}
            />
            {cp.showCourse && (
              <label className="block space-y-1">
                <span className="text-[11px] font-medium text-[var(--studio-muted)] block">
                  {t.frontMatter.course}
                </span>
                <input
                  type="text"
                  value={cp.course}
                  onChange={(e) => setFrontMatter({ coverPage: { ...cp, course: e.target.value } })}
                  className="w-full rounded-md border border-[var(--studio-border)] bg-[var(--studio-elevated)] px-2.5 py-1.5 text-xs text-[var(--studio-text)]"
                />
              </label>
            )}
            <ToggleSwitch
              label={t.frontMatter.showCity}
              checked={cp.showCity}
              onChange={(showCity) => setFrontMatter({ coverPage: { ...cp, showCity } })}
            />
            {cp.showCity && (
              <label className="block space-y-1">
                <span className="text-[11px] font-medium text-[var(--studio-muted)] block">
                  {t.frontMatter.city}
                </span>
                <input
                  type="text"
                  value={cp.city}
                  onChange={(e) => setFrontMatter({ coverPage: { ...cp, city: e.target.value } })}
                  className="w-full rounded-md border border-[var(--studio-border)] bg-[var(--studio-elevated)] px-2.5 py-1.5 text-xs text-[var(--studio-text)]"
                />
              </label>
            )}
            <ToggleSwitch
              label={t.frontMatter.uppercaseAuthor}
              checked={cp.uppercaseAuthor}
              onChange={(uppercaseAuthor) => setFrontMatter({ coverPage: { ...cp, uppercaseAuthor } })}
            />
            <ToggleSwitch
              label={t.frontMatter.uppercaseTitle}
              checked={cp.uppercaseTitle}
              onChange={(uppercaseTitle) => setFrontMatter({ coverPage: { ...cp, uppercaseTitle } })}
            />
            <ToggleSwitch
              label={t.frontMatter.borderFrame}
              checked={cp.borderFrame}
              onChange={(borderFrame) => setFrontMatter({ coverPage: { ...cp, borderFrame } })}
            />
          </div>
        )}
      </PanelSection>

      {/* Title Sheet */}
      <PanelSection title={t.frontMatter.titleSheetTitle}>
        <ToggleSwitch
          label={t.frontMatter.titleSheetEnable}
          checked={ts.enabled}
          onChange={(enabled) => setFrontMatter({ titleSheet: { ...ts, enabled } })}
        />
        {ts.enabled && (
          <div className="space-y-2.5 pl-2 border-l-2 border-amber-600/30">
            <label className="block space-y-1">
              <span className="text-[11px] font-medium text-[var(--studio-muted)] block">
                {t.frontMatter.natureNote}
              </span>
              <textarea
                rows={3}
                value={ts.natureNote}
                onChange={(e) => setFrontMatter({ titleSheet: { ...ts, natureNote: e.target.value } })}
                className="w-full rounded-md border border-[var(--studio-border)] bg-[var(--studio-elevated)] px-2.5 py-1.5 text-xs text-[var(--studio-text)]"
              />
            </label>
            <SliderField
              label={t.frontMatter.natureWidth}
              value={ts.natureWidthRatio}
              min={0.35}
              max={0.7}
              step={0.05}
              decimals={2}
              unit="×"
              onChange={(natureWidthRatio) =>
                setFrontMatter({ titleSheet: { ...ts, natureWidthRatio } })
              }
            />
            <div className="grid grid-cols-2 gap-2">
              <label className="block space-y-1">
                <span className="text-[11px] font-medium text-[var(--studio-muted)] block">
                  {t.frontMatter.advisorLabel}
                </span>
                <input
                  type="text"
                  value={ts.advisorLabel}
                  onChange={(e) =>
                    setFrontMatter({ titleSheet: { ...ts, advisorLabel: e.target.value } })
                  }
                  className="w-full rounded-md border border-[var(--studio-border)] bg-[var(--studio-elevated)] px-2 py-1 text-xs text-[var(--studio-text)]"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-[11px] font-medium text-[var(--studio-muted)] block">
                  {t.frontMatter.advisorName}
                </span>
                <input
                  type="text"
                  value={ts.advisorName}
                  onChange={(e) =>
                    setFrontMatter({ titleSheet: { ...ts, advisorName: e.target.value } })
                  }
                  className="w-full rounded-md border border-[var(--studio-border)] bg-[var(--studio-elevated)] px-2 py-1 text-xs text-[var(--studio-text)]"
                />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <label className="block space-y-1">
                <span className="text-[11px] font-medium text-[var(--studio-muted)] block">
                  {t.frontMatter.coadvisorLabel}
                </span>
                <input
                  type="text"
                  value={ts.coadvisorLabel}
                  onChange={(e) =>
                    setFrontMatter({ titleSheet: { ...ts, coadvisorLabel: e.target.value } })
                  }
                  className="w-full rounded-md border border-[var(--studio-border)] bg-[var(--studio-elevated)] px-2 py-1 text-xs text-[var(--studio-text)]"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-[11px] font-medium text-[var(--studio-muted)] block">
                  {t.frontMatter.coadvisorName}
                </span>
                <input
                  type="text"
                  value={ts.coadvisorName}
                  onChange={(e) =>
                    setFrontMatter({ titleSheet: { ...ts, coadvisorName: e.target.value } })
                  }
                  className="w-full rounded-md border border-[var(--studio-border)] bg-[var(--studio-elevated)] px-2 py-1 text-xs text-[var(--studio-text)]"
                />
              </label>
            </div>
            <ToggleSwitch
              label={t.frontMatter.showCityDate}
              checked={ts.showCityAndDate}
              onChange={(showCityAndDate) =>
                setFrontMatter({ titleSheet: { ...ts, showCityAndDate } })
              }
            />
          </div>
        )}
      </PanelSection>

      {/* Abstract & Keywords */}
      <PanelSection title={t.frontMatter.abstractTitle}>
        <ToggleSwitch
          label={t.frontMatter.abstractEnable}
          checked={ab.enabled}
          onChange={(enabled) => setFrontMatter({ abstractBlock: { ...ab, enabled } })}
        />
        {ab.enabled && (
          <div className="space-y-2.5 pl-2 border-l-2 border-amber-600/30">
            <ToggleSwitch
              label={t.frontMatter.separatePage}
              checked={ab.onSeparatePage}
              onChange={(onSeparatePage) =>
                setFrontMatter({ abstractBlock: { ...ab, onSeparatePage } })
              }
            />
            <SliderField
              label={t.frontMatter.fontSize}
              value={ab.fontSizePt}
              min={8.5}
              max={13}
              step={0.5}
              decimals={1}
              unit=" pt"
              onChange={(fontSizePt) => setFrontMatter({ abstractBlock: { ...ab, fontSizePt } })}
            />
            <SliderField
              label={t.frontMatter.lineSpacing}
              value={ab.lineSpacing}
              min={1.0}
              max={1.6}
              step={0.05}
              decimals={2}
              unit="×"
              onChange={(lineSpacing) => setFrontMatter({ abstractBlock: { ...ab, lineSpacing } })}
            />
            <label className="block space-y-1">
              <span className="text-[11px] font-medium text-[var(--studio-muted)] block">
                {t.frontMatter.heading}
              </span>
              <input
                type="text"
                value={ab.title}
                onChange={(e) => setFrontMatter({ abstractBlock: { ...ab, title: e.target.value } })}
                className="w-full rounded-md border border-[var(--studio-border)] bg-[var(--studio-elevated)] px-2 py-1 text-xs text-[var(--studio-text)]"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-[11px] font-medium text-[var(--studio-muted)] block">
                {t.frontMatter.bodyText}
              </span>
              <textarea
                rows={3}
                value={ab.text}
                onChange={(e) => setFrontMatter({ abstractBlock: { ...ab, text: e.target.value } })}
                className="w-full rounded-md border border-[var(--studio-border)] bg-[var(--studio-elevated)] px-2 py-1 text-xs text-[var(--studio-text)]"
              />
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label className="block space-y-1">
                <span className="text-[11px] font-medium text-[var(--studio-muted)] block">
                  {t.frontMatter.keywordsLabel}
                </span>
                <input
                  type="text"
                  value={ab.keywordsLabel}
                  onChange={(e) =>
                    setFrontMatter({ abstractBlock: { ...ab, keywordsLabel: e.target.value } })
                  }
                  className="w-full rounded-md border border-[var(--studio-border)] bg-[var(--studio-elevated)] px-2 py-1 text-xs text-[var(--studio-text)]"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-[11px] font-medium text-[var(--studio-muted)] block">
                  {t.frontMatter.keywords}
                </span>
                <input
                  type="text"
                  value={ab.keywords}
                  onChange={(e) =>
                    setFrontMatter({ abstractBlock: { ...ab, keywords: e.target.value } })
                  }
                  className="w-full rounded-md border border-[var(--studio-border)] bg-[var(--studio-elevated)] px-2 py-1 text-xs text-[var(--studio-text)]"
                />
              </label>
            </div>
            <ToggleSwitch
              label={t.frontMatter.includeEnglish}
              checked={ab.includeEnglishAbstract}
              onChange={(includeEnglishAbstract) =>
                setFrontMatter({ abstractBlock: { ...ab, includeEnglishAbstract } })
              }
            />
            {ab.includeEnglishAbstract && (
              <div className="space-y-2 pt-1 border-t border-[var(--studio-border)]">
                <label className="block space-y-1">
                  <span className="text-[11px] font-medium text-[var(--studio-muted)] block">
                    {t.frontMatter.englishHeading}
                  </span>
                  <input
                    type="text"
                    value={ab.englishTitle}
                    onChange={(e) =>
                      setFrontMatter({ abstractBlock: { ...ab, englishTitle: e.target.value } })
                    }
                    className="w-full rounded-md border border-[var(--studio-border)] bg-[var(--studio-elevated)] px-2 py-1 text-xs text-[var(--studio-text)]"
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-[11px] font-medium text-[var(--studio-muted)] block">
                    {t.frontMatter.englishText}
                  </span>
                  <textarea
                    rows={3}
                    value={ab.englishText}
                    onChange={(e) =>
                      setFrontMatter({ abstractBlock: { ...ab, englishText: e.target.value } })
                    }
                    className="w-full rounded-md border border-[var(--studio-border)] bg-[var(--studio-elevated)] px-2 py-1 text-xs text-[var(--studio-text)]"
                  />
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="block space-y-1">
                    <span className="text-[11px] font-medium text-[var(--studio-muted)] block">
                      {t.frontMatter.englishKeywordsLabel}
                    </span>
                    <input
                      type="text"
                      value={ab.englishKeywordsLabel}
                      onChange={(e) =>
                        setFrontMatter({
                          abstractBlock: { ...ab, englishKeywordsLabel: e.target.value },
                        })
                      }
                      className="w-full rounded-md border border-[var(--studio-border)] bg-[var(--studio-elevated)] px-2 py-1 text-xs text-[var(--studio-text)]"
                    />
                  </label>
                  <label className="block space-y-1">
                    <span className="text-[11px] font-medium text-[var(--studio-muted)] block">
                      {t.frontMatter.englishKeywords}
                    </span>
                    <input
                      type="text"
                      value={ab.englishKeywords}
                      onChange={(e) =>
                        setFrontMatter({
                          abstractBlock: { ...ab, englishKeywords: e.target.value },
                        })
                      }
                      className="w-full rounded-md border border-[var(--studio-border)] bg-[var(--studio-elevated)] px-2 py-1 text-xs text-[var(--studio-text)]"
                    />
                  </label>
                </div>
              </div>
            )}
          </div>
        )}
      </PanelSection>

      {/* Lists & Flow */}
      <PanelSection title={t.frontMatter.structureTitle}>
        <ToggleSwitch
          label={t.frontMatter.includeToc}
          checked={config.numbering.includeToc}
          onChange={(includeToc) =>
            updateConfig('numbering', { ...config.numbering, includeToc })
          }
        />
        <ToggleSwitch
          label={t.frontMatter.includeLof}
          checked={fm.includeListOfFigures}
          onChange={(includeListOfFigures) => setFrontMatter({ includeListOfFigures })}
        />
        <ToggleSwitch
          label={t.frontMatter.includeLot}
          checked={fm.includeListOfTables}
          onChange={(includeListOfTables) => setFrontMatter({ includeListOfTables })}
        />
        <ToggleSwitch
          label={t.frontMatter.sectionBreak}
          checked={fm.sectionStartsNewPage}
          onChange={(sectionStartsNewPage) => setFrontMatter({ sectionStartsNewPage })}
        />
        <ToggleSwitch
          label={t.frontMatter.startNumberingAtBody}
          checked={fm.startNumberingAtBody}
          onChange={(startNumberingAtBody) => setFrontMatter({ startNumberingAtBody })}
        />
      </PanelSection>
    </div>
  );
};
