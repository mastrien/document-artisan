export type DocumentType = 'article' | 'monograph' | 'book' | 'report' | 'slides';
export type LatexEngine = 'xelatex' | 'lualatex' | 'pdflatex';
export type DocumentLanguage = 'brazilian' | 'english' | 'spanish';
export type PaperSize =
  | 'a4'
  | 'a5'
  | 'letter'
  | 'legal'
  | 'b5'
  | 'trade6x9'
  | 'slide16x9'
  | 'slide4x3'
  | 'custom';

export type HeaderFooterToken =
  | 'empty'
  | 'title'
  | 'section'
  | 'author'
  | 'page'
  | 'pageOfTotal'
  | 'date'
  | 'institution'
  | 'custom';

export type PageNumberStyle = 'arabic' | 'roman' | 'Roman' | 'alph' | 'none';
export type SectionNumberStyle = 'arabic' | 'roman' | 'none';
export type CitationStyle = 'abnt' | 'apa' | 'ieee' | 'vancouver' | 'authoryear' | 'numeric';
export type AbntCitationCase = 'titlecase' | 'uppercase';
export type DialogueStyle = 'literary' | 'script' | 'interview';
export type TableStyle = 'booktabs' | 'abnt-open' | 'striped' | 'grid' | 'horizontal';
export type CaptionSeparator = 'colon' | 'endash' | 'emdash' | 'period';
export type TextAlign = 'left' | 'center' | 'right' | 'justify';
export type SimpleAlign = 'left' | 'center' | 'right';

export type RuleStyle = 'solid' | 'double' | 'dashed';
export type FirstPageHeaderMode = 'same' | 'empty' | 'custom';
export type LogoSlot = 'left' | 'center' | 'right';
export type LogoPlacement = 'beforeText' | 'afterText' | 'replaceSlot';

export interface HeaderFooterLogoConfig {
  enabled: boolean;
  fileName?: string;
  dataUrl?: string;
  buffer?: ArrayBuffer;
  slot: LogoSlot;
  placement: LogoPlacement;
  heightMm: number;
  verticalOffsetMm: number;
  gapMm: number;
  opacity: number;
}

export interface FirstPageHeaderFooterConfig {
  headerEnabled: boolean;
  headerLeft: HeaderFooterToken;
  headerCenter: HeaderFooterToken;
  headerRight: HeaderFooterToken;
  headerCustomLeft: string;
  headerCustomCenter: string;
  headerCustomRight: string;
  showHeaderLogo: boolean;
  showHeaderRule: boolean;
  footerEnabled: boolean;
  footerLeft: HeaderFooterToken;
  footerCenter: HeaderFooterToken;
  footerRight: HeaderFooterToken;
  footerCustomLeft: string;
  footerCustomCenter: string;
  footerCustomRight: string;
  showFooterLogo: boolean;
  showFooterRule: boolean;
}

export type FontVariantKey = 'regular' | 'bold' | 'italic' | 'boldItalic';

export interface CustomFontVariantFile {
  fileName: string;
  format: 'ttf' | 'otf' | 'woff2';
  buffer?: ArrayBuffer;
}

export interface CustomFontFamily {
  id: string;
  familyName: string;
  variants: Partial<Record<FontVariantKey, CustomFontVariantFile>>;
}

export type HeadingDecoration = 'none' | 'leftBar' | 'bottomRule' | 'box';

export interface HeadingBoxStyle {
  bgColor: string;
  borderColor: string;
  borderWidthPt: number;
  borderLeftOnly: boolean;
  paddingYPt: number;
  paddingXPt: number;
  radiusPt: number;
  fullWidth: boolean;
}

export interface HeadingLevelStyle {
  fontSizePt: number;
  bold: boolean;
  italic: boolean;
  transform: 'none' | 'uppercase' | 'smallcaps';
  alignment: SimpleAlign;
  color: string;
  spaceBeforePt: number;
  spaceAfterPt: number;
  decoration: HeadingDecoration;
  box: HeadingBoxStyle;
  numberSeparator: 'space' | 'dot' | 'dash';
}

export type ListBulletStyle = 'disc' | 'dash' | 'square' | 'arrow';
export type ListEnumStyle = 'arabic' | 'alphaParen' | 'romanParen';

export interface CoverPageConfig {
  enabled: boolean;
  showInstitution: boolean;
  showLogo: boolean;
  logoHeightMm: number;
  showCourse: boolean;
  course: string;
  showCity: boolean;
  city: string;
  uppercaseTitle: boolean;
  uppercaseAuthor: boolean;
  borderFrame: boolean;
}

export interface TitleSheetConfig {
  enabled: boolean;
  natureNote: string;
  natureWidthRatio: number;
  advisorLabel: string;
  advisorName: string;
  coadvisorLabel: string;
  coadvisorName: string;
  showCityAndDate: boolean;
}

export interface AbstractBlockConfig {
  enabled: boolean;
  title: string;
  text: string;
  keywordsLabel: string;
  keywords: string;
  includeEnglishAbstract: boolean;
  englishTitle: string;
  englishText: string;
  englishKeywordsLabel: string;
  englishKeywords: string;
  onSeparatePage: boolean;
  fontSizePt: number;
  lineSpacing: number;
}

export interface FrontMatterConfig {
  coverPage: CoverPageConfig;
  titleSheet: TitleSheetConfig;
  abstractBlock: AbstractBlockConfig;
  includeListOfFigures: boolean;
  includeListOfTables: boolean;
  sectionStartsNewPage: boolean;
  startNumberingAtBody: boolean;
}

export interface TitleBoxStyle {
  enabled: boolean;
  bgColor: string;
  borderColor: string;
  borderWidthPt: number;
  borderLeftOnly: boolean;
  paddingYPt: number;
  paddingXPt: number;
  radiusPt: number;
}

export interface TitleBlockStyle {
  fontSizePt: number;
  weight: '400' | '600' | '700' | '800';
  italic: boolean;
  transform: 'none' | 'uppercase' | 'smallcaps';
  alignment: SimpleAlign;
  metaAlignment: SimpleAlign;
  color: string;
  subtitleSizePt: number;
  subtitleItalic: boolean;
  metaSizePt: number;
  metaLayout: 'inline' | 'stacked';
  dividerWidthPt: number;
  dividerColor: string;
  spaceAfterPt: number;
  box: TitleBoxStyle;
}

export interface AuthorEntry {
  name: string;
  email: string;
  institution: string;
  role: string;
}

export interface TemplateConfig {
  templateSlug: string;
  documentType: DocumentType;
  engine: LatexEngine;
  documentLanguage: DocumentLanguage;
  metadata: {
    title: string;
    subtitle: string;
    author: string;
    authorEmail: string;
    authors: AuthorEntry[];
    institution: string;
    department: string;
    location: string;
    documentCode: string;
    date: string;
  };
  page: {
    size: PaperSize;
    customWidthMm: number;
    customHeightMm: number;
    orientation: 'portrait' | 'landscape';
    twoside: boolean;
    unit: 'mm' | 'cm';
    margins: {
      top: number;
      bottom: number;
      left: number;
      right: number;
      linked: boolean;
    };
    pageFrame: {
      enabled: boolean;
      widthPt: number;
      color: string;
      insetMm: number;
    };
  };
  columns: {
    count: 1 | 2 | 3;
    mode: 'native' | 'multicol';
    gapMm: number;
    ruleWidthPt: number;
    ruleColor: string;
  };
  typography: {
    bodyFontId: string;
    titleFontId: string;
    headingFontId: string;
    headerFooterFontId: string;
    captionFontId: string;
    monoFontId: string;
    baseFontSizePt: number;
    alignment: TextAlign;
    lineSpacing: number;
    letterSpacingEm: number;
    headingLetterSpacingEm: number;
    paragraphIndentMm: number;
    paragraphSkipPt: number;
    hyphenation: boolean;
    widowOrphanControl: boolean;
    titleBlock: TitleBlockStyle;
    headings: {
      h1: HeadingLevelStyle;
      h2: HeadingLevelStyle;
      h3: HeadingLevelStyle;
    };
    textColor: string;
    accentColor: string;
    pageBgColor: string;
  };
  customFonts: CustomFontFamily[];
  headerFooter: {
    headerEnabled: boolean;
    headerLeft: HeaderFooterToken;
    headerCenter: HeaderFooterToken;
    headerRight: HeaderFooterToken;
    headerCustomLeft: string;
    headerCustomCenter: string;
    headerCustomRight: string;
    headerRulePt: number;
    headerRuleStyle: RuleStyle;
    headerRuleColor: string;
    headerFontSizePt: number;
    headerBold: boolean;
    headerItalic: boolean;
    headerUppercase: boolean;
    headerColor: string;
    headerBgEnabled: boolean;
    headerBgColor: string;
    headerSepMm: number;
    headHeightMm: number;
    headerLogo: HeaderFooterLogoConfig;
    footerEnabled: boolean;
    footerLeft: HeaderFooterToken;
    footerCenter: HeaderFooterToken;
    footerRight: HeaderFooterToken;
    footerCustomLeft: string;
    footerCustomCenter: string;
    footerCustomRight: string;
    footerRulePt: number;
    footerRuleStyle: RuleStyle;
    footerRuleColor: string;
    footerFontSizePt: number;
    footerBold: boolean;
    footerItalic: boolean;
    footerUppercase: boolean;
    footerColor: string;
    footerBgEnabled: boolean;
    footerBgColor: string;
    footerSkipMm: number;
    footerLogo: HeaderFooterLogoConfig;
    suppressFirstPage: boolean;
    firstPageMode: FirstPageHeaderMode;
    firstPage: FirstPageHeaderFooterConfig;
  };
  numbering: {
    pageStyle: PageNumberStyle;
    sectionDepth: 0 | 1 | 2 | 3;
    sectionStyle: SectionNumberStyle;
    tocDepth: 1 | 2 | 3;
    includeToc: boolean;
  };
  frontMatter: FrontMatterConfig;
  modules: {
    images: {
      enabled: boolean;
      captionPosition: 'bottom' | 'top';
      captionAlign: TextAlign;
      captionPrefix: string;
      captionSeparator: CaptionSeparator;
      captionLabelBold: boolean;
      captionLabelUppercase: boolean;
      captionFontSizePt: number;
      captionItalic: boolean;
      captionColor: string;
      showSourceLine: boolean;
      sourcePrefix: string;
      sourcePrefixBold: boolean;
      sourceAlign: SimpleAlign;
      defaultWidthRatio: number;
      border: boolean;
      borderWidthPt: number;
      borderColor: string;
      paddingPt: number;
      spacingVerticalPt: number;
      graphicsPath: string;
    };
    tables: {
      enabled: boolean;
      style: TableStyle;
      rowStretch: number;
      cellPaddingPt: number;
      fontSizePt: number;
      borderWidthPt: number;
      borderColor: string;
      headerTint: boolean;
      headerBgColor: string;
      headerTextColor: string;
      headerBold: boolean;
      headerUppercase: boolean;
      headerAlign: SimpleAlign;
      stripeColor: string;
      captionPosition: 'bottom' | 'top';
      captionAlign: SimpleAlign;
      captionPrefix: string;
      captionSeparator: CaptionSeparator;
      captionLabelBold: boolean;
      captionFontSizePt: number;
      captionColor: string;
      showSourceLine: boolean;
      sourcePrefix: string;
      sourcePrefixBold: boolean;
      sourceAlign: SimpleAlign;
    };
    citations: {
      enabled: boolean;
      style: CitationStyle;
      abntCiteCase: AbntCitationCase;
      bibFile: string;
      referencesTitle: string;
    };
    dialogues: {
      enabled: boolean;
      style: DialogueStyle;
      speakerBold: boolean;
      indentMm: number;
    };
    math: {
      enabled: boolean;
      numberedEquations: boolean;
      theoremBoxes: boolean;
    };
    code: {
      enabled: boolean;
      lineNumbers: boolean;
      frame: boolean;
      backgroundTint: boolean;
    };
    hyperref: {
      enabled: boolean;
      coloredLinks: boolean;
    };
    callouts: {
      enabled: boolean;
      borderLeftOnly: boolean;
    };
    longQuotes: {
      enabled: boolean;
      indentLeftMm: number;
      fontSizePt: number;
      lineSpacing: number;
      italic: boolean;
      leftBorder: boolean;
    };
    lists: {
      enabled: boolean;
      bulletStyle: ListBulletStyle;
      enumStyle: ListEnumStyle;
      itemSepPt: number;
      leftMarginMm: number;
    };
    footnotes: {
      enabled: boolean;
      fontSizePt: number;
      lineSpacing: number;
      ruleWidthRatio: number;
      hangingIndent: boolean;
    };
  };
  exportOptions: {
    includeClass: boolean;
    includeStyle: boolean;
    contentMode: 'example' | 'minimal';
  };
}

export interface GeneratedFile {
  path: string;
  content: string | ArrayBuffer;
  language: 'latex' | 'bibtex' | 'markdown' | 'binary';
  label: string;
}

export type InspectorTab =
  | 'model'
  | 'frontMatter'
  | 'page'
  | 'typography'
  | 'headerFooter'
  | 'modules';
export type ViewMode = 'preview' | 'split' | 'code';
export type StudioTheme = 'light' | 'dark';
