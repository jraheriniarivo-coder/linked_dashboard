import PptxGenJS from 'pptxgenjs';
import {
  JANUARY_PLANNING_DAYS,
  JANUARY_PLANNING_META,
  NEXT_STEPS_HEADLINE,
  NEXT_STEPS_MILESTONES,
} from '../data/nextStepsPlan';
import { CohortAnalysis, ReportConfig, VerdictCategory } from '../types/dashboard';
import { getConnecteoLogoDataUri } from './connecteoLogo';
import {
  buildClosingArtworkSvgString,
  buildCoverArtworkSvgString,
  CLOSING_SLIDE_DEFAULTS,
  splitCoverTitle,
} from './connecteoSlides';

const ROADMAP_DAYS = [
  {
    day: 'Jour 1',
    title: 'Relation Client',
    summary: 'Fondamentaux expérience client, posture de service et fidélisation.',
  },
  {
    day: 'Jour 2',
    title: 'Communication',
    summary: 'Posture vocale, référentiel DIVA, écoute active et reformulation.',
  },
  {
    day: 'Jour 3',
    title: 'Recouvrement',
    summary: 'Profils débiteurs, structure en 7 temps et négociation ferme.',
  },
  {
    day: 'Jour 4',
    title: 'Situations Complexes',
    summary: 'Méthode FOS, désamorçage émotionnel et protocole des 5 R.',
  },
  {
    day: 'Jour 5',
    title: 'Évaluation finale',
    summary: 'Mises en situation évaluées, synthèse et feuille de route.',
  },
];

const C = {
  deepTeal: '065260',
  sapphireDeep: '064552',
  sapphire: '096475',
  teal: '00AFA9',
  tealBright: '00C2BA',
  tealDark: '008C87',
  amber: 'FFA900',
  amberText: 'B45309',
  amberBg: 'FFFDF8',
  amberBorder: 'F3E6C8',
  danger: 'C62828',
  dangerBg: 'FFF5F5',
  dangerBorder: 'F5CCCC',
  textDark: '1D2B30',
  textMed: '334155',
  textMuted: '47585E',
  textLight: '6D7D83',
  slate: '64748B',
  slateLight: '94A3B8',
  bgTint: 'F4FAFA',
  bgTint2: 'EEF7F8',
  cardBg: 'FAFCFD',
  border: 'DCE9EB',
  borderSoft: 'E5ECEE',
  white: 'FFFFFF',
};

const FONT_SANS = 'Calibri';
const FONT_SERIF = 'Georgia';
const FONT_MONO = 'Consolas';

function getInitials(name?: string): string {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return 'CN';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function clamp(text: string | undefined, max: number): string {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trimEnd()}…`;
}

async function svgToPngDataUri(
  svgSource: string,
  width: number,
  height: number
): Promise<string | null> {
  try {
    const src = svgSource.startsWith('data:')
      ? svgSource
      : `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgSource)}`;

    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('SVG rasterization failed'));
      el.src = src;
    });

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);
    return canvas.toDataURL('image/png');
  } catch {
    return null;
  }
}

async function imageToPngWithRatio(
  src: string,
  maxWIn: number,
  maxHIn: number
): Promise<{ data: string; w: number; h: number } | null> {
  const clean = (src || '').trim();
  if (!clean) return null;
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.crossOrigin = 'anonymous';
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('Image rasterization failed'));
      el.src = clean;
    });

    const natW = img.naturalWidth || 320;
    const natH = img.naturalHeight || 120;
    const ratio = natW / natH;

    let wIn = maxHIn * ratio;
    let hIn = maxHIn;
    if (wIn > maxWIn) {
      wIn = maxWIn;
      hIn = maxWIn / ratio;
    }

    const canvasW = Math.max(40, Math.round(wIn * 240));
    const canvasH = Math.max(40, Math.round(hIn * 240));
    const canvas = document.createElement('canvas');
    canvas.width = canvasW;
    canvas.height = canvasH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.clearRect(0, 0, canvasW, canvasH);
    ctx.drawImage(img, 0, 0, canvasW, canvasH);
    return {
      data: canvas.toDataURL('image/png'),
      w: Number(wIn.toFixed(3)),
      h: Number(hIn.toFixed(3)),
    };
  } catch {
    return null;
  }
}

function addCoverBrandHeader(
  pptx: PptxGenJS,
  slide: PptxGenJS.Slide,
  logoPng: string | null,
  clientLogoMeta: { data: string; w: number; h: number } | null
) {
  if (logoPng) {
    slide.addImage({ data: logoPng, x: 0.78, y: 0.52, w: 2.2, h: 0.49 });
  }
  slide.addText('CHAQUE EXPÉRIENCE EST UNIQUE', {
    x: 0.78,
    y: 1.07,
    w: 4.5,
    h: 0.24,
    fontFace: FONT_SANS,
    fontSize: 9.5,
    bold: true,
    charSpacing: 2.2,
    color: C.white,
    margin: 0,
  });

  if (clientLogoMeta) {
    slide.addShape(pptx.ShapeType.line, {
      x: 3.16,
      y: 0.56,
      w: 0,
      h: 0.68,
      line: { color: '4F99A5', width: 1 },
    });
    const badgeW = clientLogoMeta.w + 0.26;
    const badgeH = 0.64;
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 3.34,
      y: 0.52,
      w: badgeW,
      h: badgeH,
      rectRadius: 0.09,
      fill: { color: C.white },
      line: { color: 'D6EEEE', width: 0.5 },
    });
    slide.addImage({
      data: clientLogoMeta.data,
      x: 3.34 + (badgeW - clientLogoMeta.w) / 2,
      y: 0.52 + (badgeH - clientLogoMeta.h) / 2,
      w: clientLogoMeta.w,
      h: clientLogoMeta.h,
    });
  }
}

function addContentChrome(
  pptx: PptxGenJS,
  slide: PptxGenJS.Slide,
  sectionNum: string,
  title: string,
  subtitle: string,
  todayLabel: string
) {
  slide.background = { color: C.white };

  // Top 3-tone Connecteo crown bar
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 4.44,
    h: 0.06,
    fill: { color: C.sapphireDeep },
    line: { type: 'none' },
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: 4.44,
    y: 0,
    w: 4.45,
    h: 0.06,
    fill: { color: C.sapphire },
    line: { type: 'none' },
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: 8.89,
    y: 0,
    w: 4.45,
    h: 0.06,
    fill: { color: C.teal },
    line: { type: 'none' },
  });

  // Section badge square
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.55,
    y: 0.22,
    w: 0.34,
    h: 0.34,
    rectRadius: 0.16,
    fill: { color: C.sapphire },
    line: { type: 'none' },
  });
  slide.addText(sectionNum, {
    x: 0.55,
    y: 0.22,
    w: 0.34,
    h: 0.34,
    fontFace: FONT_MONO,
    fontSize: 10,
    bold: true,
    color: C.white,
    align: 'center',
    valign: 'middle',
    margin: 0,
  });

  // Section title + right label
  slide.addText(title, {
    x: 1.0,
    y: 0.19,
    w: 8.6,
    h: 0.38,
    fontFace: FONT_SANS,
    fontSize: 16,
    bold: true,
    color: C.sapphire,
    valign: 'middle',
    margin: 0,
  });
  slide.addText(subtitle, {
    x: 9.7,
    y: 0.22,
    w: 3.08,
    h: 0.34,
    fontFace: FONT_SANS,
    fontSize: 10,
    bold: true,
    color: C.tealDark,
    align: 'right',
    valign: 'middle',
    margin: 0,
  });

  // Header divider line
  slide.addShape(pptx.ShapeType.line, {
    x: 0.55,
    y: 0.65,
    w: 12.23,
    h: 0,
    line: { color: 'DBE7E9', width: 1 },
  });

  // Footer
  slide.addShape(pptx.ShapeType.line, {
    x: 0.55,
    y: 7.06,
    w: 12.23,
    h: 0,
    line: { color: 'D6E7E9', width: 1 },
  });
  slide.addText('Connecteo · Chaque expérience est unique', {
    x: 0.55,
    y: 7.1,
    w: 6.0,
    h: 0.26,
    fontFace: FONT_SANS,
    fontSize: 9,
    bold: true,
    color: C.sapphire,
    margin: 0,
  });
  slide.addText(`Rapport généré automatiquement · ${todayLabel}`, {
    x: 6.78,
    y: 7.1,
    w: 6.0,
    h: 0.26,
    fontFace: FONT_SANS,
    fontSize: 9,
    color: C.textLight,
    align: 'right',
    margin: 0,
  });
}

function addTopAccentedCard(
  pptx: PptxGenJS,
  slide: PptxGenJS.Slide,
  x: number,
  y: number,
  w: number,
  h: number,
  accentColor: string,
  fillColor = C.cardBg,
  borderColor = C.border
) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x,
    y,
    w,
    h,
    rectRadius: 0.08,
    fill: { color: fillColor },
    line: { color: borderColor, width: 0.75 },
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: x + 0.04,
    y,
    w: w - 0.08,
    h: 0.04,
    fill: { color: accentColor },
    line: { type: 'none' },
  });
}

function verdictVisual(cat: VerdictCategory): {
  label: string;
  bg: string;
  border: string;
  text: string;
} {
  switch (cat) {
    case 'expert':
      return { label: 'Expert', bg: 'EDF7F7', border: 'BFE1E1', text: C.sapphire };
    case 'maitrise':
      return { label: 'Maîtrise', bg: 'F0FAF9', border: 'BFEAE7', text: C.tealDark };
    case 'consolidation':
      return {
        label: 'En consolidation',
        bg: 'FFF9EC',
        border: 'F5DFA9',
        text: '9A5400',
      };
    case 'pending':
      return {
        label: 'Finalisation J5 attendue',
        bg: 'F4F7F8',
        border: 'CBD5E1',
        text: C.textMuted,
      };
    default:
      return {
        label: 'À renforcer',
        bg: C.dangerBg,
        border: C.dangerBorder,
        text: C.danger,
      };
  }
}

export async function exportReportToPptx(
  analysis: CohortAnalysis,
  config: ReportConfig,
  groupLabel: string,
  todayLabel: string,
  fileName: string
): Promise<void> {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.author = config.facilitator || 'Connecteo';
  pptx.company = 'Connecteo';
  pptx.subject = config.reportTitle;
  pptx.title = `${config.reportTitle} — Connecteo`;

  const logoSvgUri = getConnecteoLogoDataUri();
  const [logoPng, coverArtPng, closingArtPng, clientLogoMeta] = await Promise.all([
    svgToPngDataUri(logoSvgUri, 780, 174),
    svgToPngDataUri(buildCoverArtworkSvgString(), 840, 1080),
    svgToPngDataUri(buildClosingArtworkSvgString(), 840, 1080),
    imageToPngWithRatio(config.clientLogoDataUri || '', 1.75, 0.48),
  ]);

  const showCovers = config.includeCovers !== false;
  const { lead: coverLead, main: coverMain } = splitCoverTitle(config.reportTitle);
  const periodLabel = (config.trainingPeriod || '').trim() || 'Parcours 5 jours';
  const locationLabel = (config.trainingLocation || '').trim() || 'Zone Futura Andranome';
  const coverSubtitle =
    (config.coverSubtitle || '').trim() ||
    'Renforcer la posture, l’écoute active et la maîtrise du recouvrement amiable en production.';
  const facilitatorEmail = (config.facilitatorEmail || '').trim();

  // =========================================================================
  // SLIDE 1 : COUVERTURE CONNECTEO
  // =========================================================================
  if (showCovers) {
    const slide = pptx.addSlide();
    slide.background = { color: C.deepTeal };

    // Top accent bar
    slide.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0,
      w: 9.6,
      h: 0.06,
      fill: { color: C.tealBright },
      line: { type: 'none' },
    });
    slide.addShape(pptx.ShapeType.rect, {
      x: 9.6,
      y: 0,
      w: 3.74,
      h: 0.06,
      fill: { color: C.amber },
      line: { type: 'none' },
    });

    if (coverArtPng) {
      slide.addImage({ data: coverArtPng, x: 7.5, y: 0, w: 5.833, h: 7.5 });
    }

    addCoverBrandHeader(pptx, slide, logoPng, clientLogoMeta);

    slide.addText('RAPPORT DE FORMATION', {
      x: 0.78,
      y: 2.02,
      w: 6.8,
      h: 0.28,
      fontFace: FONT_SANS,
      fontSize: 10.5,
      bold: true,
      charSpacing: 3,
      color: C.tealBright,
      margin: 0,
    });

    const titleFontSize = coverMain.length > 35 ? 31 : 38;
    const titleRuns: PptxGenJS.TextProps[] = [];
    if (coverLead) {
      titleRuns.push({
        text: `${coverLead}\n`,
        options: { fontSize: titleFontSize, bold: false, color: C.white },
      });
    }
    titleRuns.push({
      text: coverMain,
      options: { fontSize: titleFontSize, bold: true, color: C.white },
    });
    slide.addText(titleRuns, {
      x: 0.78,
      y: 2.36,
      w: 7.55,
      h: 1.85,
      fontFace: FONT_SANS,
      valign: 'top',
      margin: 0,
    });

    slide.addText(coverSubtitle, {
      x: 0.78,
      y: 4.32,
      w: 6.9,
      h: 0.85,
      fontFace: FONT_SANS,
      fontSize: 14,
      color: 'D6EEEE',
      valign: 'top',
      margin: 0,
    });

    // Bottom 4 metadata blocks
    const metaBlocks = [
      {
        x: 0.78,
        w: 2.15,
        title: periodLabel,
        sub: `${groupLabel} · Renforcement RC`,
      },
      {
        x: 3.05,
        w: 2.15,
        title: locationLabel,
        sub: 'Lieu de formation',
      },
      {
        x: 5.32,
        w: 2.15,
        title: `${analysis.total} conseillers formés`,
        sub: `${analysis.withFinalCount} évalués · ${analysis.passedCount} validés`,
      },
      {
        x: 7.59,
        w: 2.7,
        title: config.facilitator,
        sub: `Trainer Animator${config.clientName.trim() ? ` · ${config.clientName.trim()}` : ''}`,
      },
    ];

    metaBlocks.forEach((b) => {
      slide.addShape(pptx.ShapeType.ellipse, {
        x: b.x,
        y: 6.28,
        w: 0.4,
        h: 0.4,
        fill: { color: '1B6876' },
        line: { color: '3D828F', width: 0.75 },
      });
      slide.addShape(pptx.ShapeType.ellipse, {
        x: b.x + 0.14,
        y: 6.42,
        w: 0.12,
        h: 0.12,
        fill: { color: C.tealBright },
        line: { type: 'none' },
      });
      slide.addText(b.title, {
        x: b.x + 0.48,
        y: 6.25,
        w: b.w - 0.48,
        h: 0.25,
        fontFace: FONT_SANS,
        fontSize: 10.5,
        bold: true,
        color: C.white,
        margin: 0,
      });
      slide.addText(b.sub, {
        x: b.x + 0.48,
        y: 6.5,
        w: b.w - 0.48,
        h: 0.22,
        fontFace: FONT_SANS,
        fontSize: 8.8,
        color: 'B8DFDF',
        margin: 0,
      });
    });
  }

  // =========================================================================
  // SLIDE 2 : 01. SYNTHÈSE EXÉCUTIVE & KPIs
  // =========================================================================
  if (config.includeExecutiveNarrative) {
    const slide = pptx.addSlide();
    addContentChrome(
      pptx,
      slide,
      '01',
      'Synthèse exécutive & narration des résultats',
      'Vue d’ensemble',
      todayLabel
    );

    // Context line
    slide.addText(
      `${config.clientName ? `Client : ${config.clientName} · ` : ''}Lieu : ${locationLabel} · Périmètre : ${groupLabel} · ${config.programTag}`,
      {
        x: 0.55,
        y: 0.75,
        w: 12.23,
        h: 0.24,
        fontFace: FONT_SANS,
        fontSize: 10,
        color: C.textLight,
        margin: 0,
      }
    );

    // Headline
    slide.addText(analysis.executiveHeadline, {
      x: 0.55,
      y: 1.04,
      w: 12.23,
      h: 0.55,
      fontFace: FONT_SANS,
      fontSize: 16,
      bold: true,
      color: C.textDark,
      margin: 0,
    });

    // 6 KPI cards
    const kpis = [
      {
        label: 'Effectif évalué',
        value: `${analysis.total}`,
        sub: `${analysis.priorTrainingRate}% déjà formés RC`,
        accent: C.sapphire,
        bg: C.cardBg,
        valColor: C.sapphire,
      },
      {
        label: 'Diagnostic initial',
        value: `${analysis.preAvg}%`,
        sub: `Auto-éval : ${analysis.selfEvalAvg ? `${analysis.selfEvalAvg}%` : '—'}`,
        accent: C.slate,
        bg: C.cardBg,
        valColor: C.textDark,
      },
      {
        label: 'Évaluation finale',
        value: `${analysis.postAvg}%`,
        sub: `Médiane : ${analysis.medianPost}%`,
        accent: C.sapphire,
        bg: 'F5FBFB',
        valColor: C.sapphire,
      },
      {
        label: 'Progression nette',
        value: `${analysis.progression >= 0 ? '+' : ''}${analysis.progression} pts`,
        sub: `Écart min–max : ${analysis.spreadPost} pts`,
        accent: C.teal,
        bg: 'F5FBFB',
        valColor: analysis.progression >= 0 ? C.tealDark : C.danger,
      },
      {
        label: 'Validation ≥ 60%',
        value: `${analysis.validationRate}%`,
        sub: `${analysis.passedCount}/${analysis.withFinalCount} validés`,
        accent: C.teal,
        bg: C.cardBg,
        valColor: C.sapphire,
      },
      {
        label: 'Simulation appel',
        value: analysis.withSimCount ? `${analysis.simAvg}%` : '—',
        sub: analysis.withSimCount
          ? `${analysis.withSimCount} mises en situation`
          : 'Non évaluée',
        accent: C.amber,
        bg: C.amberBg,
        valColor: C.amberText,
      },
    ];

    const kpiW = 1.91;
    const kpiGap = 0.15;
    kpis.forEach((k, idx) => {
      const kx = 0.55 + idx * (kpiW + kpiGap);
      addTopAccentedCard(pptx, slide, kx, 1.72, kpiW, 1.15, k.accent, k.bg, 'E1ECEE');
      slide.addText(k.label, {
        x: kx + 0.12,
        y: 1.82,
        w: kpiW - 0.24,
        h: 0.22,
        fontFace: FONT_SANS,
        fontSize: 9.5,
        bold: true,
        color: C.textLight,
        margin: 0,
      });
      slide.addText(k.value, {
        x: kx + 0.12,
        y: 2.08,
        w: kpiW - 0.24,
        h: 0.42,
        fontFace: FONT_MONO,
        fontSize: 20,
        bold: true,
        color: k.valColor,
        margin: 0,
      });
      slide.addText(k.sub, {
        x: kx + 0.12,
        y: 2.54,
        w: kpiW - 0.24,
        h: 0.24,
        fontFace: FONT_SANS,
        fontSize: 8.5,
        color: C.textLight,
        margin: 0,
      });
    });

    // Executive Narrative paragraphs
    const narrativeBlocks = [
      ...(config.customIntro.trim() ? [config.customIntro.trim()] : []),
      ...analysis.executiveNarrative,
    ];
    slide.addText(
      narrativeBlocks.map((p) => ({
        text: `${p}\n\n`,
        options: { fontSize: 12, color: C.textMed },
      })),
      {
        x: 0.55,
        y: 3.12,
        w: 12.23,
        h: 2.35,
        fontFace: FONT_SANS,
        valign: 'top',
        margin: 0,
      }
    );

    // Editorial Serif Pull Quote
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.55,
      y: 5.72,
      w: 12.23,
      h: 1.05,
      rectRadius: 0.08,
      fill: { color: C.bgTint },
      line: { color: 'D6E9EB', width: 1 },
    });
    slide.addText(analysis.pullQuote, {
      x: 0.8,
      y: 5.82,
      w: 11.73,
      h: 0.85,
      fontFace: FONT_SERIF,
      italic: true,
      fontSize: 13.5,
      color: C.sapphire,
      valign: 'middle',
      margin: 0,
    });
  }

  // =========================================================================
  // SLIDE 3 : 02. ARCHITECTURE PÉDAGOGIQUE — PARCOURS 5 JOURS
  // =========================================================================
  if (config.includeRoadmap) {
    const slide = pptx.addSlide();
    addContentChrome(
      pptx,
      slide,
      '02',
      'Architecture pédagogique — Parcours 5 jours',
      'Chaque expérience est unique',
      todayLabel
    );

    const colW = 2.28;
    const colGap = 0.2;
    ROADMAP_DAYS.forEach((step, idx) => {
      const rx = 0.55 + idx * (colW + colGap);
      addTopAccentedCard(pptx, slide, rx, 1.05, colW, 4.45, C.teal, C.cardBg, C.border);

      // Day header strip
      slide.addShape(pptx.ShapeType.rect, {
        x: rx + 0.01,
        y: 1.05,
        w: colW - 0.02,
        h: 0.48,
        fill: { color: C.bgTint2 },
        line: { color: 'E1EFF1', width: 0.5 },
      });
      slide.addText(step.day, {
        x: rx + 0.14,
        y: 1.12,
        w: 1.2,
        h: 0.34,
        fontFace: FONT_MONO,
        fontSize: 10.5,
        bold: true,
        color: C.sapphire,
        valign: 'middle',
        margin: 0,
      });
      slide.addText(`0${idx + 1}/05`, {
        x: rx + 1.35,
        y: 1.12,
        w: 0.8,
        h: 0.34,
        fontFace: FONT_MONO,
        fontSize: 9.5,
        bold: true,
        color: C.tealDark,
        align: 'right',
        valign: 'middle',
        margin: 0,
      });

      slide.addText(step.title, {
        x: rx + 0.16,
        y: 1.72,
        w: colW - 0.32,
        h: 0.55,
        fontFace: FONT_SANS,
        fontSize: 14,
        bold: true,
        color: C.sapphire,
        valign: 'top',
        margin: 0,
      });
      slide.addText(step.summary, {
        x: rx + 0.16,
        y: 2.38,
        w: colW - 0.32,
        h: 2.8,
        fontFace: FONT_SANS,
        fontSize: 11.5,
        color: '52636A',
        valign: 'top',
        margin: 0,
      });
    });

    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.55,
      y: 5.82,
      w: 12.23,
      h: 0.92,
      rectRadius: 0.08,
      fill: { color: C.bgTint },
      line: { color: 'D6E7E9', width: 1 },
    });
    slide.addText(
      'Logique de montée en compétences : diagnostic initial des réflexes métier, ancrage vocal (DIVA), structuration de l’appel en 7 temps, gestion des situations tendues (FOS / 5 R) puis validation en mise en situation réelle.',
      {
        x: 0.78,
        y: 5.92,
        w: 11.77,
        h: 0.72,
        fontFace: FONT_SANS,
        fontSize: 11.5,
        color: C.textMed,
        valign: 'middle',
        margin: 0,
      }
    );
  }

  // =========================================================================
  // SLIDES 4 & 5 : 03. GRAPHIQUES & POSITIONNEMENT
  // =========================================================================
  if (config.includeCharts) {
    // --- SLIDE 4 : Trajectoires & Piliers J1-J4 ---
    const slide4 = pptx.addSlide();
    addContentChrome(
      pptx,
      slide4,
      '03',
      'Visualisations & analyse par compétence',
      'Trajectoires & piliers',
      todayLabel
    );

    // Left Card: Trajectoires individuelles (native slope lines)
    addTopAccentedCard(pptx, slide4, 0.55, 0.88, 6.85, 4.58, C.sapphire, C.white, C.border);
    slide4.addText('Trajectoires individuelles (Pré-quiz → Final)', {
      x: 0.75,
      y: 1.0,
      w: 6.45,
      h: 0.32,
      fontFace: FONT_SANS,
      fontSize: 12.5,
      bold: true,
      color: C.sapphire,
      margin: 0,
    });

    const sortedSlope = [...analysis.learnerAnalyses].sort((a, b) => b.postPct - a.postPct);
    const maxSlopeRows = Math.min(sortedSlope.length, 15);
    const plotX = 2.45;
    const plotW = 4.05;
    const topY = 1.48;
    const rowH = Math.min(0.32, 3.8 / Math.max(1, maxSlopeRows));

    // Vertical threshold lines 60% and 80%
    [0, 60, 80, 100].forEach((tick) => {
      const tx = plotX + (tick / 100) * plotW;
      slide4.addText(`${tick}%`, {
        x: tx - 0.22,
        y: 1.28,
        w: 0.44,
        h: 0.2,
        fontFace: FONT_MONO,
        fontSize: 7.5,
        color: C.textLight,
        align: 'center',
        margin: 0,
      });
      slide4.addShape(pptx.ShapeType.line, {
        x: tx,
        y: topY,
        w: 0,
        h: maxSlopeRows * rowH,
        line: {
          color: tick === 60 ? 'D97706' : tick === 80 ? C.sapphire : 'E2E8F0',
          width: 0.75,
          dashType: tick === 60 || tick === 80 ? 'dash' : 'solid',
        },
      });
    });

    sortedSlope.slice(0, maxSlopeRows).forEach((item, idx) => {
      const cy = topY + idx * rowH + rowH / 2;
      const xPre = plotX + (Math.max(0, Math.min(100, item.prePct)) / 100) * plotW;
      const xPost = plotX + (Math.max(0, Math.min(100, item.postPct)) / 100) * plotW;
      const lineColor =
        item.postPct >= 80 ? C.sapphire : item.postPct >= 60 ? C.teal : C.danger;

      slide4.addText(clamp(item.learner.name || 'Apprenant', 20), {
        x: 0.72,
        y: cy - 0.11,
        w: 1.68,
        h: 0.22,
        fontFace: FONT_SANS,
        fontSize: 9,
        bold: true,
        color: C.textDark,
        valign: 'middle',
        margin: 0,
      });
      slide4.addShape(pptx.ShapeType.line, {
        x: plotX,
        y: cy,
        w: plotW,
        h: 0,
        line: { color: 'F1F5F9', width: 1.5 },
      });

      if (item.hasPre && item.hasPost) {
        const minX = Math.min(xPre, xPost);
        const spanW = Math.max(0.02, Math.abs(xPost - xPre));
        slide4.addShape(pptx.ShapeType.line, {
          x: minX,
          y: cy,
          w: spanW,
          h: 0,
          line: { color: lineColor, width: 2.5 },
        });
      }
      if (item.hasPre) {
        slide4.addShape(pptx.ShapeType.ellipse, {
          x: xPre - 0.05,
          y: cy - 0.05,
          w: 0.1,
          h: 0.1,
          fill: { color: C.slateLight },
          line: { color: C.white, width: 0.75 },
        });
      }
      if (item.hasPost) {
        slide4.addShape(pptx.ShapeType.ellipse, {
          x: xPost - 0.065,
          y: cy - 0.065,
          w: 0.13,
          h: 0.13,
          fill: { color: lineColor },
          line: { color: C.white, width: 1 },
        });
      }

      const deltaText =
        item.hasPre && item.hasPost
          ? `${item.progression >= 0 ? '+' : ''}${item.progression} pts`
          : item.hasPost
          ? `${item.postPct}%`
          : 'J5 att.';
      slide4.addText(deltaText, {
        x: 6.56,
        y: cy - 0.11,
        w: 0.72,
        h: 0.22,
        fontFace: FONT_MONO,
        fontSize: 8.5,
        bold: true,
        color: item.progression >= 0 ? C.sapphire : C.danger,
        align: 'right',
        valign: 'middle',
        margin: 0,
      });
    });

    // Right Card: Performance par pilier (J1-J4)
    addTopAccentedCard(pptx, slide4, 7.6, 0.88, 5.18, 4.58, C.teal, C.white, C.border);
    slide4.addText('Performance comparée par pilier (J1–J4)', {
      x: 7.8,
      y: 1.0,
      w: 4.8,
      h: 0.32,
      fontFace: FONT_SANS,
      fontSize: 12.5,
      bold: true,
      color: C.sapphire,
      margin: 0,
    });

    analysis.modules.forEach((m, idx) => {
      const my = 1.46 + idx * 0.96;
      slide4.addShape(pptx.ShapeType.roundRect, {
        x: 7.8,
        y: my,
        w: 4.78,
        h: 0.86,
        rectRadius: 0.06,
        fill: { color: C.cardBg },
        line: { color: C.borderSoft, width: 0.75 },
      });
      slide4.addText(`${m.dayLabel} · ${m.title}`, {
        x: 7.94,
        y: my + 0.08,
        w: 2.5,
        h: 0.24,
        fontFace: FONT_SANS,
        fontSize: 10,
        bold: true,
        color: C.sapphire,
        margin: 0,
      });
      slide4.addText(
        `${m.prePct}% → ${m.postPct}% (${m.delta >= 0 ? '+' : ''}${m.delta} pts)`,
        {
          x: 10.3,
          y: my + 0.08,
          w: 2.15,
          h: 0.24,
          fontFace: FONT_MONO,
          fontSize: 9,
          bold: true,
          color: C.tealDark,
          align: 'right',
          margin: 0,
        }
      );

      // Pre bar
      slide4.addShape(pptx.ShapeType.roundRect, {
        x: 7.94,
        y: my + 0.4,
        w: 4.5,
        h: 0.1,
        rectRadius: 0.04,
        fill: { color: 'E8EFF1' },
        line: { type: 'none' },
      });
      if (m.prePct > 0) {
        slide4.addShape(pptx.ShapeType.roundRect, {
          x: 7.94,
          y: my + 0.4,
          w: Math.max(0.08, (m.prePct / 100) * 4.5),
          h: 0.1,
          rectRadius: 0.04,
          fill: { color: C.slateLight },
          line: { type: 'none' },
        });
      }

      // Post bar
      slide4.addShape(pptx.ShapeType.roundRect, {
        x: 7.94,
        y: my + 0.57,
        w: 4.5,
        h: 0.13,
        rectRadius: 0.05,
        fill: { color: 'E8EFF1' },
        line: { type: 'none' },
      });
      if (m.postPct > 0) {
        slide4.addShape(pptx.ShapeType.roundRect, {
          x: 7.94,
          y: my + 0.57,
          w: Math.max(0.08, (m.postPct / 100) * 4.5),
          h: 0.13,
          rectRadius: 0.05,
          fill: { color: C.teal },
          line: { type: 'none' },
        });
      }
    });

    // Bottom prose box (2 columns)
    slide4.addShape(pptx.ShapeType.roundRect, {
      x: 0.55,
      y: 5.64,
      w: 12.23,
      h: 1.25,
      rectRadius: 0.08,
      fill: { color: C.bgTint },
      line: { color: 'D6E7E9', width: 1 },
    });
    slide4.addText('Analyse des piliers J1–J4', {
      x: 0.78,
      y: 5.74,
      w: 5.7,
      h: 0.24,
      fontFace: FONT_SANS,
      fontSize: 10.5,
      bold: true,
      color: C.sapphire,
      margin: 0,
    });
    slide4.addText(clamp(analysis.moduleNarrative, 220), {
      x: 0.78,
      y: 6.0,
      w: 5.7,
      h: 0.8,
      fontFace: FONT_SANS,
      fontSize: 10,
      color: C.textMed,
      valign: 'top',
      margin: 0,
    });

    if (analysis.transferNarrative) {
      slide4.addShape(pptx.ShapeType.line, {
        x: 6.66,
        y: 5.78,
        w: 0,
        h: 0.96,
        line: { color: 'D6E7E9', width: 1 },
      });
      slide4.addText('Transfert pratique & posture terrain', {
        x: 6.86,
        y: 5.74,
        w: 5.7,
        h: 0.24,
        fontFace: FONT_SANS,
        fontSize: 10.5,
        bold: true,
        color: C.sapphire,
        margin: 0,
      });
      slide4.addText(clamp(analysis.transferNarrative, 220), {
        x: 6.86,
        y: 6.0,
        w: 5.7,
        h: 0.8,
        fontFace: FONT_SANS,
        fontSize: 10,
        color: C.textMed,
        valign: 'top',
        margin: 0,
      });
    }

    // --- SLIDE 5 : Positionnement & Niveaux de maîtrise ---
    const slide5 = pptx.addSlide();
    addContentChrome(
      pptx,
      slide5,
      '03',
      'Positionnement individuel & niveaux de maîtrise',
      'Calibration & axes',
      todayLabel
    );

    // Left Card: Matrice Pré-quiz vs Quiz final
    addTopAccentedCard(pptx, slide5, 0.55, 0.88, 6.0, 6.0, C.sapphire, C.white, C.border);
    slide5.addText('Positionnement Pré-quiz × Quiz final', {
      x: 0.78,
      y: 1.0,
      w: 5.5,
      h: 0.3,
      fontFace: FONT_SANS,
      fontSize: 12.5,
      bold: true,
      color: C.sapphire,
      margin: 0,
    });

    const qX = 1.25;
    const qY = 1.55;
    const qW = 4.95;
    const qH = 4.65;
    slide5.addShape(pptx.ShapeType.rect, {
      x: qX,
      y: qY,
      w: qW,
      h: qH,
      fill: { color: 'FAFDFE' },
      line: { color: 'D6E5E7', width: 1 },
    });

    // Reference lines (60% horizontal & vertical)
    const y60 = qY + ((100 - 60) / 100) * qH;
    const x60 = qX + (60 / 100) * qW;
    slide5.addShape(pptx.ShapeType.line, {
      x: qX,
      y: y60,
      w: qW,
      h: 0,
      line: { color: 'D97706', width: 0.8, dashType: 'dash' },
    });
    slide5.addShape(pptx.ShapeType.line, {
      x: x60,
      y: qY,
      w: 0,
      h: qH,
      line: { color: '94A3B8', width: 0.8, dashType: 'dash' },
    });
    slide5.addText('Seuil validation 60%', {
      x: qX + 0.08,
      y: y60 - 0.22,
      w: 1.6,
      h: 0.2,
      fontFace: FONT_SANS,
      fontSize: 8,
      bold: true,
      color: 'D97706',
      margin: 0,
    });
    slide5.addText('Quiz final (%)', {
      x: 0.65,
      y: qY + 0.05,
      w: 0.55,
      h: 0.4,
      fontFace: FONT_SANS,
      fontSize: 8,
      color: C.textLight,
      margin: 0,
    });
    slide5.addText('Pré-quiz (%) →', {
      x: qX + qW - 1.3,
      y: qY + qH + 0.08,
      w: 1.3,
      h: 0.22,
      fontFace: FONT_SANS,
      fontSize: 8.5,
      color: C.textLight,
      align: 'right',
      margin: 0,
    });

    analysis.learnerAnalyses.forEach((item) => {
      if (!item.hasPost) return;
      const px = qX + (Math.max(4, Math.min(96, item.prePct)) / 100) * qW;
      const py = qY + ((100 - Math.max(4, Math.min(96, item.postPct))) / 100) * qH;
      const dotColor =
        item.postPct >= 80 ? C.sapphire : item.postPct >= 60 ? C.teal : C.danger;

      slide5.addShape(pptx.ShapeType.ellipse, {
        x: px - 0.09,
        y: py - 0.09,
        w: 0.18,
        h: 0.18,
        fill: { color: dotColor },
        line: { color: C.white, width: 1 },
      });
      slide5.addText(getInitials(item.learner.name), {
        x: px + 0.1,
        y: py - 0.1,
        w: 0.45,
        h: 0.2,
        fontFace: FONT_MONO,
        fontSize: 7.5,
        bold: true,
        color: C.textDark,
        margin: 0,
      });
    });

    // Right Card: Verdict distribution + Top axes
    addTopAccentedCard(pptx, slide5, 6.75, 0.88, 6.03, 6.0, C.teal, C.white, C.border);
    slide5.addText('Répartition des niveaux de maîtrise', {
      x: 6.98,
      y: 1.0,
      w: 5.5,
      h: 0.3,
      fontFace: FONT_SANS,
      fontSize: 12.5,
      bold: true,
      color: C.sapphire,
      margin: 0,
    });

    analysis.verdictDistribution.forEach((b, idx) => {
      const by = 1.48 + idx * 0.56;
      const barMax = 5.45;
      slide5.addText(b.label, {
        x: 6.98,
        y: by,
        w: 3.4,
        h: 0.22,
        fontFace: FONT_SANS,
        fontSize: 10,
        bold: true,
        color: C.textDark,
        margin: 0,
      });
      slide5.addText(`${b.count} (${b.percentage}%)`, {
        x: 10.6,
        y: by,
        w: 1.85,
        h: 0.22,
        fontFace: FONT_MONO,
        fontSize: 9.5,
        bold: true,
        color: C.sapphire,
        align: 'right',
        margin: 0,
      });
      slide5.addShape(pptx.ShapeType.roundRect, {
        x: 6.98,
        y: by + 0.26,
        w: barMax,
        h: 0.16,
        rectRadius: 0.05,
        fill: { color: 'EDF3F4' },
        line: { type: 'none' },
      });
      if (b.percentage > 0) {
        slide5.addShape(pptx.ShapeType.roundRect, {
          x: 6.98,
          y: by + 0.26,
          w: Math.max(0.12, (b.percentage / 100) * barMax),
          h: 0.16,
          rectRadius: 0.05,
          fill: { color: b.color.replace('#', '') },
          line: { type: 'none' },
        });
      }
    });

    // Consolidation axes divider
    slide5.addShape(pptx.ShapeType.line, {
      x: 6.98,
      y: 4.46,
      w: 5.55,
      h: 0,
      line: { color: 'EDF2F3', width: 1 },
    });
    slide5.addText('Thématiques prioritaires de consolidation', {
      x: 6.98,
      y: 4.58,
      w: 5.55,
      h: 0.26,
      fontFace: FONT_SANS,
      fontSize: 10.5,
      bold: true,
      color: C.sapphire,
      margin: 0,
    });

    if (analysis.topRemainingAxes.length > 0) {
      analysis.topRemainingAxes.slice(0, 5).forEach((ax, idx) => {
        const ay = 4.94 + idx * 0.36;
        slide5.addText(clamp(ax.label, 52), {
          x: 6.98,
          y: ay,
          w: 4.2,
          h: 0.28,
          fontFace: FONT_SANS,
          fontSize: 9.5,
          color: C.textMuted,
          margin: 0,
        });
        slide5.addText(`${ax.count} apprenant${ax.count > 1 ? 's' : ''}`, {
          x: 11.2,
          y: ay,
          w: 1.32,
          h: 0.28,
          fontFace: FONT_MONO,
          fontSize: 9,
          bold: true,
          color: C.sapphire,
          align: 'right',
          margin: 0,
        });
      });
    } else {
      slide5.addText('Aucun axe critique résiduel signalé sur cette sélection.', {
        x: 6.98,
        y: 4.96,
        w: 5.5,
        h: 0.35,
        fontFace: FONT_SANS,
        fontSize: 10,
        color: C.textLight,
        margin: 0,
      });
    }
  }

  // =========================================================================
  // SLIDES 6..N : 04. BILANS INDIVIDUELS (1 SLIDE DÉDIÉE PAR APPRENANT)
  // =========================================================================
  if (config.includeIndividualNarratives) {
    analysis.learnerAnalyses.forEach((item, idx) => {
      const slide = pptx.addSlide();
      addContentChrome(
        pptx,
        slide,
        '04',
        `Bilan individuel (${idx + 1}/${analysis.learnerAnalyses.length})`,
        'Chaque expérience est unique',
        todayLabel
      );

      const vStyle = verdictVisual(item.verdictCategory);
      const obs = item.observation;

      // Header strip
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.55,
        y: 0.82,
        w: 12.23,
        h: 0.84,
        rectRadius: 0.08,
        fill: { color: 'F3FAFA' },
        line: { color: 'DBE9EB', width: 1 },
      });

      // Monogram
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.74,
        y: 0.96,
        w: 0.54,
        h: 0.54,
        rectRadius: 0.12,
        fill: { color: C.sapphire },
        line: { type: 'none' },
      });
      slide.addText(getInitials(item.learner.name), {
        x: 0.74,
        y: 0.96,
        w: 0.54,
        h: 0.54,
        fontFace: FONT_SANS,
        fontSize: 14,
        bold: true,
        color: C.white,
        align: 'center',
        valign: 'middle',
        margin: 0,
      });

      slide.addText(item.learner.name || '—', {
        x: 1.42,
        y: 0.93,
        w: 6.5,
        h: 0.32,
        fontFace: FONT_SANS,
        fontSize: 16,
        bold: true,
        color: C.sapphire,
        margin: 0,
      });
      slide.addText(
        `${item.learner.email || '—'} · ${item.learner.wave || 'Sans vague'} · ${item.learner.seniority || 'Ancienneté N/C'} · ${item.learner.langues || '—'}`,
        {
          x: 1.42,
          y: 1.28,
          w: 7.4,
          h: 0.24,
          fontFace: FONT_SANS,
          fontSize: 9.5,
          color: C.textLight,
          margin: 0,
        }
      );

      // Verdict pill & trajectory
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 9.8,
        y: 0.93,
        w: 2.78,
        h: 0.32,
        rectRadius: 0.06,
        fill: { color: vStyle.bg },
        line: { color: vStyle.border, width: 0.75 },
      });
      slide.addText(item.learner.verdict || vStyle.label, {
        x: 9.8,
        y: 0.93,
        w: 2.78,
        h: 0.32,
        fontFace: FONT_SANS,
        fontSize: 10,
        bold: true,
        color: vStyle.text,
        align: 'center',
        valign: 'middle',
        margin: 0,
      });
      slide.addText(item.trajectoryTag, {
        x: 9.4,
        y: 1.3,
        w: 3.18,
        h: 0.22,
        fontFace: FONT_SANS,
        fontSize: 8.5,
        bold: true,
        color: C.textLight,
        align: 'right',
        margin: 0,
      });

      // 4 KPI Cards
      const lKpis = [
        {
          label: 'Pré-quiz',
          val: item.hasPre ? `${item.prePct}%` : '—',
          sub: `Auto-éval : ${item.hasSelfEval ? `${item.selfEvalPct}%` : '—'}`,
          accent: C.slateLight,
          bg: 'F6F9FA',
          border: 'E6EEF0',
          valColor: C.textDark,
        },
        {
          label: 'Quiz final',
          val: item.hasPost ? `${item.postPct}%` : '—',
          sub:
            item.verdictCategory === 'pending'
              ? 'Reprise J5 (Gr. 2)'
              : 'Seuil requis : 60%',
          accent: C.sapphire,
          bg: C.bgTint,
          border: 'DCEBED',
          valColor: C.sapphire,
        },
        {
          label: 'Progression',
          val:
            item.hasPre && item.hasPost
              ? `${item.progression >= 0 ? '+' : ''}${item.progression} pts`
              : '—',
          sub: clamp(item.calibrationLabel, 30),
          accent: C.teal,
          bg: C.bgTint,
          border: 'DCEBED',
          valColor: item.progression >= 0 ? C.tealDark : C.danger,
        },
        {
          label: 'Simulation d’appel',
          val: item.hasSim ? `${item.simPct}%` : '—',
          sub: clamp(
            item.learner.sim_verdict ||
              (item.verdictCategory === 'pending'
                ? 'À passer avec Groupe 2'
                : 'Non renseignée'),
            30
          ),
          accent: C.amber,
          bg: 'FFFCF5',
          border: C.amberBorder,
          valColor: C.amberText,
        },
      ];

      const lkW = 2.91;
      const lkGap = 0.19;
      lKpis.forEach((k, kIdx) => {
        const lx = 0.55 + kIdx * (lkW + lkGap);
        addTopAccentedCard(pptx, slide, lx, 1.78, lkW, 0.92, k.accent, k.bg, k.border);
        slide.addText(k.label, {
          x: lx + 0.14,
          y: 1.86,
          w: lkW - 0.28,
          h: 0.2,
          fontFace: FONT_SANS,
          fontSize: 9,
          bold: true,
          color: C.textLight,
          margin: 0,
        });
        slide.addText(k.val, {
          x: lx + 0.14,
          y: 2.08,
          w: lkW - 0.28,
          h: 0.34,
          fontFace: FONT_MONO,
          fontSize: 17,
          bold: true,
          color: k.valColor,
          margin: 0,
        });
        slide.addText(k.sub, {
          x: lx + 0.14,
          y: 2.44,
          w: lkW - 0.28,
          h: 0.2,
          fontFace: FONT_SANS,
          fontSize: 8.5,
          color: C.textLight,
          margin: 0,
        });
      });

      // Per-Module Mini Progress Bars (J1-J4)
      let cursorY = 2.82;
      if (item.moduleScores.some((m) => m.postPct !== null)) {
        item.moduleScores.forEach((m, mIdx) => {
          const mx = 0.55 + mIdx * (lkW + lkGap);
          slide.addShape(pptx.ShapeType.roundRect, {
            x: mx,
            y: cursorY,
            w: lkW,
            h: 0.72,
            rectRadius: 0.06,
            fill: { color: 'FCFDFE' },
            line: { color: 'EDF2F3', width: 0.75 },
          });
          slide.addText(m.title, {
            x: mx + 0.12,
            y: cursorY + 0.08,
            w: 1.9,
            h: 0.2,
            fontFace: FONT_SANS,
            fontSize: 9,
            bold: true,
            color: C.textMuted,
            margin: 0,
          });
          slide.addText(m.postPct !== null ? `${m.postPct}%` : '—', {
            x: mx + lkW - 0.85,
            y: cursorY + 0.08,
            w: 0.73,
            h: 0.2,
            fontFace: FONT_MONO,
            fontSize: 9,
            bold: true,
            color: C.sapphire,
            align: 'right',
            margin: 0,
          });
          slide.addShape(pptx.ShapeType.roundRect, {
            x: mx + 0.12,
            y: cursorY + 0.34,
            w: lkW - 0.24,
            h: 0.08,
            rectRadius: 0.03,
            fill: { color: 'E8EFF1' },
            line: { type: 'none' },
          });
          if ((m.postPct ?? 0) > 0) {
            slide.addShape(pptx.ShapeType.roundRect, {
              x: mx + 0.12,
              y: cursorY + 0.34,
              w: Math.max(0.06, ((m.postPct ?? 0) / 100) * (lkW - 0.24)),
              h: 0.08,
              rectRadius: 0.03,
              fill: { color: C.teal },
              line: { type: 'none' },
            });
          }
          slide.addText(`${m.preRaw || '—'}   →   ${m.postRaw || '—'}`, {
            x: mx + 0.12,
            y: cursorY + 0.47,
            w: lkW - 0.24,
            h: 0.18,
            fontFace: FONT_MONO,
            fontSize: 8,
            color: C.textLight,
            margin: 0,
          });
        });
        cursorY += 0.86;
      }

      // Automated Summary
      slide.addText(clamp(item.automatedSummary, 310), {
        x: 0.55,
        y: cursorY,
        w: 12.23,
        h: 0.72,
        fontFace: FONT_SANS,
        fontSize: 11,
        color: C.textMed,
        valign: 'top',
        margin: 0,
      });
      cursorY += 0.76;

      // Observation highlight box
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.55,
        y: cursorY,
        w: 12.23,
        h: 0.68,
        rectRadius: 0.06,
        fill: { color: 'F3F9F9' },
        line: { color: 'DCECEC', width: 0.75 },
      });
      slide.addText(
        [
          { text: 'Observation : ', options: { bold: true, color: C.sapphire } },
          { text: clamp(item.operationalAdvice, 240), options: { color: C.textDark } },
        ],
        {
          x: 0.72,
          y: cursorY + 0.08,
          w: 11.89,
          h: 0.52,
          fontFace: FONT_SANS,
          fontSize: 10,
          valign: 'middle',
          margin: 0,
        }
      );
      cursorY += 0.8;

      // Bottom details: Residual axes & Trainer observations
      const obsItems: Array<{ label: string; text: string; bg: string; border: string; labelColor: string }> = [];
      if (item.finalAxes.length > 0) {
        obsItems.push({
          label: 'Axes résiduels post-formation',
          text: item.finalAxes.join(' · '),
          bg: C.cardBg,
          border: 'EDF2F3',
          labelColor: C.sapphire,
        });
      }
      if (obs.forces) {
        obsItems.push({
          label: 'Points forts observés',
          text: obs.forces,
          bg: 'F4FAF9',
          border: 'DCEEED',
          labelColor: C.sapphire,
        });
      }
      if (obs.axes) {
        obsItems.push({
          label: 'Axes à travailler',
          text: obs.axes,
          bg: 'FFFBF2',
          border: 'F5E7C2',
          labelColor: '9A5400',
        });
      }
      if (obs.global || obs.engagement) {
        obsItems.push({
          label: obs.global ? 'Synthèse formateur' : 'Engagement final',
          text: obs.global || obs.engagement || '',
          bg: 'F6F9FA',
          border: 'E1E9EB',
          labelColor: C.sapphire,
        });
      }

      if (obsItems.length > 0) {
        const cols = Math.min(2, obsItems.length);
        const boxW = cols === 1 ? 12.23 : 6.02;
        const rowsCount = Math.ceil(obsItems.slice(0, 4).length / 2);
        const boxH = rowsCount === 1 ? Math.min(1.35, 6.95 - cursorY) : Math.min(0.84, (6.95 - cursorY - 0.12) / 2);
        obsItems.slice(0, 4).forEach((box, bIdx) => {
          const col = bIdx % 2;
          const row = Math.floor(bIdx / 2);
          const bx = 0.55 + col * (boxW + 0.19);
          const by = cursorY + row * (boxH + 0.1);
          slide.addShape(pptx.ShapeType.roundRect, {
            x: bx,
            y: by,
            w: boxW,
            h: boxH,
            rectRadius: 0.06,
            fill: { color: box.bg },
            line: { color: box.border, width: 0.75 },
          });
          slide.addText(
            [
              { text: `${box.label}\n`, options: { bold: true, color: box.labelColor, fontSize: 9.5 } },
              { text: clamp(box.text, 165), options: { color: C.textMed, fontSize: 9 } },
            ],
            {
              x: bx + 0.12,
              y: by + 0.07,
              w: boxW - 0.24,
              h: boxH - 0.14,
              fontFace: FONT_SANS,
              valign: 'top',
              margin: 0,
            }
          );
        });
      }
    });
  }

  // =========================================================================
  // SLIDE N+1 : 05. RECOMMANDATIONS MANAGÉRIALES & ACCOMPAGNEMENT
  // =========================================================================
  if (config.includeActionPlan) {
    const slide = pptx.addSlide();
    addContentChrome(
      pptx,
      slide,
      '05',
      'Recommandations managériales & accompagnement',
      'Consolidation terrain',
      todayLabel
    );

    const recs = analysis.recommendations.slice(0, 4);
    const cardW = 6.01;
    const cardH = recs.length <= 2 ? 4.8 : 2.86;
    recs.forEach((rec, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const rx = 0.55 + col * (cardW + 0.21);
      const ry = 0.96 + row * (cardH + 0.22);
      const accent =
        rec.priority === 'Priorité haute'
          ? C.danger
          : rec.priority === 'Planification J5'
          ? C.sapphire
          : rec.priority === 'Consolidation'
          ? C.amber
          : C.teal;
      const labelColor =
        rec.priority === 'Priorité haute'
          ? C.danger
          : rec.priority === 'Planification J5'
          ? C.sapphire
          : rec.priority === 'Consolidation'
          ? C.amberText
          : C.tealDark;

      addTopAccentedCard(pptx, slide, rx, ry, cardW, cardH, accent, C.cardBg, C.border);

      slide.addText(rec.priority, {
        x: rx + 0.2,
        y: ry + 0.14,
        w: 3.5,
        h: 0.22,
        fontFace: FONT_SANS,
        fontSize: 10,
        bold: true,
        color: labelColor,
        margin: 0,
      });
      slide.addText(`0${idx + 1}`, {
        x: rx + cardW - 0.9,
        y: ry + 0.14,
        w: 0.7,
        h: 0.22,
        fontFace: FONT_MONO,
        fontSize: 10,
        bold: true,
        color: C.textLight,
        align: 'right',
        margin: 0,
      });
      slide.addText(rec.title, {
        x: rx + 0.2,
        y: ry + 0.42,
        w: cardW - 0.4,
        h: 0.42,
        fontFace: FONT_SANS,
        fontSize: 13.5,
        bold: true,
        color: C.sapphire,
        margin: 0,
      });
      slide.addText(rec.rationale, {
        x: rx + 0.2,
        y: ry + 0.88,
        w: cardW - 0.4,
        h: cardH - 1.72,
        fontFace: FONT_SANS,
        fontSize: 10.5,
        color: '52636A',
        valign: 'top',
        margin: 0,
      });

      slide.addShape(pptx.ShapeType.line, {
        x: rx + 0.2,
        y: ry + cardH - 0.82,
        w: cardW - 0.4,
        h: 0,
        line: { color: C.borderSoft, width: 0.75 },
      });
      slide.addText(
        [
          { text: 'Action : ', options: { bold: true, color: C.sapphire } },
          { text: rec.action, options: { color: C.textDark } },
        ],
        {
          x: rx + 0.2,
          y: ry + cardH - 0.74,
          w: cardW - 0.4,
          h: 0.64,
          fontFace: FONT_SANS,
          fontSize: 10,
          valign: 'top',
          margin: 0,
        }
      );
    });
  }

  // =========================================================================
  // SLIDE N+2 : 06. NEXT STEPS & FEUILLE DE ROUTE JANVIER
  // =========================================================================
  if (config.includeNextSteps) {
    const slide = pptx.addSlide();
    addContentChrome(
      pptx,
      slide,
      '06',
      'Next Steps — Déploiement terrain & verrouillage des acquis',
      'Décembre → Janvier',
      todayLabel
    );

    slide.addText(NEXT_STEPS_HEADLINE, {
      x: 0.55,
      y: 0.78,
      w: 12.23,
      h: 0.44,
      fontFace: FONT_SANS,
      fontSize: 11.5,
      color: C.textMed,
      margin: 0,
    });

    // 2 Milestones
    NEXT_STEPS_MILESTONES.slice(0, 2).forEach((step, idx) => {
      const mx = 0.55 + idx * 6.22;
      const mw = 6.01;
      addTopAccentedCard(
        pptx,
        slide,
        mx,
        1.3,
        mw,
        2.0,
        idx === 0 ? C.teal : C.sapphire,
        'F5FBFB',
        'D6E6E8'
      );
      slide.addText(step.badge, {
        x: mx + 0.18,
        y: 1.4,
        w: 2.4,
        h: 0.22,
        fontFace: FONT_MONO,
        fontSize: 9.5,
        bold: true,
        color: C.tealDark,
        margin: 0,
      });
      slide.addText(step.period, {
        x: mx + 2.6,
        y: 1.4,
        w: 3.22,
        h: 0.22,
        fontFace: FONT_SANS,
        fontSize: 9.5,
        bold: true,
        color: C.sapphire,
        align: 'right',
        margin: 0,
      });
      slide.addText(step.title, {
        x: mx + 0.18,
        y: 1.66,
        w: mw - 0.36,
        h: 0.32,
        fontFace: FONT_SANS,
        fontSize: 13,
        bold: true,
        color: C.sapphire,
        margin: 0,
      });
      slide.addText(step.summary, {
        x: mx + 0.18,
        y: 2.02,
        w: mw - 0.36,
        h: 0.68,
        fontFace: FONT_SANS,
        fontSize: 10,
        color: C.textMuted,
        valign: 'top',
        margin: 0,
      });
      slide.addShape(pptx.ShapeType.line, {
        x: mx + 0.18,
        y: 2.74,
        w: mw - 0.36,
        h: 0,
        line: { color: 'D8E8EA', width: 0.75 },
      });
      slide.addText(
        [
          { text: 'Livrable : ', options: { bold: true, color: C.sapphire } },
          { text: step.deliverable, options: { color: C.textDark } },
        ],
        {
          x: mx + 0.18,
          y: 2.8,
          w: mw - 0.36,
          h: 0.44,
          fontFace: FONT_SANS,
          fontSize: 9.5,
          valign: 'top',
          margin: 0,
        }
      );
    });

    // January 3-day schedule container
    addTopAccentedCard(pptx, slide, 0.55, 3.46, 12.23, 3.44, C.sapphire, C.white, 'D8E7E9');
    slide.addText(JANUARY_PLANNING_META.title, {
      x: 0.76,
      y: 3.58,
      w: 7.4,
      h: 0.28,
      fontFace: FONT_SANS,
      fontSize: 12.5,
      bold: true,
      color: C.sapphire,
      margin: 0,
    });
    slide.addText(JANUARY_PLANNING_META.subtitle, {
      x: 8.2,
      y: 3.6,
      w: 4.38,
      h: 0.24,
      fontFace: FONT_SANS,
      fontSize: 10,
      bold: true,
      color: C.tealDark,
      align: 'right',
      margin: 0,
    });

    const dayW = 3.82;
    JANUARY_PLANNING_DAYS.slice(0, 3).forEach((d, idx) => {
      const dx = 0.76 + idx * (dayW + 0.17);
      const dy = 3.96;
      const dh = 2.78;

      slide.addShape(pptx.ShapeType.roundRect, {
        x: dx,
        y: dy,
        w: dayW,
        h: dh,
        rectRadius: 0.06,
        fill: { color: C.cardBg },
        line: { color: C.border, width: 0.75 },
      });
      // Day header strip
      slide.addShape(pptx.ShapeType.rect, {
        x: dx + 0.01,
        y: dy,
        w: dayW - 0.02,
        h: 0.36,
        fill: { color: C.bgTint2 },
        line: { color: 'E1EFF1', width: 0.5 },
      });
      slide.addText(d.day, {
        x: dx + 0.12,
        y: dy + 0.05,
        w: 1.1,
        h: 0.26,
        fontFace: FONT_MONO,
        fontSize: 10,
        bold: true,
        color: C.sapphire,
        valign: 'middle',
        margin: 0,
      });
      slide.addText(d.format, {
        x: dx + 1.25,
        y: dy + 0.05,
        w: dayW - 1.37,
        h: 0.26,
        fontFace: FONT_SANS,
        fontSize: 8.5,
        bold: true,
        color: C.tealDark,
        align: 'right',
        valign: 'middle',
        margin: 0,
      });

      slide.addText(d.title, {
        x: dx + 0.12,
        y: dy + 0.44,
        w: dayW - 0.24,
        h: 0.28,
        fontFace: FONT_SANS,
        fontSize: 11,
        bold: true,
        color: C.sapphire,
        margin: 0,
      });
      slide.addText(
        [
          { text: 'Matin : ', options: { bold: true, color: C.sapphire } },
          { text: `${d.morning}\n\n`, options: { color: C.textMed } },
          { text: 'Après-midi : ', options: { bold: true, color: C.sapphire } },
          { text: d.afternoon, options: { color: C.textMed } },
        ],
        {
          x: dx + 0.12,
          y: dy + 0.76,
          w: dayW - 0.24,
          h: 1.32,
          fontFace: FONT_SANS,
          fontSize: 9.2,
          valign: 'top',
          margin: 0,
        }
      );

      // Outcome footer band
      slide.addShape(pptx.ShapeType.rect, {
        x: dx + 0.01,
        y: dy + dh - 0.62,
        w: dayW - 0.02,
        h: 0.61,
        fill: { color: C.bgTint },
        line: { color: 'E1EFF1', width: 0.5 },
      });
      slide.addText(
        [
          { text: 'Cap visé : ', options: { bold: true, color: C.tealDark } },
          { text: d.outcome, options: { color: C.textDark } },
        ],
        {
          x: dx + 0.12,
          y: dy + dh - 0.57,
          w: dayW - 0.24,
          h: 0.52,
          fontFace: FONT_SANS,
          fontSize: 9,
          valign: 'middle',
          margin: 0,
        }
      );
    });
  }

  // =========================================================================
  // DERNIÈRE SLIDE : CLÔTURE « MERCI. »
  // =========================================================================
  if (showCovers) {
    const slide = pptx.addSlide();
    slide.background = { color: C.deepTeal };

    slide.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0,
      w: 9.6,
      h: 0.06,
      fill: { color: C.tealBright },
      line: { type: 'none' },
    });
    slide.addShape(pptx.ShapeType.rect, {
      x: 9.6,
      y: 0,
      w: 3.74,
      h: 0.06,
      fill: { color: C.amber },
      line: { type: 'none' },
    });

    if (closingArtPng) {
      slide.addImage({ data: closingArtPng, x: 7.5, y: 0, w: 5.833, h: 7.5 });
    }

    addCoverBrandHeader(pptx, slide, logoPng, clientLogoMeta);

    slide.addText(CLOSING_SLIDE_DEFAULTS.title, {
      x: 0.78,
      y: 2.38,
      w: 2.6,
      h: 1.05,
      fontFace: FONT_SANS,
      fontSize: 64,
      bold: true,
      color: C.white,
      margin: 0,
    });
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 3.35,
      y: 3.08,
      w: 0.22,
      h: 0.22,
      rectRadius: 0.25,
      fill: { color: '00BFB6' },
      line: { type: 'none' },
    });

    const closingHeadline =
      config.closingHeadline !== undefined
        ? config.closingHeadline
        : CLOSING_SLIDE_DEFAULTS.headline;
    if (closingHeadline.trim()) {
      slide.addText(closingHeadline, {
        x: 0.78,
        y: 3.55,
        w: 6.5,
        h: 0.46,
        fontFace: FONT_SANS,
        fontSize: 22,
        bold: true,
        color: C.tealBright,
        margin: 0,
      });
    }

    const rawClosingMessage =
      config.closingMessage !== undefined
        ? config.closingMessage
        : CLOSING_SLIDE_DEFAULTS.message;
    const closingLines = rawClosingMessage
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    if (closingLines.length > 0) {
      slide.addText(closingLines.join('\n'), {
        x: 0.78,
        y: 4.18,
        w: 6.5,
        h: 1.25,
        fontFace: FONT_SANS,
        fontSize: 16,
        color: 'E6F4F4',
        valign: 'top',
        margin: 0,
      });
    }

    slide.addText(
      [
        { text: config.facilitator, options: { bold: true, color: C.white } },
        { text: '  ·  Trainer Animator', options: { color: 'D6EEEE' } },
        ...(facilitatorEmail
          ? [{ text: `  ·  ${facilitatorEmail}`, options: { color: 'D6EEEE' } }]
          : []),
      ],
      {
        x: 0.78,
        y: 6.42,
        w: 7.4,
        h: 0.3,
        fontFace: FONT_SANS,
        fontSize: 11.5,
        margin: 0,
      }
    );
  }

  await pptx.writeFile({ fileName });
}
