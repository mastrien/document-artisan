import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { DEFAULT_CONFIG, PRESETS } from '../data/presets';
import {
  CompileResult,
  isTauriRuntime,
  LatexEnvInfo,
  TauriLatexCompiler,
} from '../engine/compiler';
import {
  arrayBufferToDataUrl,
  deletePersistedAsset,
  loadPersistedAsset,
  loadPersistedManifest,
  mimeTypeForLogoFile,
  PersistedAssetManifest,
  PersistedFontFamilyMeta,
  savePersistedAsset,
  savePersistedManifest,
} from './assetStore';
import {
  CustomFontFamily,
  CustomFontVariantFile,
  DocumentType,
  FontVariantKey,
  InspectorTab,
  StudioTheme,
  TemplateConfig,
  ViewMode,
} from '../types/template';

export type PreviewEngineMode = 'visual' | 'pdf';

interface TemplateContextValue {
  config: TemplateConfig;
  setConfig: React.Dispatch<React.SetStateAction<TemplateConfig>>;
  updateConfig: <K extends keyof TemplateConfig>(key: K, value: TemplateConfig[K]) => void;
  loadPreset: (presetId: string) => void;
  setDocumentType: (docType: DocumentType) => void;
  uploadCustomFontFiles: (
    files: FileList | File[],
    targetFamilyId?: string,
    forcedVariant?: FontVariantKey
  ) => Promise<string | null>;
  removeCustomFontFamily: (familyId: string) => void;
  removeCustomFontVariant: (familyId: string, variant: FontVariantKey) => void;
  uploadHeaderFooterLogo: (target: 'header' | 'footer', file: File) => Promise<void>;
  removeHeaderFooterLogo: (target: 'header' | 'footer') => void;
  importConfigJson: (raw: string) => boolean;
  theme: StudioTheme;
  toggleTheme: () => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  activeTab: InspectorTab;
  setActiveTab: (tab: InspectorTab) => void;
  zoom: number;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
  showGuides: boolean;
  setShowGuides: React.Dispatch<React.SetStateAction<boolean>>;
  referencePaneOpen: boolean;
  setReferencePaneOpen: React.Dispatch<React.SetStateAction<boolean>>;
  previewEngine: PreviewEngineMode;
  setPreviewEngine: (mode: PreviewEngineMode) => void;
  autoCompilePdf: boolean;
  setAutoCompilePdf: (auto: boolean) => void;
  latexEnv: LatexEnvInfo | null;
  compileResult: CompileResult | null;
  isCompiling: boolean;
  compileNow: () => Promise<void>;
}

const STORAGE_KEY = 'document-artisan:state:v2';
const THEME_KEY = 'document-artisan:theme:v1';

const TemplateContext = createContext<TemplateContextValue | null>(null);

function detectVariantFromFilename(fileName: string): FontVariantKey {
  const stem = fileName.replace(/\.[^.]+$/, '').toLowerCase();
  if (
    /bold[-_ ]?italic|boldoblique|[-_]bi$|[-_]z$/.test(stem)
  ) {
    return 'boldItalic';
  }
  if (/bold|semibold|demibold|[-_]bd$|[-_]b$/.test(stem)) {
    return 'bold';
  }
  if (/italic|oblique|[-_]it$|[-_]i$/.test(stem)) {
    return 'italic';
  }
  return 'regular';
}

function deriveFamilyName(fileName: string): string {
  const stem = fileName.replace(/\.[^.]+$/, '');
  const cleaned = stem
    .replace(/[-_ ]?(regular|roman|book|normal|bolditalic|bold-italic|boldoblique|semibold|demibold|bold|italic|oblique|medium|light)$/i, '')
    .replace(/[-_]+/g, ' ')
    .trim();
  return cleaned || stem;
}

function variantCssDescriptors(variant: FontVariantKey): FontFaceDescriptors {
  switch (variant) {
    case 'bold':
      return { weight: '700', style: 'normal' };
    case 'italic':
      return { weight: '400', style: 'italic' };
    case 'boldItalic':
      return { weight: '700', style: 'italic' };
    default:
      return { weight: '400', style: 'normal' };
  }
}

export function sanitizeStoredConfig(parsed: Partial<TemplateConfig>): TemplateConfig {
  const def = DEFAULT_CONFIG;
  return {
    ...def,
    ...parsed,
    metadata: { ...def.metadata, ...parsed.metadata },
    page: {
      ...def.page,
      ...parsed.page,
      margins: { ...def.page.margins, ...parsed.page?.margins },
      pageFrame: { ...def.page.pageFrame, ...parsed.page?.pageFrame },
    },
    columns: { ...def.columns, ...parsed.columns },
    typography: {
      ...def.typography,
      ...parsed.typography,
      titleBlock: { ...def.typography.titleBlock, ...parsed.typography?.titleBlock },
      headings: {
        h1: {
          ...def.typography.headings.h1,
          ...parsed.typography?.headings?.h1,
          box: { ...def.typography.headings.h1.box, ...parsed.typography?.headings?.h1?.box },
        },
        h2: {
          ...def.typography.headings.h2,
          ...parsed.typography?.headings?.h2,
          box: { ...def.typography.headings.h2.box, ...parsed.typography?.headings?.h2?.box },
        },
        h3: {
          ...def.typography.headings.h3,
          ...parsed.typography?.headings?.h3,
          box: { ...def.typography.headings.h3.box, ...parsed.typography?.headings?.h3?.box },
        },
      },
    },
    headerFooter: {
      ...def.headerFooter,
      ...parsed.headerFooter,
      headerLogo: {
        ...def.headerFooter.headerLogo,
        ...parsed.headerFooter?.headerLogo,
        buffer: undefined,
        dataUrl: undefined,
      },
      footerLogo: {
        ...def.headerFooter.footerLogo,
        ...parsed.headerFooter?.footerLogo,
        buffer: undefined,
        dataUrl: undefined,
      },
      firstPage: {
        ...def.headerFooter.firstPage,
        ...parsed.headerFooter?.firstPage,
      },
      firstPageMode:
        parsed.headerFooter?.firstPageMode ??
        (parsed.headerFooter?.suppressFirstPage === false ? 'same' : def.headerFooter.firstPageMode),
    },
    numbering: { ...def.numbering, ...parsed.numbering },
    frontMatter: {
      ...def.frontMatter,
      ...parsed.frontMatter,
      coverPage: { ...def.frontMatter.coverPage, ...parsed.frontMatter?.coverPage },
      titleSheet: { ...def.frontMatter.titleSheet, ...parsed.frontMatter?.titleSheet },
      abstractBlock: { ...def.frontMatter.abstractBlock, ...parsed.frontMatter?.abstractBlock },
    },
    modules: {
      images: { ...def.modules.images, ...parsed.modules?.images },
      tables: { ...def.modules.tables, ...parsed.modules?.tables },
      citations: { ...def.modules.citations, ...parsed.modules?.citations },
      dialogues: { ...def.modules.dialogues, ...parsed.modules?.dialogues },
      math: { ...def.modules.math, ...parsed.modules?.math },
      code: { ...def.modules.code, ...parsed.modules?.code },
      hyperref: { ...def.modules.hyperref, ...parsed.modules?.hyperref },
      callouts: { ...def.modules.callouts, ...parsed.modules?.callouts },
      longQuotes: { ...def.modules.longQuotes, ...parsed.modules?.longQuotes },
      lists: { ...def.modules.lists, ...parsed.modules?.lists },
      footnotes: { ...def.modules.footnotes, ...parsed.modules?.footnotes },
    },
    exportOptions: { ...def.exportOptions, ...parsed.exportOptions },
    // Binary buffers cannot be persisted into localStorage
    customFonts: [],
  };
}

export const TemplateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<TemplateConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return sanitizeStoredConfig(JSON.parse(saved) as Partial<TemplateConfig>);
      }
    } catch {
      // fallback to default
    }
    return DEFAULT_CONFIG;
  });

  const [theme, setTheme] = useState<StudioTheme>(() => {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {
      // ignore
    }
    return 'light';
  });

  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [activeTab, setActiveTab] = useState<InspectorTab>('model');
  const [zoom, setZoom] = useState<number>(0.74);
  const [showGuides, setShowGuides] = useState<boolean>(true);
  const [referencePaneOpen, setReferencePaneOpen] = useState<boolean>(false);
  const [previewEngine, setPreviewEngine] = useState<PreviewEngineMode>('visual');
  const [autoCompilePdf, setAutoCompilePdf] = useState<boolean>(true);
  const [latexEnv, setLatexEnv] = useState<LatexEnvInfo | null>(null);
  const [compileResult, setCompileResult] = useState<CompileResult | null>(null);
  const [isCompiling, setIsCompiling] = useState<boolean>(false);

  const compilerRef = useRef(new TauriLatexCompiler());
  const configRef = useRef(config);
  configRef.current = config;

  useEffect(() => {
    if (!isTauriRuntime()) return;
    compilerRef.current.detectEnvironment().then((env) => {
      if (env) setLatexEnv(env);
    });
  }, []);

  const persistManifestFromState = useCallback(async (cfg: TemplateConfig) => {
    const customFonts: PersistedFontFamilyMeta[] = cfg.customFonts.map((fam) => {
      const variantsMeta: PersistedFontFamilyMeta['variants'] = {};
      for (const [k, v] of Object.entries(fam.variants) as [FontVariantKey, CustomFontVariantFile | undefined][]) {
        if (v) {
          variantsMeta[k] = {
            fileName: v.fileName,
            format: v.format,
            assetKey: `fonts/${fam.id.replace(/[^a-zA-Z0-9_-]+/g, '_')}-${v.fileName}`,
          };
        }
      }
      return { id: fam.id, familyName: fam.familyName, variants: variantsMeta };
    });

    const hl = cfg.headerFooter.headerLogo;
    const fl = cfg.headerFooter.footerLogo;
    const manifest: PersistedAssetManifest = {
      customFonts,
      headerLogo:
        hl.fileName && hl.buffer
          ? {
              fileName: hl.fileName,
              assetKey: `logos/${hl.fileName}`,
              mimeType: mimeTypeForLogoFile(hl.fileName),
            }
          : undefined,
      footerLogo:
        fl.fileName && fl.buffer
          ? {
              fileName: fl.fileName,
              assetKey: `logos/${fl.fileName}`,
              mimeType: mimeTypeForLogoFile(fl.fileName),
            }
          : undefined,
    };
    await savePersistedManifest(manifest);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const manifest = await loadPersistedManifest();
      if (!manifest || cancelled) return;

      const hydratedFonts: CustomFontFamily[] = [];
      for (const fm of manifest.customFonts) {
        const variants: Partial<Record<FontVariantKey, CustomFontVariantFile>> = {};
        for (const [k, v] of Object.entries(fm.variants) as [
          FontVariantKey,
          PersistedFontFamilyMeta['variants'][FontVariantKey],
        ][]) {
          if (!v) continue;
          const buffer = await loadPersistedAsset(v.assetKey);
          if (!buffer) continue;
          try {
            const face = new FontFace(fm.id, buffer.slice(0), variantCssDescriptors(k));
            await face.load();
            document.fonts.add(face);
          } catch {
            // Browser FontFace decode may fail for unsupported formats; keep bytes for LaTeX
          }
          variants[k] = { fileName: v.fileName, format: v.format, buffer };
        }
        if (Object.keys(variants).length > 0) {
          hydratedFonts.push({ id: fm.id, familyName: fm.familyName, variants });
        }
      }

      const hlBuf = manifest.headerLogo
        ? await loadPersistedAsset(manifest.headerLogo.assetKey)
        : null;
      const flBuf = manifest.footerLogo
        ? await loadPersistedAsset(manifest.footerLogo.assetKey)
        : null;

      if (cancelled) return;
      setConfig((prev) => ({
        ...prev,
        customFonts: hydratedFonts.length > 0 ? hydratedFonts : prev.customFonts,
        headerFooter: {
          ...prev.headerFooter,
          headerLogo:
            hlBuf && manifest.headerLogo
              ? {
                  ...prev.headerFooter.headerLogo,
                  fileName: manifest.headerLogo.fileName,
                  buffer: hlBuf,
                  dataUrl: arrayBufferToDataUrl(hlBuf, manifest.headerLogo.mimeType),
                }
              : prev.headerFooter.headerLogo,
          footerLogo:
            flBuf && manifest.footerLogo
              ? {
                  ...prev.headerFooter.footerLogo,
                  fileName: manifest.footerLogo.fileName,
                  buffer: flBuf,
                  dataUrl: arrayBufferToDataUrl(flBuf, manifest.footerLogo.mimeType),
                }
              : prev.headerFooter.footerLogo,
        },
      }));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const compileNow = useCallback(async () => {
    if (!isTauriRuntime()) return;
    setIsCompiling(true);
    try {
      const res = await compilerRef.current.compileConfig(configRef.current);
      setCompileResult(res);
    } finally {
      setIsCompiling(false);
    }
  }, []);

  useEffect(() => {
    if (previewEngine !== 'pdf' || !isTauriRuntime()) return;
    if (!compileResult && !isCompiling) {
      void compileNow();
      return;
    }
    if (!autoCompilePdf) return;
    const timer = setTimeout(() => {
      void compileNow();
    }, 1400);
    return () => clearTimeout(timer);
  }, [config, previewEngine, autoCompilePdf, compileNow]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  useEffect(() => {
    try {
      const serializable: TemplateConfig = {
        ...config,
        customFonts: [],
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
      localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
    } catch {
      // ignore storage quota errors
    }
  }, [config]);

  const updateConfig = <K extends keyof TemplateConfig>(key: K, value: TemplateConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const loadPreset = (presetId: string) => {
    const found = PRESETS.find((p) => p.id === presetId);
    if (!found) return;
    setConfig((prev) => ({
      ...found.config,
      // Preserve uploaded custom fonts in memory so switching presets doesn't discard them
      customFonts: prev.customFonts,
    }));
  };

  const setDocumentType = (docType: DocumentType) => {
    setConfig((prev) => {
      const next = { ...prev, documentType: docType };
      if (docType === 'slides') {
        next.page = {
          ...prev.page,
          size: prev.page.size === 'slide4x3' ? 'slide4x3' : 'slide16x9',
          orientation: 'landscape',
          twoside: false,
          margins: { top: 10, bottom: 10, left: 12, right: 12, linked: false },
        };
      } else {
        if (prev.page.size === 'slide16x9' || prev.page.size === 'slide4x3') {
          next.page = {
            ...prev.page,
            size: docType === 'book' ? 'a5' : 'a4',
            orientation: 'portrait',
            margins: { top: 25, bottom: 20, left: 25, right: 20, linked: false },
          };
        }
        if (docType === 'monograph') {
          next.frontMatter = {
            ...prev.frontMatter,
            coverPage: { ...prev.frontMatter.coverPage, enabled: true },
            titleSheet: { ...prev.frontMatter.titleSheet, enabled: true },
            abstractBlock: { ...prev.frontMatter.abstractBlock, enabled: true, onSeparatePage: true },
            sectionStartsNewPage: true,
            startNumberingAtBody: true,
          };
          next.numbering = { ...prev.numbering, includeToc: true };
        }
      }
      return next;
    });
  };

  const uploadCustomFontFiles = async (
    files: FileList | File[],
    targetFamilyId?: string,
    forcedVariant?: FontVariantKey
  ): Promise<string | null> => {
    const list = Array.from(files);
    if (list.length === 0) return null;

    const firstFile = list[0];
    const derivedName = deriveFamilyName(firstFile.name);
    const slugStem = derivedName.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'font';
    const familyId = targetFamilyId ?? `custom:${slugStem}-${Date.now().toString(36)}`;

    const newVariants: Partial<Record<FontVariantKey, CustomFontVariantFile>> = {};

    for (const file of list) {
      const buffer = await file.arrayBuffer();
      const ext = file.name.split('.').pop()?.toLowerCase();
      const format: CustomFontVariantFile['format'] =
        ext === 'otf' ? 'otf' : ext === 'woff2' ? 'woff2' : 'ttf';
      const variant: FontVariantKey = forcedVariant ?? detectVariantFromFilename(file.name);

      const face = new FontFace(
        familyId,
        buffer.slice(0),
        variantCssDescriptors(variant)
      );
      await face.load();
      document.fonts.add(face);

      newVariants[variant] = {
        fileName: file.name,
        format,
        buffer,
      };
      await savePersistedAsset(
        `fonts/${familyId.replace(/[^a-zA-Z0-9_-]+/g, '_')}-${file.name}`,
        buffer
      );
    }

    setConfig((prev) => {
      const existingIdx = prev.customFonts.findIndex((f) => f.id === familyId);
      let nextCfg: TemplateConfig;
      if (existingIdx >= 0) {
        const updated = [...prev.customFonts];
        updated[existingIdx] = {
          ...updated[existingIdx],
          variants: { ...updated[existingIdx].variants, ...newVariants },
        };
        nextCfg = { ...prev, customFonts: updated };
      } else {
        const created: CustomFontFamily = {
          id: familyId,
          familyName: derivedName,
          variants: newVariants,
        };
        nextCfg = {
          ...prev,
          customFonts: [...prev.customFonts, created],
        };
      }
      void persistManifestFromState(nextCfg);
      return nextCfg;
    });

    return familyId;
  };

  const removeCustomFontFamily = (familyId: string) => {
    setConfig((prev) => {
      const targetFam = prev.customFonts.find((f) => f.id === familyId);
      if (targetFam) {
        for (const v of Object.values(targetFam.variants)) {
          if (v) {
            void deletePersistedAsset(
              `fonts/${familyId.replace(/[^a-zA-Z0-9_-]+/g, '_')}-${v.fileName}`
            );
          }
        }
      }
      const fallback = DEFAULT_CONFIG.typography.bodyFontId;
      const t = prev.typography;
      const nextCfg: TemplateConfig = {
        ...prev,
        customFonts: prev.customFonts.filter((f) => f.id !== familyId),
        typography: {
          ...t,
          bodyFontId: t.bodyFontId === familyId ? fallback : t.bodyFontId,
          titleFontId: t.titleFontId === familyId ? fallback : t.titleFontId,
          headingFontId: t.headingFontId === familyId ? fallback : t.headingFontId,
          headerFooterFontId:
            t.headerFooterFontId === familyId ? fallback : t.headerFooterFontId,
          captionFontId: t.captionFontId === familyId ? fallback : t.captionFontId,
          monoFontId:
            t.monoFontId === familyId ? DEFAULT_CONFIG.typography.monoFontId : t.monoFontId,
        },
      };
      void persistManifestFromState(nextCfg);
      return nextCfg;
    });
  };

  const removeCustomFontVariant = (familyId: string, variant: FontVariantKey) => {
    setConfig((prev) => {
      const targetFam = prev.customFonts.find((f) => f.id === familyId);
      const removed = targetFam?.variants[variant];
      if (removed) {
        void deletePersistedAsset(
          `fonts/${familyId.replace(/[^a-zA-Z0-9_-]+/g, '_')}-${removed.fileName}`
        );
      }
      const updated = prev.customFonts
        .map((fam) => {
          if (fam.id !== familyId) return fam;
          const nextVars = { ...fam.variants };
          delete nextVars[variant];
          return { ...fam, variants: nextVars };
        })
        .filter((fam) => Object.keys(fam.variants).length > 0);
      const nextCfg = { ...prev, customFonts: updated };
      void persistManifestFromState(nextCfg);
      return nextCfg;
    });
  };

  const uploadHeaderFooterLogo = async (target: 'header' | 'footer', file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    const stem = file.name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]+/g, '-');
    let buffer: ArrayBuffer;
    let dataUrl: string;
    let safeFileName: string;

    if (ext === 'png' || ext === 'jpg' || ext === 'jpeg') {
      buffer = await file.arrayBuffer();
      safeFileName = `${target}-${stem || 'logo'}.${ext}`;
      dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });
    } else {
      // Transcode SVG / WebP / GIF to crisp PNG so XeLaTeX/pdfLaTeX graphicx loads natively
      const objectUrl = URL.createObjectURL(file);
      try {
        const img = await new Promise<HTMLImageElement>((resolve, reject) => {
          const el = new Image();
          el.onload = () => resolve(el);
          el.onerror = (err) => reject(err);
          el.src = objectUrl;
        });
        const maxDim = 1200;
        const scale = Math.min(1, maxDim / Math.max(img.naturalWidth || 1, img.naturalHeight || 1));
        const w = Math.max(1, Math.round((img.naturalWidth || 400) * scale));
        const h = Math.max(1, Math.round((img.naturalHeight || 200) * scale));
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
        }
        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('PNG export failed'))), 'image/png');
        });
        buffer = await blob.arrayBuffer();
        dataUrl = canvas.toDataURL('image/png');
        safeFileName = `${target}-${stem || 'logo'}.png`;
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    }

    await savePersistedAsset(`logos/${safeFileName}`, buffer);
    setConfig((prev) => {
      const key = target === 'header' ? 'headerLogo' : 'footerLogo';
      const nextCfg: TemplateConfig = {
        ...prev,
        headerFooter: {
          ...prev.headerFooter,
          [key]: {
            ...prev.headerFooter[key],
            enabled: true,
            fileName: safeFileName,
            dataUrl,
            buffer,
          },
        },
      };
      void persistManifestFromState(nextCfg);
      return nextCfg;
    });
  };

  const removeHeaderFooterLogo = (target: 'header' | 'footer') => {
    setConfig((prev) => {
      const key = target === 'header' ? 'headerLogo' : 'footerLogo';
      const oldName = prev.headerFooter[key].fileName;
      if (oldName) {
        void deletePersistedAsset(`logos/${oldName}`);
      }
      const nextCfg: TemplateConfig = {
        ...prev,
        headerFooter: {
          ...prev.headerFooter,
          [key]: {
            ...prev.headerFooter[key],
            enabled: false,
            fileName: undefined,
            dataUrl: undefined,
            buffer: undefined,
          },
        },
      };
      void persistManifestFromState(nextCfg);
      return nextCfg;
    });
  };

  const importConfigJson = (raw: string): boolean => {
    try {
      const parsed = JSON.parse(raw) as Partial<TemplateConfig>;
      setConfig(sanitizeStoredConfig(parsed));
      return true;
    } catch {
      return false;
    }
  };

  const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));

  return (
    <TemplateContext.Provider
      value={{
        config,
        setConfig,
        updateConfig,
        loadPreset,
        setDocumentType,
        uploadCustomFontFiles,
        removeCustomFontFamily,
        removeCustomFontVariant,
        uploadHeaderFooterLogo,
        removeHeaderFooterLogo,
        importConfigJson,
        theme,
        toggleTheme,
        viewMode,
        setViewMode,
        activeTab,
        setActiveTab,
        zoom,
        setZoom,
        showGuides,
        setShowGuides,
        referencePaneOpen,
        setReferencePaneOpen,
        previewEngine,
        setPreviewEngine,
        autoCompilePdf,
        setAutoCompilePdf,
        latexEnv,
        compileResult,
        isCompiling,
        compileNow,
      }}
    >
      {children}
    </TemplateContext.Provider>
  );
};

export function useTemplate(): TemplateContextValue {
  const ctx = useContext(TemplateContext);
  if (!ctx) throw new Error('useTemplate must be used within TemplateProvider');
  return ctx;
}
