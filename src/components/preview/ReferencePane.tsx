import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { FileUp, Image as ImageIcon, Link2, Upload, X, ZoomIn, ZoomOut } from 'lucide-react';
import { useI18n } from '../../i18n/LanguageContext';
import { useTemplate } from '../../state/TemplateContext';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

type ReferenceDoc =
  | { kind: 'pdf'; name: string; bytes: Uint8Array }
  | { kind: 'image'; name: string; dataUrl: string };

export const ReferencePane: React.FC = () => {
  const { t } = useI18n();
  const { zoom: studioZoom, setReferencePaneOpen } = useTemplate();

  const [doc, setDoc] = useState<ReferenceDoc | null>(null);
  const [refZoom, setRefZoom] = useState(0.74);
  const [syncZoom, setSyncZoom] = useState(true);
  const [pdfPageCount, setPdfPageCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const pagesHostRef = useRef<HTMLDivElement | null>(null);

  const effectiveZoom = syncZoom ? studioZoom : refZoom;

  const loadFile = async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (ext === 'pdf') {
      const bytes = new Uint8Array(await file.arrayBuffer());
      setDoc({ kind: 'pdf', name: file.name, bytes });
      return;
    }
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
    setDoc({ kind: 'image', name: file.name, dataUrl });
  };

  useEffect(() => {
    let cancelled = false;
    const host = pagesHostRef.current;
    if (!host) return;
    if (!doc || doc.kind !== 'pdf') {
      host.innerHTML = '';
      setPdfPageCount(0);
      return;
    }

    (async () => {
      try {
        const pdf = await pdfjsLib.getDocument({ data: doc.bytes.slice(0) }).promise;
        if (cancelled) return;
        setPdfPageCount(pdf.numPages);
        host.innerHTML = '';

        const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
        const cssScale = Math.max(0.4, effectiveZoom) * 1.25;

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          if (cancelled) return;
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: cssScale });

          const wrapper = document.createElement('div');
          wrapper.className = 'flex flex-col items-center gap-1.5';

          const badge = document.createElement('div');
          badge.className =
            'px-2.5 py-0.5 rounded-full bg-[var(--studio-surface)]/85 border border-[var(--studio-border)] text-[11px] font-medium text-[var(--studio-muted)]';
          badge.textContent = `${pageNum} ${t.reference.pageOf} ${pdf.numPages}`;
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
      } catch {
        // Keep current view if a corrupt PDF is picked
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [doc, effectiveZoom, t.reference.pageOf]);

  return (
    <div className="h-full w-full flex flex-col border-r border-[var(--studio-border)] bg-[var(--studio-bg)] overflow-hidden">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg,.webp"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void loadFile(f);
          e.target.value = '';
        }}
        className="hidden"
      />

      {/* Toolbar */}
      <div className="shrink-0 px-3 py-2 border-b border-[var(--studio-border)] bg-[var(--studio-surface)] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <ImageIcon className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span className="text-xs font-semibold text-[var(--studio-text)] truncate">
            {doc ? doc.name : t.reference.title}
          </span>
          {doc?.kind === 'pdf' && pdfPageCount > 0 && (
            <span className="text-[10px] font-mono text-[var(--studio-muted)] shrink-0">
              ({pdfPageCount}p)
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSyncZoom((s) => !s)}
            title={t.reference.syncZoom}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] border cursor-pointer ${
              syncZoom
                ? 'border-amber-600/50 bg-amber-500/10 text-amber-800 dark:text-amber-300'
                : 'border-[var(--studio-border)] text-[var(--studio-muted)]'
            }`}
          >
            <Link2 className="w-3 h-3" />
            <span>{t.reference.syncZoom}</span>
          </button>

          {!syncZoom && (
            <div className="flex items-center gap-0.5 px-1 py-0.5 rounded-md border border-[var(--studio-border)] bg-[var(--studio-bg)]">
              <button
                type="button"
                onClick={() => setRefZoom((z) => Math.max(0.4, Number((z - 0.1).toFixed(2))))}
                className="p-0.5 text-[var(--studio-muted)] hover:text-[var(--studio-text)] cursor-pointer"
              >
                <ZoomOut className="w-3 h-3" />
              </button>
              <span className="text-[10px] font-mono w-9 text-center">
                {Math.round(refZoom * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setRefZoom((z) => Math.min(1.5, Number((z + 0.1).toFixed(2))))}
                className="p-0.5 text-[var(--studio-muted)] hover:text-[var(--studio-text)] cursor-pointer"
              >
                <ZoomIn className="w-3 h-3" />
              </button>
            </div>
          )}

          {doc && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1 px-2 py-1 rounded-md border border-[var(--studio-border)] bg-[var(--studio-elevated)] text-[11px] font-medium text-[var(--studio-text)] hover:border-amber-600/50 cursor-pointer"
            >
              <Upload className="w-3 h-3" />
              <span>{t.reference.replaceBtn}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setReferencePaneOpen(false)}
            title={t.reference.closeBtn}
            className="p-1 rounded-md text-[var(--studio-muted)] hover:text-[var(--studio-text)] hover:bg-[var(--studio-bg)] cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Host */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const f = e.dataTransfer.files?.[0];
          if (f) void loadFile(f);
        }}
        className="flex-1 min-h-0 overflow-auto studio-canvas-grid flex flex-col items-center py-7 px-5"
      >
        {!doc ? (
          <div className="my-auto max-w-sm rounded-2xl border border-dashed border-[var(--studio-border)] bg-[var(--studio-surface)]/90 p-6 text-center space-y-3">
            <div className="mx-auto w-10 h-10 rounded-xl bg-amber-600/15 text-amber-700 dark:text-amber-300 flex items-center justify-center">
              <FileUp className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-bold text-[var(--studio-text)]">{t.reference.emptyTitle}</h3>
            <p className="text-[11px] text-[var(--studio-muted)] leading-relaxed">
              {t.reference.emptyDesc}
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{t.reference.uploadBtn}</span>
            </button>
          </div>
        ) : doc.kind === 'image' ? (
          <img
            src={doc.dataUrl}
            alt={doc.name}
            style={{ width: `${Math.round(794 * effectiveZoom)}px` }}
            className="paper-elevation bg-white rounded-xs max-w-none"
          />
        ) : (
          <div ref={pagesHostRef} className="flex flex-col items-center gap-6" />
        )}
      </div>
    </div>
  );
};
