import React from 'react';
import { PAPER_SPECS } from '../../data/fonts';
import { TemplateConfig } from '../../types/template';
import { MM_TO_PX, resolveRoleFontFamily } from './previewHelpers';

export type FrontMatterPageKind = 'cover' | 'titleSheet' | 'abstract';

export const FrontMatterPageCard: React.FC<{
  kind: FrontMatterPageKind;
  config: TemplateConfig;
  zoom: number;
  showGuides: boolean;
}> = ({ kind, config, zoom, showGuides }) => {
  const spec = PAPER_SPECS[config.page.size] ?? PAPER_SPECS.a4;
  const baseW = config.page.size === 'custom' ? config.page.customWidthMm : spec.widthMm;
  const baseH = config.page.size === 'custom' ? config.page.customHeightMm : spec.heightMm;
  const widthMm = config.page.orientation === 'landscape' ? baseH : baseW;
  const heightMm = config.page.orientation === 'landscape' ? baseW : baseH;
  const toMm = (val: number) => (config.page.unit === 'cm' ? val * 10 : val);
  const topPx = toMm(config.page.margins.top) * MM_TO_PX;
  const bottomPx = toMm(config.page.margins.bottom) * MM_TO_PX;
  const leftPx = toMm(config.page.margins.left) * MM_TO_PX;
  const rightPx = toMm(config.page.margins.right) * MM_TO_PX;
  const widthPx = widthMm * MM_TO_PX;
  const heightPx = heightMm * MM_TO_PX;

  const ptToPx = 96 / 72;
  const typo = config.typography;
  const fm = config.frontMatter;
  const bodyFont = resolveRoleFontFamily(config, 'body');
  const titleFont = resolveRoleFontFamily(config, 'title');
  const headingFont = resolveRoleFontFamily(config, 'heading');

  const logo = config.headerFooter.headerLogo;
  const cp = fm.coverPage;
  const ts = fm.titleSheet;
  const ab = fm.abstractBlock;

  return (
    <div
      style={{ width: `${widthPx * zoom}px`, height: `${heightPx * zoom}px` }}
      className="relative shrink-0 transition-[width,height] duration-150"
    >
      <div
        style={{
          width: `${widthPx}px`,
          height: `${heightPx}px`,
          transform: `scale(${zoom})`,
          transformOrigin: 'top left',
          backgroundColor: typo.pageBgColor,
          color: typo.textColor,
          fontFamily: bodyFont,
          fontSize: `${typo.baseFontSizePt * ptToPx}px`,
          lineHeight: typo.lineSpacing,
          padding: `${topPx}px ${rightPx}px ${bottomPx}px ${leftPx}px`,
        }}
        className="paper-elevation relative overflow-hidden box-border flex flex-col"
      >
        {showGuides && (
          <div className="pointer-events-none absolute inset-0 z-20">
            <div
              style={{
                top: `${topPx}px`,
                bottom: `${bottomPx}px`,
                left: `${leftPx}px`,
                right: `${rightPx}px`,
              }}
              className="absolute border border-dashed border-sky-500/45"
            />
          </div>
        )}

        {kind === 'cover' && (
          <div
            className={`flex-1 flex flex-col justify-between items-center text-center ${
              cp.borderFrame ? 'border border-current p-6' : ''
            }`}
          >
            <div className="space-y-2">
              {cp.showInstitution && (
                <div className="font-bold uppercase tracking-wide">
                  {config.metadata.institution}
                </div>
              )}
              {cp.showLogo && (
                <div className="py-2 flex justify-center">
                  {logo.enabled && logo.dataUrl ? (
                    <img
                      src={logo.dataUrl}
                      alt="Logo"
                      style={{ height: `${cp.logoHeightMm * MM_TO_PX}px` }}
                      className="object-contain"
                    />
                  ) : (
                    <span className="px-3 py-1.5 border border-dashed border-current/40 text-xs font-mono opacity-65">
                      LOGO
                    </span>
                  )}
                </div>
              )}
              {cp.showCourse && cp.course && <div className="opacity-85">{cp.course}</div>}
              <div
                className={`pt-10 font-bold ${cp.uppercaseAuthor ? 'uppercase' : ''}`}
              >
                {config.metadata.author}
              </div>
            </div>

            <div className="my-auto py-8 space-y-2 max-w-[90%]">
              <div
                style={{
                  fontFamily: titleFont,
                  fontSize: `${typo.titleBlock.fontSizePt * ptToPx}px`,
                  color: typo.titleBlock.color,
                }}
                className={`font-bold leading-snug ${cp.uppercaseTitle ? 'uppercase' : ''}`}
              >
                {config.metadata.title}
              </div>
              {config.metadata.subtitle && (
                <div className="opacity-75 text-[0.92em]">{config.metadata.subtitle}</div>
              )}
            </div>

            <div className="space-y-0.5">
              {cp.showCity && cp.city && <div>{cp.city}</div>}
              <div>{config.metadata.date}</div>
            </div>
          </div>
        )}

        {kind === 'titleSheet' && (
          <div className="flex-1 flex flex-col justify-between items-center text-center">
            <div className={`font-bold ${cp.uppercaseAuthor ? 'uppercase' : ''}`}>
              {config.metadata.author}
            </div>

            <div className="my-auto w-full space-y-10">
              <div className="space-y-2 max-w-[90%] mx-auto">
                <div
                  style={{
                    fontFamily: titleFont,
                    fontSize: `${typo.titleBlock.fontSizePt * ptToPx}px`,
                    color: typo.titleBlock.color,
                  }}
                  className={`font-bold leading-snug ${cp.uppercaseTitle ? 'uppercase' : ''}`}
                >
                  {config.metadata.title}
                </div>
                {config.metadata.subtitle && (
                  <div className="opacity-75 text-[0.92em]">{config.metadata.subtitle}</div>
                )}
              </div>

              <div className="flex justify-end w-full">
                <div
                  style={{
                    width: `${Math.round(ts.natureWidthRatio * 100)}%`,
                    fontSize: `${10 * ptToPx}px`,
                    lineHeight: 1.15,
                  }}
                  className="text-left space-y-2"
                >
                  {ts.natureNote && <p>{ts.natureNote}</p>}
                  {ts.advisorName && (
                    <p>
                      <strong>{ts.advisorLabel}</strong> {ts.advisorName}
                    </p>
                  )}
                  {ts.coadvisorName && (
                    <p>
                      <strong>{ts.coadvisorLabel}</strong> {ts.coadvisorName}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {ts.showCityAndDate ? (
              <div className="space-y-0.5">
                {cp.city && <div>{cp.city}</div>}
                <div>{config.metadata.date}</div>
              </div>
            ) : (
              <div />
            )}
          </div>
        )}

        {kind === 'abstract' && (
          <div className="space-y-6">
            <div className="space-y-2.5">
              <div
                style={{ fontFamily: headingFont }}
                className="text-center font-bold uppercase tracking-wide"
              >
                {ab.title}
              </div>
              <div
                style={{
                  fontSize: `${ab.fontSizePt * ptToPx}px`,
                  lineHeight: ab.lineSpacing,
                  textAlign: 'justify',
                }}
                className="space-y-2"
              >
                <p>{ab.text}</p>
                {ab.keywords && (
                  <p>
                    <strong>{ab.keywordsLabel}</strong> {ab.keywords}
                  </p>
                )}
              </div>
            </div>

            {ab.includeEnglishAbstract && (
              <div className="pt-4 border-t border-black/10 space-y-2.5">
                <div
                  style={{ fontFamily: headingFont }}
                  className="text-center font-bold uppercase tracking-wide"
                >
                  {ab.englishTitle}
                </div>
                <div
                  style={{
                    fontSize: `${ab.fontSizePt * ptToPx}px`,
                    lineHeight: ab.lineSpacing,
                    textAlign: 'justify',
                  }}
                  className="space-y-2"
                >
                  <p>{ab.englishText}</p>
                  {ab.englishKeywords && (
                    <p>
                      <strong>{ab.englishKeywordsLabel}</strong> {ab.englishKeywords}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
