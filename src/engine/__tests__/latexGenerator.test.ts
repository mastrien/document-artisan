import { describe, expect, it } from 'vitest';
import { DEFAULT_CONFIG, PRESETS } from '../../data/presets';
import {
  buildClassFile,
  buildMainTex,
  buildMetadataTex,
  buildStyleFile,
  generateProjectBundle,
  sanitizeSlug,
} from '../latexGenerator';
import { TemplateConfig } from '../../types/template';

function cloneConfig(base: TemplateConfig = DEFAULT_CONFIG): TemplateConfig {
  return JSON.parse(JSON.stringify(base)) as TemplateConfig;
}

describe('latexGenerator', () => {
  it('sanitizes template slugs safely', () => {
    expect(sanitizeSlug(' Meu Modelo ABNT!! ')).toBe('meu-modelo-abnt');
    expect(sanitizeSlug('   ')).toBe('custom-template');
  });

  it('generates valid .cls using ProvidesClass, LoadClass, and RequirePackage only', () => {
    const cls = buildClassFile(DEFAULT_CONFIG);
    expect(cls).toContain('\\NeedsTeXFormat{LaTeX2e}');
    expect(cls).toContain('\\ProvidesClass{artigo-abnt}');
    expect(cls).toContain('\\LoadClass[12pt, a4paper]{article}');
    expect(cls).toContain('\\RequirePackage');
    expect(cls).not.toContain('\\usepackage');
  });

  it('generates valid .sty using ProvidesPackage and RequirePackage', () => {
    const sty = buildStyleFile(DEFAULT_CONFIG);
    expect(sty).toContain('\\ProvidesPackage{artigo-abnt}');
    expect(sty).toContain('\\RequirePackage');
    expect(sty).not.toContain('\\LoadClass');
  });

  it('switches cleanly between fontspec (xelatex/lualatex) and pdflatex', () => {
    const xeCfg = cloneConfig();
    xeCfg.engine = 'xelatex';
    xeCfg.typography.letterSpacingEm = 0.04;
    const xeCls = buildClassFile(xeCfg);
    expect(xeCls).toContain('\\RequirePackage{fontspec}');
    expect(xeCls).toContain('LetterSpace=4');
    expect(xeCls).not.toContain('\\RequirePackage[utf8]{inputenc}');

    const pdfCfg = cloneConfig();
    pdfCfg.engine = 'pdflatex';
    pdfCfg.typography.letterSpacingEm = 0.03;
    const pdfCls = buildClassFile(pdfCfg);
    expect(pdfCls).toContain('\\RequirePackage[utf8]{inputenc}');
    expect(pdfCls).toContain('\\RequirePackage[T1]{fontenc}');
    expect(pdfCls).toContain('letterspace=30');
    expect(pdfCls).not.toContain('\\RequirePackage{fontspec}');
  });

  it('emits multi-variant fontspec paths and bundles all custom font files in ZIP', () => {
    const cfg = cloneConfig();
    const dummyBuf = new ArrayBuffer(8);
    cfg.customFonts = [
      {
        id: 'custom:myeditorial',
        familyName: 'MyEditorial',
        variants: {
          regular: { fileName: 'MyEditorial-Regular.ttf', format: 'ttf', buffer: dummyBuf },
          bold: { fileName: 'MyEditorial-Bold.ttf', format: 'ttf', buffer: dummyBuf },
          italic: { fileName: 'MyEditorial-Italic.ttf', format: 'ttf', buffer: dummyBuf },
        },
      },
    ];
    cfg.typography.bodyFontId = 'custom:myeditorial';
    const cls = buildClassFile(cfg);
    expect(cls).toContain('Path=fonts/');
    expect(cls).toContain('UprightFont=MyEditorial-Regular.ttf');
    expect(cls).toContain('BoldFont=MyEditorial-Bold.ttf');
    expect(cls).toContain('ItalicFont=MyEditorial-Italic.ttf');

    const bundle = generateProjectBundle(cfg);
    const paths = bundle.map((f) => f.path);
    expect(paths).toContain('class-version/fonts/MyEditorial-Regular.ttf');
    expect(paths).toContain('class-version/fonts/MyEditorial-Bold.ttf');
    expect(paths).toContain('package-version/fonts/MyEditorial-Italic.ttf');
  });

  it('supports system fonts like Times New Roman directly in fontspec', () => {
    const cfg = cloneConfig();
    cfg.typography.bodyFontId = 'system:Times New Roman';
    const cls = buildClassFile(cfg);
    expect(cls).toContain('\\setmainfont{Times New Roman}');
  });

  it('handles custom paper size, headsep, footskip, and page frame border', () => {
    const cfg = cloneConfig();
    cfg.page.size = 'custom';
    cfg.page.customWidthMm = 170;
    cfg.page.customHeightMm = 240;
    cfg.page.pageFrame = { enabled: true, widthPt: 1.2, color: '#0f766e', insetMm: 12 };
    cfg.headerFooter.headerSepMm = 9;
    cfg.headerFooter.footerSkipMm = 11;
    const cls = buildClassFile(cfg);
    expect(cls).toContain('paperwidth=170mm');
    expect(cls).toContain('paperheight=240mm');
    expect(cls).toContain('headsep=9mm');
    expect(cls).toContain('footskip=11mm');
    expect(cls).toContain('\\RequirePackage{eso-pic, tikz}');
    expect(cls).toContain('line width=1.2pt');
  });

  it('emits independent H1/H2/H3 titlesec rules and disables hyphenation when configured', () => {
    const cfg = cloneConfig();
    cfg.typography.hyphenation = false;
    cfg.typography.headings.h1.spaceBeforePt = 18;
    cfg.typography.headings.h2.italic = true;
    cfg.typography.headings.h3.fontSizePt = 10.5;
    const cls = buildClassFile(cfg);
    expect(cls).toContain('\\hyphenpenalty=10000');
    expect(cls).toContain('\\titleformat{\\section}');
    expect(cls).toContain('\\titlespacing*{\\section}{0pt}{18pt}');
    expect(cls).toContain('\\titleformat{\\subsection}');
    expect(cls).toContain('\\titleformat{\\subsubsection}');
  });

  it('emits DOCX-grade caption prefixes, separators, and ABNT source macros', () => {
    const cfg = cloneConfig();
    cfg.modules.images.captionPrefix = 'Figura';
    cfg.modules.images.captionSeparator = 'endash';
    cfg.modules.tables.headerTint = true;
    cfg.modules.tables.headerBgColor = '#0f766e';
    const cls = buildClassFile(cfg);
    expect(cls).toContain('\\renewcommand{\\figurename}{Figura}');
    expect(cls).toContain('labelsep=endash');
    expect(cls).toContain('\\newcommand{\\artisansource}');
    expect(cls).toContain('\\definecolor{artisanTableHeaderBg}{HTML}{0F766E}');
  });

  it('handles native twocolumn vs multicol and 3-column layouts', () => {
    const nativeCfg = cloneConfig();
    nativeCfg.columns = { count: 2, mode: 'native', gapMm: 7, ruleWidthPt: 0.5, ruleColor: '#cccccc' };
    const nativeCls = buildClassFile(nativeCfg);
    expect(nativeCls).toContain('\\LoadClass[12pt, a4paper, twocolumn]{article}');
    expect(nativeCls).toContain('\\setlength{\\columnsep}{7mm}');
    expect(nativeCls).toContain('\\setlength{\\columnseprule}{0.5pt}');

    const multiCfg = cloneConfig();
    multiCfg.columns = { count: 3, mode: 'multicol', gapMm: 5, ruleWidthPt: 0, ruleColor: '#cccccc' };
    const multiCls = buildClassFile(multiCfg);
    expect(multiCls).toContain('\\RequirePackage{multicol}');
    expect(multiCls).not.toContain('twocolumn');
  });

  it('configures ABNT biblatex + biber (NBR 10520:2023 titlecase by default, legacy uppercase optional) and dialogue macros', () => {
    const cfg = cloneConfig();
    cfg.modules.citations = {
      enabled: true,
      style: 'abnt',
      abntCiteCase: 'titlecase',
      bibFile: 'refs.bib',
      referencesTitle: 'Referências',
    };
    cfg.modules.dialogues = { enabled: true, style: 'literary', speakerBold: true, indentMm: 6 };
    const clsTitle = buildClassFile(cfg);
    expect(clsTitle).toContain(
      '\\RequirePackage[backend=biber, style=abnt, accite=false, sorting=nyt]{biblatex}'
    );
    expect(clsTitle).toContain('\\addbibresource{refs.bib}');
    expect(clsTitle).toContain('\\newcommand{\\fala}');
    expect(clsTitle).toContain('\\newcommand{\\dialogo}');

    cfg.modules.citations.abntCiteCase = 'uppercase';
    const clsUpper = buildClassFile(cfg);
    expect(clsUpper).toContain(
      '\\RequirePackage[backend=biber, style=abnt, accite=true, sorting=nyt]{biblatex}'
    );
  });

  it('handles Beamer slides without emitting geometry, fancyhdr, xcolor clash, or caption conflicts', () => {
    const slidesPreset = PRESETS.find((p) => p.id === 'academic-slides')!;
    const cls = buildClassFile(slidesPreset.config);
    expect(cls).toContain('\\LoadClass[aspectratio=169, 11pt, xcolor=table]{beamer}');
    expect(cls).toContain('\\setbeamertemplate{headline}');
    expect(cls).toContain('\\setbeamertemplate{footline}');
    expect(cls).not.toContain('\\RequirePackage[table]{xcolor}');
    expect(cls).not.toContain('\\RequirePackage{caption}');
    expect(cls).not.toContain('\\RequirePackage{fancyhdr}');
    expect(cls).not.toContain(']{geometry}');
  });

  it('uses begingroup instead of flushleft in maketitle and loads etoolbox before artisansource', () => {
    const cls = buildClassFile(DEFAULT_CONFIG);
    expect(cls).toContain('\\begingroup\\setlength{\\parindent}{0pt}');
    expect(cls).not.toContain('\\begin{flushleft}');
    expect(cls.indexOf('\\RequirePackage{etoolbox}')).toBeLessThan(
      cls.indexOf('\\newcommand{\\artisansource}')
    );
  });

  it('embeds uploaded header/footer logos, auto headheight, multiline shortstack, rule styles, and custom 1st page', () => {
    const cfg = cloneConfig();
    const dummyPng = new ArrayBuffer(16);
    cfg.headerFooter.headerLogo = {
      enabled: true,
      fileName: 'header-logo.png',
      buffer: dummyPng,
      slot: 'left',
      placement: 'beforeText',
      heightMm: 14,
      verticalOffsetMm: 0,
      gapMm: 4,
      opacity: 1,
    };
    cfg.headerFooter.headerLeft = 'custom';
    cfg.headerFooter.headerCustomLeft = 'Linha Um\nLinha Dois';
    cfg.headerFooter.headerRulePt = 0.8;
    cfg.headerFooter.headerRuleStyle = 'double';
    cfg.headerFooter.footerRulePt = 0.5;
    cfg.headerFooter.footerRuleStyle = 'dashed';
    cfg.headerFooter.firstPageMode = 'custom';

    const cls = buildClassFile(cfg);
    expect(cls).toContain('\\RequirePackage{graphicx}');
    expect(cls).toContain('headheight=17mm');
    expect(cls).toContain('\\includegraphics[height=14mm]{assets/header-logo.png}');
    expect(cls).toContain('\\shortstack[l]{Linha Um \\\\ Linha Dois}');
    expect(cls).toContain('\\vbox{\\hbox to\\headwidth');
    expect(cls).toContain('\\cleaders\\hbox to 6pt');
    expect(cls).toContain('\\fancypagestyle{firstpage}');
    expect(cls).toContain('\\AtBeginDocument{\\thispagestyle{firstpage}}');

    const bundle = generateProjectBundle(cfg);
    const paths = bundle.map((f) => f.path);
    expect(paths).toContain('class-version/assets/header-logo.png');
    expect(paths).toContain('package-version/assets/header-logo.png');
  });

  it('bundles both class-version/ and package-version/ in generateProjectBundle', () => {
    const files = generateProjectBundle(DEFAULT_CONFIG);
    const paths = files.map((f) => f.path);
    expect(paths).toContain('README.md');
    expect(paths).toContain('class-version/artigo-abnt.cls');
    expect(paths).toContain('class-version/main.tex');
    expect(paths).toContain('package-version/artigo-abnt.sty');
    expect(paths).toContain('package-version/main.tex');
  });

  it('generates tcolorbox boxed headings for H1/H2 without loading tcolorbox twice', () => {
    const cfg = cloneConfig();
    cfg.modules.callouts.enabled = true;
    cfg.typography.headings.h1.decoration = 'box';
    cfg.typography.headings.h1.box = {
      bgColor: '#1e3a8a',
      borderColor: '#1e40af',
      borderWidthPt: 1,
      borderLeftOnly: false,
      paddingYPt: 6,
      paddingXPt: 10,
      radiusPt: 3,
      fullWidth: true,
    };
    cfg.typography.headings.h2.decoration = 'box';
    cfg.typography.headings.h2.box = {
      bgColor: '#eff6ff',
      borderColor: '#1d4ed8',
      borderWidthPt: 2.5,
      borderLeftOnly: true,
      paddingYPt: 4,
      paddingXPt: 8,
      radiusPt: 0,
      fullWidth: false,
    };

    const cls = buildClassFile(cfg);
    expect(cls).toContain('\\RequirePackage[explicit]{titlesec}');
    expect(cls).toContain('\\definecolor{artisanH1BoxBg}{HTML}{1E3A8A}');
    expect(cls).toContain('\\begin{tcolorbox}');
    expect(cls).toContain('\\tcbox[');
    expect(cls).toContain('leftrule=2.5pt');
    expect(cls).toContain('name=\\section, numberless');
    const tcolorboxMatches = cls.match(/\\RequirePackage\[most\]\{tcolorbox\}/g) ?? [];
    expect(tcolorboxMatches).toHaveLength(1);
  });

  it('generates ABNT monograph preset with cover, title sheet, bilingual abstracts, LOF/LOT, TOC, and body-only numbering', () => {
    const monoPreset = PRESETS.find((p) => p.id === 'abnt-monograph')!;
    const cls = buildClassFile(monoPreset.config);
    const sty = buildStyleFile(monoPreset.config);
    const tex = buildMainTex(monoPreset.config, 'class', 'example');

    expect(cls).toContain('\\LoadClass[12pt, a4paper]{article}');
    expect(cls).toContain('\\newcommand{\\artisancoverpage}');
    expect(cls).toContain('\\newcommand{\\artisantitlesheet}');
    expect(cls).toContain('\\newcommand{\\artisanabstract}');
    expect(cls).toContain('\\newcommand{\\sectionbreak}{\\clearpage}');
    expect(cls).toContain('\\AtBeginDocument{\\pagestyle{empty}}');
    expect(cls).not.toContain('\\usepackage');
    expect(sty).not.toContain('\\LoadClass');

    expect(tex).toContain('\\artisancoverpage');
    expect(tex).toContain('\\artisantitlesheet');
    expect(tex).toContain('\\artisanabstract');
    expect(tex).toContain('\\clearpage\\listoffigures');
    expect(tex).toContain('\\clearpage\\listoftables');
    expect(tex).toContain('\\clearpage\\tableofcontents');
    expect(tex).toContain('\\clearpage\\pagestyle{fancy}');
    expect(tex).not.toContain('\\maketitle');
    expect(tex).toContain('\\begin{citacaolonga}');
    expect(tex).toContain('\\footnote{');
    expect(cls.indexOf('\\RequirePackage{hyperref}')).toBeLessThan(
      cls.indexOf('\\RequirePackage{cleveref}')
    );
  });

  it('emits inline abstract for ABNT article and separate macros for longQuotes, enumitem lists, and footmisc footnotes without duplicate packages', () => {
    const cfg = cloneConfig();
    cfg.headerFooter.headerLogo.enabled = true;
    cfg.frontMatter.coverPage.enabled = true;
    cfg.frontMatter.coverPage.showLogo = true;
    cfg.modules.images.enabled = true;
    cfg.modules.callouts.enabled = true;
    cfg.modules.longQuotes = {
      enabled: true,
      indentLeftMm: 40,
      fontSizePt: 10,
      lineSpacing: 1.0,
      italic: false,
      leftBorder: true,
    };
    cfg.modules.lists = {
      enabled: true,
      bulletStyle: 'arrow',
      enumStyle: 'alphaParen',
      itemSepPt: 4,
      leftMarginMm: 10,
    };
    cfg.modules.footnotes = {
      enabled: true,
      fontSizePt: 9.5,
      lineSpacing: 1.0,
      ruleWidthRatio: 0.35,
      hangingIndent: true,
    };

    const cls = buildClassFile(cfg);
    expect(cls).toContain('\\newtcolorbox{citacaolonga}');
    expect(cls).toContain('enlarge left by=40mm');
    expect(cls).toContain('\\RequirePackage{enumitem}');
    expect(cls).toContain('\\setlist[itemize,1]{label=\\textrightarrow}');
    expect(cls).toContain('\\setlist[enumerate,1]{label=\\alph*)}');
    expect(cls).toContain('\\RequirePackage[hang, bottom]{footmisc}');
    expect(cls).toContain('\\renewcommand{\\footnoterule}');

    const graphicxMatches = cls.match(/\\RequirePackage\{graphicx\}/g) ?? [];
    expect(graphicxMatches).toHaveLength(1);
    const tcolorboxMatches = cls.match(/\\RequirePackage\[most\]\{tcolorbox\}/g) ?? [];
    expect(tcolorboxMatches).toHaveLength(1);
  });

  it('enables report preset with separated metadata.tex, title box radius, decoupled author alignment, bold Fonte, and custom references title', () => {
    const reportPreset = PRESETS.find((p) => p.id === 'technical-report')!;
    expect(reportPreset.comingSoon).toBe(false);

    const cls = buildClassFile(reportPreset.config);
    const metaTex = buildMetadataTex(reportPreset.config);
    const mainTex = buildMainTex(reportPreset.config, 'class', 'example');
    const bundle = generateProjectBundle(reportPreset.config);

    expect(cls).toContain('\\LoadClass[11pt, a4paper]{article}');
    expect(cls).toContain('\\definecolor{artisanTitleBoxBg}{HTML}{F0FDFA}');
    expect(cls).toContain('arc=4pt, outer arc=4pt');
    expect(cls).toContain('\\raggedleft\\fontsize{9.5}');
    expect(cls).toContain('\\artisansource[left]{\\textbf{Fonte:}');
    expect(mainTex).toContain('\\input{metadata}');
    expect(mainTex).toContain('\\printbibliography[title={Referências Bibliográficas}]');
    expect(metaTex).toContain('\\artisanauthoritem{Mariana Ribeiro}{Laboratório Central de Sistemas}{mariana.ribeiro@laboratorio-sistemas.org.br}{Engenheira de Arquitetura}');
    expect(metaTex).toContain('\\artisandocumentcode{RT-2026-04}');
    expect(bundle.map((f) => f.path)).toContain('class-version/metadata.tex');
    expect(bundle.map((f) => f.path)).toContain('package-version/metadata.tex');
    expect(cls.match(/\\RequirePackage\{etoolbox\}/g) ?? []).toHaveLength(1);
    expect(cls.match(/\\RequirePackage\[most\]\{tcolorbox\}/g) ?? []).toHaveLength(1);
  });

  it('emits sharp corners when heading or title box radius is 0 and custom arc when non-zero', () => {
    const cfg = cloneConfig();
    cfg.typography.headings.h1.decoration = 'box';
    cfg.typography.headings.h1.box.radiusPt = 0;
    cfg.typography.headings.h2.decoration = 'box';
    cfg.typography.headings.h2.box.radiusPt = 12;

    const cls = buildClassFile(cfg);
    expect(cls).toContain('arc=0pt, outer arc=0pt, sharp corners');
    expect(cls).toContain('arc=12pt, outer arc=12pt');
  });
});
