import { invoke } from '@tauri-apps/api/core';
import { GeneratedFile, TemplateConfig } from '../types/template';
import { generateProjectBundle, sanitizeSlug } from './latexGenerator';

export interface LatexEnvInfo {
  available_engines: string[];
  has_biber: boolean;
  has_latexmk: boolean;
  engine_paths: Record<string, string>;
}

export interface CompileResult {
  success: boolean;
  mode: 'web-visual' | 'tauri-native';
  pdfBytes?: Uint8Array;
  log: string;
  errors: string[];
  durationMs?: number;
  engineUsed?: string;
}

export interface PreviewCompiler {
  readonly mode: 'web-visual' | 'tauri-native';
  isAvailable(): boolean;
  compile(files: GeneratedFile[]): Promise<CompileResult>;
}

export function isTauriRuntime(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const slice = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...slice);
  }
  return btoa(binary);
}

function stringToBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  return bytesToBase64(bytes);
}

function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    out[i] = binary.charCodeAt(i);
  }
  return out;
}

export function buildCompileBundle(config: TemplateConfig): {
  engine: string;
  entry_file: string;
  run_biber: boolean;
  files: { path: string; content_base64: string }[];
} {
  const compileConfig: TemplateConfig = {
    ...config,
    templateSlug: sanitizeSlug(config.templateSlug),
    exportOptions: {
      includeClass: true,
      includeStyle: false,
      contentMode: 'example',
    },
  };

  const rawFiles = generateProjectBundle(compileConfig).filter(
    (f) => f.path !== 'README.md'
  );

  const files = rawFiles.map((file) => ({
    path: file.path,
    content_base64:
      typeof file.content === 'string'
        ? stringToBase64(file.content)
        : bytesToBase64(new Uint8Array(file.content)),
  }));

  return {
    engine: config.engine,
    entry_file: 'main.tex',
    run_biber: config.modules.citations.enabled,
    files,
  };
}

export class WebVisualCompiler implements PreviewCompiler {
  readonly mode = 'web-visual' as const;

  isAvailable(): boolean {
    return true;
  }

  async compile(): Promise<CompileResult> {
    return {
      success: true,
      mode: 'web-visual',
      log: 'Instant browser visual layout active.',
      errors: [],
    };
  }
}

interface RustCompileResponse {
  success: boolean;
  pdf_base64: string | null;
  log: string;
  errors: string[];
  duration_ms: number;
  engine_used: string;
}

export class TauriLatexCompiler implements PreviewCompiler {
  readonly mode = 'tauri-native' as const;

  isAvailable(): boolean {
    return isTauriRuntime();
  }

  async detectEnvironment(): Promise<LatexEnvInfo | null> {
    if (!this.isAvailable()) return null;
    try {
      return await invoke<LatexEnvInfo>('detect_latex_environment');
    } catch {
      return null;
    }
  }

  async listSystemFonts(): Promise<string[]> {
    if (!this.isAvailable()) return [];
    try {
      return await invoke<string[]>('list_system_fonts');
    } catch {
      return [];
    }
  }

  async compileConfig(config: TemplateConfig): Promise<CompileResult> {
    if (!this.isAvailable()) {
      return {
        success: false,
        mode: 'tauri-native',
        log: 'Tauri runtime not detected in browser mode.',
        errors: ['Tauri desktop runtime required for local LaTeX compilation.'],
      };
    }

    const req = buildCompileBundle(config);
    const res = await invoke<RustCompileResponse>('compile_latex_bundle', { req });

    return {
      success: res.success,
      mode: 'tauri-native',
      pdfBytes: res.pdf_base64 ? base64ToBytes(res.pdf_base64) : undefined,
      log: res.log,
      errors: res.errors,
      durationMs: res.duration_ms,
      engineUsed: res.engine_used,
    };
  }

  async compile(): Promise<CompileResult> {
    return {
      success: false,
      mode: 'tauri-native',
      log: 'Use compileConfig(config) for full bundle compilation.',
      errors: [],
    };
  }
}

export function getActiveCompiler(): PreviewCompiler {
  const tauri = new TauriLatexCompiler();
  return tauri.isAvailable() ? tauri : new WebVisualCompiler();
}
