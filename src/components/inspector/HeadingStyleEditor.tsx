import React, { useState } from 'react';
import { useI18n } from '../../i18n/LanguageContext';
import { useTemplate } from '../../state/TemplateContext';
import { HeadingBoxStyle, HeadingDecoration, HeadingLevelStyle } from '../../types/template';
import {
  ColorPickerField,
  PanelSection,
  SegmentedControl,
  SelectField,
  SliderField,
  ToggleSwitch,
} from '../ui/Controls';

type HeadingKey = 'h1' | 'h2' | 'h3';

export const HeadingStyleEditor: React.FC = () => {
  const { t } = useI18n();
  const { config, updateConfig } = useTemplate();
  const [activeHeading, setActiveHeading] = useState<HeadingKey>('h1');

  const typo = config.typography;
  const hStyle = typo.headings[activeHeading];

  const updateHeadingLevel = (patch: Partial<HeadingLevelStyle>) => {
    updateConfig('typography', {
      ...typo,
      headings: {
        ...typo.headings,
        [activeHeading]: { ...hStyle, ...patch },
      },
    });
  };

  const updateHeadingBox = (patch: Partial<HeadingBoxStyle>) => {
    updateHeadingLevel({
      box: { ...hStyle.box, ...patch },
    });
  };

  return (
    <PanelSection title={t.typography.headingsTitle}>
      <SegmentedControl<HeadingKey>
        value={activeHeading}
        onChange={setActiveHeading}
        options={[
          { value: 'h1', label: 'H1 (Seção)' },
          { value: 'h2', label: 'H2 (Sub)' },
          { value: 'h3', label: 'H3 (Sub-sub)' },
        ]}
      />

      <SliderField
        label={t.typography.headingSize}
        value={hStyle.fontSizePt}
        min={9}
        max={24}
        step={0.5}
        decimals={1}
        unit=" pt"
        onChange={(fontSizePt) => updateHeadingLevel({ fontSizePt })}
      />

      <div className="grid grid-cols-2 gap-2">
        <ToggleSwitch
          label={t.typography.headingBold}
          checked={hStyle.bold}
          onChange={(bold) => updateHeadingLevel({ bold })}
        />
        <ToggleSwitch
          label={t.typography.headingItalic}
          checked={hStyle.italic}
          onChange={(italic) => updateHeadingLevel({ italic })}
        />
      </div>

      <SegmentedControl<'none' | 'uppercase' | 'smallcaps'>
        value={hStyle.transform}
        onChange={(transform) => updateHeadingLevel({ transform })}
        options={[
          { value: 'none', label: t.typography.transformNone },
          { value: 'uppercase', label: t.typography.transformUpper },
          { value: 'smallcaps', label: t.typography.transformSmallcaps },
        ]}
      />

      <SegmentedControl<'left' | 'center' | 'right'>
        value={hStyle.alignment}
        onChange={(alignment) => updateHeadingLevel({ alignment })}
        options={[
          { value: 'left', label: t.typography.left },
          { value: 'center', label: t.typography.center },
          { value: 'right', label: t.typography.right },
        ]}
      />

      <div className="space-y-1">
        <span className="text-xs font-medium text-[var(--studio-text)] block">
          {t.typography.headingDecoration}
        </span>
        <SegmentedControl<HeadingDecoration>
          value={hStyle.decoration}
          onChange={(decoration) => updateHeadingLevel({ decoration })}
          options={[
            { value: 'none', label: t.typography.decoNone },
            { value: 'leftBar', label: t.typography.decoLeftBar },
            { value: 'bottomRule', label: t.typography.decoBottomRule },
            { value: 'box', label: t.typography.decoBox },
          ]}
        />
      </div>

      {hStyle.decoration === 'box' && (
        <div className="p-2.5 rounded-xl border border-amber-600/35 bg-[var(--studio-bg)] space-y-2.5">
          <ColorPickerField
            label={t.typography.boxBgColor}
            value={hStyle.box.bgColor}
            swatches={['#f1f5f9', '#f0fdfa', '#eff6ff', '#fef3c7', '#0f766e', '#1e3a8a']}
            onChange={(bgColor) => updateHeadingBox({ bgColor })}
          />
          <ColorPickerField
            label={t.typography.boxBorderColor}
            value={hStyle.box.borderColor}
            swatches={['#0f766e', '#1d4ed8', '#92400e', '#111827', '#cbd5e1']}
            onChange={(borderColor) => updateHeadingBox({ borderColor })}
          />
          <SliderField
            label={t.typography.boxBorderWidth}
            value={hStyle.box.borderWidthPt}
            min={0}
            max={4}
            step={0.2}
            decimals={1}
            unit=" pt"
            onChange={(borderWidthPt) => updateHeadingBox({ borderWidthPt })}
          />
          <ToggleSwitch
            label={t.typography.boxBorderLeftOnly}
            checked={hStyle.box.borderLeftOnly}
            onChange={(borderLeftOnly) => updateHeadingBox({ borderLeftOnly })}
          />
          <div className="grid grid-cols-2 gap-2">
            <SliderField
              label={t.typography.boxPaddingY}
              value={hStyle.box.paddingYPt}
              min={1}
              max={14}
              step={0.5}
              decimals={1}
              unit="pt"
              onChange={(paddingYPt) => updateHeadingBox({ paddingYPt })}
            />
            <SliderField
              label={t.typography.boxPaddingX}
              value={hStyle.box.paddingXPt}
              min={2}
              max={18}
              step={1}
              unit="pt"
              onChange={(paddingXPt) => updateHeadingBox({ paddingXPt })}
            />
          </div>
          <SliderField
            label={t.typography.boxRadius}
            value={hStyle.box.radiusPt}
            min={0}
            max={24}
            step={0.5}
            decimals={1}
            unit=" pt"
            onChange={(radiusPt) => updateHeadingBox({ radiusPt })}
          />
          <ToggleSwitch
            label={t.typography.boxFullWidth}
            checked={hStyle.box.fullWidth}
            onChange={(fullWidth) => updateHeadingBox({ fullWidth })}
          />
        </div>
      )}

      <SelectField
        label={t.typography.numberSep}
        value={hStyle.numberSeparator}
        options={[
          { value: 'space', label: t.typography.sepSpace },
          { value: 'dot', label: t.typography.sepDot },
          { value: 'dash', label: t.typography.sepDash },
        ]}
        onChange={(v) =>
          updateHeadingLevel({ numberSeparator: v as HeadingLevelStyle['numberSeparator'] })
        }
      />

      <div className="grid grid-cols-2 gap-2">
        <SliderField
          label={t.typography.spaceBefore}
          value={hStyle.spaceBeforePt}
          min={0}
          max={32}
          step={1}
          unit="pt"
          onChange={(spaceBeforePt) => updateHeadingLevel({ spaceBeforePt })}
        />
        <SliderField
          label={t.typography.spaceAfter}
          value={hStyle.spaceAfterPt}
          min={0}
          max={24}
          step={1}
          unit="pt"
          onChange={(spaceAfterPt) => updateHeadingLevel({ spaceAfterPt })}
        />
      </div>

      <ColorPickerField
        label={t.typography.textColor}
        value={hStyle.color}
        swatches={['#111827', '#ffffff', '#92400e', '#1d4ed8', '#0f766e', '#7c2d12', '#475569']}
        onChange={(color) => updateHeadingLevel({ color })}
      />
    </PanelSection>
  );
};
