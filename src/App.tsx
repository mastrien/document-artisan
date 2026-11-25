import React, { useState } from 'react';
import { CodeInspector } from './components/code/CodeInspector';
import { HeaderFooterPanel } from './components/inspector/HeaderFooterPanel';
import { ModelPanel } from './components/inspector/ModelPanel';
import { ModulesPanel } from './components/inspector/ModulesPanel';
import { PageColumnsPanel } from './components/inspector/PageColumnsPanel';
import { TypographyPanel } from './components/inspector/TypographyPanel';
import { ExportModal } from './components/modal/ExportModal';
import { DocumentCanvas } from './components/preview/DocumentCanvas';
import { SidebarNav } from './components/SidebarNav';
import { TopBar } from './components/TopBar';
import { LanguageProvider } from './i18n/LanguageContext';
import { TemplateProvider, useTemplate } from './state/TemplateContext';

const StudioShell: React.FC = () => {
  const { activeTab, viewMode } = useTemplate();
  const [exportOpen, setExportOpen] = useState(false);

  const renderInspector = () => {
    switch (activeTab) {
      case 'model':
        return <ModelPanel />;
      case 'page':
        return <PageColumnsPanel />;
      case 'typography':
        return <TypographyPanel />;
      case 'headerFooter':
        return <HeaderFooterPanel />;
      case 'modules':
        return <ModulesPanel />;
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[var(--studio-bg)] text-[var(--studio-text)]">
      <TopBar onOpenExport={() => setExportOpen(true)} />

      <div className="flex-1 min-h-0 flex">
        <SidebarNav />

        {/* Left Controls Drawer */}
        <aside className="w-80 lg:w-84 shrink-0 border-r border-[var(--studio-border)] bg-[var(--studio-surface)] overflow-y-auto p-3.5">
          {renderInspector()}
        </aside>

        {/* Workspace Area */}
        <main className="flex-1 min-w-0 flex">
          {(viewMode === 'preview' || viewMode === 'split') && (
            <div className={viewMode === 'split' ? 'w-1/2 min-w-0 h-full' : 'w-full h-full'}>
              <DocumentCanvas />
            </div>
          )}

          {(viewMode === 'code' || viewMode === 'split') && (
            <div className={viewMode === 'split' ? 'w-1/2 min-w-0 h-full' : 'w-full h-full'}>
              <CodeInspector />
            </div>
          )}
        </main>
      </div>

      {exportOpen && <ExportModal onClose={() => setExportOpen(false)} />}
    </div>
  );
};

export function App() {
  return (
    <LanguageProvider>
      <TemplateProvider>
        <StudioShell />
      </TemplateProvider>
    </LanguageProvider>
  );
}

export default App;
