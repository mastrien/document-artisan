# AGENTS.md

## Project Overview & Map
- **Name:** Document Artisan — Visual LaTeX template studio (`.cls` + `.sty` + `.zip` + real PDF preview).
- **Stack:** React 19, TypeScript (strict), Vite 6, Tailwind CSS v4, Vitest, JSZip, `pdfjs-dist`, Tauri v2 (Rust), local MiKTeX (`xelatex` / `lualatex` / `pdflatex` + `biber`).
- **Active Scope:** Currently focused on `article` templates; `book`, `report`, and `slides` are flagged `comingSoon: true` in UI/presets.
- **Core Sources of Truth:**
  - Schema: `src/types/template.ts`
  - Fonts & Paper specs: `src/data/fonts.ts`
  - Presets: `src/data/presets.ts`
  - Bilingual UI & sample copy (`pt` / `en`): `src/i18n/translations.ts`
  - App state, font/logo loaders & `localStorage` migration: `src/state/TemplateContext.tsx`
  - Pure LaTeX generator & bundle builder: `src/engine/latexGenerator.ts`
  - ZIP packager & Tauri compiler bridge: `src/engine/zipExporter.ts`, `src/engine/compiler.ts`
  - Native Rust compiler backend: `src-tauri/src/latex.rs`, `src-tauri/src/lib.rs`

## Mandatory Commands (Feedback Loop)
Run checks before finishing any task. On Windows, if `node`/`npm` is not in default PATH, prepend the `fnm` Node v23.4.0 installation dir:
`$env:PATH = "C:\Users\G51 Informática\AppData\Roaming\fnm\node-versions\v23.4.0\installation;$env:PATH"`

- **Typecheck (TS):** `npx tsc --noEmit`
- **Unit tests (Headless JS):** `npm test` (`vitest run` — `src/engine/__tests__/latexGenerator.test.ts`)
- **Production build (TS + Vite):** `npm run build`
- **Rust backend tests/check:** `cargo test --manifest-path src-tauri/Cargo.toml`
- **Web dev server:** `npm run dev` (binds `127.0.0.1:5173`)
- **Desktop app (Tauri + Vite HMR):** `npm run tauri:dev`
- **Real LaTeX smoke check (when changing LaTeX output):** Compile a generated `main.tex` + `.cls` in a temp dir using `xelatex -interaction=nonstopmode -file-line-error main.tex` (plus `biber main` + pass 2 if citations are enabled) and assert `PDF` exists with 0 errors.
- **Clean Up:** Delete temporary build/smoke directories (`da-smoke-*`, etc.) immediately after verification. Never leave orphan files in the repo or `%TEMP%`.

## Clean Code Rules for AI Agents
1. **Small Functions & Files:** Keep functions single-purpose with shallow nesting. Aim for files under 300–500 lines so they fit cleanly in a single read; split large new modules instead of creating monoliths.
2. **Greppable Names:** Use explicit, searchable names (`buildHeaderFooterBlock`, `uploadHeaderFooterLogo`, `sanitize_relative_path`). Avoid vague names like `handle`, `process`, `data`, or `manager`.
3. **Strict DRY:** Reuse existing helpers (`resolveFontOption`, `formatSlotTextLatex`, `sanitizeSlug`, `Controls.tsx`) rather than duplicating logic across visual preview, LaTeX generator, or Rust code.
4. **Comments for WHY, Never WHAT:** Do not write obvious line-by-line comments (they waste tokens). Comment only non-obvious invariants, LaTeX package-order constraints, or bug workarounds—and never delete existing invariant comments during refactors.
5. **Strict Typing:** Never introduce `any` or `@ts-ignore`. Keep `TemplateConfig`, `sanitizeStoredConfig` (`TemplateContext.tsx`), and `ExportModal.tsx` synchronized whenever schema fields change.
6. **Headless Tests as Oracle:** Every change to `latexGenerator.ts` or `src-tauri/src/latex.rs` must add or update deterministic unit tests in `latexGenerator.test.ts` or `latex.rs` `#[cfg(test)]`.
7. **Bilingual Parity:** Every new UI label or preview text must be added to both `pt` and `en` in `src/i18n/translations.ts`.

## Project Invariants & Caveats (Do NOT Break)
- **`.cls` vs `.sty`:** Both formats must use `\RequirePackage` (never `\usepackage` inside `.cls`/`.sty`). Only `.cls` emits `\LoadClass`.
- **Package Load Order:** `etoolbox` must load before `\artisansource`; `hyperref` + `cleveref` must load last in paper classes.
- **Beamer Safety:** For `slides`, pass `xcolor=table` in `\LoadClass` and never emit `\RequirePackage[table]{xcolor}`, `geometry`, `fancyhdr`, `caption`, or `subcaption`.
- **Fonts & Logos in TeX:**
  - Custom uploaded font files go to `fonts/<file>` (`Path=fonts/` in `fontspec`); `pdfLaTeX` cannot use `fontspec` custom fonts.
  - Default presets targeting local Windows MiKTeX should use natively installed fonts (`Times New Roman`, `Courier New`, `Arial`, `Calibri`, `Cambria`) so out-of-the-box PDF compilation succeeds with 0 font errors.
  - Non-PNG/JPG logos (`.svg`, `.webp`) must be transcoded to PNG in `uploadHeaderFooterLogo` and bundled under `assets/<file>`.
  - Never persist binary `ArrayBuffer` or large `dataUrl` blobs into `localStorage` or exported `.json` configs.
- **Rust Security (`src-tauri/src/latex.rs`):** Keep the strict engine allowlist (`xelatex` | `lualatex` | `pdflatex`), reject path traversal (`..`, `:`, leading `/`/`\`) in `sanitize_relative_path`, and always set `CREATE_NO_WINDOW` on Windows commands.
- **Repo Hygiene:** Do not install new external dependencies without explicit approval. Never commit `node_modules/`, `dist/`, `.vite/`, `*.tsbuildinfo`, `src-tauri/target/`, or `src-tauri/gen/schemas/`.
