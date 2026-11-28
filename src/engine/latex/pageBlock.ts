import { PAPER_SPECS } from '../../data/fonts';
import { TemplateConfig } from '../../types/template';

export function buildPageGeometryAndColumns(config: TemplateConfig): string[] {
  const lines: string[] = [];
  const unit = config.page.unit;

  if (config.documentType === 'slides') {
    lines.push('% --- Slide Margins ---');
    lines.push(
      `\\setbeamersize{text margin left=${config.page.margins.left}${unit}, text margin right=${config.page.margins.right}${unit}}`
    );
    if (config.columns.count > 1) {
      lines.push('\\RequirePackage{multicol}');
      lines.push(`\\setlength{\\columnsep}{${config.columns.gapMm}mm}`);
      lines.push(`\\setlength{\\columnseprule}{${config.columns.ruleWidthPt}pt}`);
    }
    return lines;
  }

  lines.push('% --- Page Geometry & Margins ---');
  const paperSpec = PAPER_SPECS[config.page.size];
  const geoArgs: string[] = [];
  if (config.page.size === 'custom') {
    geoArgs.push(`paperwidth=${config.page.customWidthMm}mm`);
    geoArgs.push(`paperheight=${config.page.customHeightMm}mm`);
  } else {
    geoArgs.push(paperSpec.geometryOption);
  }
  if (config.page.orientation === 'landscape') {
    geoArgs.push('landscape');
  }
  if (config.page.twoside) {
    geoArgs.push('twoside');
    geoArgs.push(`inner=${config.page.margins.left}${unit}`);
    geoArgs.push(`outer=${config.page.margins.right}${unit}`);
  } else {
    geoArgs.push(`left=${config.page.margins.left}${unit}`);
    geoArgs.push(`right=${config.page.margins.right}${unit}`);
  }
  geoArgs.push(`top=${config.page.margins.top}${unit}`);
  geoArgs.push(`bottom=${config.page.margins.bottom}${unit}`);

  const hf = config.headerFooter;
  const maxHeaderLines = Math.max(
    1,
    ...[
      hf.headerCustomLeft,
      hf.headerCustomCenter,
      hf.headerCustomRight,
      hf.firstPage.headerCustomLeft,
      hf.firstPage.headerCustomCenter,
      hf.firstPage.headerCustomRight,
    ].map((s) => (s ? s.split(/\r?\n/).length : 1))
  );
  const autoHeadHeightMm = Math.max(
    6,
    hf.headerLogo.enabled ? hf.headerLogo.heightMm + 3 : 0,
    maxHeaderLines * (hf.headerFontSizePt * 0.45) + 3
  );
  const finalHeadHeightMm =
    hf.headHeightMm > 0 ? hf.headHeightMm : Math.ceil(autoHeadHeightMm);

  geoArgs.push(`headheight=${finalHeadHeightMm}mm`);
  geoArgs.push(`headsep=${hf.headerSepMm}mm`);
  geoArgs.push(`footskip=${hf.footerSkipMm}mm`);
  lines.push(`\\RequirePackage[${geoArgs.join(', ')}]{geometry}`);

  if (config.page.pageFrame.enabled) {
    lines.push('');
    lines.push('% --- Page Border Frame ---');
    lines.push('\\RequirePackage{eso-pic, tikz}');
    lines.push('\\AddToShipoutPictureBG{%');
    lines.push('  \\begin{tikzpicture}[remember picture, overlay]');
    lines.push(
      `    \\draw[color=artisanPageFrame, line width=${config.page.pageFrame.widthPt}pt]`
    );
    lines.push(
      `      ([xshift=${config.page.pageFrame.insetMm}mm, yshift=-${config.page.pageFrame.insetMm}mm]current page.north west)`
    );
    lines.push(
      `      rectangle ([xshift=-${config.page.pageFrame.insetMm}mm, yshift=${config.page.pageFrame.insetMm}mm]current page.south east);`
    );
    lines.push('  \\end{tikzpicture}%');
    lines.push('}');
  }

  lines.push('');
  lines.push('% --- Columns Configuration ---');
  if (config.columns.count > 1) {
    lines.push(`\\setlength{\\columnsep}{${config.columns.gapMm}mm}`);
    lines.push(`\\setlength{\\columnseprule}{${config.columns.ruleWidthPt}pt}`);
    if (config.columns.count === 3 || config.columns.mode === 'multicol') {
      lines.push('\\RequirePackage{multicol}');
    }
  }

  return lines;
}
