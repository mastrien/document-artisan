import {
  FirstPageHeaderFooterConfig,
  FrontMatterConfig,
  HeaderFooterLogoConfig,
  HeadingBoxStyle,
  TemplateConfig,
} from '../../types/template';

export const DEFAULT_HEADING_BOX: HeadingBoxStyle = {
  bgColor: '#f1f5f9',
  borderColor: '#0f766e',
  borderWidthPt: 0.8,
  borderLeftOnly: false,
  paddingYPt: 5,
  paddingXPt: 8,
  radiusPt: 2,
  fullWidth: true,
};

export interface PresetDefinition {
  id: string;
  namePt: string;
  nameEn: string;
  descriptionPt: string;
  descriptionEn: string;
  badge: string;
  comingSoon?: boolean;
  config: TemplateConfig;
}

export const baseExportOptions = {
  includeClass: true,
  includeStyle: true,
  contentMode: 'example' as const,
};

export const DEFAULT_HEADER_LOGO: HeaderFooterLogoConfig = {
  enabled: false,
  slot: 'left',
  placement: 'beforeText',
  heightMm: 10,
  verticalOffsetMm: 0,
  gapMm: 3,
  opacity: 1,
};

export const DEFAULT_FOOTER_LOGO: HeaderFooterLogoConfig = {
  enabled: false,
  slot: 'left',
  placement: 'beforeText',
  heightMm: 7,
  verticalOffsetMm: 0,
  gapMm: 3,
  opacity: 1,
};

export const DEFAULT_FIRST_PAGE_HF: FirstPageHeaderFooterConfig = {
  headerEnabled: true,
  headerLeft: 'institution',
  headerCenter: 'empty',
  headerRight: 'date',
  headerCustomLeft: '',
  headerCustomCenter: '',
  headerCustomRight: '',
  showHeaderLogo: true,
  showHeaderRule: true,
  footerEnabled: true,
  footerLeft: 'author',
  footerCenter: 'empty',
  footerRight: 'page',
  footerCustomLeft: '',
  footerCustomCenter: '',
  footerCustomRight: '',
  showFooterLogo: false,
  showFooterRule: true,
};


export const DEFAULT_FRONT_MATTER: FrontMatterConfig = {
  coverPage: {
    enabled: false,
    showInstitution: true,
    showLogo: false,
    logoHeightMm: 18,
    showCourse: true,
    course: 'Bacharelado em Engenharia e Tecnologia',
    showCity: true,
    city: 'São Paulo',
    uppercaseTitle: true,
    uppercaseAuthor: true,
    borderFrame: false,
  },
  titleSheet: {
    enabled: false,
    natureNote:
      'Trabalho de Conclusão de Curso apresentado à Coordenação de Graduação como requisito parcial para obtenção do título de Bacharel.',
    natureWidthRatio: 0.5,
    advisorLabel: 'Orientador:',
    advisorName: 'Prof. Dr. Marcos Vinícius Rocha',
    coadvisorLabel: 'Coorientador:',
    coadvisorName: '',
    showCityAndDate: true,
  },
  abstractBlock: {
    enabled: false,
    title: 'Resumo',
    text: 'Este trabalho investiga a padronização editorial e estrutural de documentos técnico-científicos por meio da separação entre conteúdo textual e especificações tipográficas em LaTeX.',
    keywordsLabel: 'Palavras-chave:',
    keywords: 'Tipografia; LaTeX; Normalização; ABNT.',
    includeEnglishAbstract: false,
    englishTitle: 'Abstract',
    englishText:
      'This work investigates editorial and structural standardization of technical-scientific documents through the separation of textual content and typographic specifications in LaTeX.',
    englishKeywordsLabel: 'Keywords:',
    englishKeywords: 'Typography; LaTeX; Standardization; ABNT.',
    onSeparatePage: false,
    fontSizePt: 10.5,
    lineSpacing: 1.0,
  },
  includeListOfFigures: false,
  includeListOfTables: false,
  sectionStartsNewPage: false,
  startNumberingAtBody: false,
};

export const DEFAULT_LONG_QUOTES: TemplateConfig['modules']['longQuotes'] = {
  enabled: false,
  indentLeftMm: 40,
  fontSizePt: 10,
  lineSpacing: 1.0,
  italic: false,
  leftBorder: false,
};

export const DEFAULT_LISTS: TemplateConfig['modules']['lists'] = {
  enabled: false,
  bulletStyle: 'disc',
  enumStyle: 'arabic',
  itemSepPt: 3,
  leftMarginMm: 8,
};

export const DEFAULT_FOOTNOTES: TemplateConfig['modules']['footnotes'] = {
  enabled: false,
  fontSizePt: 10,
  lineSpacing: 1.0,
  ruleWidthRatio: 0.4,
  hangingIndent: true,
};