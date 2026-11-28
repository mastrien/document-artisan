import React from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { PAPER_SPECS } from '../../data/fonts';
import { useI18n } from '../../i18n/LanguageContext';
import { HeadingLevelStyle, HeaderFooterLogoConfig, LogoSlot, TemplateConfig } from '../../types/template';
import {
  formatCaptionSeparator,
  formatInlineCitation,
  formatSectionLabel,
  MM_TO_PX,
  resolvePreviewToken,
  resolveRoleFontFamily,
} from './previewHelpers';

function buildHeadingCss(
  style: HeadingLevelStyle,
  fontFamily: string,
  letterSpacingEm: number,
  ptToPx: number
): React.CSSProperties {
  const base: React.CSSProperties = {
    fontFamily,
    fontSize: `${style.fontSizePt * ptToPx}px`,
    fontWeight: style.bold ? 700 : 400,
    fontStyle: style.italic ? 'italic' : 'normal',
    letterSpacing: `${letterSpacingEm}em`,
    textTransform: style.transform === 'uppercase' ? 'uppercase' : 'none',
    fontVariant: style.transform === 'smallcaps' ? 'small-caps' : 'normal',
    textAlign: style.alignment,
    color: style.color,
    marginTop: `${style.spaceBeforePt * ptToPx}px`,
    marginBottom: `${style.spaceAfterPt * ptToPx}px`,
  };

  if (style.decoration === 'box') {
    const bw = style.box.borderWidthPt * ptToPx;
    return {
      ...base,
      display: style.box.fullWidth ? 'block' : 'table',
      marginLeft:
        !style.box.fullWidth && (style.alignment === 'center' || style.alignment === 'right')
          ? 'auto'
          : undefined,
      marginRight: !style.box.fullWidth && style.alignment === 'center' ? 'auto' : undefined,
      backgroundColor: style.box.bgColor,
      padding: `${style.box.paddingYPt * ptToPx}px ${style.box.paddingXPt * ptToPx}px`,
      borderRadius: `${style.box.radiusPt * ptToPx}px`,
      borderStyle: 'solid',
      borderColor: style.box.borderColor,
      borderWidth: style.box.borderLeftOnly ? `0 0 0 ${bw}px` : `${bw}px`,
    };
  }

  return {
    ...base,
    borderBottom: style.decoration === 'bottomRule' ? `1px solid ${style.color}` : 'none',
    paddingBottom: style.decoration === 'bottomRule' ? '2px' : undefined,
  };
}

export const PaperPage: React.FC<{
  config: TemplateConfig;
  pageNumber: number;
  zoom: number;
  showGuides: boolean;
}> = ({ config, pageNumber, zoom, showGuides }) => {
  const { t } = useI18n();
  const spec = PAPER_SPECS[config.page.size] ?? PAPER_SPECS.a4;

  const baseWidthMm =
    config.page.size === 'custom' ? config.page.customWidthMm : spec.widthMm;
  const baseHeightMm =
    config.page.size === 'custom' ? config.page.customHeightMm : spec.heightMm;

  const widthMm = config.page.orientation === 'landscape' ? baseHeightMm : baseWidthMm;
  const heightMm = config.page.orientation === 'landscape' ? baseWidthMm : baseHeightMm;

  const toMm = (val: number) => (config.page.unit === 'cm' ? val * 10 : val);
  const topMm = toMm(config.page.margins.top);
  const bottomMm = toMm(config.page.margins.bottom);
  const rawLeftMm = toMm(config.page.margins.left);
  const rawRightMm = toMm(config.page.margins.right);

  const isEvenPage = pageNumber % 2 === 0;
  const leftMm = config.page.twoside && isEvenPage ? rawRightMm : rawLeftMm;
  const rightMm = config.page.twoside && isEvenPage ? rawLeftMm : rawRightMm;

  const widthPx = widthMm * MM_TO_PX;
  const heightPx = heightMm * MM_TO_PX;
  const topPx = topMm * MM_TO_PX;
  const bottomPx = bottomMm * MM_TO_PX;
  const leftPx = leftMm * MM_TO_PX;
  const rightPx = rightMm * MM_TO_PX;

  const bodyFont = resolveRoleFontFamily(config, 'body');
  const titleFont = resolveRoleFontFamily(config, 'title');
  const headingFont = resolveRoleFontFamily(config, 'heading');
  const hfFont = resolveRoleFontFamily(config, 'headerFooter');
  const captionFont = resolveRoleFontFamily(config, 'caption');
  const monoFont = resolveRoleFontFamily(config, 'mono');

  const typo = config.typography;
  const hf = config.headerFooter;
  const m = config.modules;
  const ptToPx = 96 / 72;
  const baseFontPx = typo.baseFontSizePt * ptToPx;
  const activeSectionTitle = pageNumber === 1 ? t.preview.sec1 : t.preview.sec2;
  const fm = config.frontMatter;
  const hidePageHeaderFooterForAbnt =
    fm.startNumberingAtBody && (fm.coverPage.enabled || fm.titleSheet.enabled);

  const isCustomFirstPage = pageNumber === 1 && hf.firstPageMode === 'custom';
  const isEmptyFirstPage = pageNumber === 1 && hf.firstPageMode === 'empty';

  const headerActive = hidePageHeaderFooterForAbnt
    ? pageNumber > 1 && hf.headerEnabled
    : isEmptyFirstPage
      ? false
      : isCustomFirstPage
        ? hf.firstPage.headerEnabled
        : hf.headerEnabled;
  const footerActive = hidePageHeaderFooterForAbnt
    ? pageNumber > 1 && hf.footerEnabled
    : isEmptyFirstPage
      ? false
      : isCustomFirstPage
        ? hf.firstPage.footerEnabled
        : hf.footerEnabled;

  const hLeftToken = isCustomFirstPage ? hf.firstPage.headerLeft : hf.headerLeft;
  const hCenterToken = isCustomFirstPage ? hf.firstPage.headerCenter : hf.headerCenter;
  const hRightToken = isCustomFirstPage ? hf.firstPage.headerRight : hf.headerRight;
  const hCustomLeft = isCustomFirstPage ? hf.firstPage.headerCustomLeft : hf.headerCustomLeft;
  const hCustomCenter = isCustomFirstPage ? hf.firstPage.headerCustomCenter : hf.headerCustomCenter;
  const hCustomRight = isCustomFirstPage ? hf.firstPage.headerCustomRight : hf.headerCustomRight;

  const fLeftToken = isCustomFirstPage ? hf.firstPage.footerLeft : hf.footerLeft;
  const fCenterToken = isCustomFirstPage ? hf.firstPage.footerCenter : hf.footerCenter;
  const fRightToken = isCustomFirstPage ? hf.firstPage.footerRight : hf.footerRight;
  const fCustomLeft = isCustomFirstPage ? hf.firstPage.footerCustomLeft : hf.footerCustomLeft;
  const fCustomCenter = isCustomFirstPage ? hf.firstPage.footerCustomCenter : hf.footerCustomCenter;
  const fCustomRight = isCustomFirstPage ? hf.firstPage.footerCustomRight : hf.footerCustomRight;

  const headerLeft = resolvePreviewToken(
    hLeftToken,
    hCustomLeft,
    config,
    pageNumber,
    2,
    activeSectionTitle
  );
  const headerCenter = resolvePreviewToken(
    hCenterToken,
    hCustomCenter,
    config,
    pageNumber,
    2,
    activeSectionTitle
  );
  const headerRight = resolvePreviewToken(
    hRightToken,
    hCustomRight,
    config,
    pageNumber,
    2,
    activeSectionTitle
  );

  const footerLeft = resolvePreviewToken(
    fLeftToken,
    fCustomLeft,
    config,
    pageNumber,
    2,
    activeSectionTitle
  );
  const footerCenter = resolvePreviewToken(
    fCenterToken,
    fCustomCenter,
    config,
    pageNumber,
    2,
    activeSectionTitle
  );
  const footerRight = resolvePreviewToken(
    fRightToken,
    fCustomRight,
    config,
    pageNumber,
    2,
    activeSectionTitle
  );

  const showHeaderLogo =
    hf.headerLogo.enabled && (!isCustomFirstPage || hf.firstPage.showHeaderLogo);
  const showFooterLogo =
    hf.footerLogo.enabled && (!isCustomFirstPage || hf.firstPage.showFooterLogo);
  const showHeaderRule =
    hf.headerRulePt > 0 && (!isCustomFirstPage || hf.firstPage.showHeaderRule);
  const showFooterRule =
    hf.footerRulePt > 0 && (!isCustomFirstPage || hf.firstPage.showFooterRule);

  const renderSlotWithLogo = (
    slot: LogoSlot,
    text: string,
    logo: HeaderFooterLogoConfig,
    logoEnabled: boolean,
    alignClass: string
  ) => {
    const hasLogoHere = logoEnabled && logo.slot === slot;
    const logoNode = hasLogoHere ? (
      logo.dataUrl ? (
        <img
          src={logo.dataUrl}
          alt={logo.fileName ?? 'Logo'}
          style={{
            height: `${logo.heightMm * MM_TO_PX}px`,
            transform: `translateY(${-logo.verticalOffsetMm * MM_TO_PX}px)`,
            opacity: logo.opacity,
          }}
          className="object-contain shrink-0"
        />
      ) : (
        <span
          style={{
            height: `${Math.min(logo.heightMm, 12) * MM_TO_PX}px`,
            transform: `translateY(${-logo.verticalOffsetMm * MM_TO_PX}px)`,
            opacity: logo.opacity,
          }}
          className="px-1.5 inline-flex items-center justify-center text-[9px] font-mono border border-current/40 rounded-xs opacity-70 shrink-0"
        >
          LOGO
        </span>
      )
    ) : null;

    const textNode =
      text && (!hasLogoHere || logo.placement !== 'replaceSlot') ? (
        <span className="whitespace-pre-line leading-tight">{text}</span>
      ) : null;

    const justify =
      alignClass === 'text-right'
        ? 'justify-end'
        : alignClass === 'text-center'
          ? 'justify-center'
          : 'justify-start';

    return (
      <span
        style={{ gap: `${logo.gapMm * MM_TO_PX}px` }}
        className={`flex items-center ${justify} ${alignClass} min-w-0`}
      >
        {hasLogoHere && logo.placement === 'afterText' ? (
          <>
            {textNode}
            {logoNode}
          </>
        ) : (
          <>
            {logoNode}
            {textNode}
          </>
        )}
      </span>
    );
  };

  const paragraphStyle: React.CSSProperties = {
    textIndent: typo.paragraphIndentMm > 0 ? `${typo.paragraphIndentMm * MM_TO_PX}px` : '0px',
    marginBottom: `${typo.paragraphSkipPt * ptToPx}px`,
  };

  const h1Style = buildHeadingCss(
    typo.headings.h1,
    headingFont,
    typo.headingLetterSpacingEm,
    ptToPx
  );
  const h2Style = buildHeadingCss(
    typo.headings.h2,
    headingFont,
    typo.headingLetterSpacingEm,
    ptToPx
  );
  const h3Style = buildHeadingCss(
    typo.headings.h3,
    headingFont,
    typo.headingLetterSpacingEm,
    ptToPx
  );

  const sec1Num = formatSectionLabel(1, [1], typo.headings.h1, config);
  const subSec1Num = formatSectionLabel(2, [1, 1], typo.headings.h2, config);
  const subSubSec1Num = formatSectionLabel(3, [1, 1, 1], typo.headings.h3, config);
  const sec2Num = formatSectionLabel(1, [2], typo.headings.h1, config);

  const columnsStyle: React.CSSProperties =
    config.columns.count > 1
      ? {
          columnCount: config.columns.count,
          columnGap: `${config.columns.gapMm * MM_TO_PX}px`,
          columnRule:
            config.columns.ruleWidthPt > 0
              ? `${config.columns.ruleWidthPt * ptToPx}px solid ${config.columns.ruleColor}`
              : 'none',
        }
      : {};

  const headsepPx = hf.headerSepMm * MM_TO_PX;
  const footskipPx = hf.footerSkipMm * MM_TO_PX;

  const tb = typo.titleBlock;

  const renderHeadingContent = (
    numPrefix: string,
    titleText: string,
    levelStyle: HeadingLevelStyle
  ) => (
    <span className="inline-flex items-center gap-2">
      {levelStyle.decoration === 'leftBar' && (
        <span
          style={{ backgroundColor: levelStyle.color }}
          className="inline-block w-1 h-[1.05em] shrink-0"
        />
      )}
      <span>
        {numPrefix}
        {titleText}
      </span>
    </span>
  );

  const renderFigureCaption = () => {
    const img = m.images;
    const labelText = `${img.captionPrefix} 1`;
    return (
      <figcaption
        style={{
          fontFamily: captionFont,
          fontSize: `${img.captionFontSizePt * ptToPx}px`,
          textAlign: img.captionAlign,
          color: img.captionColor,
          fontStyle: img.captionItalic ? 'italic' : 'normal',
        }}
        className={img.captionPosition === 'top' ? 'mb-1.5' : 'mt-1.5'}
      >
        <span
          style={{
            fontWeight: img.captionLabelBold ? 700 : 400,
            textTransform: img.captionLabelUppercase ? 'uppercase' : 'none',
          }}
        >
          {labelText}
        </span>
        {formatCaptionSeparator(img.captionSeparator)}
        {t.preview.figCaptionText}
      </figcaption>
    );
  };

  const renderTableCaption = () => {
    const tbl = m.tables;
    const labelText = `${tbl.captionPrefix} 1`;
    return (
      <div
        style={{
          fontFamily: captionFont,
          fontSize: `${tbl.captionFontSizePt * ptToPx}px`,
          textAlign: tbl.captionAlign,
          color: tbl.captionColor,
        }}
        className={tbl.captionPosition === 'top' ? 'mb-1.5' : 'mt-1.5'}
      >
        <span style={{ fontWeight: tbl.captionLabelBold ? 700 : 400 }}>{labelText}</span>
        {formatCaptionSeparator(tbl.captionSeparator)}
        {t.preview.tableCaptionText}
      </div>
    );
  };

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
          fontSize: `${baseFontPx}px`,
          lineHeight: typo.lineSpacing,
          letterSpacing: `${typo.letterSpacingEm}em`,
          textAlign: typo.alignment,
          hyphens: typo.hyphenation ? 'auto' : 'manual',
          paddingTop: `${topPx}px`,
          paddingBottom: `${bottomPx}px`,
          paddingLeft: `${leftPx}px`,
          paddingRight: `${rightPx}px`,
        }}
        lang={config.documentLanguage === 'brazilian' ? 'pt-BR' : 'en'}
        className="paper-elevation relative overflow-hidden box-border"
      >
        {/* Optional Page Border Frame */}
        {config.page.pageFrame.enabled && (
          <div
            style={{
              top: `${config.page.pageFrame.insetMm * MM_TO_PX}px`,
              bottom: `${config.page.pageFrame.insetMm * MM_TO_PX}px`,
              left: `${config.page.pageFrame.insetMm * MM_TO_PX}px`,
              right: `${config.page.pageFrame.insetMm * MM_TO_PX}px`,
              borderWidth: `${config.page.pageFrame.widthPt * ptToPx}px`,
              borderColor: config.page.pageFrame.color,
            }}
            className="pointer-events-none absolute border-solid z-10"
          />
        )}

        {/* Visual Margin & Column Guides */}
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
            {config.columns.count > 1 && (
              <div
                style={{
                  top: `${topPx}px`,
                  bottom: `${bottomPx}px`,
                  left: `${leftPx}px`,
                  right: `${rightPx}px`,
                  gap: `${config.columns.gapMm * MM_TO_PX}px`,
                  gridTemplateColumns: `repeat(${config.columns.count}, minmax(0, 1fr))`,
                }}
                className="absolute grid"
              >
                {Array.from({ length: config.columns.count }).map((_, idx) => (
                  <div key={idx} className="border-x border-dotted border-amber-500/30 h-full" />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Running Header */}
        {headerActive && (
          <div
            style={{
              bottom: `${heightPx - topPx + headsepPx}px`,
              left: `${leftPx}px`,
              right: `${rightPx}px`,
              fontFamily: hfFont,
              fontSize: `${hf.headerFontSizePt * ptToPx}px`,
              fontWeight: hf.headerBold ? 700 : 400,
              fontStyle: hf.headerItalic ? 'italic' : 'normal',
              textTransform: hf.headerUppercase ? 'uppercase' : 'none',
              color: hf.headerColor,
              backgroundColor: hf.headerBgEnabled ? hf.headerBgColor : 'transparent',
              padding: hf.headerBgEnabled ? '3px 6px' : undefined,
              borderBottomWidth: showHeaderRule
                ? `${(hf.headerRuleStyle === 'double' ? Math.max(2.4, hf.headerRulePt * 2.5) : hf.headerRulePt) * ptToPx}px`
                : 0,
              borderBottomStyle: hf.headerRuleStyle,
              borderBottomColor: hf.headerRuleColor,
            }}
            className="absolute pb-1 flex items-center justify-between gap-2"
          >
            <div className="flex-1 min-w-0">
              {renderSlotWithLogo(
                'left',
                config.page.twoside && isEvenPage && !isCustomFirstPage ? headerRight : headerLeft,
                hf.headerLogo,
                showHeaderLogo,
                'text-left'
              )}
            </div>
            <div className="shrink-0 max-w-[40%]">
              {renderSlotWithLogo('center', headerCenter, hf.headerLogo, showHeaderLogo, 'text-center')}
            </div>
            <div className="flex-1 min-w-0">
              {renderSlotWithLogo(
                'right',
                config.page.twoside && isEvenPage && !isCustomFirstPage ? headerLeft : headerRight,
                hf.headerLogo,
                showHeaderLogo,
                'text-right'
              )}
            </div>
          </div>
        )}

        {/* Page Body */}
        <div className="relative h-full overflow-hidden flex flex-col justify-between">
          <div className="min-h-0">
          {pageNumber === 1 ? (
            <>
              {/* Title Block (shown when dedicated cover & title sheet are disabled) */}
              {!fm.coverPage.enabled && !fm.titleSheet.enabled && (
              <div
                style={{
                  marginBottom: `${tb.spaceAfterPt * ptToPx}px`,
                  borderBottomWidth: tb.dividerWidthPt > 0 ? `${tb.dividerWidthPt * ptToPx}px` : 0,
                  borderBottomColor: tb.dividerColor,
                }}
                className="pb-2.5 border-solid"
              >
                <div
                  style={{
                    textAlign: tb.alignment,
                    ...(tb.box.enabled
                      ? {
                          backgroundColor: tb.box.bgColor,
                          borderStyle: 'solid',
                          borderColor: tb.box.borderColor,
                          borderWidth: tb.box.borderLeftOnly
                            ? `0 0 0 ${tb.box.borderWidthPt * ptToPx}px`
                            : `${tb.box.borderWidthPt * ptToPx}px`,
                          padding: `${tb.box.paddingYPt * ptToPx}px ${tb.box.paddingXPt * ptToPx}px`,
                          borderRadius: `${tb.box.radiusPt * ptToPx}px`,
                        }
                      : {}),
                  }}
                >
                  {config.metadata.documentCode && (
                    <div
                      style={{ color: typo.accentColor, fontFamily: headingFont }}
                      className="text-[10px] font-bold uppercase tracking-wider mb-1"
                    >
                      {config.metadata.documentCode}
                    </div>
                  )}
                  {config.documentType === 'book' && (
                    <div
                      style={{ color: typo.accentColor, fontFamily: headingFont }}
                      className="text-[11px] uppercase tracking-[0.2em] font-semibold mb-1.5"
                    >
                      {config.metadata.institution}
                    </div>
                  )}
                  <h1
                    style={{
                      fontFamily: titleFont,
                      fontSize: `${tb.fontSizePt * ptToPx}px`,
                      fontWeight: Number(tb.weight),
                      fontStyle: tb.italic ? 'italic' : 'normal',
                      textTransform: tb.transform === 'uppercase' ? 'uppercase' : 'none',
                      fontVariant: tb.transform === 'smallcaps' ? 'small-caps' : 'normal',
                      letterSpacing: `${typo.headingLetterSpacingEm}em`,
                      lineHeight: 1.2,
                      color: tb.color,
                    }}
                  >
                    {config.metadata.title}
                  </h1>
                  {config.metadata.subtitle && (
                    <div
                      style={{
                        fontSize: `${tb.subtitleSizePt * ptToPx}px`,
                        fontStyle: tb.subtitleItalic ? 'italic' : 'normal',
                      }}
                      className="mt-1 opacity-75"
                    >
                      {config.metadata.subtitle}
                    </div>
                  )}
                </div>

                <div
                  style={{
                    fontSize: `${tb.metaSizePt * ptToPx}px`,
                    textAlign: tb.metaAlignment,
                  }}
                  className="mt-2.5 opacity-85"
                >
                  {tb.metaLayout === 'stacked' ? (
                    <div className="space-y-1">
                      {config.metadata.authors.length > 0 ? (
                        config.metadata.authors.map((a, idx) => (
                          <div key={idx} className="leading-snug">
                            <span className="font-semibold">{a.name}</span>
                            {a.role && <span className="italic opacity-80"> — {a.role}</span>}
                            {a.institution && <div>{a.institution}</div>}
                            {a.email && <div className="text-[0.88em] opacity-75">{a.email}</div>}
                          </div>
                        ))
                      ) : (
                        <>
                          <div className="font-semibold">{config.metadata.author}</div>
                          <div>{config.metadata.institution}</div>
                        </>
                      )}
                      {config.metadata.department && <div>{config.metadata.department}</div>}
                      <div>
                        {[config.metadata.location, config.metadata.date]
                          .filter(Boolean)
                          .join(' · ')}
                      </div>
                    </div>
                  ) : (
                    <span>
                      <strong>{config.metadata.author}</strong> · {config.metadata.institution}
                      {config.metadata.department ? ` · ${config.metadata.department}` : ''}
                      {config.metadata.location ? ` · ${config.metadata.location}` : ''} ·{' '}
                      {config.metadata.date}
                    </span>
                  )}
                </div>
              </div>
              )}

              {/* Inline Abstract + Keywords */}
              {fm.abstractBlock.enabled && !fm.abstractBlock.onSeparatePage && (
                <div
                  style={{
                    fontSize: `${fm.abstractBlock.fontSizePt * ptToPx}px`,
                    lineHeight: fm.abstractBlock.lineSpacing,
                    marginBottom: `${10 * ptToPx}px`,
                  }}
                  className="space-y-1 opacity-90"
                >
                  <div style={{ fontFamily: headingFont }} className="font-bold text-center uppercase">
                    {fm.abstractBlock.title}
                  </div>
                  <p>{fm.abstractBlock.text}</p>
                  {fm.abstractBlock.keywords && (
                    <p>
                      <strong>{fm.abstractBlock.keywordsLabel}</strong> {fm.abstractBlock.keywords}
                    </p>
                  )}
                </div>
              )}

              {/* Optional TOC / LOF / LOT */}
              {(config.numbering.includeToc || fm.includeListOfFigures || fm.includeListOfTables) && (
                <div
                  style={{
                    fontSize: `${baseFontPx * 0.86}px`,
                    marginBottom: `${10 * ptToPx}px`,
                  }}
                  className="p-2.5 rounded border border-black/10 bg-black/[0.02] space-y-1"
                >
                  {(fm.includeListOfFigures || fm.includeListOfTables) && (
                    <div className="flex flex-wrap gap-2 pb-1 mb-1 border-b border-black/10 text-[0.9em] opacity-80">
                      {fm.includeListOfFigures && <span>• {t.preview.lofTitle}</span>}
                      {fm.includeListOfTables && <span>• {t.preview.lotTitle}</span>}
                    </div>
                  )}
                  {config.numbering.includeToc && (
                    <>
                      <div
                        style={{ fontFamily: headingFont, color: typo.headings.h1.color }}
                        className="font-bold mb-1 text-[0.95em]"
                      >
                        {t.preview.tocTitle}
                      </div>
                      <div className="flex justify-between">
                        <span>
                          {sec1Num}
                          {t.preview.sec1}
                        </span>
                        <span className="opacity-60">1</span>
                      </div>
                      {config.numbering.tocDepth >= 2 && (
                        <div className="flex justify-between pl-4 opacity-80">
                          <span>
                            {subSec1Num}
                            {t.preview.subsec1}
                          </span>
                          <span className="opacity-60">1</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>
                          {sec2Num}
                          {t.preview.sec2}
                        </span>
                        <span className="opacity-60">2</span>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Flowed Multi-Column Content */}
              <div style={columnsStyle}>
                <h2 style={h1Style}>
                  {renderHeadingContent(sec1Num, t.preview.sec1, typo.headings.h1)}
                </h2>

                <p style={paragraphStyle}>
                  {t.preview.p1}
                  {m.footnotes.enabled && <sup className="font-semibold ml-0.5">1</sup>}{' '}
                  {m.citations.enabled && (
                    <span
                      style={{
                        color:
                          m.hyperref.enabled && m.hyperref.coloredLinks
                            ? typo.accentColor
                            : undefined,
                      }}
                    >
                      {formatInlineCitation(config)}
                    </span>
                  )}
                </p>

                {m.longQuotes.enabled && (
                  <blockquote
                    style={{
                      marginLeft: `${m.longQuotes.indentLeftMm * MM_TO_PX}px`,
                      fontSize: `${m.longQuotes.fontSizePt * ptToPx}px`,
                      lineHeight: m.longQuotes.lineSpacing,
                      fontStyle: m.longQuotes.italic ? 'italic' : 'normal',
                      borderLeft: m.longQuotes.leftBorder ? `2px solid ${typo.accentColor}` : 'none',
                      paddingLeft: m.longQuotes.leftBorder ? '8px' : undefined,
                      marginTop: '6px',
                      marginBottom: '6px',
                    }}
                    className="break-inside-avoid"
                  >
                    {t.preview.longQuoteSample}
                  </blockquote>
                )}

                <h3 style={h2Style}>
                  {renderHeadingContent(subSec1Num, t.preview.subsec1, typo.headings.h2)}
                </h3>

                <p style={paragraphStyle}>{t.preview.p2}</p>

                {m.lists.enabled && (
                  <div
                    style={{
                      marginLeft: `${m.lists.leftMarginMm * MM_TO_PX}px`,
                      marginBottom: '6px',
                    }}
                    className="break-inside-avoid"
                  >
                    {t.preview.listSamples.map((item, idx) => {
                      const marker =
                        m.lists.bulletStyle === 'dash'
                          ? '–'
                          : m.lists.bulletStyle === 'square'
                            ? '▪'
                            : m.lists.bulletStyle === 'arrow'
                              ? '→'
                              : '•';
                      return (
                        <div
                          key={idx}
                          style={{ marginBottom: `${m.lists.itemSepPt * ptToPx}px` }}
                          className="flex items-start gap-2"
                        >
                          <span className="shrink-0">{marker}</span>
                          <span>{item}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                <h4 style={h3Style}>
                  {renderHeadingContent(subSubSec1Num, t.preview.subsubsec1, typo.headings.h3)}
                </h4>

                {/* Dialogue Module Preview */}
                {m.dialogues.enabled && (
                  <div
                    style={{
                      marginBottom: `${8 * ptToPx}px`,
                      fontSize: `${baseFontPx * 0.96}px`,
                    }}
                    className="my-2"
                  >
                    {t.preview.dialogueSample.map((d, i) => (
                      <div
                        key={i}
                        style={{
                          paddingLeft:
                            m.dialogues.style === 'interview'
                              ? `${m.dialogues.indentMm * MM_TO_PX}px`
                              : `${m.dialogues.indentMm * MM_TO_PX * 0.6}px`,
                          textIndent:
                            m.dialogues.style === 'interview'
                              ? `-${m.dialogues.indentMm * MM_TO_PX * 0.5}px`
                              : '0px',
                          marginBottom: '4px',
                          textAlign: m.dialogues.style === 'script' ? 'left' : undefined,
                        }}
                      >
                        {m.dialogues.style === 'script' ? (
                          <div>
                            <div
                              className={`text-center tracking-wider uppercase text-[0.88em] ${
                                m.dialogues.speakerBold ? 'font-bold' : ''
                              }`}
                            >
                              {d.speaker}
                            </div>
                            <div>{d.line}</div>
                          </div>
                        ) : (
                          <div>
                            {m.dialogues.style === 'literary' && '— '}
                            <span
                              style={{
                                color:
                                  m.dialogues.style === 'interview' ? typo.accentColor : undefined,
                              }}
                              className={m.dialogues.speakerBold ? 'font-bold' : ''}
                            >
                              {d.speaker}:
                            </span>{' '}
                            {d.line}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Images Module Preview */}
                {m.images.enabled && (
                  <figure
                    style={{
                      width: `${Math.round(m.images.defaultWidthRatio * 100)}%`,
                      margin: `${m.images.spacingVerticalPt * ptToPx}px auto`,
                    }}
                    className="break-inside-avoid"
                  >
                    {m.images.captionPosition === 'top' && renderFigureCaption()}
                    <div
                      style={{
                        borderWidth: m.images.border
                          ? `${m.images.borderWidthPt * ptToPx}px`
                          : '1px',
                        borderStyle: m.images.border ? 'solid' : 'dashed',
                        borderColor: m.images.border
                          ? m.images.borderColor
                          : 'rgba(120,113,108,0.3)',
                        padding: `${m.images.paddingPt * ptToPx}px`,
                      }}
                      className="rounded-xs bg-black/[0.02]"
                    >
                      <div className="h-24 rounded-xs bg-black/[0.03] flex flex-col items-center justify-center gap-1 text-stone-500">
                        <ImageIcon className="w-5 h-5 opacity-60" />
                        <span style={{ fontSize: `${baseFontPx * 0.78}px` }}>
                          {t.preview.figPlaceholder}
                        </span>
                      </div>
                    </div>
                    {m.images.captionPosition === 'bottom' && renderFigureCaption()}
                    {m.images.showSourceLine && (
                      <div
                        style={{
                          fontFamily: captionFont,
                          fontSize: `${Math.max(8, m.images.captionFontSizePt - 1) * ptToPx}px`,
                          textAlign: m.images.sourceAlign,
                          color: m.images.captionColor,
                        }}
                        className="mt-1 opacity-85"
                      >
                        {m.images.sourcePrefixBold ? (
                          <strong>{m.images.sourcePrefix}</strong>
                        ) : (
                          m.images.sourcePrefix
                        )}{' '}
                        {t.preview.figSourceText}
                      </div>
                    )}
                  </figure>
                )}
              </div>
            </>
          ) : (
            /* Page 2 */
            <div style={columnsStyle}>
              <h2 style={{ ...h1Style, marginTop: 0 }}>
                {renderHeadingContent(sec2Num, t.preview.sec2, typo.headings.h1)}
              </h2>

              <p style={paragraphStyle}>{t.preview.p1}</p>

              {m.callouts.enabled && (
                <div
                  style={{
                    borderColor: typo.accentColor,
                    borderWidth: m.callouts.borderLeftOnly ? '0 0 0 3px' : '1px',
                    backgroundColor: `${typo.accentColor}10`,
                    fontSize: `${baseFontPx * 0.92}px`,
                  }}
                  className="p-2.5 rounded-r mb-3 break-inside-avoid border-solid"
                >
                  <div style={{ color: typo.accentColor }} className="font-bold mb-0.5">
                    {t.preview.calloutTitle}
                  </div>
                  <div>{t.preview.calloutBody}</div>
                </div>
              )}

              {m.math.enabled && (
                <div className="my-2.5 break-inside-avoid">
                  <div className="flex items-center justify-between px-3 py-1.5 font-serif italic">
                    <span className="mx-auto">
                      E<sub>grid</sub> = &Sigma;<sub>i=1..n</sub> (w<sub>i</sub> &middot; &lambda;
                      <sub>i</sub>) / &Delta;m
                    </span>
                    {m.math.numberedEquations && (
                      <span className="text-[0.85em] opacity-75">(1)</span>
                    )}
                  </div>
                  {m.math.theoremBoxes && (
                    <div
                      style={{ fontSize: `${baseFontPx * 0.92}px` }}
                      className="mt-1.5 pl-2.5 border-l-2 border-black/20 italic"
                    >
                      <strong className="not-italic">{t.preview.theoremTitle}.</strong>{' '}
                      {t.preview.theoremBody}
                    </div>
                  )}
                </div>
              )}

              {m.tables.enabled && (
                <div className="my-3 break-inside-avoid">
                  {m.tables.captionPosition === 'top' && renderTableCaption()}
                  {(() => {
                    const tbl = m.tables;
                    const borderStyle = `${tbl.borderWidthPt * ptToPx}px solid ${tbl.borderColor}`;
                    const isGrid = tbl.style === 'grid';
                    const isHorizontal = tbl.style === 'horizontal' || isGrid;
                    const isBooktabs = tbl.style === 'booktabs' || tbl.style === 'abnt-open';

                    return (
                      <table
                        style={{
                          fontSize: `${tbl.fontSizePt * ptToPx}px`,
                          borderTop: isBooktabs ? `${tbl.borderWidthPt * 1.6 * ptToPx}px solid ${tbl.borderColor}` : borderStyle,
                          borderBottom: isBooktabs ? `${tbl.borderWidthPt * 1.6 * ptToPx}px solid ${tbl.borderColor}` : borderStyle,
                          borderLeft: isGrid ? borderStyle : 'none',
                          borderRight: isGrid ? borderStyle : 'none',
                        }}
                        className="w-full border-collapse"
                      >
                        <thead>
                          <tr
                            style={{
                              backgroundColor: tbl.headerTint ? tbl.headerBgColor : 'transparent',
                              color: tbl.headerTint ? tbl.headerTextColor : typo.textColor,
                              borderBottom: borderStyle,
                            }}
                          >
                            {t.preview.tableHeaders.map((h, i) => (
                              <th
                                key={i}
                                style={{
                                  padding: `${3 * tbl.rowStretch}px ${tbl.cellPaddingPt * ptToPx}px`,
                                  fontWeight: tbl.headerBold ? 700 : 400,
                                  textTransform: tbl.headerUppercase ? 'uppercase' : 'none',
                                  textAlign: tbl.headerAlign,
                                  borderLeft: isGrid && i > 0 ? borderStyle : 'none',
                                }}
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {t.preview.tableRows.map((row, rIdx) => (
                            <tr
                              key={rIdx}
                              style={{
                                backgroundColor:
                                  tbl.style === 'striped' && rIdx % 2 === 1
                                    ? tbl.stripeColor
                                    : undefined,
                                borderBottom:
                                  isHorizontal && rIdx < t.preview.tableRows.length - 1
                                    ? borderStyle
                                    : 'none',
                              }}
                            >
                              {row.map((cell, cIdx) => (
                                <td
                                  key={cIdx}
                                  style={{
                                    padding: `${3 * tbl.rowStretch}px ${tbl.cellPaddingPt * ptToPx}px`,
                                    borderLeft: isGrid && cIdx > 0 ? borderStyle : 'none',
                                  }}
                                >
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    );
                  })()}
                  {m.tables.captionPosition === 'bottom' && renderTableCaption()}
                  {m.tables.showSourceLine && (
                    <div
                      style={{
                        fontFamily: captionFont,
                        fontSize: `${Math.max(8, m.tables.captionFontSizePt - 1) * ptToPx}px`,
                        textAlign: m.tables.sourceAlign,
                        color: m.tables.captionColor,
                      }}
                      className="mt-1 opacity-85"
                    >
                      {m.tables.sourcePrefixBold ? (
                        <strong>{m.tables.sourcePrefix}</strong>
                      ) : (
                        m.tables.sourcePrefix
                      )}{' '}
                      {t.preview.tableSourceText}
                    </div>
                  )}
                </div>
              )}

              {m.code.enabled && (
                <pre
                  style={{
                    fontFamily: monoFont,
                    fontSize: `${baseFontPx * 0.78}px`,
                    backgroundColor: m.code.backgroundTint ? `${typo.accentColor}0d` : 'transparent',
                    border: m.code.frame ? '1px solid rgba(120,113,108,0.35)' : 'none',
                  }}
                  className="p-2 rounded my-2.5 overflow-hidden break-inside-avoid"
                >
                  <code>
                    {m.code.lineNumbers ? '1  ' : ''}
                    def compute_measure(w, ml, mr):{'\n'}
                    {m.code.lineNumbers ? '2  ' : ''}    return w - (ml + mr)
                  </code>
                </pre>
              )}

              {m.citations.enabled && (
                <div className="mt-3 pt-2 border-t border-black/15 break-inside-avoid">
                  <div style={{ ...h2Style, marginTop: 0 }} className="mb-1.5">
                    {m.citations.referencesTitle.trim() || t.preview.referencesTitle}
                  </div>
                  <div
                    style={{ fontSize: `${baseFontPx * 0.84}px` }}
                    className="space-y-1 opacity-90 text-left"
                  >
                    {m.citations.style === 'abnt' ? (
                      <>
                        <div>
                          BRINGHURST, R. <strong>The Elements of Typographic Style</strong>. 4. ed.
                          Hartley &amp; Marks, 2012.
                        </div>
                        <div>
                          SILVA, A. P.; ALMEIDA, R. Padronização Modular de Modelos Tipográficos em
                          LaTeX. <em>Rev. Bras. Design Editorial</em>, 2024.
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          {m.citations.style === 'ieee' || m.citations.style === 'numeric'
                            ? '[1] '
                            : ''}
                          R. Bringhurst, <em>The Elements of Typographic Style</em>, 4th ed., 2012.
                        </div>
                        <div>
                          {m.citations.style === 'ieee' || m.citations.style === 'numeric'
                            ? '[2] '
                            : ''}
                          A. P. Silva and R. Almeida, &ldquo;Padronização Modular em LaTeX,&rdquo;{' '}
                          2024.
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          </div>

          {pageNumber === 1 && m.footnotes.enabled && (
            <div className="pt-2 mt-2 shrink-0">
              <div
                style={{ width: `${Math.round(m.footnotes.ruleWidthRatio * 100)}%` }}
                className="border-t border-current/40 mb-1"
              />
              <div
                style={{
                  fontSize: `${m.footnotes.fontSizePt * ptToPx}px`,
                  lineHeight: m.footnotes.lineSpacing,
                  paddingLeft: m.footnotes.hangingIndent ? '12px' : '0px',
                  textIndent: m.footnotes.hangingIndent ? '-12px' : '0px',
                }}
                className="opacity-85"
              >
                <span className="font-semibold mr-1">1</span>
                {t.preview.footnoteSample}
              </div>
            </div>
          )}
        </div>

        {/* Running Footer */}
        {footerActive && (
          <div
            style={{
              top: `${heightPx - bottomPx + footskipPx - hf.footerFontSizePt * ptToPx * 1.4}px`,
              left: `${leftPx}px`,
              right: `${rightPx}px`,
              fontFamily: hfFont,
              fontSize: `${hf.footerFontSizePt * ptToPx}px`,
              fontWeight: hf.footerBold ? 700 : 400,
              fontStyle: hf.footerItalic ? 'italic' : 'normal',
              textTransform: hf.footerUppercase ? 'uppercase' : 'none',
              color: hf.footerColor,
              backgroundColor: hf.footerBgEnabled ? hf.footerBgColor : 'transparent',
              padding: hf.footerBgEnabled ? '3px 6px' : undefined,
              borderTopWidth: showFooterRule
                ? `${(hf.footerRuleStyle === 'double' ? Math.max(2.4, hf.footerRulePt * 2.5) : hf.footerRulePt) * ptToPx}px`
                : 0,
              borderTopStyle: hf.footerRuleStyle,
              borderTopColor: hf.footerRuleColor,
            }}
            className="absolute pt-1 flex items-center justify-between gap-2"
          >
            <div className="flex-1 min-w-0">
              {renderSlotWithLogo(
                'left',
                config.page.twoside && isEvenPage && !isCustomFirstPage ? footerRight : footerLeft,
                hf.footerLogo,
                showFooterLogo,
                'text-left'
              )}
            </div>
            <div className="shrink-0 max-w-[40%]">
              {renderSlotWithLogo('center', footerCenter, hf.footerLogo, showFooterLogo, 'text-center')}
            </div>
            <div className="flex-1 min-w-0">
              {renderSlotWithLogo(
                'right',
                config.page.twoside && isEvenPage && !isCustomFirstPage ? footerLeft : footerRight,
                hf.footerLogo,
                showFooterLogo,
                'text-right'
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
