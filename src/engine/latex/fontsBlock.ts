import { getFontById } from '../../data/fonts';
import { CustomFontFamily, TemplateConfig } from '../../types/template';

export function formatCustomFontspecArgs(family: CustomFontFamily, lsPct: number): string {
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

export function formatFontSpecForId(
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

export function buildFontBlock(config: TemplateConfig): string[] {
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
