import { TemplateConfig } from '../../types/template';
import { escapeLatex } from './utils';

function sanitizeTexArg(raw: string): string {
  return escapeLatex(raw.replace(/\r?\n+/g, ' ').trim());
}

export function buildMetadataMacros(config: TemplateConfig): string[] {
  if (config.documentType === 'slides') return [];

  return [
    '% --- Structured Document Metadata Macros (populated by metadata.tex) ---',
    '\\RequirePackage{etoolbox}',
    '\\makeatletter',
    '\\def\\@artisandocumenttitle{}',
    '\\def\\@artisansubtitle{}',
    '\\def\\@artisanauthornames{}',
    '\\def\\@artisaninstitution{}',
    '\\def\\@artisandepartment{}',
    '\\def\\@artisanemail{}',
    '\\def\\@artisanlocation{}',
    '\\def\\@artisandocumentcode{}',
    '\\def\\@artisandocumentdate{}',
    '\\def\\@artisanauthorsblock{}',
    '\\def\\@artisancourse{}',
    '\\def\\@artisancity{}',
    '\\def\\@artisanadvisorlabel{Orientador:}',
    '\\def\\@artisanadvisor{}',
    '\\def\\@artisancoadvisorlabel{Coorientador:}',
    '\\def\\@artisancoadvisor{}',
    '\\def\\@artisannaturenote{}',
    '\\def\\@artisanabstracttitle{Resumo}',
    '\\def\\@artisanabstracttext{}',
    '\\def\\@artisankeywordslabel{Palavras-chave:}',
    '\\def\\@artisankeywords{}',
    '\\def\\@artisanenglishtitle{Abstract}',
    '\\def\\@artisanenglishtext{}',
    '\\def\\@artisanenglishkeywordslabel{Keywords:}',
    '\\def\\@artisanenglishkeywords{}',
    '\\newcommand{\\artisandocumenttitle}[1]{\\gdef\\@artisandocumenttitle{#1}\\title{#1}}',
    '\\newcommand{\\artisansubtitle}[1]{\\gdef\\@artisansubtitle{#1}}',
    '\\newcommand{\\artisanauthornames}[1]{\\gdef\\@artisanauthornames{#1}\\author{#1}}',
    '\\newcommand{\\artisaninstitution}[1]{\\gdef\\@artisaninstitution{#1}}',
    '\\newcommand{\\artisandepartment}[1]{\\gdef\\@artisandepartment{#1}}',
    '\\newcommand{\\artisanemail}[1]{\\gdef\\@artisanemail{#1}}',
    '\\newcommand{\\artisanlocation}[1]{\\gdef\\@artisanlocation{#1}}',
    '\\newcommand{\\artisandocumentcode}[1]{\\gdef\\@artisandocumentcode{#1}}',
    '\\newcommand{\\artisandocumentdate}[1]{\\gdef\\@artisandocumentdate{#1}\\date{#1}}',
    '\\newcommand{\\artisanauthors}[1]{\\gdef\\@artisanauthorsblock{#1}}',
    '\\newcommand{\\artisanauthoritem}[4]{{\\par\\noindent\\ifstrempty{#1}{}{\\bfseries #1}\\ifstrempty{#4}{}{~---~{\\normalfont\\itshape #4}}\\ifstrempty{#2}{}{\\par\\noindent #2}\\ifstrempty{#3}{}{\\par\\noindent{\\footnotesize #3}}\\par\\vspace{3pt}}}',
    '\\newcommand{\\artisancourse}[1]{\\gdef\\@artisancourse{#1}}',
    '\\newcommand{\\artisancity}[1]{\\gdef\\@artisancity{#1}}',
    '\\newcommand{\\artisanadvisorlabel}[1]{\\gdef\\@artisanadvisorlabel{#1}}',
    '\\newcommand{\\artisanadvisor}[1]{\\gdef\\@artisanadvisor{#1}}',
    '\\newcommand{\\artisancoadvisorlabel}[1]{\\gdef\\@artisancoadvisorlabel{#1}}',
    '\\newcommand{\\artisancoadvisor}[1]{\\gdef\\@artisancoadvisor{#1}}',
    '\\newcommand{\\artisannaturenote}[1]{\\gdef\\@artisannaturenote{#1}}',
    '\\newcommand{\\artisanabstracttitle}[1]{\\gdef\\@artisanabstracttitle{#1}}',
    '\\newcommand{\\artisanabstracttext}[1]{\\gdef\\@artisanabstracttext{#1}}',
    '\\newcommand{\\artisankeywordslabel}[1]{\\gdef\\@artisankeywordslabel{#1}}',
    '\\newcommand{\\artisankeywords}[1]{\\gdef\\@artisankeywords{#1}}',
    '\\newcommand{\\artisanenglishtitle}[1]{\\gdef\\@artisanenglishtitle{#1}}',
    '\\newcommand{\\artisanenglishtext}[1]{\\gdef\\@artisanenglishtext{#1}}',
    '\\newcommand{\\artisanenglishkeywordslabel}[1]{\\gdef\\@artisanenglishkeywordslabel{#1}}',
    '\\newcommand{\\artisanenglishkeywords}[1]{\\gdef\\@artisanenglishkeywords{#1}}',
    '\\newcommand{\\theartisantitle}{\\@artisandocumenttitle}',
    '\\newcommand{\\theartisansubtitle}{\\@artisansubtitle}',
    '\\newcommand{\\theartisanauthor}{\\@artisanauthornames}',
    '\\newcommand{\\theartisaninstitution}{\\@artisaninstitution}',
    '\\newcommand{\\theartisandepartment}{\\@artisandepartment}',
    '\\newcommand{\\theartisanemail}{\\@artisanemail}',
    '\\newcommand{\\theartisanlocation}{\\@artisanlocation}',
    '\\newcommand{\\theartisancode}{\\@artisandocumentcode}',
    '\\newcommand{\\theartisandate}{\\@artisandocumentdate}',
    '\\newcommand{\\theartisancourse}{\\@artisancourse}',
    '\\newcommand{\\theartisancity}{\\@artisancity}',
    '\\newcommand{\\theartisanadvisorlabel}{\\@artisanadvisorlabel}',
    '\\newcommand{\\theartisanadvisor}{\\@artisanadvisor}',
    '\\newcommand{\\theartisancoadvisorlabel}{\\@artisancoadvisorlabel}',
    '\\newcommand{\\theartisancoadvisor}{\\@artisancoadvisor}',
    '\\newcommand{\\theartisannaturenote}{\\@artisannaturenote}',
    '\\newcommand{\\theartisanabstracttitle}{\\@artisanabstracttitle}',
    '\\newcommand{\\theartisanabstracttext}{\\@artisanabstracttext}',
    '\\newcommand{\\theartisankeywordslabel}{\\@artisankeywordslabel}',
    '\\newcommand{\\theartisankeywords}{\\@artisankeywords}',
    '\\newcommand{\\theartisanenglishtitle}{\\@artisanenglishtitle}',
    '\\newcommand{\\theartisanenglishtext}{\\@artisanenglishtext}',
    '\\newcommand{\\theartisanenglishkeywordslabel}{\\@artisanenglishkeywordslabel}',
    '\\newcommand{\\theartisanenglishkeywords}{\\@artisanenglishkeywords}',
    '\\makeatother',
    '',
  ];
}

export function buildMetadataTex(config: TemplateConfig): string {
  const md = config.metadata;
  const fm = config.frontMatter;

  if (config.documentType === 'slides') {
    const lines = [
      '% ============================================================================',
      '% metadata.tex — Presentation Metadata (edit your details here)',
      '% ============================================================================',
      `\\title{${sanitizeTexArg(md.title)}}`,
    ];
    if (md.subtitle) lines.push(`\\subtitle{${sanitizeTexArg(md.subtitle)}}`);
    lines.push(`\\author{${sanitizeTexArg(md.author)}}`);
    if (md.institution) lines.push(`\\institute{${sanitizeTexArg(md.institution)}}`);
    lines.push(`\\date{${sanitizeTexArg(md.date)}}`);
    lines.push('');
    return lines.join('\n');
  }

  const authors =
    md.authors.length > 0
      ? md.authors
      : [
          {
            name: md.author,
            institution: md.institution,
            email: md.authorEmail,
            role: '',
          },
        ];

  const lines: string[] = [
    '% ============================================================================',
    '% metadata.tex — Document Metadata & Authors (separated from content in main.tex)',
    '% ============================================================================',
    '',
    '% --- Identification ---',
    `\\artisandocumenttitle{${sanitizeTexArg(md.title)}}`,
    `\\artisansubtitle{${sanitizeTexArg(md.subtitle)}}`,
    `\\artisandocumentcode{${sanitizeTexArg(md.documentCode)}}`,
    `\\artisandocumentdate{${sanitizeTexArg(md.date)}}`,
    `\\artisanlocation{${sanitizeTexArg(md.location)}}`,
    '',
    '% --- Institution & Contact ---',
    `\\artisaninstitution{${sanitizeTexArg(md.institution)}}`,
    `\\artisandepartment{${sanitizeTexArg(md.department)}}`,
    `\\artisanauthornames{${sanitizeTexArg(md.author)}}`,
    `\\artisanemail{${sanitizeTexArg(md.authorEmail)}}`,
    '',
    '% --- Structured Authors Template: \\artisanauthoritem{Name}{Institution}{Email}{Role} ---',
    '\\artisanauthors{%',
    ...authors.map(
      (a) =>
        `  \\artisanauthoritem{${sanitizeTexArg(a.name)}}{${sanitizeTexArg(a.institution)}}{${sanitizeTexArg(a.email)}}{${sanitizeTexArg(a.role)}}%`
    ),
    ...(authors.length <= 1
      ? [
          '  % \\artisanauthoritem{Coautor Exemplo}{Instituição / Departamento}{coautor@exemplo.org}{Cargo / Função}%',
        ]
      : []),
    '}',
  ];

  if (fm.coverPage.enabled || fm.titleSheet.enabled || fm.abstractBlock.enabled) {
    lines.push('');
    lines.push('% --- Front Matter & Abstract ---');
    lines.push(`\\artisancourse{${sanitizeTexArg(fm.coverPage.course)}}`);
    lines.push(`\\artisancity{${sanitizeTexArg(fm.coverPage.city)}}`);
    lines.push(`\\artisanadvisorlabel{${sanitizeTexArg(fm.titleSheet.advisorLabel)}}`);
    lines.push(`\\artisanadvisor{${sanitizeTexArg(fm.titleSheet.advisorName)}}`);
    lines.push(`\\artisancoadvisorlabel{${sanitizeTexArg(fm.titleSheet.coadvisorLabel)}}`);
    lines.push(`\\artisancoadvisor{${sanitizeTexArg(fm.titleSheet.coadvisorName)}}`);
    lines.push(`\\artisannaturenote{${sanitizeTexArg(fm.titleSheet.natureNote)}}`);
    lines.push(`\\artisanabstracttitle{${sanitizeTexArg(fm.abstractBlock.title)}}`);
    lines.push(`\\artisanabstracttext{${sanitizeTexArg(fm.abstractBlock.text)}}`);
    lines.push(`\\artisankeywordslabel{${sanitizeTexArg(fm.abstractBlock.keywordsLabel)}}`);
    lines.push(`\\artisankeywords{${sanitizeTexArg(fm.abstractBlock.keywords)}}`);
    lines.push(`\\artisanenglishtitle{${sanitizeTexArg(fm.abstractBlock.englishTitle)}}`);
    lines.push(`\\artisanenglishtext{${sanitizeTexArg(fm.abstractBlock.englishText)}}`);
    lines.push(
      `\\artisanenglishkeywordslabel{${sanitizeTexArg(fm.abstractBlock.englishKeywordsLabel)}}`
    );
    lines.push(`\\artisanenglishkeywords{${sanitizeTexArg(fm.abstractBlock.englishKeywords)}}`);
  }

  lines.push('');
  return lines.join('\n');
}
