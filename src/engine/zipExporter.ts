import JSZip from 'jszip';
import { TemplateConfig } from '../types/template';
import { generateProjectBundle, sanitizeSlug } from './latexGenerator';

export async function exportTemplateZip(config: TemplateConfig): Promise<void> {
  const slug = sanitizeSlug(config.templateSlug);
  const zip = new JSZip();
  const rootFolder = zip.folder(`${slug}-latex-template`);
  if (!rootFolder) {
    throw new Error('Failed to create zip root folder');
  }

  const bundle = generateProjectBundle(config);
  for (const file of bundle) {
    rootFolder.file(file.path, file.content);
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${slug}-latex-template.zip`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
