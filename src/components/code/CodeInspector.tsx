import React, { useMemo, useState } from 'react';
import { Check, Copy, FileCode2 } from 'lucide-react';
import { generateProjectBundle } from '../../engine/latexGenerator';
import { useI18n } from '../../i18n/LanguageContext';
import { useTemplate } from '../../state/TemplateContext';

function highlightLatexLine(line: string): React.ReactNode {
  const trimmed = line.trimStart();
  if (trimmed.startsWith('%')) {
    return <span className="text-emerald-700/80 dark:text-emerald-400/80 italic">{line}</span>;
  }

  const commentIdx = line.indexOf('%');
  const codePart = commentIdx >= 0 ? line.slice(0, commentIdx) : line;
  const commentPart = commentIdx >= 0 ? line.slice(commentIdx) : '';

  const tokens = codePart.split(/(\\[A-Za-z@]+|[{}\[\]])/g);
  return (
    <>
      {tokens.map((tok, i) => {
        if (tok.startsWith('\\')) {
          return (
            <span key={i} className="text-amber-700 dark:text-amber-300 font-medium">
              {tok}
            </span>
          );
        }
        if (tok === '{' || tok === '}' || tok === '[' || tok === ']') {
          return (
            <span key={i} className="text-sky-700 dark:text-sky-300">
              {tok}
            </span>
          );
        }
        return <React.Fragment key={i}>{tok}</React.Fragment>;
      })}
      {commentPart && (
        <span className="text-emerald-700/80 dark:text-emerald-400/80 italic">{commentPart}</span>
      )}
    </>
  );
}

export const CodeInspector: React.FC = () => {
  const { t } = useI18n();
  const { config } = useTemplate();

  const textFiles = useMemo(() => {
    const bundle = generateProjectBundle({
      ...config,
      exportOptions: {
        ...config.exportOptions,
        includeClass: true,
        includeStyle: true,
      },
    });
    return bundle.filter((f) => typeof f.content === 'string');
  }, [config]);

  const [selectedPath, setSelectedPath] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const activeFile =
    textFiles.find((f) => f.path === selectedPath) ?? textFiles[0];

  const content = typeof activeFile?.content === 'string' ? activeFile.content : '';
  const lines = content.split('\n');

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="h-full flex flex-col bg-[var(--studio-surface)] border-l border-[var(--studio-border)]">
      {/* File Tabs */}
      <div className="shrink-0 px-2.5 py-2 border-b border-[var(--studio-border)] flex items-center justify-between gap-2 bg-[var(--studio-bg)]">
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
          {textFiles.map((file) => {
            const active = activeFile?.path === file.path;
            return (
              <button
                key={file.path}
                type="button"
                onClick={() => setSelectedPath(file.path)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono whitespace-nowrap transition-colors cursor-pointer ${
                  active
                    ? 'bg-[var(--studio-elevated)] text-[var(--studio-text)] border border-[var(--studio-border)] shadow-xs font-semibold'
                    : 'text-[var(--studio-muted)] hover:text-[var(--studio-text)]'
                }`}
              >
                <FileCode2 className="w-3 h-3 text-amber-600" />
                <span>{file.path}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] font-mono text-[var(--studio-muted)] hidden sm:inline">
            {lines.length} {t.codeInspector.lines}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-1 rounded-md border border-[var(--studio-border)] bg-[var(--studio-elevated)] text-[11px] font-medium text-[var(--studio-text)] hover:border-amber-600/50 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-500" />
                <span>{t.codeInspector.copied}</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>{t.codeInspector.copy}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Lines */}
      <div className="flex-1 overflow-auto p-3 font-mono text-[12px] leading-relaxed bg-[var(--studio-elevated)]">
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, idx) => (
              <tr key={idx} className="hover:bg-black/[0.03] dark:hover:bg-white/[0.03]">
                <td className="select-none pr-3 text-right text-[10px] text-[var(--studio-muted)] w-9 align-top">
                  {idx + 1}
                </td>
                <td className="whitespace-pre text-[var(--studio-text)]">
                  {activeFile.language === 'latex' ? highlightLatexLine(line) : line}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
