import React from 'react';
import { Boxes, FileStack, FileText, LayoutTemplate, PanelTop, Type } from 'lucide-react';
import { useI18n } from '../i18n/LanguageContext';
import { useTemplate } from '../state/TemplateContext';
import { InspectorTab } from '../types/template';

export const SidebarNav: React.FC = () => {
  const { t } = useI18n();
  const { activeTab, setActiveTab } = useTemplate();

  const items: { id: InspectorTab; label: string; icon: React.ReactNode }[] = [
    { id: 'model', label: t.tabs.model, icon: <FileText className="w-4 h-4" /> },
    { id: 'frontMatter', label: t.tabs.frontMatter, icon: <FileStack className="w-4 h-4" /> },
    { id: 'page', label: t.tabs.page, icon: <LayoutTemplate className="w-4 h-4" /> },
    { id: 'typography', label: t.tabs.typography, icon: <Type className="w-4 h-4" /> },
    { id: 'headerFooter', label: t.tabs.headerFooter, icon: <PanelTop className="w-4 h-4" /> },
    { id: 'modules', label: t.tabs.modules, icon: <Boxes className="w-4 h-4" /> },
  ];

  return (
    <nav className="w-16 shrink-0 border-r border-[var(--studio-border)] bg-[var(--studio-surface)] flex flex-col items-center py-2.5 gap-1.5">
      {items.map((item) => {
        const active = activeTab === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveTab(item.id)}
            className={`w-13 py-2 rounded-xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
              active
                ? 'bg-amber-600/12 text-amber-800 dark:text-amber-300 border border-amber-600/30 shadow-xs'
                : 'text-[var(--studio-muted)] hover:text-[var(--studio-text)] hover:bg-[var(--studio-bg)]'
            }`}
          >
            {item.icon}
            <span className="text-[10px] font-medium leading-none">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
