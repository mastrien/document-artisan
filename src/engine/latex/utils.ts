import { PAPER_SPECS } from '../../data/fonts';
import { CaptionSeparator, TemplateConfig } from '../../types/template';

export function sanitizeSlug(raw: string): string {
  const cleaned = raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return cleaned || 'custom-template';
}

export function escapeLatex(text: string): string {
  return text
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/([&%$#_{}])/g, '\\$1')
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/\^/g, '\\textasciicircum{}');
}

export function hexToRgbDigits(hex: string): string {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return '000000';
  return clean.toUpperCase();
}

export function baseLatexClass(config: TemplateConfig): string {
  switch (config.documentType) {
    case 'book':
      return 'book';
    case 'slides':
      return 'beamer';
    default:
      // 'article', 'monograph', and 'report' all build cleanly on article + titlesec/fancyhdr
      return 'article';
  }
}

export function getClassOptions(config: TemplateConfig): string[] {
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

export function hasBoxedHeading(config: TemplateConfig): boolean {
  const { h1, h2, h3 } = config.typography.headings;
  return (
    config.documentType !== 'slides' &&
    (h1.decoration === 'box' || h2.decoration === 'box' || h3.decoration === 'box')
  );
}

export function needsTcolorboxInTypography(config: TemplateConfig): boolean {
  if (config.documentType === 'slides') return false;
  return (
    config.typography.titleBlock.box.enabled ||
    hasBoxedHeading(config) ||
    config.modules.callouts.enabled ||
    (config.modules.longQuotes.enabled && config.modules.longQuotes.leftBorder)
  );
}

export function needsEarlyGraphicx(config: TemplateConfig): boolean {
  if (config.documentType === 'slides') return false;
  return (
    config.headerFooter.headerLogo.enabled ||
    config.headerFooter.footerLogo.enabled ||
    (config.frontMatter.coverPage.enabled && config.frontMatter.coverPage.showLogo)
  );
}

export function hasPreTextualPages(config: TemplateConfig): boolean {
  if (config.documentType === 'slides') return false;
  const fm = config.frontMatter;
  const separateToc =
    config.numbering.includeToc &&
    (config.documentType === 'monograph' || fm.coverPage.enabled || fm.titleSheet.enabled);
  return (
    fm.coverPage.enabled ||
    fm.titleSheet.enabled ||
    (fm.abstractBlock.enabled && fm.abstractBlock.onSeparatePage) ||
    fm.includeListOfFigures ||
    fm.includeListOfTables ||
    separateToc
  );
}

export function separatorLatex(sep: CaptionSeparator): string {
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

export function captionJustifyLatex(align: string): string {
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
