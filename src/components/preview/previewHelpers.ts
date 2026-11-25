import { resolveFontOption } from '../../data/fonts';
import {
  CaptionSeparator,
  HeaderFooterToken,
  HeadingLevelStyle,
  PageNumberStyle,
  TemplateConfig,
} from '../../types/template';

export const MM_TO_PX = 3.7795275591;

export function formatPageNumber(num: number, style: PageNumberStyle): string {
  if (style === 'none') return '';
  if (style === 'arabic') return String(num);
  if (style === 'alph') return String.fromCharCode(96 + num);
  const romans = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x'];
  const val = romans[num - 1] ?? String(num);
  return style === 'Roman' ? val.toUpperCase() : val;
}

export function resolvePreviewToken(
  token: HeaderFooterToken,
  customText: string,
  config: TemplateConfig,
  pageNumber: number,
  totalPages: number,
  sectionLabel: string
): string {
  const formattedPage = formatPageNumber(pageNumber, config.numbering.pageStyle);
  const formattedTotal = formatPageNumber(totalPages, config.numbering.pageStyle);

  switch (token) {
    case 'empty':
      return '';
    case 'title':
      return config.metadata.title;
    case 'section':
      return sectionLabel;
    case 'author':
      return config.metadata.author;
    case 'page':
      return formattedPage;
    case 'pageOfTotal':
      if (!formattedPage) return '';
      return config.documentLanguage === 'brazilian'
        ? `Página ${formattedPage} de ${formattedTotal}`
        : `Page ${formattedPage} of ${formattedTotal}`;
    case 'date':
      return config.metadata.date;
    case 'institution':
      return config.metadata.institution;
    case 'custom':
      return customText;
  }
}

export function resolveRoleFontFamily(
  config: TemplateConfig,
  role: 'body' | 'title' | 'heading' | 'headerFooter' | 'caption' | 'mono'
): string {
  const t = config.typography;
  const fontId =
    role === 'body'
      ? t.bodyFontId
      : role === 'title'
        ? t.titleFontId
        : role === 'heading'
          ? t.headingFontId
          : role === 'headerFooter'
            ? t.headerFooterFontId
            : role === 'caption'
              ? t.captionFontId
              : t.monoFontId;

  return resolveFontOption(fontId, config.customFonts).cssFamily;
}

export function formatSectionLabel(
  level: 1 | 2 | 3,
  nums: [number, number?, number?],
  style: HeadingLevelStyle,
  config: TemplateConfig
): string {
  if (config.numbering.sectionDepth < level || config.numbering.sectionStyle === 'none') {
    return '';
  }
  const romans = ['I', 'II', 'III', 'IV', 'V'];
  const n1 =
    config.numbering.sectionStyle === 'roman'
      ? romans[(nums[0] ?? 1) - 1] ?? String(nums[0])
      : String(nums[0]);

  let rawNum = n1;
  if (level >= 2 && nums[1] !== undefined) rawNum += `.${nums[1]}`;
  if (level === 3 && nums[2] !== undefined) rawNum += `.${nums[2]}`;

  if (style.numberSeparator === 'dot') return `${rawNum}. `;
  if (style.numberSeparator === 'dash') return `${rawNum} — `;
  return `${rawNum} `;
}

export function formatCaptionSeparator(sep: CaptionSeparator): string {
  switch (sep) {
    case 'colon':
      return ': ';
    case 'endash':
      return ' – ';
    case 'emdash':
      return ' — ';
    case 'period':
      return '. ';
  }
}

export function formatInlineCitation(config: TemplateConfig): string {
  const style = config.modules.citations.style;
  switch (style) {
    case 'abnt':
      return '(SILVA; ALMEIDA, 2024; BRINGHURST, 2012)';
    case 'apa':
    case 'authoryear':
      return '(Silva & Almeida, 2024; Bringhurst, 2012)';
    case 'ieee':
    case 'numeric':
      return '[1], [2]';
    case 'vancouver':
      return '(1, 2)';
  }
}
