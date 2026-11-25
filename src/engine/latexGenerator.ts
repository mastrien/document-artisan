import { getFontById, PAPER_SPECS } from '../data/fonts';
import {
  CaptionSeparator,
  CustomFontFamily,
  GeneratedFile,
  HeaderFooterLogoConfig,
  HeaderFooterToken,
  HeadingLevelStyle,
  LogoSlot,
  RuleStyle,
  TemplateConfig,
} from '../types/template';

export function sanitizeSlug(raw: string): string {
  const cleaned = raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return cleaned || 'custom-template';
}

function escapeLatex(text: string): string {
  return text
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/([&%$#_{}])/g, '\\$1')
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/\^/g, '\\textasciicircum{}');
}

function hexToRgbDigits(hex: string): string {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return '000000';
  return clean.toUpperCase();
}

function baseLatexClass(config: TemplateConfig): string {
  switch (config.documentType) {
    case 'book':
      return 'book';
    case 'report':
      return 'report';
    case 'slides':
      return 'beamer';
    default:
      return 'article';
  }
}

function getClassOptions(config: TemplateConfig): string[] {
  const opts: string[] = [];
  if (config.documentType === 'slides') {
    const aspect = config.page.size === 'slide4x3' ? 'aspectratio=43' : 'aspectratio=169';
    opts.push(aspect);
    opts.push(`${Math.round(config.typography.baseFontSizePt)}pt`);
    opts.push('xcolor=table');
    return opts;
  }

  const pt = Math.round(config.typography.baseFontSizePt);
  if (pt === 10 || pt === 11 || pt === 12) {
    opts.push(`${pt}pt`);
  } else {
    opts.push('11pt');
  }

  const paperSpec = PAPER_SPECS[config.page.size];
  if (
    paperSpec &&
    ['a4paper', 'a5paper', 'letterpaper', 'legalpaper', 'b5paper'].includes(paperSpec.geometryOption)
  ) {
    opts.push(paperSpec.geometryOption);
  }
  if (config.page.orientation === 'landscape') {
    opts.push('landscape');
  }
  if (config.page.twoside) {
    opts.push('twoside');
  }
  if (config.columns.count === 2 && config.columns.mode === 'native') {
    opts.push('twocolumn');
  }
  return opts;
}

function formatCustomFontspecArgs(family: CustomFontFamily, lsPct: number): string {
  const opts: string[] = ['Path=fonts/'];
  const v = family.variants;
  const primary = v.regular ?? v.bold ?? v.italic ?? v.boldItalic;
  if (v.regular && (v.bold || v.italic || v.boldItalic)) {
    opts.push(`UprightFont=${v.regular.fileName}`);
  }
  if (v.bold) {
    opts.push(`BoldFont=${v.bold.fileName}`);
  }
  if (v.italic) {
    opts.push(`ItalicFont=${v.italic.fileName}`);
  }
  if (v.boldItalic) {
    opts.push(`BoldItalicFont=${v.boldItalic.fileName}`);
  }
  if (Math.abs(lsPct) > 0.01) {
    opts.push(`LetterSpace=${lsPct}`);
  }
  const target = primary ? primary.fileName : family.familyName;
  return `[${opts.join(', ')}]{${target}}`;
}

function formatFontSpecForId(
  fontId: string,
  customFonts: CustomFontFamily[],
  lsPct: number
): string {
  if (fontId.startsWith('custom:')) {
    const custom = customFonts.find((cf) => cf.id === fontId);
    if (custom) {
      return formatCustomFontspecArgs(custom, lsPct);
    }
  }
  const font = getFontById(fontId);
  const opts: string[] = [];
  if (Math.abs(lsPct) > 0.01) {
    opts.push(`LetterSpace=${lsPct}`);
  }
  const optStr = opts.length > 0 ? `[${opts.join(', ')}]` : '';
  return `${optStr}{${font.fontspecName}}`;
}

function buildFontBlock(config: TemplateConfig): string[] {
  const lines: string[] = [];
  const t = config.typography;

  const bodyFont = getFontById(t.bodyFontId);
  const headingFont = getFontById(t.headingFontId);
  const monoFont = getFontById(t.monoFontId);

  if (config.engine === 'pdflatex') {
    lines.push('% --- Encoding & Fonts (pdfLaTeX) ---');
    lines.push('\\RequirePackage[utf8]{inputenc}');
    lines.push('\\RequirePackage[T1]{fontenc}');
    lines.push(bodyFont.pdflatexPackage);
    if (headingFont.id !== bodyFont.id && headingFont.category === 'sans') {
      lines.push(headingFont.pdflatexPackage);
    }
    lines.push(monoFont.pdflatexPackage);
    lines.push('\\newcommand{\\titlefont}{}');
    lines.push('\\newcommand{\\headingfont}{}');
    lines.push('\\newcommand{\\hffont}{}');
    lines.push('\\newcommand{\\captionfont}{}');
    if (Math.abs(t.letterSpacingEm) > 0.001) {
      const ls = Math.round(t.letterSpacingEm * 1000);
      lines.push(`\\RequirePackage[letterspace=${ls}]{microtype}`);
      lines.push('\\AtBeginDocument{\\lsstyle}');
    } else {
      lines.push('\\RequirePackage{microtype}');
    }
    return lines;
  }

  lines.push(`% --- Typography & Fonts (${config.engine === 'xelatex' ? 'XeLaTeX' : 'LuaLaTeX'}) ---`);
  lines.push('\\RequirePackage{fontspec}');

  const letterSpacePct = Number((t.letterSpacingEm * 100).toFixed(2));
  const headingLsPct = Number((t.headingLetterSpacingEm * 100).toFixed(2));

  lines.push(`\\setmainfont${formatFontSpecForId(t.bodyFontId, config.customFonts, letterSpacePct)}`);
  lines.push(`\\setsansfont${formatFontSpecForId(t.headingFontId, config.customFonts, headingLsPct)}`);
  lines.push(`\\setmonofont${formatFontSpecForId(t.monoFontId, config.customFonts, 0)}`);
  lines.push(`\\newfontfamily\\titlefont${formatFontSpecForId(t.titleFontId, config.customFonts, headingLsPct)}`);
  lines.push(`\\newfontfamily\\headingfont${formatFontSpecForId(t.headingFontId, config.customFonts, headingLsPct)}`);
  lines.push(`\\newfontfamily\\hffont${formatFontSpecForId(t.headerFooterFontId, config.customFonts, 0)}`);
  lines.push(`\\newfontfamily\\captionfont${formatFontSpecForId(t.captionFontId, config.customFonts, 0)}`);

  const pt = t.baseFontSizePt;
  if (![10, 11, 12].includes(Math.round(pt))) {
    lines.push(`\\RequirePackage{fontsize}`);
    lines.push(`\\changefontsize{${pt}pt}`);
  }
  return lines;
}

function resolveTokenLatex(
  token: HeaderFooterToken,
  customText: string,
  config: TemplateConfig
): string {
  switch (token) {
    case 'empty':
      return '';
    case 'title':
      return escapeLatex(config.metadata.title);
    case 'section':
      return config.documentType === 'slides' ? '\\insertsectionhead' : '\\nouppercase{\\leftmark}';
    case 'author':
      return escapeLatex(config.metadata.author);
    case 'page':
      return config.documentType === 'slides' ? '\\insertframenumber' : '\\thepage';
    case 'pageOfTotal':
      return config.documentType === 'slides'
        ? '\\insertframenumber\\,/\\,\\inserttotalframenumber'
        : config.documentLanguage === 'brazilian'
          ? 'Página \\thepage\\ de \\pageref{LastPage}'
          : 'Page \\thepage\\ of \\pageref{LastPage}';
    case 'date':
      return escapeLatex(config.metadata.date);
    case 'institution':
      return escapeLatex(config.metadata.institution);
    case 'custom':
      return escapeLatex(customText);
  }
}

function formatSlotTextLatex(rawLatex: string, stackAlign: 'l' | 'c' | 'r', upper: boolean): string {
  if (!rawLatex) return '';
  const parts = rawLatex
    .split(/\r?\n/)
    .map((line) => (upper ? `\\MakeUppercase{${line}}` : line));
  if (parts.length <= 1) return parts[0];
  return `\\shortstack[${stackAlign}]{${parts.join(' \\\\ ')}}`;
}

function renderLogoLatex(logo: HeaderFooterLogoConfig): string {
  if (!logo.enabled) return '';
  if (logo.fileName && logo.buffer) {
    const imgCmd = `\\includegraphics[height=${logo.heightMm}mm]{assets/${logo.fileName}}`;
    return `\\raisebox{\\dimexpr -0.35\\height + ${logo.verticalOffsetMm}mm\\relax}{${imgCmd}}`;
  }
  return '\\fbox{\\scriptsize LOGO}';
}

function buildRuleCommand(
  macroName: 'headrule' | 'footrule',
  widthName: 'headrulewidth' | 'footrulewidth',
  colorName: string,
  style: RuleStyle
): string {
  if (style === 'double') {
    return `\\renewcommand{\\${macroName}}{\\vbox{\\hbox to\\headwidth{\\color{${colorName}}\\leaders\\hrule height \\${widthName}\\hfill}\\vspace{1.5pt}\\hbox to\\headwidth{\\color{${colorName}}\\leaders\\hrule height \\${widthName}\\hfill}}}`;
  }
  if (style === 'dashed') {
    return `\\renewcommand{\\${macroName}}{\\hbox to\\headwidth{\\color{${colorName}}\\cleaders\\hbox to 6pt{\\hss\\vrule height \\${widthName} width 3.5pt\\hss}\\hfill}}`;
  }
  return `\\renewcommand{\\${macroName}}{\\hbox to\\headwidth{\\color{${colorName}}\\leaders\\hrule height \\${widthName}\\hfill}}`;
}

function composeSlotWithLogo(
  slot: LogoSlot,
  textLatex: string,
  logo: HeaderFooterLogoConfig,
  includeLogo: boolean
): string {
  if (!includeLogo || !logo.enabled || logo.slot !== slot) {
    return textLatex;
  }
  const logoCmd = renderLogoLatex(logo);
  if (logo.placement === 'replaceSlot' || !textLatex) {
    return logoCmd;
  }
  if (logo.placement === 'afterText') {
    return `${textLatex}\\hspace{${logo.gapMm}mm}${logoCmd}`;
  }
  return `${logoCmd}\\hspace{${logo.gapMm}mm}${textLatex}`;
}

function buildHeaderFooterBlock(config: TemplateConfig): string[] {
  const hf = config.headerFooter;
  const lines: string[] = [];

  if (config.documentType === 'slides') {
    lines.push('% --- Beamer Header, Footer & Colors ---');
    lines.push('\\setbeamertemplate{navigation symbols}{}');
    lines.push('\\setbeamercolor{structure}{fg=artisanAccent}');
    lines.push('\\setbeamercolor{normal text}{fg=artisanText,bg=artisanPaper}');
    lines.push('\\setbeamercolor{frametitle}{fg=artisanAccent}');
    if (hf.headerEnabled) {
      const hLeft = resolveTokenLatex(hf.headerLeft, hf.headerCustomLeft, config);
      const hCenter = resolveTokenLatex(hf.headerCenter, hf.headerCustomCenter, config);
      const hRight = resolveTokenLatex(hf.headerRight, hf.headerCustomRight, config);
      lines.push('\\setbeamertemplate{headline}{');
      lines.push('  \\leavevmode\\hbox to \\paperwidth{%');
      lines.push(`    \\hspace*{${config.page.margins.left}${config.page.unit}}`);
      lines.push(
        `    \\parbox{\\dimexpr\\paperwidth-${config.page.margins.left + config.page.margins.right}${config.page.unit}\\relax}{%`
      );
      lines.push(
        `      \\vspace{4pt}\\hffont\\fontsize{${hf.headerFontSizePt}}{${(hf.headerFontSizePt * 1.2).toFixed(1)}}\\selectfont\\color{artisanHeaderText}`
      );
      lines.push(
        `      ${hf.headerBold ? '\\bfseries ' : ''}${hf.headerItalic ? '\\itshape ' : ''}${hf.headerUppercase ? '\\MakeUppercase{' : ''}${hLeft}${hf.headerUppercase ? '}' : ''} \\hfill ${hCenter} \\hfill ${hRight}`
      );
      if (hf.headerRulePt > 0) {
        lines.push(`      \\\\[2pt]{\\color{artisanHeaderRule}\\hrule height ${hf.headerRulePt}pt}`);
      }
      lines.push('    }%');
      lines.push('  }%');
      lines.push('}');
    } else {
      lines.push('\\setbeamertemplate{headline}{}');
    }

    if (hf.footerEnabled) {
      const fLeft = resolveTokenLatex(hf.footerLeft, hf.footerCustomLeft, config);
      const fCenter = resolveTokenLatex(hf.footerCenter, hf.footerCustomCenter, config);
      const fRight = resolveTokenLatex(hf.footerRight, hf.footerCustomRight, config);
      lines.push('\\setbeamertemplate{footline}{');
      lines.push('  \\leavevmode\\hbox to \\paperwidth{%');
      lines.push(`    \\hspace*{${config.page.margins.left}${config.page.unit}}`);
      lines.push(
        `    \\parbox{\\dimexpr\\paperwidth-${config.page.margins.left + config.page.margins.right}${config.page.unit}\\relax}{%`
      );
      if (hf.footerRulePt > 0) {
        lines.push(`      {\\color{artisanFooterRule}\\hrule height ${hf.footerRulePt}pt}\\\\[2pt]`);
      }
      lines.push(
        `      \\hffont\\fontsize{${hf.footerFontSizePt}}{${(hf.footerFontSizePt * 1.2).toFixed(1)}}\\selectfont\\color{artisanFooterText}`
      );
      lines.push(
        `      ${hf.footerBold ? '\\bfseries ' : ''}${hf.footerItalic ? '\\itshape ' : ''}${fLeft} \\hfill ${fCenter} \\hfill ${fRight}\\vspace{4pt}`
      );
      lines.push('    }%');
      lines.push('  }%');
      lines.push('}');
    } else {
      lines.push('\\setbeamertemplate{footline}{}');
    }
    return lines;
  }

  lines.push('% --- Headers & Footers ---');
  if (hf.headerLogo.enabled || hf.footerLogo.enabled) {
    lines.push('\\RequirePackage{graphicx}');
  }
  const usesPageOfTotal =
    hf.headerLeft === 'pageOfTotal' ||
    hf.headerCenter === 'pageOfTotal' ||
    hf.headerRight === 'pageOfTotal' ||
    hf.footerLeft === 'pageOfTotal' ||
    hf.footerCenter === 'pageOfTotal' ||
    hf.footerRight === 'pageOfTotal' ||
    (hf.firstPageMode === 'custom' &&
      (hf.firstPage.headerLeft === 'pageOfTotal' ||
        hf.firstPage.headerCenter === 'pageOfTotal' ||
        hf.firstPage.headerRight === 'pageOfTotal' ||
        hf.firstPage.footerLeft === 'pageOfTotal' ||
        hf.firstPage.footerCenter === 'pageOfTotal' ||
        hf.firstPage.footerRight === 'pageOfTotal'));
  if (usesPageOfTotal) {
    lines.push('\\RequirePackage{lastpage}');
  }
  lines.push('\\RequirePackage{fancyhdr}');
  lines.push('\\pagestyle{fancy}');
  lines.push('\\fancyhf{}');

  const hStyle = `\\hffont\\fontsize{${hf.headerFontSizePt}}{${(hf.headerFontSizePt * 1.2).toFixed(1)}}\\selectfont${hf.headerBold ? '\\bfseries ' : ''}${hf.headerItalic ? '\\itshape ' : ''}\\color{artisanHeaderText}`;
  const fStyle = `\\hffont\\fontsize{${hf.footerFontSizePt}}{${(hf.footerFontSizePt * 1.2).toFixed(1)}}\\selectfont${hf.footerBold ? '\\bfseries ' : ''}${hf.footerItalic ? '\\itshape ' : ''}\\color{artisanFooterText}`;

  const wrapSlotBg = (content: string, bgEnabled: boolean, bgColorName: string) =>
    content && bgEnabled ? `\\colorbox{${bgColorName}}{${content}}` : content;

  if (hf.headerEnabled) {
    const hlText = formatSlotTextLatex(
      resolveTokenLatex(hf.headerLeft, hf.headerCustomLeft, config),
      'l',
      hf.headerUppercase
    );
    const hcText = formatSlotTextLatex(
      resolveTokenLatex(hf.headerCenter, hf.headerCustomCenter, config),
      'c',
      hf.headerUppercase
    );
    const hrText = formatSlotTextLatex(
      resolveTokenLatex(hf.headerRight, hf.headerCustomRight, config),
      'r',
      hf.headerUppercase
    );

    const hl = wrapSlotBg(
      composeSlotWithLogo('left', hlText, hf.headerLogo, true),
      hf.headerBgEnabled,
      'artisanHeaderBg'
    );
    const hc = wrapSlotBg(
      composeSlotWithLogo('center', hcText, hf.headerLogo, true),
      hf.headerBgEnabled,
      'artisanHeaderBg'
    );
    const hr = wrapSlotBg(
      composeSlotWithLogo('right', hrText, hf.headerLogo, true),
      hf.headerBgEnabled,
      'artisanHeaderBg'
    );

    if (config.page.twoside) {
      if (hl) lines.push(`\\fancyhead[LO,RE]{${hStyle}${hl}}`);
      if (hc) lines.push(`\\fancyhead[C]{${hStyle}${hc}}`);
      if (hr) lines.push(`\\fancyhead[RO,LE]{${hStyle}${hr}}`);
    } else {
      if (hl) lines.push(`\\fancyhead[L]{${hStyle}${hl}}`);
      if (hc) lines.push(`\\fancyhead[C]{${hStyle}${hc}}`);
      if (hr) lines.push(`\\fancyhead[R]{${hStyle}${hr}}`);
    }
    lines.push(`\\renewcommand{\\headrulewidth}{${hf.headerRulePt}pt}`);
    if (hf.headerRulePt > 0) {
      lines.push(buildRuleCommand('headrule', 'headrulewidth', 'artisanHeaderRule', hf.headerRuleStyle));
    }
  } else {
    lines.push('\\renewcommand{\\headrulewidth}{0pt}');
  }

  if (hf.footerEnabled) {
    const flText = formatSlotTextLatex(
      resolveTokenLatex(hf.footerLeft, hf.footerCustomLeft, config),
      'l',
      hf.footerUppercase
    );
    const fcText = formatSlotTextLatex(
      resolveTokenLatex(hf.footerCenter, hf.footerCustomCenter, config),
      'c',
      hf.footerUppercase
    );
    const frText = formatSlotTextLatex(
      resolveTokenLatex(hf.footerRight, hf.footerCustomRight, config),
      'r',
      hf.footerUppercase
    );

    const fl = wrapSlotBg(
      composeSlotWithLogo('left', flText, hf.footerLogo, true),
      hf.footerBgEnabled,
      'artisanFooterBg'
    );
    const fc = wrapSlotBg(
      composeSlotWithLogo('center', fcText, hf.footerLogo, true),
      hf.footerBgEnabled,
      'artisanFooterBg'
    );
    const fr = wrapSlotBg(
      composeSlotWithLogo('right', frText, hf.footerLogo, true),
      hf.footerBgEnabled,
      'artisanFooterBg'
    );

    if (config.page.twoside) {
      if (fl) lines.push(`\\fancyfoot[LO,RE]{${fStyle}${fl}}`);
      if (fc) lines.push(`\\fancyfoot[C]{${fStyle}${fc}}`);
      if (fr) lines.push(`\\fancyfoot[RO,LE]{${fStyle}${fr}}`);
    } else {
      if (fl) lines.push(`\\fancyfoot[L]{${fStyle}${fl}}`);
      if (fc) lines.push(`\\fancyfoot[C]{${fStyle}${fc}}`);
      if (fr) lines.push(`\\fancyfoot[R]{${fStyle}${fr}}`);
    }
    lines.push(`\\renewcommand{\\footrulewidth}{${hf.footerRulePt}pt}`);
    if (hf.footerRulePt > 0) {
      lines.push(buildRuleCommand('footrule', 'footrulewidth', 'artisanFooterRule', hf.footerRuleStyle));
    }
  } else {
    lines.push('\\renewcommand{\\footrulewidth}{0pt}');
  }

  if (hf.firstPageMode === 'empty') {
    lines.push(
      '\\fancypagestyle{plain}{\\fancyhf{}\\renewcommand{\\headrulewidth}{0pt}\\renewcommand{\\footrulewidth}{0pt}}'
    );
    lines.push('\\AtBeginDocument{\\thispagestyle{empty}}');
  } else if (hf.firstPageMode === 'custom') {
    const fp = hf.firstPage;
    lines.push('\\fancypagestyle{firstpage}{%');
    lines.push('  \\fancyhf{}%');
    if (fp.headerEnabled) {
      const fhl = composeSlotWithLogo(
        'left',
        formatSlotTextLatex(resolveTokenLatex(fp.headerLeft, fp.headerCustomLeft, config), 'l', hf.headerUppercase),
        hf.headerLogo,
        fp.showHeaderLogo
      );
      const fhc = composeSlotWithLogo(
        'center',
        formatSlotTextLatex(resolveTokenLatex(fp.headerCenter, fp.headerCustomCenter, config), 'c', hf.headerUppercase),
        hf.headerLogo,
        fp.showHeaderLogo
      );
      const fhr = composeSlotWithLogo(
        'right',
        formatSlotTextLatex(resolveTokenLatex(fp.headerRight, fp.headerCustomRight, config), 'r', hf.headerUppercase),
        hf.headerLogo,
        fp.showHeaderLogo
      );
      if (fhl) lines.push(`  \\fancyhead[L]{${hStyle}${fhl}}%`);
      if (fhc) lines.push(`  \\fancyhead[C]{${hStyle}${fhc}}%`);
      if (fhr) lines.push(`  \\fancyhead[R]{${hStyle}${fhr}}%`);
      lines.push(`  \\renewcommand{\\headrulewidth}{${fp.showHeaderRule ? hf.headerRulePt : 0}pt}%`);
    } else {
      lines.push('  \\renewcommand{\\headrulewidth}{0pt}%');
    }
    if (fp.footerEnabled) {
      const ffl = composeSlotWithLogo(
        'left',
        formatSlotTextLatex(resolveTokenLatex(fp.footerLeft, fp.footerCustomLeft, config), 'l', hf.footerUppercase),
        hf.footerLogo,
        fp.showFooterLogo
      );
      const ffc = composeSlotWithLogo(
        'center',
        formatSlotTextLatex(resolveTokenLatex(fp.footerCenter, fp.footerCustomCenter, config), 'c', hf.footerUppercase),
        hf.footerLogo,
        fp.showFooterLogo
      );
      const ffr = composeSlotWithLogo(
        'right',
        formatSlotTextLatex(resolveTokenLatex(fp.footerRight, fp.footerCustomRight, config), 'r', hf.footerUppercase),
        hf.footerLogo,
        fp.showFooterLogo
      );
      if (ffl) lines.push(`  \\fancyfoot[L]{${fStyle}${ffl}}%`);
      if (ffc) lines.push(`  \\fancyfoot[C]{${fStyle}${ffc}}%`);
      if (ffr) lines.push(`  \\fancyfoot[R]{${fStyle}${ffr}}%`);
      lines.push(`  \\renewcommand{\\footrulewidth}{${fp.showFooterRule ? hf.footerRulePt : 0}pt}%`);
    } else {
      lines.push('  \\renewcommand{\\footrulewidth}{0pt}%');
    }
    lines.push('}');
    lines.push('\\AtBeginDocument{\\thispagestyle{firstpage}}');
  }

  if (config.numbering.pageStyle === 'none') {
    lines.push('\\pagenumbering{gobble}');
  } else {
    lines.push(`\\pagenumbering{${config.numbering.pageStyle}}`);
  }

  return lines;
}

function buildPageGeometryAndColumns(config: TemplateConfig): string[] {
  const lines: string[] = [];
  const unit = config.page.unit;

  if (config.documentType === 'slides') {
    lines.push('% --- Slide Margins ---');
    lines.push(
      `\\setbeamersize{text margin left=${config.page.margins.left}${unit}, text margin right=${config.page.margins.right}${unit}}`
    );
    if (config.columns.count > 1) {
      lines.push('\\RequirePackage{multicol}');
      lines.push(`\\setlength{\\columnsep}{${config.columns.gapMm}mm}`);
      lines.push(`\\setlength{\\columnseprule}{${config.columns.ruleWidthPt}pt}`);
    }
    return lines;
  }

  lines.push('% --- Page Geometry & Margins ---');
  const paperSpec = PAPER_SPECS[config.page.size];
  const geoArgs: string[] = [];
  if (config.page.size === 'custom') {
    geoArgs.push(`paperwidth=${config.page.customWidthMm}mm`);
    geoArgs.push(`paperheight=${config.page.customHeightMm}mm`);
  } else {
    geoArgs.push(paperSpec.geometryOption);
  }
  if (config.page.orientation === 'landscape') {
    geoArgs.push('landscape');
  }
  if (config.page.twoside) {
    geoArgs.push('twoside');
    geoArgs.push(`inner=${config.page.margins.left}${unit}`);
    geoArgs.push(`outer=${config.page.margins.right}${unit}`);
  } else {
    geoArgs.push(`left=${config.page.margins.left}${unit}`);
    geoArgs.push(`right=${config.page.margins.right}${unit}`);
  }
  geoArgs.push(`top=${config.page.margins.top}${unit}`);
  geoArgs.push(`bottom=${config.page.margins.bottom}${unit}`);

  const hf = config.headerFooter;
  const maxHeaderLines = Math.max(
    1,
    ...[
      hf.headerCustomLeft,
      hf.headerCustomCenter,
      hf.headerCustomRight,
      hf.firstPage.headerCustomLeft,
      hf.firstPage.headerCustomCenter,
      hf.firstPage.headerCustomRight,
    ].map((s) => (s ? s.split(/\r?\n/).length : 1))
  );
  const autoHeadHeightMm = Math.max(
    6,
    hf.headerLogo.enabled ? hf.headerLogo.heightMm + 3 : 0,
    maxHeaderLines * (hf.headerFontSizePt * 0.45) + 3
  );
  const finalHeadHeightMm =
    hf.headHeightMm > 0 ? hf.headHeightMm : Math.ceil(autoHeadHeightMm);

  geoArgs.push(`headheight=${finalHeadHeightMm}mm`);
  geoArgs.push(`headsep=${hf.headerSepMm}mm`);
  geoArgs.push(`footskip=${hf.footerSkipMm}mm`);
  lines.push(`\\RequirePackage[${geoArgs.join(', ')}]{geometry}`);

  if (config.page.pageFrame.enabled) {
    lines.push('');
    lines.push('% --- Page Border Frame ---');
    lines.push('\\RequirePackage{eso-pic, tikz}');
    lines.push('\\AddToShipoutPictureBG{%');
    lines.push('  \\begin{tikzpicture}[remember picture, overlay]');
    lines.push(
      `    \\draw[color=artisanPageFrame, line width=${config.page.pageFrame.widthPt}pt]`
    );
    lines.push(
      `      ([xshift=${config.page.pageFrame.insetMm}mm, yshift=-${config.page.pageFrame.insetMm}mm]current page.north west)`
    );
    lines.push(
      `      rectangle ([xshift=-${config.page.pageFrame.insetMm}mm, yshift=${config.page.pageFrame.insetMm}mm]current page.south east);`
    );
    lines.push('  \\end{tikzpicture}%');
    lines.push('}');
  }

  lines.push('');
  lines.push('% --- Columns Configuration ---');
  if (config.columns.count > 1) {
    lines.push(`\\setlength{\\columnsep}{${config.columns.gapMm}mm}`);
    lines.push(`\\setlength{\\columnseprule}{${config.columns.ruleWidthPt}pt}`);
    if (config.columns.count === 3 || config.columns.mode === 'multicol') {
      lines.push('\\RequirePackage{multicol}');
    }
  }

  return lines;
}

function formatHeadingLevel(
  cmd: '\\section' | '\\subsection' | '\\subsubsection',
  style: HeadingLevelStyle,
  colorName: string,
  fontCmd: string
): string[] {
  const alignCmd =
    style.alignment === 'center'
      ? '\\centering'
      : style.alignment === 'right'
        ? '\\raggedleft'
        : '\\raggedright';
  const sizeCmd = `\\fontsize{${style.fontSizePt}}{${(style.fontSizePt * 1.22).toFixed(1)}}\\selectfont`;
  const weightCmd = style.bold ? '\\bfseries' : '\\mdseries';
  const italicCmd = style.italic ? '\\itshape' : '';
  const scCmd = style.transform === 'smallcaps' ? '\\scshape' : '';
  const upperCmd = style.transform === 'uppercase' ? '\\MakeUppercase' : '';

  const labelNum =
    cmd === '\\section'
      ? '\\thesection'
      : cmd === '\\subsection'
        ? '\\thesubsection'
        : '\\thesubsubsection';
  const sepToken =
    style.numberSeparator === 'dot'
      ? '.'
      : style.numberSeparator === 'dash'
        ? ' --'
        : '';

  const barPrefix =
    style.decoration === 'leftBar'
      ? `{\\color{${colorName}}\\rule[-0.15em]{2.5pt}{1.05em}}\\hspace{0.45em}`
      : '';
  const bottomTrailer =
    style.decoration === 'bottomRule' ? `[\\vspace{2pt}{\\color{${colorName}}\\titlerule[0.6pt]}]` : '';

  return [
    `\\titleformat{${cmd}}{${alignCmd}${fontCmd}${sizeCmd}${weightCmd}${italicCmd}${scCmd}\\color{${colorName}}}{${barPrefix}${labelNum}${sepToken}}{0.5em}{${upperCmd}}${bottomTrailer}`,
    `\\titlespacing*{${cmd}}{0pt}{${style.spaceBeforePt}pt}{${style.spaceAfterPt}pt}`,
  ];
}

function buildTypographyAndHeadingsBlock(config: TemplateConfig): string[] {
  const lines: string[] = [];
  const t = config.typography;
  const hf = config.headerFooter;
  const m = config.modules;

  lines.push('% --- Colors ---');
  if (config.documentType !== 'slides') {
    lines.push('\\RequirePackage[table]{xcolor}');
  }
  lines.push(`\\definecolor{artisanText}{HTML}{${hexToRgbDigits(t.textColor)}}`);
  lines.push(`\\definecolor{artisanAccent}{HTML}{${hexToRgbDigits(t.accentColor)}}`);
  lines.push(`\\definecolor{artisanPaper}{HTML}{${hexToRgbDigits(t.pageBgColor)}}`);
  lines.push(`\\definecolor{artisanRule}{HTML}{${hexToRgbDigits(config.columns.ruleColor)}}`);
  lines.push(`\\definecolor{artisanPageFrame}{HTML}{${hexToRgbDigits(config.page.pageFrame.color)}}`);
  lines.push(`\\definecolor{artisanTitleColor}{HTML}{${hexToRgbDigits(t.titleBlock.color)}}`);
  lines.push(`\\definecolor{artisanTitleRule}{HTML}{${hexToRgbDigits(t.titleBlock.dividerColor)}}`);
  lines.push(`\\definecolor{artisanH1}{HTML}{${hexToRgbDigits(t.headings.h1.color)}}`);
  lines.push(`\\definecolor{artisanH2}{HTML}{${hexToRgbDigits(t.headings.h2.color)}}`);
  lines.push(`\\definecolor{artisanH3}{HTML}{${hexToRgbDigits(t.headings.h3.color)}}`);
  lines.push(`\\definecolor{artisanHeaderText}{HTML}{${hexToRgbDigits(hf.headerColor)}}`);
  lines.push(`\\definecolor{artisanHeaderRule}{HTML}{${hexToRgbDigits(hf.headerRuleColor)}}`);
  lines.push(`\\definecolor{artisanHeaderBg}{HTML}{${hexToRgbDigits(hf.headerBgColor)}}`);
  lines.push(`\\definecolor{artisanFooterText}{HTML}{${hexToRgbDigits(hf.footerColor)}}`);
  lines.push(`\\definecolor{artisanFooterRule}{HTML}{${hexToRgbDigits(hf.footerRuleColor)}}`);
  lines.push(`\\definecolor{artisanFooterBg}{HTML}{${hexToRgbDigits(hf.footerBgColor)}}`);
  lines.push(`\\definecolor{artisanFigCaption}{HTML}{${hexToRgbDigits(m.images.captionColor)}}`);
  lines.push(`\\definecolor{artisanFigBorder}{HTML}{${hexToRgbDigits(m.images.borderColor)}}`);
  lines.push(`\\definecolor{artisanTableCaption}{HTML}{${hexToRgbDigits(m.tables.captionColor)}}`);
  lines.push(`\\definecolor{artisanTableBorder}{HTML}{${hexToRgbDigits(m.tables.borderColor)}}`);
  lines.push(`\\definecolor{artisanTableHeaderBg}{HTML}{${hexToRgbDigits(m.tables.headerBgColor)}}`);
  lines.push(`\\definecolor{artisanTableHeaderFg}{HTML}{${hexToRgbDigits(m.tables.headerTextColor)}}`);
  lines.push(`\\definecolor{artisanTableStripe}{HTML}{${hexToRgbDigits(m.tables.stripeColor)}}`);
  lines.push('\\definecolor{artisanMuted}{HTML}{6B7280}');
  if (config.documentType !== 'slides') {
    lines.push('\\AtBeginDocument{\\color{artisanText}\\pagecolor{artisanPaper}}');
  }

  lines.push('');
  lines.push('% --- Line Spacing, Paragraph & Flow ---');
  lines.push('\\RequirePackage{setspace}');
  lines.push(`\\setstretch{${t.lineSpacing.toFixed(2)}}`);

  if (!t.hyphenation) {
    lines.push('% Disable automatic hyphenation (DOCX-compatible flow)');
    lines.push('\\tolerance=1');
    lines.push('\\emergencystretch=\\maxdimen');
    lines.push('\\hyphenpenalty=10000');
    lines.push('\\hbadness=10000');
  }

  if (t.widowOrphanControl) {
    lines.push('\\widowpenalty=10000');
    lines.push('\\clubpenalty=10000');
  }

  if (config.documentType !== 'slides') {
    if (t.paragraphIndentMm <= 0) {
      lines.push('\\setlength{\\parindent}{0pt}');
    } else {
      lines.push(`\\setlength{\\parindent}{${t.paragraphIndentMm}mm}`);
    }
    lines.push(`\\setlength{\\parskip}{${t.paragraphSkipPt}pt}`);

    if (t.alignment === 'left') {
      lines.push('\\RequirePackage{ragged2e}');
      lines.push('\\AtBeginDocument{\\RaggedRight}');
    } else if (t.alignment === 'center') {
      lines.push('\\AtBeginDocument{\\centering}');
    } else if (t.alignment === 'right') {
      lines.push('\\AtBeginDocument{\\raggedleft}');
    }

    lines.push('');
    lines.push('% --- Custom Title Block ---');
    const tb = t.titleBlock;
    const tbAlign =
      tb.alignment === 'center'
        ? '\\centering'
        : tb.alignment === 'right'
          ? '\\raggedleft'
          : '\\raggedright';
    const tbWeight = Number(tb.weight) >= 600 ? '\\bfseries' : '\\mdseries';
    const tbUpper = tb.transform === 'uppercase' ? '\\MakeUppercase' : '';
    const tbSc = tb.transform === 'smallcaps' ? '\\scshape' : '';
    lines.push('\\makeatletter');
    lines.push('\\renewcommand{\\maketitle}{%');
    lines.push('  {\\par\\begingroup\\setlength{\\parindent}{0pt}');
    lines.push(`    {${tbAlign}\\titlefont\\fontsize{${tb.fontSizePt}}{${(tb.fontSizePt * 1.18).toFixed(1)}}\\selectfont${tbWeight}${tb.italic ? '\\itshape' : ''}${tbSc}\\color{artisanTitleColor}${tbUpper}{\\@title}\\par}`);
    if (config.metadata.subtitle) {
      lines.push(`    \\vspace{4pt}{${tbAlign}\\fontsize{${tb.subtitleSizePt}}{${(tb.subtitleSizePt * 1.2).toFixed(1)}}\\selectfont${tb.subtitleItalic ? '\\itshape' : ''}\\color{artisanMuted}${escapeLatex(config.metadata.subtitle)}\\par}`);
    }
    lines.push(
      `    \\vspace{6pt}{${tbAlign}\\fontsize{${tb.metaSizePt}}{${(tb.metaSizePt * 1.25).toFixed(1)}}\\selectfont\\color{artisanText}\\@author${tb.metaLayout === 'stacked' ? '\\\\' : ' \\textperiodcentered\\ '}${escapeLatex(config.metadata.institution)}${tb.metaLayout === 'stacked' ? '\\\\' : ' \\textperiodcentered\\ '}\\@date\\par}`
    );
    if (tb.dividerWidthPt > 0) {
      lines.push(`    \\vspace{8pt}{\\color{artisanTitleRule}\\hrule height ${tb.dividerWidthPt}pt}`);
    }
    lines.push(`    \\vspace{${tb.spaceAfterPt}pt}`);
    lines.push('  \\par\\endgroup}');
    lines.push('}');
    lines.push('\\makeatother');

    lines.push('');
    lines.push('% --- Heading Hierarchy (H1 / H2 / H3) & Numbering ---');
    lines.push(`\\setcounter{secnumdepth}{${config.numbering.sectionDepth}}`);
    lines.push(`\\setcounter{tocdepth}{${config.numbering.tocDepth}}`);
    if (config.numbering.sectionStyle === 'roman') {
      lines.push('\\renewcommand{\\thesection}{\\Roman{section}}');
    } else if (config.numbering.sectionStyle === 'none') {
      lines.push('\\setcounter{secnumdepth}{0}');
    }

    lines.push('\\RequirePackage{titlesec}');
    lines.push(...formatHeadingLevel('\\section', t.headings.h1, 'artisanH1', '\\headingfont'));
    lines.push(...formatHeadingLevel('\\subsection', t.headings.h2, 'artisanH2', '\\headingfont'));
    lines.push(...formatHeadingLevel('\\subsubsection', t.headings.h3, 'artisanH3', '\\headingfont'));
  }

  return lines;
}

function separatorLatex(sep: CaptionSeparator): string {
  switch (sep) {
    case 'colon':
      return 'colon';
    case 'endash':
      return 'endash';
    case 'emdash':
      return 'emdash';
    case 'period':
      return 'period';
  }
}

function captionJustifyLatex(align: string): string {
  switch (align) {
    case 'center':
      return 'centering';
    case 'right':
      return 'raggedleft';
    case 'justify':
      return 'justified';
    default:
      return 'raggedright';
  }
}

function buildModulesBlock(config: TemplateConfig): string[] {
  const m = config.modules;
  const lines: string[] = [];

  lines.push('% --- Enabled Functional Modules ---');

  const isSlides = config.documentType === 'slides';

  if (m.images.enabled || m.tables.enabled) {
    lines.push('% [Shared Caption Engine]');
    lines.push('\\RequirePackage{etoolbox}');
    if (!isSlides) {
      lines.push('\\RequirePackage{caption}');
      lines.push('\\DeclareCaptionLabelSeparator{endash}{~--~}');
      lines.push('\\DeclareCaptionLabelSeparator{emdash}{~---~}');
    }
    lines.push(
      '\\newcommand{\\artisansource}[2][left]{\\par\\vspace{3pt}{\\ifstrequal{#1}{center}{\\centering}{\\raggedright}\\captionfont\\footnotesize\\color{artisanMuted}#2\\par}}'
    );
    lines.push('');
  }

  if (m.images.enabled) {
    const img = m.images;
    lines.push('% [Module: Images & Figures]');
    if (!config.headerFooter.headerLogo.enabled && !config.headerFooter.footerLogo.enabled) {
      lines.push('\\RequirePackage{graphicx}');
    }
    lines.push('\\RequirePackage{float}');
    if (!isSlides) {
      lines.push('\\RequirePackage{subcaption}');
      if (img.captionPrefix) {
        lines.push(
          `\\addto\\captions${config.documentLanguage}{\\renewcommand{\\figurename}{${escapeLatex(img.captionPrefix)}}}`
        );
      }
      const labelFontOpts = [
        img.captionLabelBold ? 'bf' : 'md',
        ...(img.captionLabelUppercase ? ['up'] : []),
      ];
      lines.push('\\captionsetup[figure]{');
      lines.push(`  position=${img.captionPosition},`);
      lines.push(`  justification=${captionJustifyLatex(img.captionAlign)},`);
      lines.push(`  labelsep=${separatorLatex(img.captionSeparator)},`);
      lines.push(`  labelfont={${labelFontOpts.join(',')}},`);
      lines.push(
        `  font={color=artisanFigCaption},`
      );
      lines.push(
        `  textfont={${img.captionItalic ? 'it' : 'normalfont'}},`
      );
      lines.push('  singlelinecheck=false');
      lines.push('}');
    }
    if (img.graphicsPath) {
      lines.push(`\\graphicspath{{${img.graphicsPath}}}`);
    }
    lines.push(`\\newcommand{\\artisanfigure}[4][${img.defaultWidthRatio}]{%`);
    lines.push('  \\begin{figure}[H]');
    lines.push(`    \\vspace{${img.spacingVerticalPt}pt}\\centering`);
    if (img.captionPosition === 'top') {
      lines.push('    \\caption{#3}');
    }
    if (img.border) {
      lines.push(`    \\setlength{\\fboxrule}{${img.borderWidthPt}pt}`);
      lines.push(`    \\setlength{\\fboxsep}{${img.paddingPt}pt}`);
      lines.push('    \\fcolorbox{artisanFigBorder}{artisanPaper}{\\includegraphics[width=#1\\linewidth]{#2}}');
    } else {
      lines.push('    \\includegraphics[width=#1\\linewidth]{#2}');
    }
    if (img.captionPosition === 'bottom') {
      lines.push('    \\caption{#3}');
    }
    if (img.showSourceLine) {
      lines.push(
        `    \\ifstrempty{#4}{}{\\artisansource[${img.sourceAlign}]{${escapeLatex(img.sourcePrefix)} #4}}`
      );
    }
    lines.push(`    \\vspace{${img.spacingVerticalPt}pt}`);
    lines.push('  \\end{figure}');
    lines.push('}');
    lines.push('');
  }

  if (m.tables.enabled) {
    const tbl = m.tables;
    lines.push('% [Module: Tables]');
    lines.push('\\RequirePackage{booktabs}');
    lines.push('\\RequirePackage{tabularx}');
    lines.push('\\RequirePackage{longtable}');
    lines.push('\\RequirePackage{multirow}');
    lines.push('\\RequirePackage{array}');
    lines.push('\\RequirePackage{colortbl}');
    lines.push(`\\renewcommand{\\arraystretch}{${tbl.rowStretch.toFixed(2)}}`);
    lines.push(`\\setlength{\\tabcolsep}{${tbl.cellPaddingPt}pt}`);
    lines.push(`\\setlength{\\arrayrulewidth}{${tbl.borderWidthPt}pt}`);
    lines.push('\\arrayrulecolor{artisanTableBorder}');
    if (!isSlides) {
      if (tbl.captionPrefix) {
        lines.push(
          `\\addto\\captions${config.documentLanguage}{\\renewcommand{\\tablename}{${escapeLatex(tbl.captionPrefix)}}}`
        );
      }
      lines.push('\\captionsetup[table]{');
      lines.push(`  position=${tbl.captionPosition},`);
      lines.push(`  justification=${captionJustifyLatex(tbl.captionAlign)},`);
      lines.push(`  labelsep=${separatorLatex(tbl.captionSeparator)},`);
      lines.push(`  labelfont={${tbl.captionLabelBold ? 'bf' : 'md'}},`);
      lines.push('  font={color=artisanTableCaption},');
      lines.push('  singlelinecheck=false');
      lines.push('}');
    }
    if (tbl.style === 'striped') {
      lines.push('\\AtBeginDocument{\\rowcolors{2}{artisanTableStripe}{artisanPaper}}');
    }
    lines.push('');
  }

  if (m.citations.enabled) {
    lines.push('% [Module: Citations & Bibliography]');
    lines.push('\\RequirePackage{csquotes}');
    lines.push(
      `\\RequirePackage[backend=biber, style=${m.citations.style}, sorting=nyt]{biblatex}`
    );
    lines.push(`\\addbibresource{${m.citations.bibFile || 'references.bib'}}`);
    lines.push('');
  }

  if (m.dialogues.enabled) {
    lines.push('% [Module: Dialogues & Speech]');
    const speakerStyle = m.dialogues.speakerBold ? '\\bfseries' : '';
    const indent = `${m.dialogues.indentMm}mm`;

    if (m.dialogues.style === 'literary') {
      lines.push('\\newcommand{\\fala}[1]{\\par\\noindent\\hspace*{' + indent + '}---~#1\\par}');
      lines.push(
        `\\newcommand{\\dialogo}[2]{\\par\\noindent\\hspace*{${indent}}---~{${speakerStyle}#1:} #2\\par}`
      );
    } else if (m.dialogues.style === 'script') {
      lines.push('\\newcommand{\\fala}[1]{\\par\\noindent\\hspace*{' + indent + '}#1\\par}');
      lines.push(
        `\\newcommand{\\dialogo}[2]{\\par\\addvspace{4pt}{\\centering${speakerStyle}\\MakeUppercase{#1}\\par}\\noindent\\hspace*{${indent}}#2\\par}`
      );
    } else {
      lines.push('\\newcommand{\\fala}[1]{\\par\\hangindent=' + indent + '\\noindent #1\\par}');
      lines.push(
        `\\newcommand{\\dialogo}[2]{\\par\\hangindent=${indent}\\noindent{${speakerStyle}\\color{artisanAccent}#1:} #2\\par}`
      );
    }
    lines.push('\\let\\speech\\fala');
    lines.push('\\let\\dialogue\\dialogo');
    lines.push('\\newenvironment{dialogoblock}{\\par\\addvspace{6pt}}{\\par\\addvspace{6pt}}');
    lines.push('');
  }

  if (m.math.enabled) {
    lines.push('% [Module: Math & Theorems]');
    lines.push('\\RequirePackage{amsmath, amssymb, mathtools}');
    if (m.math.theoremBoxes) {
      lines.push('\\RequirePackage{amsthm}');
      const thmName = config.documentLanguage === 'brazilian' ? 'Teorema' : 'Theorem';
      const defName = config.documentLanguage === 'brazilian' ? 'Definição' : 'Definition';
      lines.push(`\\newtheorem{theorem}{${thmName}}`);
      lines.push(`\\newtheorem{definition}{${defName}}`);
    }
    lines.push('');
  }

  if (m.code.enabled) {
    lines.push('% [Module: Code Listings]');
    lines.push('\\RequirePackage{listings}');
    lines.push('\\lstset{');
    lines.push('  basicstyle=\\ttfamily\\small,');
    lines.push('  keywordstyle=\\color{artisanAccent}\\bfseries,');
    lines.push('  commentstyle=\\color{artisanMuted}\\itshape,');
    lines.push('  breaklines=true,');
    if (m.code.lineNumbers) {
      lines.push('  numbers=left,');
      lines.push('  numberstyle=\\tiny\\color{artisanMuted},');
    }
    if (m.code.frame) {
      lines.push('  frame=single,');
      lines.push('  rulecolor=\\color{artisanMuted!40},');
    }
    if (m.code.backgroundTint) {
      lines.push('  backgroundcolor=\\color{artisanAccent!5},');
    }
    lines.push('  tabsize=2');
    lines.push('}');
    lines.push('');
  }

  if (m.callouts.enabled) {
    lines.push('% [Module: Callout Boxes]');
    lines.push('\\RequirePackage[most]{tcolorbox}');
    lines.push('\\newtcolorbox{calloutbox}[1][]{');
    lines.push('  enhanced,');
    lines.push('  colback=artisanAccent!5,');
    lines.push('  colframe=artisanAccent,');
    lines.push('  coltitle=artisanAccent,');
    lines.push('  fonttitle=\\bfseries,');
    if (m.callouts.borderLeftOnly) {
      lines.push('  boxrule=0pt,');
      lines.push('  leftrule=3pt,');
      lines.push('  arc=1pt,');
    } else {
      lines.push('  boxrule=0.7pt,');
      lines.push('  arc=3pt,');
    }
    lines.push('  attach title to upper={\\\\},');
    lines.push('  title={#1}');
    lines.push('}');
    lines.push('\\newenvironment{destaque}[1][]{\\begin{calloutbox}[#1]}{\\end{calloutbox}}');
    lines.push('');
  }

  if (m.hyperref.enabled && config.documentType !== 'slides') {
    lines.push('% [Module: Hyperref & Cross-References — always loaded last]');
    lines.push('\\RequirePackage{hyperref}');
    lines.push('\\hypersetup{');
    if (m.hyperref.coloredLinks) {
      lines.push('  colorlinks=true,');
      lines.push('  linkcolor=artisanAccent,');
      lines.push('  citecolor=artisanAccent,');
      lines.push('  urlcolor=artisanAccent');
    } else {
      lines.push('  colorlinks=false,');
      lines.push('  pdfborder={0 0 0}');
    }
    lines.push('}');
    lines.push('\\RequirePackage{cleveref}');
  }

  return lines;
}

function buildCoreBody(config: TemplateConfig): string[] {
  const lines: string[] = [];
  lines.push(`% --- Language (babel) ---`);
  lines.push(`\\RequirePackage[${config.documentLanguage}]{babel}`);
  lines.push('');
  lines.push(...buildFontBlock(config));
  lines.push('');
  lines.push(...buildPageGeometryAndColumns(config));
  lines.push('');
  lines.push(...buildTypographyAndHeadingsBlock(config));
  lines.push('');
  lines.push(...buildHeaderFooterBlock(config));
  lines.push('');
  lines.push(...buildModulesBlock(config));
  return lines;
}

export function buildClassFile(config: TemplateConfig): string {
  const slug = sanitizeSlug(config.templateSlug);
  const baseClass = baseLatexClass(config);
  const classOpts = getClassOptions(config);

  const lines: string[] = [
    `% ============================================================================`,
    `% ${slug}.cls — Generated by Document Artisan`,
    `% Base class: ${baseClass} | Engine: ${config.engine}`,
    `% ============================================================================`,
    `\\NeedsTeXFormat{LaTeX2e}`,
    `\\ProvidesClass{${slug}}[2026/11/25 Custom LaTeX Document Class]`,
    ``,
    `\\DeclareOption*{\\PassOptionsToClass{\\CurrentOption}{${baseClass}}}`,
    `\\ProcessOptions\\relax`,
    `\\LoadClass[${classOpts.join(', ')}]{${baseClass}}`,
    ``,
    ...buildCoreBody(config),
    ``,
    `\\endinput`,
  ];

  return lines.join('\n');
}

export function buildStyleFile(config: TemplateConfig): string {
  const slug = sanitizeSlug(config.templateSlug);
  const baseClass = baseLatexClass(config);

  const lines: string[] = [
    `% ============================================================================`,
    `% ${slug}.sty — Generated by Document Artisan`,
    `% Designed for base class: ${baseClass} | Engine: ${config.engine}`,
    `% Usage: \\usepackage{${slug}}`,
    `% ============================================================================`,
    `\\NeedsTeXFormat{LaTeX2e}`,
    `\\ProvidesPackage{${slug}}[2026/11/25 Custom LaTeX Style Package]`,
    ``,
    ...buildCoreBody(config),
    ``,
    `\\endinput`,
  ];

  return lines.join('\n');
}

function buildSampleContent(config: TemplateConfig, contentMode: 'example' | 'minimal'): string[] {
  const isPt = config.documentLanguage === 'brazilian';
  const m = config.modules;

  if (config.documentType === 'slides') {
    const lines: string[] = ['\\begin{frame}[plain]', '  \\titlepage', '\\end{frame}', ''];
    if (contentMode === 'minimal') {
      lines.push(`\\begin{frame}{${isPt ? 'Primeiro Slide' : 'First Slide'}}`);
      lines.push(`  ${isPt ? 'Comece seu conteúdo aqui.' : 'Start your slide content here.'}`);
      lines.push('\\end{frame}');
      return lines;
    }

    lines.push(`\\section{${isPt ? 'Visão Geral' : 'Overview'}}`);
    lines.push(`\\begin{frame}{${isPt ? 'Arquitetura do Modelo' : 'Template Architecture'}}`);
    if (config.columns.count > 1) {
      lines.push(`  \\begin{multicols}{${config.columns.count}}`);
    }
    lines.push('  \\begin{itemize}');
    lines.push(
      `    \\item ${isPt ? 'Separação entre conteúdo e estilo (.cls / .sty)' : 'Clean separation of content and styling (.cls / .sty)'}`
    );
    lines.push(
      `    \\item ${isPt ? 'Margens, colunas e tipografia consistentes' : 'Consistent margins, columns, and typography'}`
    );
    lines.push(
      `    \\item ${isPt ? 'Suporte completo a módulos LaTeX' : 'Modular LaTeX package integration'}`
    );
    lines.push('  \\end{itemize}');
    if (m.callouts.enabled) {
      lines.push('');
      lines.push(`  \\begin{destaque}[${isPt ? 'Destaque' : 'Highlight'}]`);
      lines.push(
        `    ${isPt ? 'Bloco configurado pelo módulo de caixas de destaque.' : 'Block styled via the Callouts module.'}`
      );
      lines.push('  \\end{destaque}');
    }
    if (config.columns.count > 1) {
      lines.push('  \\end{multicols}');
    }
    lines.push('\\end{frame}');
    return lines;
  }

  const lines: string[] = [];
  lines.push('\\maketitle');
  if (config.numbering.includeToc) {
    lines.push('\\tableofcontents');
    lines.push(
      config.documentType === 'book' || config.documentType === 'report'
        ? '\\clearpage'
        : '\\vspace{1em}'
    );
  }
  lines.push('');

  if (contentMode === 'minimal') {
    lines.push(`\\section{${isPt ? 'Introdução' : 'Introduction'}}`);
    lines.push(
      isPt ? 'Escreva o conteúdo do seu documento aqui.' : 'Write your document content here.'
    );
    if (m.citations.enabled) {
      lines.push('');
      lines.push('\\printbibliography');
    }
    return lines;
  }

  const useMulticol =
    config.columns.count === 3 || (config.columns.count === 2 && config.columns.mode === 'multicol');

  if (useMulticol) {
    lines.push(`\\begin{multicols}{${config.columns.count}}`);
  }

  const headingCmd =
    config.documentType === 'book' || config.documentType === 'report' ? '\\chapter' : '\\section';
  lines.push(
    `${headingCmd}{${isPt ? 'Fundamentação e Estrutura Tipográfica' : 'Typographic Foundation and Page Grid'}}`
  );
  lines.push(
    isPt
      ? `Este documento demonstra o modelo gerado pelo Document Artisan. O espaçamento entre linhas, margens e famílias tipográficas seguem exatamente a configuração escolhida${m.citations.enabled ? ' \\parencite{silva2024,bringhurst2012}' : ''}.`
      : `This sample document demonstrates the template generated by Document Artisan. Line spacing, margins, and font families follow your exact configuration${m.citations.enabled ? ' \\parencite{silva2024,bringhurst2012}' : ''}.`
  );
  lines.push('');
  lines.push(`\\subsection{${isPt ? 'Diretrizes de Composição' : 'Composition Guidelines'}}`);
  lines.push(`\\subsubsection{${isPt ? 'Ajuste Fino Terciário' : 'Tertiary Subsections'}}`);
  lines.push('');

  if (m.dialogues.enabled) {
    lines.push(`\\subsection{${isPt ? 'Exemplo de Diálogo' : 'Dialogue Sample'}}`);
    lines.push('\\begin{dialogoblock}');
    lines.push(
      `  \\dialogo{Clara}{${isPt ? 'Ajustamos as margens e a largura das colunas antes da publicação?' : 'Did we finalize the margins and column widths before publishing?'}}`
    );
    lines.push(
      `  \\dialogo{Mateus}{${isPt ? 'Sim, e a fluidez da leitura melhorou imediatamente.' : 'Yes, and the reading rhythm improved immediately.'}}`
    );
    lines.push('\\end{dialogoblock}');
    lines.push('');
  }

  if (m.callouts.enabled) {
    lines.push(`\\begin{destaque}[${isPt ? 'Nota Editorial' : 'Editorial Note'}]`);
    lines.push(
      isPt
        ? 'Bloco de destaque configurado via tcolorbox, pronto para notas, avisos ou resumos.'
        : 'Callout box powered by tcolorbox, ready for notes, warnings, or key takeaways.'
    );
    lines.push('\\end{destaque}');
    lines.push('');
  }

  if (m.math.enabled) {
    lines.push(`\\subsection{${isPt ? 'Expressão Matemática' : 'Mathematical Expression'}}`);
    if (m.math.numberedEquations) {
      lines.push('\\begin{equation}');
      lines.push('  E_{\\text{grid}} = \\sum_{i=1}^{n} \\frac{w_i \\cdot \\lambda_i}{\\Delta m}');
      lines.push('\\end{equation}');
    } else {
      lines.push('\\[ E_{\\text{grid}} = \\sum_{i=1}^{n} \\frac{w_i \\cdot \\lambda_i}{\\Delta m} \\]');
    }
    if (m.math.theoremBoxes) {
      lines.push('\\begin{theorem}');
      lines.push(
        isPt
          ? 'Para margens consistentes, a legibilidade ótima ocorre entre 55 e 75 caracteres por linha.'
          : 'Across consistent margins, optimal readability occurs between 55 and 75 characters per line.'
      );
      lines.push('\\end{theorem}');
    }
    lines.push('');
  }

  if (m.tables.enabled) {
    const tbl = m.tables;
    lines.push(`\\subsection{${isPt ? 'Tabela Estruturada' : 'Structured Table'}}`);
    lines.push('\\begin{table}[h!]');
    lines.push(
      `  \\centering\\fontsize{${tbl.fontSizePt}}{${(tbl.fontSizePt * 1.2).toFixed(1)}}\\selectfont`
    );
    if (tbl.captionPosition === 'top') {
      lines.push(`  \\caption{${isPt ? 'Parâmetros do modelo' : 'Template configuration summary'}}`);
    }
    const colSpec = tbl.style === 'grid' ? '|l|l|l|' : 'lll';
    lines.push(`  \\begin{tabular}{${colSpec}}`);
    lines.push(tbl.style === 'grid' || tbl.style === 'abnt-open' || tbl.style === 'horizontal' ? '    \\hline' : '    \\toprule');
    const hdrRow = tbl.headerTint ? '    \\rowcolor{artisanTableHeaderBg} ' : '    ';
    const hdrFmt = (txt: string) => {
      const styled = tbl.headerUppercase ? txt.toUpperCase() : txt;
      const bolded = tbl.headerBold ? `\\textbf{${styled}}` : styled;
      return `\\color{artisanTableHeaderFg}${bolded}`;
    };
    lines.push(
      isPt
        ? `${hdrRow}${hdrFmt('Componente')} & ${hdrFmt('Configuração')} & ${hdrFmt('Estado')} \\\\`
        : `${hdrRow}${hdrFmt('Component')} & ${hdrFmt('Setting')} & ${hdrFmt('Status')} \\\\`
    );
    lines.push(tbl.style === 'grid' || tbl.style === 'abnt-open' || tbl.style === 'horizontal' ? '    \\hline' : '    \\midrule');
    lines.push(
      `    ${isPt ? 'Geometria' : 'Geometry'} & ${config.page.size.toUpperCase()} & Active \\\\`
    );
    lines.push(`    ${isPt ? 'Motor' : 'Engine'} & ${config.engine} & Ready \\\\`);
    lines.push(tbl.style === 'grid' || tbl.style === 'abnt-open' || tbl.style === 'horizontal' ? '    \\hline' : '    \\bottomrule');
    lines.push('  \\end{tabular}');
    if (tbl.captionPosition === 'bottom') {
      lines.push(`  \\caption{${isPt ? 'Parâmetros do modelo' : 'Template configuration summary'}}`);
    }
    if (tbl.showSourceLine) {
      lines.push(
        `  \\artisansource[center]{${escapeLatex(tbl.sourcePrefix)} ${isPt ? 'Dados de configuração do Document Artisan (2026).' : 'Document Artisan configuration (2026).'}}`
      );
    }
    lines.push('\\end{table}');
    lines.push('');
  }

  if (m.code.enabled) {
    lines.push(`\\subsection{${isPt ? 'Trecho de Código' : 'Code Snippet'}}`);
    lines.push('\\begin{lstlisting}[language=Python]');
    lines.push('def compute_measure(page_width_mm, margin_left, margin_right):');
    lines.push('    return page_width_mm - (margin_left + margin_right)');
    lines.push('\\end{lstlisting}');
    lines.push('');
  }

  if (m.images.enabled) {
    lines.push('% Example figure macro (place sample.png inside your graphics folder):');
    lines.push(
      `% \\artisanfigure{sample.png}{${isPt ? 'Legenda da figura' : 'Figure caption'}}{${isPt ? 'Elaborado pelo autor (2026).' : 'Author (2026).'}}`
    );
    lines.push('');
  }

  if (useMulticol) {
    lines.push('\\end{multicols}');
  }

  if (m.citations.enabled) {
    lines.push('');
    lines.push('\\printbibliography');
  }

  return lines;
}

export function buildMainTex(
  config: TemplateConfig,
  variant: 'class' | 'style',
  contentMode: 'example' | 'minimal'
): string {
  const slug = sanitizeSlug(config.templateSlug);
  const baseClass = baseLatexClass(config);
  const classOpts = getClassOptions(config);

  const lines: string[] = [
    `% ============================================================================`,
    `% main.tex — Using ${variant === 'class' ? `${slug}.cls (Document Class)` : `${slug}.sty (Style Package)`}`,
    `% Compile with: ${config.engine}${config.modules.citations.enabled ? ' -> biber -> ' + config.engine : ''}`,
    `% ============================================================================`,
  ];

  if (variant === 'class') {
    lines.push(`\\documentclass{${slug}}`);
  } else {
    lines.push(`\\documentclass[${classOpts.join(', ')}]{${baseClass}}`);
    lines.push(`\\usepackage{${slug}}`);
  }

  lines.push('');
  lines.push(`\\title{${escapeLatex(config.metadata.title)}}`);
  if (config.documentType === 'slides' && config.metadata.subtitle) {
    lines.push(`\\subtitle{${escapeLatex(config.metadata.subtitle)}}`);
  }
  lines.push(`\\author{${escapeLatex(config.metadata.author)}}`);
  if (config.documentType === 'slides' && config.metadata.institution) {
    lines.push(`\\institute{${escapeLatex(config.metadata.institution)}}`);
  }
  lines.push(`\\date{${escapeLatex(config.metadata.date)}}`);
  lines.push('');
  lines.push('\\begin{document}');
  lines.push('');
  lines.push(...buildSampleContent(config, contentMode));
  lines.push('');
  lines.push('\\end{document}');

  return lines.join('\n');
}

export function buildReferencesBib(): string {
  return `@book{bringhurst2012,
  author    = {Robert Bringhurst},
  title     = {The Elements of Typographic Style},
  edition   = {4},
  publisher = {Hartley \\& Marks},
  year      = {2012}
}

@article{silva2024,
  author    = {Ana Paula Silva and Ricardo Almeida},
  title     = {Padronização Modular de Modelos Tipográficos em LaTeX},
  journal   = {Revista Brasileira de Design Editorial},
  year      = {2024},
  volume    = {12},
  number    = {2},
  pages     = {44--61}
}

@book{knuth1984,
  author    = {Donald E. Knuth},
  title     = {The {\\TeX}book},
  publisher = {Addison-Wesley},
  year      = {1984}
}
`;
}

export function buildReadme(
  config: TemplateConfig,
  options: { includeClass: boolean; includeStyle: boolean }
): string {
  const slug = sanitizeSlug(config.templateSlug);
  const bibStep = config.modules.citations.enabled ? `biber main\n` : '';
  const compileCmd = `${config.engine} main.tex\n${bibStep}${config.engine} main.tex`;
  const fontFiles = config.customFonts.flatMap((fam) =>
    Object.values(fam.variants)
      .filter((v): v is NonNullable<typeof v> => Boolean(v))
      .map((v) => v.fileName)
  );

  return `# ${config.metadata.title} (${slug})

Generated with **Document Artisan**.

## Package Contents
${options.includeClass ? `- **\`${slug}.cls\`**: Standalone LaTeX Document Class (used via \`\\documentclass{${slug}}\`).\n` : ''}${options.includeStyle ? `- **\`${slug}.sty\`**: Reusable LaTeX Style Package (used via \`\\usepackage{${slug}}\`).\n` : ''}${config.modules.citations.enabled ? `- **\`${config.modules.citations.bibFile || 'references.bib'}\`**: Sample BibLaTeX bibliography (${config.modules.citations.style}).\n` : ''}${fontFiles.length > 0 ? `- **\`fonts/\`**: Bundled custom font files (${fontFiles.join(', ')}).\n` : ''}
## How to Compile

\`\`\`bash
${compileCmd}
\`\`\`

Recommended engine: **${config.engine}**
`;
}

export function generateProjectBundle(config: TemplateConfig): GeneratedFile[] {
  const slug = sanitizeSlug(config.templateSlug);
  const { includeClass, includeStyle, contentMode } = config.exportOptions;
  const both = includeClass && includeStyle;
  const files: GeneratedFile[] = [];

  const appendVariant = (variant: 'class' | 'style', prefix: string) => {
    const ext = variant === 'class' ? 'cls' : 'sty';
    const content = variant === 'class' ? buildClassFile(config) : buildStyleFile(config);
    files.push({
      path: `${prefix}${slug}.${ext}`,
      content,
      language: 'latex',
      label: `${prefix}${slug}.${ext}`,
    });
    files.push({
      path: `${prefix}main.tex`,
      content: buildMainTex(config, variant, contentMode),
      language: 'latex',
      label: `${prefix}main.tex`,
    });
    if (config.modules.citations.enabled) {
      const bibName = config.modules.citations.bibFile || 'references.bib';
      files.push({
        path: `${prefix}${bibName}`,
        content: buildReferencesBib(),
        language: 'bibtex',
        label: `${prefix}${bibName}`,
      });
    }
    for (const fam of config.customFonts) {
      for (const variantFile of Object.values(fam.variants)) {
        if (variantFile?.buffer) {
          files.push({
            path: `${prefix}fonts/${variantFile.fileName}`,
            content: variantFile.buffer,
            language: 'binary',
            label: `${prefix}fonts/${variantFile.fileName}`,
          });
        }
      }
    }
    const logos = [config.headerFooter.headerLogo, config.headerFooter.footerLogo];
    for (const logo of logos) {
      if (logo.enabled && logo.fileName && logo.buffer) {
        files.push({
          path: `${prefix}assets/${logo.fileName}`,
          content: logo.buffer,
          language: 'binary',
          label: `${prefix}assets/${logo.fileName}`,
        });
      }
    }
  };

  files.push({
    path: 'README.md',
    content: buildReadme(config, { includeClass, includeStyle }),
    language: 'markdown',
    label: 'README.md',
  });

  if (includeClass) {
    appendVariant('class', both ? 'class-version/' : '');
  }
  if (includeStyle) {
    appendVariant('style', both ? 'package-version/' : '');
  }

  return files;
}
