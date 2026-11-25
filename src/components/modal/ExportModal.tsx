import React, { useMemo, useRef, useState } from 'react';
import { Download, FileArchive, FileJson, FolderTree, Upload, X } from 'lucide-react';
import { generateProjectBundle, sanitizeSlug } from '../../engine/latexGenerator';
import { exportTemplateZip } from '../../engine/zipExporter';
import { useI18n } from '../../i18n/LanguageContext';
import { useTemplate } from '../../state/TemplateContext';

export const ExportModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { t } = useI18n();
  const { config, updateConfig, importConfigJson } = useTemplate();
  const [downloading, setDownloading] = useState(false);
  const jsonInputRef = useRef<HTMLInputElement | null>(null);

  const opts = config.exportOptions;
  const slug = sanitizeSlug(config.templateSlug);
  const canExport = opts.includeClass || opts.includeStyle;

  const bundleFiles = useMemo(() => generateProjectBundle(config), [config]);

  const handleDownloadZip = async () => {
    if (!canExport) return;
    setDownloading(true);
    try {
      await exportTemplateZip(config);
    } finally {
      setDownloading(false);
    }
  };

  const handleExportJson = () => {
    const serializable = {
      ...config,
      customFonts: config.customFonts.map((fam) => ({
        ...fam,
        variants: Object.fromEntries(
          Object.entries(fam.variants).map(([k, v]) => [
            k,
            v ? { fileName: v.fileName, format: v.format } : undefined,
          ])
        ),
      })),
      headerFooter: {
        ...config.headerFooter,
        headerLogo: {
          ...config.headerFooter.headerLogo,
          buffer: undefined,
          dataUrl: undefined,
        },
        footerLogo: {
          ...config.headerFooter.footerLogo,
          buffer: undefined,
          dataUrl: undefined,
        },
      },
    };
    const blob = new Blob([JSON.stringify(serializable, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${slug}-studio-config.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleImportJson = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    if (importConfigJson(text)) {
      onClose();
    }
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-xl rounded-2xl border border-[var(--studio-border)] bg-[var(--studio-surface)] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[var(--studio-border)] flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-600/15 text-amber-700 dark:text-amber-300">
              <FileArchive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[var(--studio-text)]">{t.exportModal.title}</h2>
              <p className="text-xs text-[var(--studio-muted)]">{t.exportModal.subtitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--studio-muted)] hover:text-[var(--studio-text)] hover:bg-[var(--studio-bg)] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          <label className="block space-y-1">
            <span className="text-xs font-semibold text-[var(--studio-text)] block">
              {t.exportModal.slugLabel}
            </span>
            <input
              type="text"
              value={config.templateSlug}
              onChange={(e) => updateConfig('templateSlug', e.target.value)}
              className="w-full rounded-lg border border-[var(--studio-border)] bg-[var(--studio-elevated)] px-3 py-1.5 text-xs font-mono text-[var(--studio-text)] focus:outline-none focus:ring-1 focus:ring-amber-600"
            />
          </label>

          {/* Formats */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-[var(--studio-text)] block">
              {t.exportModal.formatsLabel}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <label className="p-3 rounded-xl border border-[var(--studio-border)] bg-[var(--studio-elevated)] flex items-start gap-2.5 cursor-pointer hover:border-amber-600/50">
                <input
                  type="checkbox"
                  checked={opts.includeClass}
                  onChange={(e) =>
                    updateConfig('exportOptions', { ...opts, includeClass: e.target.checked })
                  }
                  className="mt-0.5 accent-amber-600"
                />
                <div>
                  <div className="text-xs font-semibold text-[var(--studio-text)]">
                    {t.exportModal.includeCls}
                  </div>
                  <div className="text-[11px] text-[var(--studio-muted)] leading-snug mt-0.5">
                    {t.exportModal.includeClsDesc.replace('slug', slug)}
                  </div>
                </div>
              </label>

              <label className="p-3 rounded-xl border border-[var(--studio-border)] bg-[var(--studio-elevated)] flex items-start gap-2.5 cursor-pointer hover:border-amber-600/50">
                <input
                  type="checkbox"
                  checked={opts.includeStyle}
                  onChange={(e) =>
                    updateConfig('exportOptions', { ...opts, includeStyle: e.target.checked })
                  }
                  className="mt-0.5 accent-amber-600"
                />
                <div>
                  <div className="text-xs font-semibold text-[var(--studio-text)]">
                    {t.exportModal.includeSty}
                  </div>
                  <div className="text-[11px] text-[var(--studio-muted)] leading-snug mt-0.5">
                    {t.exportModal.includeStyDesc.replace('slug', slug)}
                  </div>
                </div>
              </label>
            </div>
            {!canExport && (
              <p className="text-xs text-red-500 font-medium">{t.exportModal.mustSelectOne}</p>
            )}
          </div>

          {/* Content mode */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-[var(--studio-text)] block">
              {t.exportModal.contentLabel}
            </span>
            <div className="space-y-1.5">
              {(
                [
                  ['example', t.exportModal.contentExample],
                  ['minimal', t.exportModal.contentMinimal],
                ] as const
              ).map(([mode, label]) => (
                <label
                  key={mode}
                  className="flex items-center gap-2 text-xs text-[var(--studio-text)] cursor-pointer"
                >
                  <input
                    type="radio"
                    name="contentMode"
                    checked={opts.contentMode === mode}
                    onChange={() =>
                      updateConfig('exportOptions', { ...opts, contentMode: mode })
                    }
                    className="accent-amber-600"
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* ZIP Tree Preview */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--studio-text)]">
              <FolderTree className="w-3.5 h-3.5 text-amber-600" />
              <span>{t.exportModal.treeLabel}</span>
            </div>
            <div className="p-3 rounded-xl bg-[var(--studio-bg)] border border-[var(--studio-border)] font-mono text-[11px] text-[var(--studio-text)] space-y-0.5 max-h-40 overflow-y-auto">
              <div className="font-semibold text-amber-700 dark:text-amber-300">
                {slug}-latex-template/
              </div>
              {bundleFiles.map((f) => (
                <div key={f.path} className="pl-4 text-[var(--studio-muted)]">
                  ├── {f.path}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-[var(--studio-border)] bg-[var(--studio-bg)] flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <input
              ref={jsonInputRef}
              type="file"
              accept=".json"
              onChange={handleImportJson}
              className="hidden"
            />
            <button
              type="button"
              onClick={handleExportJson}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[var(--studio-border)] bg-[var(--studio-elevated)] text-xs font-medium text-[var(--studio-text)] hover:border-amber-600/50 cursor-pointer"
            >
              <FileJson className="w-3.5 h-3.5" />
              <span>{t.exportModal.exportJson}</span>
            </button>
            <button
              type="button"
              onClick={() => jsonInputRef.current?.click()}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[var(--studio-border)] bg-[var(--studio-elevated)] text-xs font-medium text-[var(--studio-text)] hover:border-amber-600/50 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{t.exportModal.importJson}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--studio-muted)] hover:text-[var(--studio-text)] cursor-pointer"
            >
              {t.exportModal.close}
            </button>
            <button
              type="button"
              disabled={!canExport || downloading}
              onClick={handleDownloadZip}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-amber-700 hover:bg-amber-800 disabled:opacity-50 text-white shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t.exportModal.downloadZip}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
