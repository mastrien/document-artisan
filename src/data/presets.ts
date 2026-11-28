import { TemplateConfig } from '../types/template';
import { ARTICLE_PRESETS } from './presets/articlePresets';
import { COMING_SOON_PRESETS } from './presets/comingSoonPresets';
import {
  DEFAULT_FIRST_PAGE_HF,
  DEFAULT_FOOTER_LOGO,
  DEFAULT_FOOTNOTES,
  DEFAULT_FRONT_MATTER,
  DEFAULT_HEADER_LOGO,
  DEFAULT_HEADING_BOX,
  DEFAULT_LISTS,
  DEFAULT_LONG_QUOTES,
  PresetDefinition,
} from './presets/defaults';
import { MONOGRAPH_PRESETS } from './presets/monographPresets';

export type { PresetDefinition };
export {
  DEFAULT_FIRST_PAGE_HF,
  DEFAULT_FOOTER_LOGO,
  DEFAULT_FOOTNOTES,
  DEFAULT_FRONT_MATTER,
  DEFAULT_HEADER_LOGO,
  DEFAULT_HEADING_BOX,
  DEFAULT_LISTS,
  DEFAULT_LONG_QUOTES,
};

export const PRESETS: PresetDefinition[] = [
  ...ARTICLE_PRESETS,
  ...MONOGRAPH_PRESETS,
  ...COMING_SOON_PRESETS,
];

export const DEFAULT_CONFIG: TemplateConfig = PRESETS[0].config;
