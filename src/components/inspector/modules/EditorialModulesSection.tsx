import React from 'react';
import { Footprints, ListOrdered, Quote } from 'lucide-react';
import { useI18n } from '../../../i18n/LanguageContext';
import { useTemplate } from '../../../state/TemplateContext';
import { ListBulletStyle, ListEnumStyle } from '../../../types/template';
import { SelectField, SliderField, ToggleSwitch } from '../../ui/Controls';
import { ModuleCard } from './ModuleCard';

export const EditorialModulesSection: React.FC = () => {
  const { t } = useI18n();
  const { config, updateConfig } = useTemplate();
  const m = config.modules;

  return (
    <>
      {/* Long Direct Quotes */}
      <ModuleCard
        icon={<Quote className="w-4 h-4" />}
        title={t.modules.longQuotes.name}
        desc={t.modules.longQuotes.desc}
        enabled={m.longQuotes.enabled}
        onToggle={(enabled) =>
          updateConfig('modules', { ...m, longQuotes: { ...m.longQuotes, enabled } })
        }
      >
        <SliderField
          label={t.modules.longQuotes.indentLeft}
          value={m.longQuotes.indentLeftMm}
          min={10}
          max={60}
          step={2}
          unit=" mm"
          onChange={(indentLeftMm) =>
            updateConfig('modules', { ...m, longQuotes: { ...m.longQuotes, indentLeftMm } })
          }
        />
        <SliderField
          label={t.modules.longQuotes.fontSize}
          value={m.longQuotes.fontSizePt}
          min={8}
          max={12}
          step={0.5}
          decimals={1}
          unit=" pt"
          onChange={(fontSizePt) =>
            updateConfig('modules', { ...m, longQuotes: { ...m.longQuotes, fontSizePt } })
          }
        />
        <SliderField
          label={t.modules.longQuotes.lineSpacing}
          value={m.longQuotes.lineSpacing}
          min={1.0}
          max={1.5}
          step={0.05}
          decimals={2}
          unit="×"
          onChange={(lineSpacing) =>
            updateConfig('modules', { ...m, longQuotes: { ...m.longQuotes, lineSpacing } })
          }
        />
        <ToggleSwitch
          label={t.modules.longQuotes.italic}
          checked={m.longQuotes.italic}
          onChange={(italic) =>
            updateConfig('modules', { ...m, longQuotes: { ...m.longQuotes, italic } })
          }
        />
        <ToggleSwitch
          label={t.modules.longQuotes.leftBorder}
          checked={m.longQuotes.leftBorder}
          onChange={(leftBorder) =>
            updateConfig('modules', { ...m, longQuotes: { ...m.longQuotes, leftBorder } })
          }
        />
      </ModuleCard>

      {/* Lists & Enumerations */}
      <ModuleCard
        icon={<ListOrdered className="w-4 h-4" />}
        title={t.modules.lists.name}
        desc={t.modules.lists.desc}
        enabled={m.lists.enabled}
        onToggle={(enabled) =>
          updateConfig('modules', { ...m, lists: { ...m.lists, enabled } })
        }
      >
        <SelectField
          label={t.modules.lists.bulletStyle}
          value={m.lists.bulletStyle}
          options={[
            { value: 'disc', label: t.modules.lists.bullets.disc },
            { value: 'dash', label: t.modules.lists.bullets.dash },
            { value: 'square', label: t.modules.lists.bullets.square },
            { value: 'arrow', label: t.modules.lists.bullets.arrow },
          ]}
          onChange={(v) =>
            updateConfig('modules', {
              ...m,
              lists: { ...m.lists, bulletStyle: v as ListBulletStyle },
            })
          }
        />
        <SelectField
          label={t.modules.lists.enumStyle}
          value={m.lists.enumStyle}
          options={[
            { value: 'arabic', label: t.modules.lists.enums.arabic },
            { value: 'alphaParen', label: t.modules.lists.enums.alphaParen },
            { value: 'romanParen', label: t.modules.lists.enums.romanParen },
          ]}
          onChange={(v) =>
            updateConfig('modules', {
              ...m,
              lists: { ...m.lists, enumStyle: v as ListEnumStyle },
            })
          }
        />
        <SliderField
          label={t.modules.lists.itemSep}
          value={m.lists.itemSepPt}
          min={0}
          max={12}
          step={1}
          unit=" pt"
          onChange={(itemSepPt) =>
            updateConfig('modules', { ...m, lists: { ...m.lists, itemSepPt } })
          }
        />
        <SliderField
          label={t.modules.lists.leftMargin}
          value={m.lists.leftMarginMm}
          min={4}
          max={20}
          step={1}
          unit=" mm"
          onChange={(leftMarginMm) =>
            updateConfig('modules', { ...m, lists: { ...m.lists, leftMarginMm } })
          }
        />
      </ModuleCard>

      {/* Footnotes */}
      <ModuleCard
        icon={<Footprints className="w-4 h-4" />}
        title={t.modules.footnotes.name}
        desc={t.modules.footnotes.desc}
        enabled={m.footnotes.enabled}
        onToggle={(enabled) =>
          updateConfig('modules', { ...m, footnotes: { ...m.footnotes, enabled } })
        }
      >
        <SliderField
          label={t.modules.footnotes.fontSize}
          value={m.footnotes.fontSizePt}
          min={7.5}
          max={11}
          step={0.5}
          decimals={1}
          unit=" pt"
          onChange={(fontSizePt) =>
            updateConfig('modules', { ...m, footnotes: { ...m.footnotes, fontSizePt } })
          }
        />
        <SliderField
          label={t.modules.footnotes.lineSpacing}
          value={m.footnotes.lineSpacing}
          min={1.0}
          max={1.4}
          step={0.05}
          decimals={2}
          unit="×"
          onChange={(lineSpacing) =>
            updateConfig('modules', { ...m, footnotes: { ...m.footnotes, lineSpacing } })
          }
        />
        <SliderField
          label={t.modules.footnotes.ruleWidth}
          value={m.footnotes.ruleWidthRatio}
          min={0.1}
          max={1.0}
          step={0.05}
          decimals={2}
          unit="×"
          onChange={(ruleWidthRatio) =>
            updateConfig('modules', { ...m, footnotes: { ...m.footnotes, ruleWidthRatio } })
          }
        />
        <ToggleSwitch
          label={t.modules.footnotes.hangingIndent}
          checked={m.footnotes.hangingIndent}
          onChange={(hangingIndent) =>
            updateConfig('modules', { ...m, footnotes: { ...m.footnotes, hangingIndent } })
          }
        />
      </ModuleCard>
    </>
  );
};
