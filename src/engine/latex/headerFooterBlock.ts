import {
  HeaderFooterLogoConfig,
  HeaderFooterToken,
  LogoSlot,
  RuleStyle,
  TemplateConfig,
} from '../../types/template';
import { escapeLatex } from './utils';

export function resolveTokenLatex(
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

export function formatSlotTextLatex(
  rawLatex: string,
  stackAlign: 'l' | 'c' | 'r',
  upper: boolean
): string {
  if (!rawLatex) return '';
  const parts = rawLatex
    .split(/\r?\n/)
    .map((line) => (upper ? `\\MakeUppercase{${line}}` : line));
  if (parts.length <= 1) return parts[0];
  return `\\shortstack[${stackAlign}]{${parts.join(' \\\\ ')}}`;
}

export function renderLogoLatex(logo: HeaderFooterLogoConfig): string {
  if (!logo.enabled) return '';
  if (logo.fileName && logo.buffer) {
    const imgCmd = `\\includegraphics[height=${logo.heightMm}mm]{assets/${logo.fileName}}`;
    return `\\raisebox{\\dimexpr -0.35\\height + ${logo.verticalOffsetMm}mm\\relax}{${imgCmd}}`;
  }
  return '\\fbox{\\scriptsize LOGO}';
}

export function buildRuleCommand(
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

export function composeSlotWithLogo(
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

export function buildHeaderFooterBlock(config: TemplateConfig): string[] {
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
