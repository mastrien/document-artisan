import { TemplateConfig } from '../types/template';
import { ARTICLE_PRESETS } from './presets/articlePresets';
import { COMING_SOON_PRESETS } from './presets/comingSoonPresets';
import {
  DEFAULT_FIRST_PAGE_HF,
  DEFAULT_FOOTER_LOGO,
  DEFAULT_HEADER_LOGO,
  DEFAULT_HEADING_BOX,
  PresetDefinition,
} from './presets/defaults';

export type { PresetDefinition };
export {
  DEFAULT_FIRST_PAGE_HF,
  DEFAULT_FOOTER_LOGO,
  DEFAULT_HEADER_LOGO,
  DEFAULT_HEADING_BOX,
};

export const PRESETS: PresetDefinition[] = [...ARTICLE_PRESETS, ...COMING_SOON_PRESETS];

export const DEFAULT_CONFIG: TemplateConfig = PRESETS[0].config;
