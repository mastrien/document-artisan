import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Download,
  FileWarning,
  Loader2,
  Play,
  Terminal,
} from 'lucide-react';
import { isTauriRuntime } from '../../engine/compiler';
import { sanitizeSlug } from '../../engine/latexGenerator';
import { useI18n } from '../../i18n/LanguageContext';
import { useTemplate } from '../../state/TemplateContext';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

export const PdfPreviewCanvas: React.FC = () => {
  const { t } = useI18n();
  const {
    config,
    zoom,
    compileResult,
    isCompiling,
    compileNow,
    autoCompilePdf,
    setAutoCompilePdf,
    setPreviewEngine,
    latexEnv,
  } = useTemplate();

  const [numPages, setNumPages] = useState(0);
  const [logOpen, setLogOpen] = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);
  const pagesHostRef = useRef<HTMLDivElement | null>(null);

  const inTauri = isTauriRuntime();

  useEffect(() => {
    let cancelled = false;
    const host = pagesHostRef.current;
    if (!host) return;

    const bytes = compileResult?.pdfBytes;
    if (!bytes || bytes.length === 0) {
      host.innerHTML = '';
      setNumPages(0);
      return;
    }

    (async () => {
      try {
        setRenderError(null);
        const loadingTask = pdfjsLib.getDocument({ data: bytes.slice(0) });
        const pdf = await loadingTask.promise;
        if (cancelled) return;

        setNumPages(pdf.numPages);
        host.innerHTML = '';

        const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
        const cssScale = Math.max(0.4, zoom) * 1.25;

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          if (cancelled) return;
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: cssScale });

          const wrapper = document.createElement('div');
          wrapper.className = 'flex flex-col items-center gap-2';

          const badge = document.createElement('div');
          badge.className =
            'px-2.5 py-0.5 rounded-full bg-[var(--studio-surface)]/85 border border-[var(--studio-border)] text-[11px] font-medium text-[var(--studio-muted)]';
          badge.textContent = `${t.preview.pageLabel} ${pageNum} / ${pdf.numPages}`;
          wrapper.appendChild(badge);

          const canvas = document.createElement('canvas');
          canvas.width = Math.floor(viewport.width * dpr);
          canvas.height = Math.floor(viewport.height * dpr);
          canvas.style.width = `${Math.floor(viewport.width)}px`;
          canvas.style.height = `${Math.floor(viewport.height)}px`;
          canvas.className = 'paper-elevation bg-white rounded-xs';

          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            await page.render({ canvasContext: ctx, viewport }).promise;
          }

          wrapper.appendChild(canvas);
          host.appendChild(wrapper);
        }
      } catch (err) {
        if (!cancelled) {
          setRenderError(err instanceof Error ? err.message : String(err));
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [compileResult?.pdfBytes, zoom, t.preview.pageLabel]);

  const handleDownloadPdf = () => {
    if (!compileResult?.pdfBytes) return;
    const blob = new Blob([compileResult.pdfBytes.slice(0)], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sanitizeSlug(config.templateSlug)}.pdf`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  if (!inTauri) {
    return (
      <div className="h-full w-full studio-canvas-grid flex items-center justify-center p-6">
        <div className="max-w-md rounded-2xl border border-[var(--studio-border)] bg-[var(--studio-surface)] p-6 shadow-xl space-y-3 text-center">
          <div className="mx-auto w-10 h-10 rounded-xl bg-amber-600/15 text-amber-700 dark:text-amber-300 flex items-center justify-center">
            <FileWarning className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-[var(--studio-text)]">
            {t.pdfPreview.tauriOnlyTitle}
          </h3>
          <p className="text-xs text-[var(--studio-muted)] leading-relaxed">
            {t.pdfPreview.tauriOnlyDesc}
          </p>
          <code className="block px-3 py-2 rounded-lg bg-[var(--studio-bg)] border border-[var(--studio-border)] text-xs font-mono text-amber-800 dark:text-amber-300">
            npm run tauri:dev
          </code>
          <button
            type="button"
            onClick={() => setPreviewEngine('visual')}
            className="px-4 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold cursor-pointer"
          >
            {t.pdfPreview.backToVisual}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      {/* PDF Toolbar */}
      <div className="shrink-0 px-3 py-2 border-b border-[var(--studio-border)] bg-[var(--studio-surface)] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs">
          {isCompiling ? (
            <span className="inline-flex items-center gap-1.5 text-amber-700 dark:text-amber-300 font-medium">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              {t.pdfPreview.compiling}
            </span>
          ) : compileResult?.success ? (
            <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {compileResult.engineUsed} · {((compileResult.durationMs ?? 0) / 1000).toFixed(2)}s ·{' '}
              {numPages} {t.pdfPreview.pagesCount}
            </span>
          ) : compileResult ? (
            <span className="inline-flex items-center gap-1.5 text-red-600 dark:text-red-400 font-medium">
              <AlertCircle className="w-3.5 h-3.5" />
              {t.pdfPreview.failed} ({compileResult.errors.length})
            </span>
          ) : (
            <span className="text-[var(--studio-muted)]">
              {latexEnv?.available_engines.length
                ? `${t.pdfPreview.readyEngines}: ${latexEnv.available_engines.join(', ')}`
                : t.pdfPreview.noEngine}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 text-[11px] text-[var(--studio-muted)] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoCompilePdf}
              onChange={(e) => setAutoCompilePdf(e.target.checked)}
              className="accent-amber-600"
            />
            <span>{t.pdfPreview.autoCompile}</span>
          </label>

          <button
            type="button"
            disabled={isCompiling}
            onClick={() => void compileNow()}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-700 hover:bg-amber-800 disabled:opacity-50 text-white text-xs font-semibold cursor-pointer"
          >
            {isCompiling ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5" />
            )}
            <span>{t.pdfPreview.compileBtn}</span>
          </button>

          {compileResult?.pdfBytes && (
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md border border-[var(--studio-border)] bg-[var(--studio-elevated)] text-xs font-medium text-[var(--studio-text)] hover:border-amber-600/50 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>PDF</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setLogOpen((o) => !o)}
            className="flex items-center gap-1 px-2 py-1 rounded-md border border-[var(--studio-border)] bg-[var(--studio-elevated)] text-xs font-medium text-[var(--studio-text)] cursor-pointer"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Log</span>
            {logOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Rendered PDF Pages (Vertically Stacked) */}
      <div className="flex-1 min-h-0 overflow-auto studio-canvas-grid flex flex-col items-center py-7 px-6">
        {renderError && (
          <div className="mb-4 px-3 py-2 rounded-lg bg-red-500/15 border border-red-500/40 text-xs text-red-700 dark:text-red-300">
            {renderError}
          </div>
        )}
        <div ref={pagesHostRef} className="flex flex-col items-center gap-8" />
      </div>

      {/* Collapsible LaTeX Log Drawer */}
      {logOpen && (
        <div className="h-52 shrink-0 border-t border-[var(--studio-border)] bg-[var(--studio-surface)] flex flex-col">
          {compileResult && compileResult.errors.length > 0 && (
            <div className="px-3 py-1.5 bg-red-500/10 border-b border-red-500/30 text-[11px] font-mono text-red-700 dark:text-red-300 max-h-20 overflow-y-auto">
              {compileResult.errors.map((err, i) => (
                <div key={i}>{err}</div>
              ))}
            </div>
          )}
          <pre className="flex-1 overflow-auto p-3 text-[11px] font-mono text-[var(--studio-text)] whitespace-pre-wrap">
            {compileResult?.log || t.pdfPreview.noLogYet}
          </pre>
        </div>
      )}
    </div>
  );
};
