import { TemplateConfig } from '../../types/template';

function formatUpperExpr(expr: string, upper: boolean): string {
  return upper ? `\\MakeUppercase{${expr}}` : expr;
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
    lines.push('\\makeatletter');
    lines.push('\\newcommand{\\artisancoverpage}{%');
    lines.push('  \\begin{titlepage}');
    lines.push('  \\thispagestyle{empty}');
    if (cp.borderFrame) {
      lines.push('  \\noindent\\fbox{\\begin{minipage}[c][0.92\\textheight][c]{0.95\\textwidth}');
    }
    lines.push('  \\centering\\setlength{\\parindent}{0pt}');
    if (cp.showInstitution) {
      lines.push(
        `  \\ifdefempty{\\@artisaninstitution}{}{\\par{\\bfseries ${formatUpperExpr('\\@artisaninstitution', true)}\\par}}`
      );
    }
    if (logoLine) {
      lines.push(logoLine);
    }
    if (cp.showCourse) {
      lines.push('  \\ifdefempty{\\@artisancourse}{}{\\vspace{0.25cm}{\\@artisancourse\\par}}');
    }
    lines.push('  \\vspace{1.8cm}');
    lines.push(`  {\\bfseries ${formatUpperExpr('\\@artisanauthornames', cp.uppercaseAuthor)}\\par}`);
    lines.push('  \\vfill');
    lines.push(
      `  {\\titlefont\\fontsize{${config.typography.titleBlock.fontSizePt}}{${(config.typography.titleBlock.fontSizePt * 1.2).toFixed(1)}}\\selectfont\\bfseries\\color{artisanTitleColor} ${formatUpperExpr('\\@artisandocumenttitle', cp.uppercaseTitle)}\\par}`
    );
    lines.push(
      '  \\ifdefempty{\\@artisansubtitle}{}{\\vspace{0.35cm}{\\color{artisanMuted} \\@artisansubtitle\\par}}'
    );
    lines.push('  \\vfill');
    if (cp.showCity) {
      lines.push('  \\ifdefempty{\\@artisancity}{}{\\@artisancity\\par}');
    }
    lines.push('  {\\@artisandocumentdate\\par}');
    if (cp.borderFrame) {
      lines.push('  \\end{minipage}}');
    }
    lines.push('  \\end{titlepage}');
    lines.push('}');
    lines.push('\\makeatother');
    lines.push('');
  }

  if (fm.titleSheet.enabled) {
    const ts = fm.titleSheet;
    const widthFrac = ts.natureWidthRatio.toFixed(2);
    lines.push('% --- Title Sheet (Folha de Rosto) Macro ---');
    lines.push('\\makeatletter');
    lines.push('\\newcommand{\\artisantitlesheet}{%');
    lines.push('  \\clearpage');
    lines.push('  \\thispagestyle{empty}');
    if (fm.startNumberingAtBody) {
      lines.push('  \\setcounter{page}{1}');
    }
    lines.push('  {\\centering\\setlength{\\parindent}{0pt}');
    lines.push(
      `    {\\bfseries ${formatUpperExpr('\\@artisanauthornames', fm.coverPage.uppercaseAuthor)}\\par}`
    );
    lines.push('    \\vfill');
    lines.push(
      `    {\\titlefont\\fontsize{${config.typography.titleBlock.fontSizePt}}{${(config.typography.titleBlock.fontSizePt * 1.2).toFixed(1)}}\\selectfont\\bfseries\\color{artisanTitleColor} ${formatUpperExpr('\\@artisandocumenttitle', fm.coverPage.uppercaseTitle)}\\par}`
    );
    lines.push(
      '    \\ifdefempty{\\@artisansubtitle}{}{\\vspace{0.3cm}{\\color{artisanMuted} \\@artisansubtitle\\par}}'
    );
    lines.push('  \\par}');
    lines.push('  \\vspace{1.8cm}');
    lines.push('  \\noindent\\hspace*{\\fill}\\begin{minipage}{' + widthFrac + '\\linewidth}');
    lines.push('    \\setstretch{1.05}\\fontsize{10}{12}\\selectfont\\raggedright');
    lines.push('    \\ifdefempty{\\@artisannaturenote}{}{\\@artisannaturenote\\par}');
    lines.push(
      '    \\ifdefempty{\\@artisanadvisor}{}{\\vspace{0.5em}\\textbf{\\@artisanadvisorlabel} \\@artisanadvisor\\par}'
    );
    lines.push(
      '    \\ifdefempty{\\@artisancoadvisor}{}{\\vspace{0.25em}\\textbf{\\@artisancoadvisorlabel} \\@artisancoadvisor\\par}'
    );
    lines.push('  \\end{minipage}\\par');
    lines.push('  \\vfill');
    if (ts.showCityAndDate) {
      lines.push('  {\\centering\\setlength{\\parindent}{0pt}');
      lines.push('    \\ifdefempty{\\@artisancity}{}{\\@artisancity\\par}');
      lines.push('    {\\@artisandocumentdate\\par}');
      lines.push('  \\par}');
    }
    lines.push('  \\clearpage');
    lines.push('}');
    lines.push('\\makeatother');
    lines.push('');
  }

  if (fm.abstractBlock.enabled) {
    const ab = fm.abstractBlock;
    lines.push('% --- Abstract & Keywords Macro ---');
    lines.push('\\makeatletter');
    lines.push('\\newcommand{\\artisanabstract}{%');
    if (ab.onSeparatePage) {
      lines.push('  \\clearpage');
      lines.push('  \\thispagestyle{empty}');
    } else {
      lines.push('  \\vspace{4pt}');
    }
    lines.push('  {\\begingroup\\setlength{\\parindent}{0pt}');
    lines.push(
      '    {\\centering\\headingfont\\bfseries\\MakeUppercase{\\@artisanabstracttitle}\\par}'
    );
    lines.push('    \\vspace{0.5em}');
    lines.push(
      `    {\\fontsize{${ab.fontSizePt}}{${(ab.fontSizePt * 1.2).toFixed(1)}}\\selectfont\\setstretch{${ab.lineSpacing.toFixed(2)}}`
    );
    lines.push('      \\@artisanabstracttext\\par');
    lines.push(
      '      \\ifdefempty{\\@artisankeywords}{}{\\vspace{0.45em}\\textbf{\\@artisankeywordslabel} \\@artisankeywords\\par}'
    );
    lines.push('    }');
    if (ab.includeEnglishAbstract) {
      if (ab.onSeparatePage) {
        lines.push('    \\clearpage\\thispagestyle{empty}');
      } else {
        lines.push('    \\vspace{1em}');
      }
      lines.push(
        '    {\\centering\\headingfont\\bfseries\\MakeUppercase{\\@artisanenglishtitle}\\par}'
      );
      lines.push('    \\vspace{0.5em}');
      lines.push(
        `    {\\fontsize{${ab.fontSizePt}}{${(ab.fontSizePt * 1.2).toFixed(1)}}\\selectfont\\setstretch{${ab.lineSpacing.toFixed(2)}}`
      );
      lines.push('      \\@artisanenglishtext\\par');
      lines.push(
        '      \\ifdefempty{\\@artisanenglishkeywords}{}{\\vspace{0.45em}\\textbf{\\@artisanenglishkeywordslabel} \\@artisanenglishkeywords\\par}'
      );
      lines.push('    }');
    }
    lines.push('  \\endgroup}');
    lines.push(ab.onSeparatePage ? '  \\clearpage' : '  \\vspace{10pt}');
    lines.push('}');
    lines.push('\\makeatother');
    lines.push('');
  }

  return lines;
}
