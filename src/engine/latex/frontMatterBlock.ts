import { TemplateConfig } from '../../types/template';
import { escapeLatex } from './utils';

function formatUpperIf(text: string, upper: boolean): string {
  const escaped = escapeLatex(text);
  return upper ? `\\MakeUppercase{${escaped}}` : escaped;
}

export function buildFrontMatterMacros(config: TemplateConfig): string[] {
  if (config.documentType === 'slides') return [];

  const fm = config.frontMatter;
  const lines: string[] = [];

  if (fm.coverPage.enabled) {
    const cp = fm.coverPage;
    const logo = config.headerFooter.headerLogo;
    const logoLine = !cp.showLogo
      ? ''
      : logo.enabled && logo.fileName && logo.buffer
        ? `  \\vspace{0.5cm}\\includegraphics[height=${cp.logoHeightMm}mm]{assets/${logo.fileName}}\\par\\vspace{0.6cm}`
        : `  \\vspace{0.5cm}\\fbox{\\scriptsize LOGO}\\par\\vspace{0.6cm}`;

    lines.push('% --- Cover Page Macro ---');
    lines.push('\\newcommand{\\artisancoverpage}{%');
    lines.push('  \\begin{titlepage}');
    lines.push('  \\thispagestyle{empty}');
    if (cp.borderFrame) {
      lines.push('  \\noindent\\fbox{\\begin{minipage}[c][0.92\\textheight][c]{0.95\\textwidth}');
    }
    lines.push('  \\centering\\setlength{\\parindent}{0pt}');
    if (cp.showInstitution && config.metadata.institution) {
      lines.push(`  {\\bfseries ${formatUpperIf(config.metadata.institution, true)}\\par}`);
    }
    if (logoLine) {
      lines.push(logoLine);
    }
    if (cp.showCourse && cp.course) {
      lines.push(`  \\vspace{0.25cm}{${escapeLatex(cp.course)}\\par}`);
    }
    lines.push('  \\vspace{1.8cm}');
    lines.push(`  {\\bfseries ${formatUpperIf(config.metadata.author, cp.uppercaseAuthor)}\\par}`);
    lines.push('  \\vfill');
    lines.push(
      `  {\\titlefont\\fontsize{${config.typography.titleBlock.fontSizePt}}{${(config.typography.titleBlock.fontSizePt * 1.2).toFixed(1)}}\\selectfont\\bfseries\\color{artisanTitleColor} ${formatUpperIf(config.metadata.title, cp.uppercaseTitle)}\\par}`
    );
    if (config.metadata.subtitle) {
      lines.push(`  \\vspace{0.35cm}{\\color{artisanMuted} ${escapeLatex(config.metadata.subtitle)}\\par}`);
    }
    lines.push('  \\vfill');
    if (cp.showCity && cp.city) {
      lines.push(`  {${escapeLatex(cp.city)}\\par}`);
    }
    lines.push(`  {${escapeLatex(config.metadata.date)}\\par}`);
    if (cp.borderFrame) {
      lines.push('  \\end{minipage}}');
    }
    lines.push('  \\end{titlepage}');
    lines.push('}');
    lines.push('');
  }

  if (fm.titleSheet.enabled) {
    const ts = fm.titleSheet;
    const widthFrac = ts.natureWidthRatio.toFixed(2);
    lines.push('% --- Title Sheet (Folha de Rosto) Macro ---');
    lines.push('\\newcommand{\\artisantitlesheet}{%');
    lines.push('  \\clearpage');
    lines.push('  \\thispagestyle{empty}');
    if (fm.startNumberingAtBody) {
      lines.push('  \\setcounter{page}{1}');
    }
    lines.push('  {\\centering\\setlength{\\parindent}{0pt}');
    lines.push(`    {\\bfseries ${formatUpperIf(config.metadata.author, fm.coverPage.uppercaseAuthor)}\\par}`);
    lines.push('    \\vfill');
    lines.push(
      `    {\\titlefont\\fontsize{${config.typography.titleBlock.fontSizePt}}{${(config.typography.titleBlock.fontSizePt * 1.2).toFixed(1)}}\\selectfont\\bfseries\\color{artisanTitleColor} ${formatUpperIf(config.metadata.title, fm.coverPage.uppercaseTitle)}\\par}`
    );
    if (config.metadata.subtitle) {
      lines.push(`    \\vspace{0.3cm}{\\color{artisanMuted} ${escapeLatex(config.metadata.subtitle)}\\par}`);
    }
    lines.push('  \\par}');
    lines.push('  \\vspace{1.8cm}');
    lines.push('  \\noindent\\hspace*{\\fill}\\begin{minipage}{' + widthFrac + '\\linewidth}');
    lines.push('    \\setstretch{1.05}\\fontsize{10}{12}\\selectfont\\raggedright');
    if (ts.natureNote) {
      lines.push(`    ${escapeLatex(ts.natureNote)}\\par`);
    }
    if (ts.advisorName) {
      lines.push(
        `    \\vspace{0.5em}\\textbf{${escapeLatex(ts.advisorLabel)}} ${escapeLatex(ts.advisorName)}\\par`
      );
    }
    if (ts.coadvisorName) {
      lines.push(
        `    \\vspace{0.25em}\\textbf{${escapeLatex(ts.coadvisorLabel)}} ${escapeLatex(ts.coadvisorName)}\\par`
      );
    }
    lines.push('  \\end{minipage}\\par');
    lines.push('  \\vfill');
    if (ts.showCityAndDate) {
      lines.push('  {\\centering\\setlength{\\parindent}{0pt}');
      if (fm.coverPage.city) {
        lines.push(`    {${escapeLatex(fm.coverPage.city)}\\par}`);
      }
      lines.push(`    {${escapeLatex(config.metadata.date)}\\par}`);
      lines.push('  \\par}');
    }
    lines.push('  \\clearpage');
    lines.push('}');
    lines.push('');
  }

  if (fm.abstractBlock.enabled) {
    const ab = fm.abstractBlock;
    lines.push('% --- Abstract & Keywords Macro ---');
    lines.push('\\newcommand{\\artisanabstract}{%');
    if (ab.onSeparatePage) {
      lines.push('  \\clearpage');
      lines.push('  \\thispagestyle{empty}');
    } else {
      lines.push('  \\vspace{4pt}');
    }
    lines.push('  {\\begingroup\\setlength{\\parindent}{0pt}');
    lines.push(
      `    {\\centering\\headingfont\\bfseries\\MakeUppercase{${escapeLatex(ab.title)}}\\par}`
    );
    lines.push('    \\vspace{0.5em}');
    lines.push(
      `    {\\fontsize{${ab.fontSizePt}}{${(ab.fontSizePt * 1.2).toFixed(1)}}\\selectfont\\setstretch{${ab.lineSpacing.toFixed(2)}}`
    );
    lines.push(`      ${escapeLatex(ab.text)}\\par`);
    if (ab.keywords) {
      lines.push(
        `      \\vspace{0.45em}\\textbf{${escapeLatex(ab.keywordsLabel)}} ${escapeLatex(ab.keywords)}\\par`
      );
    }
    lines.push('    }');
    if (ab.includeEnglishAbstract) {
      if (ab.onSeparatePage) {
        lines.push('    \\clearpage\\thispagestyle{empty}');
      } else {
        lines.push('    \\vspace{1em}');
      }
      lines.push(
        `    {\\centering\\headingfont\\bfseries\\MakeUppercase{${escapeLatex(ab.englishTitle)}}\\par}`
      );
      lines.push('    \\vspace{0.5em}');
      lines.push(
        `    {\\fontsize{${ab.fontSizePt}}{${(ab.fontSizePt * 1.2).toFixed(1)}}\\selectfont\\setstretch{${ab.lineSpacing.toFixed(2)}}`
      );
      lines.push(`      ${escapeLatex(ab.englishText)}\\par`);
      if (ab.englishKeywords) {
        lines.push(
          `      \\vspace{0.45em}\\textbf{${escapeLatex(ab.englishKeywordsLabel)}} ${escapeLatex(ab.englishKeywords)}\\par`
        );
      }
      lines.push('    }');
    }
    lines.push('  \\endgroup}');
    lines.push(ab.onSeparatePage ? '  \\clearpage' : '  \\vspace{10pt}');
    lines.push('}');
    lines.push('');
  }

  return lines;
}
