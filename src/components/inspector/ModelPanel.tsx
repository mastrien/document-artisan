import React from 'react';
import { BookOpen, FileSpreadsheet, FileText, Presentation } from 'lucide-react';
import { PRESETS } from '../../data/presets';
import { useI18n } from '../../i18n/LanguageContext';
import { useTemplate } from '../../state/TemplateContext';
import { DocumentLanguage, DocumentType, LatexEngine } from '../../types/template';
import { PanelSection, SegmentedControl, SelectField } from '../ui/Controls';

export const ModelPanel: React.FC = () => {
  const { lang, t } = useI18n();
  const { config, updateConfig, loadPreset, setDocumentType } = useTemplate();

  const docTypes: { id: DocumentType; label: string; icon: React.ReactNode; soon?: boolean }[] = [
    { id: 'article', label: t.model.types.article, icon: <FileText className="w-4 h-4" /> },
    { id: 'book', label: t.model.types.book, icon: <BookOpen className="w-4 h-4" />, soon: true },
    {
      id: 'report',
      label: t.model.types.report,
      icon: <FileSpreadsheet className="w-4 h-4" />,
      soon: true,
    },
    {
      id: 'slides',
      label: t.model.types.slides,
      icon: <Presentation className="w-4 h-4" />,
      soon: true,
    },
  ];

  return (
    <div className="space-y-4">
      <PanelSection title={t.model.docType}>
        <div className="grid grid-cols-2 gap-1.5">
          {docTypes.map((dt) => {
            const active = config.documentType === dt.id && !dt.soon;
            return (
              <button
                key={dt.id}
                type="button"
                disabled={dt.soon}
                onClick={() => {
                  if (!dt.soon) setDocumentType(dt.id);
                }}
                className={`flex items-center justify-between gap-1.5 px-2.5 py-2 rounded-lg border text-xs font-medium transition-all ${
                  dt.soon
                    ? 'border-[var(--studio-border)] bg-[var(--studio-bg)] text-[var(--studio-muted)] opacity-60 cursor-not-allowed'
                    : active
                      ? 'border-amber-600 bg-amber-500/10 text-amber-800 dark:text-amber-300 cursor-pointer'
                      : 'border-[var(--studio-border)] bg-[var(--studio-elevated)] text-[var(--studio-text)] hover:border-amber-600/40 cursor-pointer'
                }`}
              >
                <span className="flex items-center gap-1.5 min-w-0">
                  {dt.icon}
                  <span className="truncate">{dt.label}</span>
                </span>
                {dt.soon && (
                  <span className="text-[9px] font-semibold uppercase px-1 py-0.5 rounded bg-[var(--studio-surface)] border border-[var(--studio-border)] text-[var(--studio-muted)] shrink-0">
                    {t.model.comingSoon}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </PanelSection>

      <PanelSection title={t.model.presetsTitle}>
        <div className="space-y-1.5">
          {PRESETS.map((preset) => {
            const disabled = Boolean(preset.comingSoon);
            return (
              <button
                key={preset.id}
                type="button"
                disabled={disabled}
                onClick={() => {
                  if (!disabled) loadPreset(preset.id);
                }}
                className={`w-full text-left p-2 rounded-lg border transition-colors group ${
                  disabled
                    ? 'border-[var(--studio-border)] bg-[var(--studio-bg)] opacity-55 cursor-not-allowed'
                    : 'border-[var(--studio-border)] bg-[var(--studio-elevated)] hover:border-amber-600/50 cursor-pointer'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-xs font-semibold ${
                      disabled
                        ? 'text-[var(--studio-muted)]'
                        : 'text-[var(--studio-text)] group-hover:text-amber-700 dark:group-hover:text-amber-400'
                    }`}
                  >
                    {lang === 'pt' ? preset.namePt : preset.nameEn}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--studio-bg)] border border-[var(--studio-border)] text-[var(--studio-muted)] shrink-0">
                    {disabled ? t.model.comingSoon : preset.badge}
                  </span>
                </div>
                <p className="text-[11px] text-[var(--studio-muted)] mt-0.5 leading-snug">
                  {lang === 'pt' ? preset.descriptionPt : preset.descriptionEn}
                </p>
              </button>
            );
          })}
        </div>
      </PanelSection>

      <PanelSection title={t.model.engineTitle} hint={t.model.engineNote}>
        <SegmentedControl<LatexEngine>
          value={config.engine}
          onChange={(v) => updateConfig('engine', v)}
          options={[
            { value: 'xelatex', label: 'XeLaTeX' },
            { value: 'lualatex', label: 'LuaLaTeX' },
            { value: 'pdflatex', label: 'pdfLaTeX' },
          ]}
        />
        <SelectField
          label={t.model.docLang}
          value={config.documentLanguage}
          onChange={(v) => updateConfig('documentLanguage', v as DocumentLanguage)}
          options={[
            { value: 'brazilian', label: t.model.languages.brazilian },
            { value: 'english', label: t.model.languages.english },
            { value: 'spanish', label: t.model.languages.spanish },
          ]}
        />
      </PanelSection>

      <PanelSection title={t.model.metadataTitle}>
        {(
          [
            ['title', t.model.title],
            ['subtitle', t.model.subtitle],
            ['author', t.model.author],
            ['institution', t.model.institution],
            ['date', t.model.date],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="block space-y-1">
            <span className="text-[11px] font-medium text-[var(--studio-muted)] block">{label}</span>
            <input
              type="text"
              value={config.metadata[key]}
              onChange={(e) =>
                updateConfig('metadata', { ...config.metadata, [key]: e.target.value })
              }
              className="w-full rounded-md border border-[var(--studio-border)] bg-[var(--studio-elevated)] px-2.5 py-1.5 text-xs text-[var(--studio-text)] focus:outline-none focus:ring-1 focus:ring-amber-600"
            />
          </label>
        ))}
      </PanelSection>
    </div>
  );
};
