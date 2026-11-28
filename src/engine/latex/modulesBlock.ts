import { ListBulletStyle, ListEnumStyle, TemplateConfig } from '../../types/template';
import {
  captionJustifyLatex,
  escapeLatex,
  needsEarlyGraphicx,
  needsTcolorboxInTypography,
  separatorLatex,
} from './utils';

function mapBulletSymbolLatex(style: ListBulletStyle): string {
  switch (style) {
    case 'dash':
      return '--';
    case 'square':
      return '\\rule[0.25ex]{0.55ex}{0.55ex}';
    case 'arrow':
      return '\\textrightarrow';
    default:
      return '\\textbullet';
  }
}

function mapEnumFormatLatex(style: ListEnumStyle): string {
  switch (style) {
    case 'alphaParen':
      return '\\alph*)';
    case 'romanParen':
      return '\\roman*)';
    default:
      return '\\arabic*.';
  }
}

export function buildModulesBlock(config: TemplateConfig): string[] {
  const m = config.modules;
  const lines: string[] = [];

  lines.push('% --- Enabled Functional Modules ---');

  const isSlides = config.documentType === 'slides';

  if (m.images.enabled || m.tables.enabled) {
    lines.push('% [Shared Caption Engine]');
    if (isSlides) {
      lines.push('\\RequirePackage{etoolbox}');
    }
    if (!isSlides) {
      lines.push('\\RequirePackage{caption}');
      lines.push('\\DeclareCaptionLabelSeparator{endash}{~--~}');
      lines.push('\\DeclareCaptionLabelSeparator{emdash}{~---~}');
    }
    lines.push(
      '\\newcommand{\\artisansource}[2][left]{\\par\\vspace{3pt}{\\ifstrequal{#1}{center}{\\centering}{\\ifstrequal{#1}{right}{\\raggedleft}{\\raggedright}}\\captionfont\\footnotesize\\color{artisanMuted}#2\\par}}'
    );
    lines.push('');
  }

  if (m.images.enabled) {
    const img = m.images;
    lines.push('% [Module: Images & Figures]');
    if (!needsEarlyGraphicx(config)) {
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
      lines.push('  font={color=artisanFigCaption},');
      lines.push(`  textfont={${img.captionItalic ? 'it' : 'normalfont'}},`);
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
      const prefixTex = img.sourcePrefixBold
        ? `\\textbf{${escapeLatex(img.sourcePrefix)}}`
        : escapeLatex(img.sourcePrefix);
      lines.push(
        `    \\ifstrempty{#4}{}{\\artisansource[${img.sourceAlign}]{${prefixTex} #4}}`
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
    // accite=false enforces ABNT NBR 10520:2023 Title Case surnames in parenthetical citations
    const abntOpts =
      m.citations.style === 'abnt'
        ? `, accite=${m.citations.abntCiteCase === 'uppercase' ? 'true' : 'false'}`
        : '';
    lines.push(
      `\\RequirePackage[backend=biber, style=${m.citations.style}${abntOpts}, sorting=nyt]{biblatex}`
    );
    lines.push(`\\addbibresource{${m.citations.bibFile || 'references.bib'}}`);
    lines.push('');
  }

  if (m.longQuotes.enabled && !isSlides) {
    const lq = m.longQuotes;
    lines.push('% [Module: Long Direct Quotes (NBR 10520)]');
    const styleCmd = `\\fontsize{${lq.fontSizePt}}{${(lq.fontSizePt * 1.15).toFixed(1)}}\\selectfont\\setstretch{${lq.lineSpacing.toFixed(2)}}${lq.italic ? '\\itshape' : ''}`;
    if (lq.leftBorder) {
      lines.push('\\newtcolorbox{citacaolonga}{');
      lines.push('  enhanced, breakable,');
      lines.push('  colback=artisanPaper, colframe=artisanAccent,');
      lines.push('  boxrule=0pt, leftrule=2pt, arc=0pt,');
      lines.push('  left=8pt, right=0pt, top=2pt, bottom=2pt,');
      lines.push(`  enlarge left by=${lq.indentLeftMm}mm,`);
      lines.push(`  width=\\dimexpr\\linewidth-${lq.indentLeftMm}mm\\relax,`);
      lines.push(`  fontupper={${styleCmd}}`);
      lines.push('}');
    } else {
      lines.push('\\newenvironment{citacaolonga}{%');
      lines.push(
        `  \\begin{list}{}{\\setlength{\\leftmargin}{${lq.indentLeftMm}mm}\\setlength{\\rightmargin}{0pt}\\setlength{\\topsep}{6pt}\\setlength{\\parsep}{0pt}}\\item\\relax${styleCmd}`
      );
      lines.push('}{\\end{list}}');
    }
    lines.push('\\newenvironment{longquote}{\\begin{citacaolonga}}{\\end{citacaolonga}}');
    lines.push('');
  }

  if (m.lists.enabled) {
    const lst = m.lists;
    lines.push('% [Module: Custom Lists & Enumerations]');
    lines.push('\\RequirePackage{enumitem}');
    lines.push(`\\setlist{itemsep=${lst.itemSepPt}pt, leftmargin=${lst.leftMarginMm}mm}`);
    lines.push(`\\setlist[itemize,1]{label=${mapBulletSymbolLatex(lst.bulletStyle)}}`);
    lines.push(`\\setlist[enumerate,1]{label=${mapEnumFormatLatex(lst.enumStyle)}}`);
    lines.push('');
  }

  if (m.footnotes.enabled && !isSlides) {
    const fn = m.footnotes;
    lines.push('% [Module: Footnotes]');
    lines.push(`\\RequirePackage[${fn.hangingIndent ? 'hang, ' : ''}bottom]{footmisc}`);
    lines.push(
      `\\renewcommand{\\footnotelayout}{\\fontsize{${fn.fontSizePt}}{${(fn.fontSizePt * 1.2).toFixed(1)}}\\selectfont\\setstretch{${fn.lineSpacing.toFixed(2)}}}`
    );
    lines.push(
      `\\renewcommand{\\footnoterule}{\\kern-3pt\\hrule width ${fn.ruleWidthRatio.toFixed(2)}\\columnwidth height 0.4pt\\kern 2.6pt}`
    );
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
    if (!needsTcolorboxInTypography(config)) {
      lines.push('\\RequirePackage[most]{tcolorbox}');
    }
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

  if (m.hyperref.enabled && !isSlides) {
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
