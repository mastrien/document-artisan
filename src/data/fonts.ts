import { CustomFontFamily, PaperSize } from '../types/template';

export interface FontOption {
  id: string;
  label: string;
  category: 'serif' | 'sans' | 'mono' | 'system';
  cssFamily: string;
  fontspecName: string;
  pdflatexPackage: string;
  sampleTag: string;
}

export const FONT_CATALOG: FontOption[] = [
  {
    id: 'source-serif',
    label: 'Source Serif 4',
    category: 'serif',
    cssFamily: '"Source Serif 4", Georgia, serif',
    fontspecName: 'Source Serif 4',
    pdflatexPackage: '\\RequirePackage{sourceserifpro}',
    sampleTag: 'Editorial',
  },
  {
    id: 'eb-garamond',
    label: 'EB Garamond',
    category: 'serif',
    cssFamily: '"EB Garamond", Garamond, Georgia, serif',
    fontspecName: 'EB Garamond',
    pdflatexPackage: '\\RequirePackage{ebgaramond}',
    sampleTag: 'Classic Book',
  },
  {
    id: 'merriweather',
    label: 'Merriweather',
    category: 'serif',
    cssFamily: '"Merriweather", Georgia, serif',
    fontspecName: 'Merriweather',
    pdflatexPackage: '\\RequirePackage{merriweather}',
    sampleTag: 'Academic',
  },
  {
    id: 'lora',
    label: 'Lora',
    category: 'serif',
    cssFamily: '"Lora", Georgia, serif',
    fontspecName: 'Lora',
    pdflatexPackage: '\\RequirePackage{lora}',
    sampleTag: 'Literary',
  },
  {
    id: 'crimson-pro',
    label: 'Crimson Pro',
    category: 'serif',
    cssFamily: '"Crimson Pro", Georgia, serif',
    fontspecName: 'Crimson Pro',
    pdflatexPackage: '\\RequirePackage{cochineal}',
    sampleTag: 'Humanities',
  },
  {
    id: 'playfair',
    label: 'Playfair Display',
    category: 'serif',
    cssFamily: '"Playfair Display", Georgia, serif',
    fontspecName: 'Playfair Display',
    pdflatexPackage: '\\RequirePackage{newtxtext}',
    sampleTag: 'Display',
  },
  {
    id: 'latin-modern',
    label: 'Latin Modern (TeX)',
    category: 'serif',
    cssFamily: '"EB Garamond", "Crimson Pro", serif',
    fontspecName: 'Latin Modern Roman',
    pdflatexPackage: '\\RequirePackage{lmodern}',
    sampleTag: 'LaTeX Default',
  },
  {
    id: 'inter',
    label: 'Inter',
    category: 'sans',
    cssFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
    fontspecName: 'Inter',
    pdflatexPackage: '\\RequirePackage[default]{sourcesanspro}',
    sampleTag: 'Clean UI',
  },
  {
    id: 'fira-sans',
    label: 'Fira Sans',
    category: 'sans',
    cssFamily: '"Fira Sans", Arial, sans-serif',
    fontspecName: 'Fira Sans',
    pdflatexPackage: '\\RequirePackage[scaled=0.95]{FiraSans}',
    sampleTag: 'Slides & Tech',
  },
  {
    id: 'jetbrains-mono',
    label: 'JetBrains Mono',
    category: 'mono',
    cssFamily: '"JetBrains Mono", Consolas, monospace',
    fontspecName: 'JetBrains Mono',
    pdflatexPackage: '\\RequirePackage{inconsolata}',
    sampleTag: 'Code',
  },
  // Classic DOCX / Office System Fonts
  {
    id: 'system:Times New Roman',
    label: 'Times New Roman (DOCX)',
    category: 'system',
    cssFamily: '"Times New Roman", Times, "Crimson Pro", serif',
    fontspecName: 'Times New Roman',
    pdflatexPackage: '\\RequirePackage{newtxtext}',
    sampleTag: 'DOCX Serif',
  },
  {
    id: 'system:Arial',
    label: 'Arial (DOCX)',
    category: 'system',
    cssFamily: 'Arial, Helvetica, Inter, sans-serif',
    fontspecName: 'Arial',
    pdflatexPackage: '\\RequirePackage[scaled]{helvet}',
    sampleTag: 'DOCX Sans',
  },
  {
    id: 'system:Calibri',
    label: 'Calibri (DOCX)',
    category: 'system',
    cssFamily: 'Calibri, Inter, sans-serif',
    fontspecName: 'Calibri',
    pdflatexPackage: '\\RequirePackage{carlito}',
    sampleTag: 'Office',
  },
  {
    id: 'system:Cambria',
    label: 'Cambria (DOCX)',
    category: 'system',
    cssFamily: 'Cambria, "Source Serif 4", Georgia, serif',
    fontspecName: 'Cambria',
    pdflatexPackage: '\\RequirePackage{caladea}',
    sampleTag: 'Office Serif',
  },
  {
    id: 'system:Georgia',
    label: 'Georgia (DOCX)',
    category: 'system',
    cssFamily: 'Georgia, "Source Serif 4", serif',
    fontspecName: 'Georgia',
    pdflatexPackage: '\\RequirePackage{charter}',
    sampleTag: 'System Serif',
  },
  {
    id: 'system:Garamond',
    label: 'Garamond (DOCX)',
    category: 'system',
    cssFamily: 'Garamond, "EB Garamond", serif',
    fontspecName: 'Garamond',
    pdflatexPackage: '\\RequirePackage{ebgaramond}',
    sampleTag: 'Book Serif',
  },
  {
    id: 'system:Courier New',
    label: 'Courier New (DOCX)',
    category: 'system',
    cssFamily: '"Courier New", "JetBrains Mono", monospace',
    fontspecName: 'Courier New',
    pdflatexPackage: '\\RequirePackage{courier}',
    sampleTag: 'Mono',
  },
];

export function getFontById(id: string): FontOption {
  const found = FONT_CATALOG.find((f) => f.id === id);
  if (found) return found;
  if (id.startsWith('system:')) {
    const rawName = id.slice('system:'.length).trim() || 'Times New Roman';
    return {
      id,
      label: rawName,
      category: 'system',
      cssFamily: `"${rawName}", serif`,
      fontspecName: rawName,
      pdflatexPackage: '\\RequirePackage{lmodern}',
      sampleTag: 'System',
    };
  }
  return FONT_CATALOG[0];
}

export interface ResolvedFontInfo {
  isCustom: boolean;
  customFamily?: CustomFontFamily;
  catalogOption?: FontOption;
  cssFamily: string;
  label: string;
}

export function resolveFontOption(
  fontId: string,
  customFonts: CustomFontFamily[]
): ResolvedFontInfo {
  if (fontId.startsWith('custom:')) {
    const customFamily = customFonts.find((cf) => cf.id === fontId);
    if (customFamily) {
      return {
        isCustom: true,
        customFamily,
        cssFamily: `"${customFamily.id}", "${customFamily.familyName}", serif`,
        label: customFamily.familyName,
      };
    }
  }
  const catalogOption = getFontById(fontId);
  return {
    isCustom: false,
    catalogOption,
    cssFamily: catalogOption.cssFamily,
    label: catalogOption.label,
  };
}

export interface PaperDimensionSpec {
  id: PaperSize;
  label: string;
  widthMm: number;
  heightMm: number;
  geometryOption: string;
}

export const PAPER_SPECS: Record<PaperSize, PaperDimensionSpec> = {
  a4: { id: 'a4', label: 'A4 (210 × 297 mm)', widthMm: 210, heightMm: 297, geometryOption: 'a4paper' },
  a5: { id: 'a5', label: 'A5 (148 × 210 mm)', widthMm: 148, heightMm: 210, geometryOption: 'a5paper' },
  letter: { id: 'letter', label: 'US Letter (216 × 279 mm)', widthMm: 215.9, heightMm: 279.4, geometryOption: 'letterpaper' },
  legal: { id: 'legal', label: 'Legal (216 × 356 mm)', widthMm: 215.9, heightMm: 355.6, geometryOption: 'legalpaper' },
  b5: { id: 'b5', label: 'B5 (176 × 250 mm)', widthMm: 176, heightMm: 250, geometryOption: 'b5paper' },
  trade6x9: { id: 'trade6x9', label: 'Livro 6×9" (152 × 229 mm)', widthMm: 152.4, heightMm: 228.6, geometryOption: 'paperwidth=152.4mm,paperheight=228.6mm' },
  slide16x9: { id: 'slide16x9', label: 'Slide 16:9 (160 × 90 mm)', widthMm: 160, heightMm: 90, geometryOption: 'aspectratio=169' },
  slide4x3: { id: 'slide4x3', label: 'Slide 4:3 (128 × 96 mm)', widthMm: 128, heightMm: 96, geometryOption: 'aspectratio=43' },
  custom: { id: 'custom', label: 'Customizado (mm)', widthMm: 210, heightMm: 297, geometryOption: 'custom' },
};
