import { HeadingLevelStyle, TemplateConfig } from '../../types/template';
import { escapeLatex, hexToRgbDigits, needsTcolorboxInTypography } from './utils';

export function formatHeadingLevel(
  cmd: '\\section' | '\\subsection' | '\\subsubsection',
  style: HeadingLevelStyle,
  colorName: string,
  boxBgName: string,
  boxBorderName: string,
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
  const titleArg = style.transform === 'uppercase' ? '\\MakeUppercase{#1}' : '#1';

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

  if (style.decoration === 'box') {
    const b = style.box;
    const ruleOpts = b.borderLeftOnly
      ? `boxrule=0pt, leftrule=${b.borderWidthPt}pt`
      : `boxrule=${b.borderWidthPt}pt`;
    const commonOpts = [
      'enhanced',
      'nobeforeafter',
      'boxsep=0pt',
      `top=${b.paddingYPt}pt`,
      `bottom=${b.paddingYPt}pt`,
      `left=${b.paddingXPt}pt`,
      `right=${b.paddingXPt}pt`,
      `colback=${boxBgName}`,
      `colframe=${boxBorderName}`,
      `arc=${b.radiusPt}pt`,
      ruleOpts,
    ];
    const fmtPrefix = `${alignCmd}${fontCmd}${sizeCmd}${weightCmd}${italicCmd}${scCmd}\\color{${colorName}}`;

    const wrapContent = (inner: string) =>
      b.fullWidth
        ? `\\begin{tcolorbox}[${commonOpts.join(', ')}, width=\\linewidth, halign=${style.alignment}]${inner}\\end{tcolorbox}`
        : `\\tcbox[${commonOpts.join(', ')}]{${inner}}`;

    return [
      `\\titleformat{${cmd}}{${fmtPrefix}}{}{0pt}{${wrapContent(`${labelNum}${sepToken}\\hspace{0.45em}${titleArg}`)}}`,
      `\\titleformat{name=${cmd}, numberless}{${fmtPrefix}}{}{0pt}{${wrapContent(titleArg)}}`,
      `\\titlespacing*{${cmd}}{0pt}{${style.spaceBeforePt}pt}{${style.spaceAfterPt}pt}`,
    ];
  }

  const barPrefix =
    style.decoration === 'leftBar'
      ? `{\\color{${colorName}}\\rule[-0.15em]{2.5pt}{1.05em}}\\hspace{0.45em}`
      : '';
  const bottomTrailer =
    style.decoration === 'bottomRule'
      ? `[\\vspace{2pt}{\\color{${colorName}}\\titlerule[0.6pt]}]`
      : '';

  return [
    `\\titleformat{${cmd}}{${alignCmd}${fontCmd}${sizeCmd}${weightCmd}${italicCmd}${scCmd}\\color{${colorName}}}{${barPrefix}${labelNum}${sepToken}}{0.5em}{${titleArg}}${bottomTrailer}`,
    `\\titlespacing*{${cmd}}{0pt}{${style.spaceBeforePt}pt}{${style.spaceAfterPt}pt}`,
  ];
}

export function buildTypographyAndHeadingsBlock(config: TemplateConfig): string[] {
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
  lines.push(`\\definecolor{artisanH1BoxBg}{HTML}{${hexToRgbDigits(t.headings.h1.box.bgColor)}}`);
  lines.push(`\\definecolor{artisanH1BoxBorder}{HTML}{${hexToRgbDigits(t.headings.h1.box.borderColor)}}`);
  lines.push(`\\definecolor{artisanH2}{HTML}{${hexToRgbDigits(t.headings.h2.color)}}`);
  lines.push(`\\definecolor{artisanH2BoxBg}{HTML}{${hexToRgbDigits(t.headings.h2.box.bgColor)}}`);
  lines.push(`\\definecolor{artisanH2BoxBorder}{HTML}{${hexToRgbDigits(t.headings.h2.box.borderColor)}}`);
  lines.push(`\\definecolor{artisanH3}{HTML}{${hexToRgbDigits(t.headings.h3.color)}}`);
  lines.push(`\\definecolor{artisanH3BoxBg}{HTML}{${hexToRgbDigits(t.headings.h3.box.bgColor)}}`);
  lines.push(`\\definecolor{artisanH3BoxBorder}{HTML}{${hexToRgbDigits(t.headings.h3.box.borderColor)}}`);
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

    if (needsTcolorboxInTypography(config)) {
      lines.push('\\RequirePackage[most]{tcolorbox}');
    }
    lines.push('\\RequirePackage[explicit]{titlesec}');
    if (config.frontMatter.sectionStartsNewPage) {
      lines.push('\\newcommand{\\sectionbreak}{\\clearpage}');
    }
    lines.push(
      ...formatHeadingLevel(
        '\\section',
        t.headings.h1,
        'artisanH1',
        'artisanH1BoxBg',
        'artisanH1BoxBorder',
        '\\headingfont'
      )
    );
    lines.push(
      ...formatHeadingLevel(
        '\\subsection',
        t.headings.h2,
        'artisanH2',
        'artisanH2BoxBg',
        'artisanH2BoxBorder',
        '\\headingfont'
      )
    );
    lines.push(
      ...formatHeadingLevel(
        '\\subsubsection',
        t.headings.h3,
        'artisanH3',
        'artisanH3BoxBg',
        'artisanH3BoxBorder',
        '\\headingfont'
      )
    );
  }

  return lines;
}
