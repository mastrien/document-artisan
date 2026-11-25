import React from 'react';
import { useI18n } from '../../i18n/LanguageContext';
import { useTemplate } from '../../state/TemplateContext';
import { PaperPage } from './PaperPage';
import { PdfPreviewCanvas } from './PdfPreviewCanvas';
import { SlideFrame } from './SlideFrame';

export const DocumentCanvas: React.FC = () => {
  const { t } = useI18n();
  const { config, zoom, showGuides, previewEngine } = useTemplate();

  if (previewEngine === 'pdf') {
    return <PdfPreviewCanvas />;
  }

  const isSlides = config.documentType === 'slides';
  const pages = [1, 2];

  return (
    <div className="h-full w-full overflow-auto studio-canvas-grid flex flex-col items-center py-7 px-6 gap-8">
      {pages.map((num) => (
        <div key={num} className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[var(--studio-surface)]/85 border border-[var(--studio-border)] text-[11px] font-medium text-[var(--studio-muted)] shadow-2xs">
            <span>
              {isSlides ? t.preview.slideLabel : t.preview.pageLabel} {num}
            </span>
            {!isSlides && config.page.twoside && (
              <span className="text-[10px] font-mono text-amber-700 dark:text-amber-300">
                · {num % 2 === 1 ? t.preview.facingOdd : t.preview.facingEven}
              </span>
            )}
          </div>

          {isSlides ? (
            <SlideFrame
              config={config}
              slideNumber={num}
              zoom={zoom}
              showGuides={showGuides}
            />
          ) : (
            <PaperPage
              config={config}
              pageNumber={num}
              zoom={zoom}
              showGuides={showGuides}
            />
          )}
        </div>
      ))}
    </div>
  );
};
