import React from 'react';
import { Trash2 } from 'lucide-react';
import { useI18n } from '../../i18n/LanguageContext';
import { useTemplate } from '../../state/TemplateContext';
import { AuthorEntry } from '../../types/template';
import { PanelSection } from '../ui/Controls';

export const AuthorsEditor: React.FC = () => {
  const { t } = useI18n();
  const { config, updateConfig } = useTemplate();
  const md = config.metadata;
  const authors = md.authors;

  const commitAuthors = (nextAuthors: AuthorEntry[]) => {
    const namesSummary = nextAuthors
      .map((a) => a.name.trim())
      .filter(Boolean)
      .join(' & ');
    updateConfig('metadata', {
      ...md,
      authors: nextAuthors,
      author: namesSummary || md.author,
      authorEmail: nextAuthors[0]?.email ?? md.authorEmail,
    });
  };

  const updateAuthor = (index: number, patch: Partial<AuthorEntry>) => {
    const next = authors.map((a, i) => (i === index ? { ...a, ...patch } : a));
    commitAuthors(next);
  };

  const addAuthor = () => {
    commitAuthors([
      ...authors,
      {
        name: '',
        email: '',
        institution: md.institution,
        role: '',
      },
    ]);
  };

  const removeAuthor = (index: number) => {
    if (authors.length <= 1) return;
    commitAuthors(authors.filter((_, i) => i !== index));
  };

  return (
    <PanelSection title={t.model.authorsTitle}>
      <div className="space-y-2">
        {authors.map((entry, idx) => (
          <div
            key={idx}
            className="p-2 rounded-lg border border-[var(--studio-border)] bg-[var(--studio-elevated)] space-y-1.5"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-mono uppercase text-[var(--studio-muted)]">
                #{idx + 1}
              </span>
              {authors.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeAuthor(idx)}
                  className="p-0.5 text-[var(--studio-muted)] hover:text-red-500 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
            <input
              type="text"
              placeholder={t.model.authorName}
              value={entry.name}
              onChange={(e) => updateAuthor(idx, { name: e.target.value })}
              className="w-full rounded border border-[var(--studio-border)] bg-[var(--studio-bg)] px-2 py-1 text-xs text-[var(--studio-text)]"
            />
            <div className="grid grid-cols-2 gap-1.5">
              <input
                type="email"
                placeholder={t.model.authorEmail}
                value={entry.email}
                onChange={(e) => updateAuthor(idx, { email: e.target.value })}
                className="w-full rounded border border-[var(--studio-border)] bg-[var(--studio-bg)] px-2 py-1 text-[11px] text-[var(--studio-text)]"
              />
              <input
                type="text"
                placeholder={t.model.authorRole}
                value={entry.role}
                onChange={(e) => updateAuthor(idx, { role: e.target.value })}
                className="w-full rounded border border-[var(--studio-border)] bg-[var(--studio-bg)] px-2 py-1 text-[11px] text-[var(--studio-text)]"
              />
            </div>
            <input
              type="text"
              placeholder={t.model.authorInstitution}
              value={entry.institution}
              onChange={(e) => updateAuthor(idx, { institution: e.target.value })}
              className="w-full rounded border border-[var(--studio-border)] bg-[var(--studio-bg)] px-2 py-1 text-[11px] text-[var(--studio-text)]"
            />
          </div>
        ))}
        <button
          type="button"
          onClick={addAuthor}
          className="w-full py-1.5 rounded-lg border border-dashed border-[var(--studio-border)] hover:border-amber-600/60 text-xs font-medium text-amber-700 dark:text-amber-400 cursor-pointer"
        >
          {t.model.addAuthor}
        </button>
      </div>
    </PanelSection>
  );
};
