import React from 'react';
import {
  BookOpenCheck,
  Code2,
  Columns2,
  Download,
  Eye,
  FileText,
  Grid2x2,
  Maximize2,
  Moon,
  Sun,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { PRESETS } from '../data/presets';
import { isTauriRuntime } from '../engine/compiler';
import { useI18n } from '../i18n/LanguageContext';
import { useTemplate } from '../state/TemplateContext';
import { ViewMode } from '../types/template';

export const TopBar: React.FC<{ onOpenExport: () => void }> = ({ onOpenExport }) => {
  const { lang, setLang, t } = useI18n();
  const {
    config,
    updateConfig,
    loadPreset,
    theme,
    toggleTheme,
    viewMode,
    setViewMode,
    zoom,
    setZoom,
    showGuides,
    setShowGuides,
    previewEngine,
    setPreviewEngine,
    latexEnv,
  } = useTemplate();

  const inTauri = isTauriRuntime();

  const viewModes: { id: ViewMode; label: string; icon: React.ReactNode }[] = [
    { id: 'preview', label: t.topbar.preview, icon: <Eye className="w-3.5 h-3.5" /> },
    { id: 'split', label: t.topbar.split, icon: <Columns2 className="w-3.5 h-3.5" /> },
    { id: 'code', label: t.topbar.code, icon: <Code2 className="w-3.5 h-3.5" /> },
  ];

  return (
    <header className="h-13 shrink-0 px-3 flex items-center justify-between gap-3 border-b border-[var(--studio-border)] bg-[var(--studio-surface)]">
      {/* Left: Brand, Slug, Preset */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="flex items-center gap-2 shrink-0">
          <div className="h-7 w-7 rounded-lg bg-amber-700 dark:bg-amber-600 text-white flex items-center justify-center shadow-xs">
            <BookOpenCheck className="w-4 h-4" />
          </div>
          <div className="hidden sm:block leading-tight">
            <div className="text-xs font-bold tracking-tight text-[var(--studio-text)]">
              {t.appName}
            </div>
            <div className="text-[10px] text-[var(--studio-muted)]">{config.engine}</div>
          </div>
        </div>

        <div className="h-5 w-px bg-[var(--studio-border)] hidden md:block" />

        <div className="hidden md:flex items-center gap-1.5">
          <span className="text-[11px] text-[var(--studio-muted)]">{t.topbar.templateSlug}:</span>
          <input
            type="text"
            value={config.templateSlug}
            onChange={(e) => updateConfig('templateSlug', e.target.value)}
            className="w-32 px-2 py-1 text-xs font-mono rounded-md border border-[var(--studio-border)] bg-[var(--studio-elevated)] text-[var(--studio-text)] focus:outline-none focus:ring-1 focus:ring-amber-600"
          />
        </div>

        <select
          aria-label={t.topbar.preset}
          onChange={(e) => {
            if (e.target.value) loadPreset(e.target.value);
          }}
          defaultValue=""
          className="hidden lg:block max-w-48 rounded-md border border-[var(--studio-border)] bg-[var(--studio-elevated)] px-2 py-1 text-xs text-[var(--studio-text)] focus:outline-none focus:ring-1 focus:ring-amber-600"
        >
          <option value="" disabled>
            {t.topbar.preset}...
          </option>
          {PRESETS.map((preset) => (
            <option key={preset.id} value={preset.id} disabled={Boolean(preset.comingSoon)}>
              [{preset.comingSoon ? t.model.comingSoon : preset.badge}]{' '}
              {lang === 'pt' ? preset.namePt : preset.nameEn}
            </option>
          ))}
        </select>
      </div>

      {/* Center: View Switcher, Visual/PDF Real Pill, Zoom, Guides */}
      <div className="flex items-center gap-2">
        <div className="flex items-center p-0.5 rounded-lg bg-[var(--studio-bg)] border border-[var(--studio-border)]">
          {viewModes.map((vm) => {
            const active = viewMode === vm.id;
            return (
              <button
                key={vm.id}
                type="button"
                onClick={() => setViewMode(vm.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  active
                    ? 'bg-[var(--studio-elevated)] text-[var(--studio-text)] shadow-xs border border-[var(--studio-border)]'
                    : 'text-[var(--studio-muted)] hover:text-[var(--studio-text)]'
                }`}
              >
                {vm.icon}
                <span className="hidden sm:inline">{vm.label}</span>
              </button>
            );
          })}
        </div>

        {viewMode !== 'code' && (
          <>
            <div className="flex items-center p-0.5 rounded-lg bg-[var(--studio-bg)] border border-[var(--studio-border)]">
              <button
                type="button"
                onClick={() => setPreviewEngine('visual')}
                className={`px-2 py-1 rounded-md text-[11px] font-medium cursor-pointer transition-all ${
                  previewEngine === 'visual'
                    ? 'bg-[var(--studio-elevated)] text-[var(--studio-text)] shadow-xs border border-[var(--studio-border)]'
                    : 'text-[var(--studio-muted)] hover:text-[var(--studio-text)]'
                }`}
              >
                {t.topbar.visualEngine}
              </button>
              <button
                type="button"
                onClick={() => setPreviewEngine('pdf')}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium cursor-pointer transition-all ${
                  previewEngine === 'pdf'
                    ? 'bg-amber-700 text-white shadow-xs'
                    : 'text-[var(--studio-muted)] hover:text-[var(--studio-text)]'
                }`}
              >
                <FileText className="w-3 h-3" />
                <span>{t.topbar.pdfEngine}</span>
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-[var(--studio-bg)] border border-[var(--studio-border)]">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(0.4, Number((z - 0.1).toFixed(2))))}
                className="p-1 text-[var(--studio-muted)] hover:text-[var(--studio-text)] cursor-pointer"
                title="-10%"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono w-10 text-center text-[var(--studio-text)]">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(1.4, Number((z + 0.1).toFixed(2))))}
                className="p-1 text-[var(--studio-muted)] hover:text-[var(--studio-text)] cursor-pointer"
                title="+10%"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setZoom(0.74)}
                className="p-1 text-[var(--studio-muted)] hover:text-[var(--studio-text)] cursor-pointer"
                title={t.topbar.fit}
              >
                <Maximize2 className="w-3 h-3" />
              </button>
            </div>

            {previewEngine === 'visual' && (
              <button
                type="button"
                onClick={() => setShowGuides((g) => !g)}
                title={t.topbar.guidesHint}
                className={`hidden md:flex items-center gap-1 px-2 py-1 rounded-md text-xs border transition-colors cursor-pointer ${
                  showGuides
                    ? 'border-amber-600/50 bg-amber-500/10 text-amber-800 dark:text-amber-300'
                    : 'border-[var(--studio-border)] text-[var(--studio-muted)] hover:text-[var(--studio-text)]'
                }`}
              >
                <Grid2x2 className="w-3.5 h-3.5" />
                <span className="text-[11px] font-medium">{t.topbar.guides}</span>
              </button>
            )}
          </>
        )}
      </div>

      {/* Right: Compiler badge, Language, Theme, Export */}
      <div className="flex items-center gap-2">
        <span
          title={t.topbar.compilerHint}
          className="hidden 2xl:inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-medium bg-[var(--studio-bg)] border border-[var(--studio-border)] text-[var(--studio-muted)]"
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              inTauri && latexEnv?.available_engines.length
                ? 'bg-emerald-500'
                : inTauri
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
            }`}
          />
          {inTauri
            ? `${t.topbar.compilerTauri}${
                latexEnv?.available_engines.includes(config.engine) ? ' ✓' : ''
              }`
            : t.topbar.compilerVisual}
        </span>

        <div className="flex items-center rounded-md border border-[var(--studio-border)] bg-[var(--studio-bg)] p-0.5">
          {(['pt', 'en'] as const).map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => setLang(code)}
              className={`px-1.5 py-0.5 rounded text-[11px] font-semibold uppercase cursor-pointer ${
                lang === code
                  ? 'bg-[var(--studio-elevated)] text-[var(--studio-text)] shadow-xs'
                  : 'text-[var(--studio-muted)] hover:text-[var(--studio-text)]'
              }`}
            >
              {code}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={toggleTheme}
          title={theme === 'light' ? t.topbar.themeDark : t.topbar.themeLight}
          className="p-1.5 rounded-md border border-[var(--studio-border)] bg-[var(--studio-elevated)] text-[var(--studio-muted)] hover:text-[var(--studio-text)] cursor-pointer"
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>

        <button
          type="button"
          onClick={onOpenExport}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-700 hover:bg-amber-800 dark:bg-amber-600 dark:hover:bg-amber-500 text-white shadow-xs transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{t.topbar.exportZip}</span>
        </button>
      </div>
    </header>
  );
};
