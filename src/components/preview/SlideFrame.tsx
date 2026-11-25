import React from 'react';
import { PAPER_SPECS } from '../../data/fonts';
import { useI18n } from '../../i18n/LanguageContext';
import { TemplateConfig } from '../../types/template';
import {
  MM_TO_PX,
  resolvePreviewToken,
  resolveRoleFontFamily,
} from './previewHelpers';

export const SlideFrame: React.FC<{
  config: TemplateConfig;
  slideNumber: number;
  zoom: number;
  showGuides: boolean;
}> = ({ config, slideNumber, zoom, showGuides }) => {
  const { t } = useI18n();
  const spec = PAPER_SPECS[config.page.size] ?? PAPER_SPECS.slide16x9;

  const slideScale = 1.35;
  const widthPx = spec.widthMm * MM_TO_PX * slideScale;
  const heightPx = spec.heightMm * MM_TO_PX * slideScale;
  const padLeft = config.page.margins.left * MM_TO_PX * slideScale;
  const padRight = config.page.margins.right * MM_TO_PX * slideScale;

  const bodyFont = resolveRoleFontFamily(config, 'body');
  const titleFont = resolveRoleFontFamily(config, 'title');
  const headingFont = resolveRoleFontFamily(config, 'heading');
  const hfFont = resolveRoleFontFamily(config, 'headerFooter');

  const typo = config.typography;
  const hf = config.headerFooter;
  const tb = typo.titleBlock;
  const ptToPx = (96 / 72) * slideScale;

  const headerLeft = resolvePreviewToken(
    hf.headerLeft,
    hf.headerCustomLeft,
    config,
    slideNumber,
    2,
    t.preview.slideIntroTitle
  );
  const headerCenter = resolvePreviewToken(
    hf.headerCenter,
    hf.headerCustomCenter,
    config,
    slideNumber,
    2,
    t.preview.slideIntroTitle
  );
  const headerRight = resolvePreviewToken(
    hf.headerRight,
    hf.headerCustomRight,
    config,
    slideNumber,
    2,
    t.preview.slideIntroTitle
  );
  const footerLeft = resolvePreviewToken(
    hf.footerLeft,
    hf.footerCustomLeft,
    config,
    slideNumber,
    2,
    t.preview.slideIntroTitle
  );
  const footerCenter = resolvePreviewToken(
    hf.footerCenter,
    hf.footerCustomCenter,
    config,
    slideNumber,
    2,
    t.preview.slideIntroTitle
  );
  const footerRight = resolvePreviewToken(
    hf.footerRight,
    hf.footerCustomRight,
    config,
    slideNumber,
    2,
    t.preview.slideIntroTitle
  );

  return (
    <div
      style={{
        width: `${widthPx * zoom}px`,
        height: `${heightPx * zoom}px`,
      }}
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
          letterSpacing: `${typo.letterSpacingEm}em`,
        }}
        className="paper-elevation relative overflow-hidden flex flex-col justify-between box-border rounded-sm"
      >
        {showGuides && (
          <div
            style={{ left: `${padLeft}px`, right: `${padRight}px` }}
            className="pointer-events-none absolute inset-y-4 border border-dashed border-sky-500/40 z-20"
          />
        )}

        {/* Headline */}
        {hf.headerEnabled && !(hf.suppressFirstPage && slideNumber === 1) ? (
          <div
            style={{
              paddingLeft: `${padLeft}px`,
              paddingRight: `${padRight}px`,
              fontFamily: hfFont,
              fontSize: `${hf.headerFontSizePt * ptToPx}px`,
              fontWeight: hf.headerBold ? 700 : 400,
              fontStyle: hf.headerItalic ? 'italic' : 'normal',
              textTransform: hf.headerUppercase ? 'uppercase' : 'none',
              color: hf.headerColor,
              borderBottomWidth: hf.headerRulePt > 0 ? `${hf.headerRulePt * ptToPx}px` : 0,
              borderBottomColor: hf.headerRuleColor,
            }}
            className="pt-3 pb-1.5 flex justify-between border-solid"
          >
            <span>{headerLeft}</span>
            <span>{headerCenter}</span>
            <span>{headerRight}</span>
          </div>
        ) : (
          <div className="h-3" />
        )}

        {/* Slide Body */}
        {slideNumber === 1 ? (
          <div
            style={{
              paddingLeft: `${padLeft}px`,
              paddingRight: `${padRight}px`,
              textAlign: tb.alignment,
            }}
            className="my-auto space-y-3"
          >
            <div
              style={{ backgroundColor: typo.accentColor }}
              className={`h-1.5 w-16 rounded-full ${
                tb.alignment === 'center'
                  ? 'mx-auto'
                  : tb.alignment === 'right'
                    ? 'ml-auto'
                    : ''
              }`}
            />
            <h1
              style={{
                fontFamily: titleFont,
                fontWeight: Number(tb.weight),
                fontStyle: tb.italic ? 'italic' : 'normal',
                textTransform: tb.transform === 'uppercase' ? 'uppercase' : 'none',
                color: tb.color,
                letterSpacing: `${typo.headingLetterSpacingEm}em`,
                fontSize: `${tb.fontSizePt * ptToPx}px`,
                lineHeight: 1.15,
              }}
            >
              {config.metadata.title}
            </h1>
            {config.metadata.subtitle && (
              <p
                style={{
                  fontSize: `${tb.subtitleSizePt * ptToPx}px`,
                  fontStyle: tb.subtitleItalic ? 'italic' : 'normal',
                }}
                className="opacity-75"
              >
                {config.metadata.subtitle}
              </p>
            )}
            <div style={{ fontSize: `${tb.metaSizePt * ptToPx}px` }} className="pt-2 opacity-80">
              <strong>{config.metadata.author}</strong> — {config.metadata.institution} (
              {config.metadata.date})
            </div>
          </div>
        ) : (
          <div
            style={{
              paddingLeft: `${padLeft}px`,
              paddingRight: `${padRight}px`,
            }}
            className="flex-1 py-4 flex flex-col justify-center"
          >
            <h2
              style={{
                fontFamily: headingFont,
                fontWeight: typo.headings.h1.bold ? 700 : 400,
                fontStyle: typo.headings.h1.italic ? 'italic' : 'normal',
                color: typo.headings.h1.color,
                fontSize: `${typo.headings.h1.fontSizePt * ptToPx}px`,
              }}
              className="mb-4 flex items-center gap-2"
            >
              {typo.headings.h1.decoration === 'leftBar' && (
                <span
                  style={{ backgroundColor: typo.headings.h1.color }}
                  className="inline-block w-1.5 h-[1em]"
                />
              )}
              <span>{t.preview.slideIntroTitle}</span>
            </h2>

            <div
              style={
                config.columns.count > 1
                  ? {
                      display: 'grid',
                      gridTemplateColumns: `repeat(${config.columns.count}, minmax(0, 1fr))`,
                      gap: `${config.columns.gapMm * MM_TO_PX * slideScale}px`,
                    }
                  : undefined
              }
              className="space-y-3"
            >
              <ul className="list-disc pl-5 space-y-2">
                {t.preview.slideBullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>

              {config.modules.callouts.enabled && (
                <div
                  style={{
                    borderLeft: `3px solid ${typo.accentColor}`,
                    backgroundColor: `${typo.accentColor}12`,
                  }}
                  className="p-3 rounded-r text-[0.9em] self-start"
                >
                  <div style={{ color: typo.accentColor }} className="font-bold mb-1">
                    {t.preview.calloutTitle}
                  </div>
                  <div>{t.preview.calloutBody}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footline */}
        {hf.footerEnabled && !(hf.suppressFirstPage && slideNumber === 1) ? (
          <div
            style={{
              paddingLeft: `${padLeft}px`,
              paddingRight: `${padRight}px`,
              fontFamily: hfFont,
              fontSize: `${hf.footerFontSizePt * ptToPx}px`,
              fontWeight: hf.footerBold ? 700 : 400,
              fontStyle: hf.footerItalic ? 'italic' : 'normal',
              textTransform: hf.footerUppercase ? 'uppercase' : 'none',
              color: hf.footerColor,
              borderTopWidth: hf.footerRulePt > 0 ? `${hf.footerRulePt * ptToPx}px` : 0,
              borderTopColor: hf.footerRuleColor,
            }}
            className="pb-2.5 pt-1.5 flex justify-between border-solid"
          >
            <span>{footerLeft}</span>
            <span>{footerCenter}</span>
            <span>{footerRight}</span>
          </div>
        ) : (
          <div className="h-3" />
        )}
      </div>
    </div>
  );
};
