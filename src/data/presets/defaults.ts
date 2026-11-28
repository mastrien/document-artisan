import {
  FirstPageHeaderFooterConfig,
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
