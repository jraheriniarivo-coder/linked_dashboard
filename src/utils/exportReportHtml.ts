import {
  JANUARY_PLANNING_DAYS,
  JANUARY_PLANNING_META,
  NEXT_STEPS_HEADLINE,
  NEXT_STEPS_MILESTONES,
} from '../data/nextStepsPlan';
import { CohortAnalysis, ReportConfig } from '../types/dashboard';
import { getConnecteoLogoDataUri } from './connecteoLogo';
import {
  buildClosingArtworkSvgString,
  buildCoverArtworkSvgString,
  splitCoverTitle,
} from './connecteoSlides';

function esc(value: string): string {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getInitials(name: string): string {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return 'AP';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function buildInlineSlopeSvg(analysis: CohortAnalysis): string {
  const sorted = [...analysis.learnerAnalyses].sort((a, b) => b.postPct - a.postPct);
  const leftPad = 150;
  const rightPad = 60;
  const topPad = 34;
  const rowH = 34;
  const width = 760;
  const plotW = width - leftPad - rightPad;
  const height = topPad + sorted.length * rowH + 22;
  const xPos = (pct: number) => leftPad + (Math.max(0, Math.min(100, pct)) / 100) * plotW;

  const grid = [0, 20, 40, 60, 80, 100]
    .map((t) => {
      const x = xPos(t);
      const stroke = t === 60 ? '#d97706' : t === 80 ? '#096475' : '#e2e8f0';
      const dash = t === 60 || t === 80 ? 'stroke-dasharray="4 4"' : '';
      return `<line x1="${x}" y1="${topPad - 8}" x2="${x}" y2="${height - 14}" stroke="${stroke}" ${dash} stroke-width="1"/><text x="${x}" y="15" text-anchor="middle" font-size="10" fill="#64748b" font-family="monospace">${t}%</text>`;
    })
    .join('');

  const rows = sorted
    .map((item, idx) => {
      const cy = topPad + idx * rowH + rowH / 2;
      const xPre = xPos(item.prePct);
      const xPost = xPos(item.postPct);
      const lineColor = item.postPct >= 80 ? '#096475' : item.postPct >= 60 ? '#00afa9' : '#c62828';
      const name = esc((item.learner.name || 'Apprenant').slice(0, 22));
      const delta =
        item.hasPre && item.hasPost
          ? `${item.progression >= 0 ? '+' : ''}${item.progression} pts`
          : item.hasPost
          ? `${item.postPct}%`
          : 'J5 att.';

      return `
        <text x="8" y="${cy + 4}" font-size="12" font-weight="600" fill="#1e293b">${name}</text>
        <line x1="${leftPad}" y1="${cy}" x2="${leftPad + plotW}" y2="${cy}" stroke="#f1f5f9" stroke-width="2"/>
        ${item.hasPre && item.hasPost ? `<line x1="${xPre}" y1="${cy}" x2="${xPost}" y2="${cy}" stroke="${lineColor}" stroke-width="3.5" stroke-linecap="round"/>` : ''}
        ${item.hasPre ? `<circle cx="${xPre}" cy="${cy}" r="5" fill="#94a3b8" stroke="#fff" stroke-width="1.5"/>` : ''}
        ${item.hasPost ? `<circle cx="${xPost}" cy="${cy}" r="6.5" fill="${lineColor}" stroke="#fff" stroke-width="2"/>` : ''}
        <text x="${width - 8}" y="${cy + 4}" text-anchor="end" font-size="11" font-weight="700" font-family="monospace" fill="${item.progression >= 0 ? '#096475' : '#c62828'}">${delta}</text>
      `;
    })
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" style="width:100%;height:auto">${grid}${rows}</svg>`;
}

export function buildStandaloneReportHtml(
  analysis: CohortAnalysis,
  config: ReportConfig,
  groupLabel: string,
  todayLabel: string
): string {
  const logoDataUri = getConnecteoLogoDataUri();
  const slopeSvg = buildInlineSlopeSvg(analysis);
  const coverArtworkSvg = buildCoverArtworkSvgString();
  const closingArtworkSvg = buildClosingArtworkSvgString();
  const showCovers = config.includeCovers !== false;
  const { lead: coverLead, main: coverMain } = splitCoverTitle(config.reportTitle);
  const periodLabel = (config.trainingPeriod || '').trim() || 'Parcours 5 jours';
  const coverSubtitle =
    (config.coverSubtitle || '').trim() ||
    'Renforcer la posture, l’écoute active et la maîtrise du recouvrement amiable en production.';
  const facilitatorEmail = (config.facilitatorEmail || '').trim();

  const verdictLabel: Record<string, string> = {
    expert: 'Expert',
    maitrise: 'Maîtrise',
    consolidation: 'En consolidation',
    renforcer: 'À renforcer',
    pending: 'Finalisation J5 attendue',
  };

  const modulesHtml = analysis.modules
    .map(
      (m) => `
      <div style="padding:10px 12px;border:1px solid #dce9eb;border-radius:10px;margin-bottom:8px;background:#fafcfd;">
        <div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:13px;">
          <strong><span style="color:#008c87;">${esc(m.dayLabel)}</span> · ${esc(m.title)}</strong>
          <span style="font-family:'JetBrains Mono',monospace;color:#096475;">Départ ${m.prePct}% → Final <strong>${m.postPct}%</strong> (${m.delta >= 0 ? '+' : ''}${m.delta} pts)</span>
        </div>
        <div style="height:7px;background:#e8eff1;border-radius:999px;overflow:hidden;margin-bottom:4px;">
          <div style="height:100%;width:${m.prePct}%;background:#94a3b8;"></div>
        </div>
        <div style="height:9px;background:#e8eff1;border-radius:999px;overflow:hidden;">
          <div style="height:100%;width:${m.postPct}%;background:linear-gradient(90deg,#096475,#00afa9);"></div>
        </div>
      </div>`
    )
    .join('');

  const learnersHtml = analysis.learnerAnalyses
    .map((a) => {
      const obs = a.observation;
      const initials = esc(getInitials(a.learner.name || ''));
      const badgeColor =
        a.verdictCategory === 'expert' || a.verdictCategory === 'maitrise'
          ? { bg: '#f1f9f8', border: '#c5e4e2', text: '#096475' }
          : a.verdictCategory === 'consolidation'
          ? { bg: '#fffaf0', border: '#f5dfb1', text: '#9a5400' }
          : a.verdictCategory === 'pending'
          ? { bg: '#f3f7f9', border: '#cedee4', text: '#096475' }
          : { bg: '#fff5f5', border: '#f5cccc', text: '#c62828' };

      return `
      <article class="learner-card">
        <div class="learner-head">
          <div style="display:flex;align-items:center;gap:12px;">
            <div class="monogram">${initials}</div>
            <div>
              <h3 style="margin:0;font-size:18px;font-weight:900;color:#096475;">${esc(a.learner.name || '—')}</h3>
              <div style="font-size:12px;color:#6d7d83;margin-top:2px;">
                ${esc(a.learner.email || '—')} · ${esc(a.learner.wave || 'Sans vague')} · ${esc(a.learner.seniority || 'Ancienneté N/C')} · ${esc(a.learner.langues || '—')}
              </div>
            </div>
          </div>
          <div style="text-align:right;">
            <span style="display:inline-block;font-size:12px;font-weight:700;color:${badgeColor.text};border:1px solid ${badgeColor.border};padding:4px 10px;border-radius:6px;background:${badgeColor.bg};">
              ${esc(a.learner.verdict || verdictLabel[a.verdictCategory])}
            </span>
            <div style="font-size:11px;font-weight:600;color:#6d7d83;margin-top:3px;">${esc(a.trajectoryTag)}</div>
          </div>
        </div>

        <div class="learner-body">
          <div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-bottom:14px;">
            <div style="padding:10px 12px;background:#f6f9fa;border:1px solid #e6eef0;border-top:2px solid #94a3b8;border-radius:10px;">
              <div style="font-size:11px;font-weight:700;color:#6d7d83;">Pré-quiz</div>
              <div style="font-size:18px;font-weight:900;font-family:'JetBrains Mono',monospace;color:#1d2b30;">${a.hasPre ? `${a.prePct}%` : '—'}</div>
            </div>
            <div style="padding:10px 12px;background:#f4fafa;border:1px solid #dcebed;border-top:2px solid #096475;border-radius:10px;">
              <div style="font-size:11px;font-weight:700;color:#096475;">Quiz final</div>
              <div style="font-size:18px;font-weight:900;font-family:'JetBrains Mono',monospace;color:#096475;">${a.hasPost ? `${a.postPct}%` : '—'}</div>
            </div>
            <div style="padding:10px 12px;background:#f4fafa;border:1px solid #dcebed;border-top:2px solid #00afa9;border-radius:10px;">
              <div style="font-size:11px;font-weight:700;color:#008c87;">Progression</div>
              <div style="font-size:18px;font-weight:900;font-family:'JetBrains Mono',monospace;color:${a.progression >= 0 ? '#008c87' : '#c62828'};">${a.hasPre && a.hasPost ? `${a.progression >= 0 ? '+' : ''}${a.progression} pts` : '—'}</div>
            </div>
            <div style="padding:10px 12px;background:#fffcf5;border:1px solid #f3e6c8;border-top:2px solid #ffa900;border-radius:10px;">
              <div style="font-size:11px;font-weight:700;color:#9a5400;">Simulation</div>
              <div style="font-size:18px;font-weight:900;font-family:'JetBrains Mono',monospace;color:#b45309;">${a.hasSim ? `${a.simPct}%` : '—'}</div>
            </div>
          </div>

          ${a.automatedSummary ? `<p style="font-size:14px;color:#334155;margin:0 0 10px;line-height:1.6;">${esc(a.automatedSummary)}</p>` : ''}
          <div style="font-size:13px;color:#096475;margin:0 0 10px;background:#f3f9f9;border:1px solid #dcecec;border-radius:8px;padding:9px 12px;">
            <strong>Observation :</strong> <span style="color:#1d2b30;">${esc(a.operationalAdvice)}</span>
          </div>

          ${a.finalAxes.length ? `<p style="font-size:13px;color:#47585e;margin:0 0 8px;"><strong>Axes résiduels post-formation :</strong> ${esc(a.finalAxes.join(' · '))}</p>` : ''}

          ${
            obs.forces || obs.axes || obs.engagement || obs.global
              ? `<div style="margin-top:12px;padding-top:12px;border-top:1px solid #e8eff1;font-size:13px;color:#47585e;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;">
                  ${obs.forces ? `<div style="background:#f4faf9;border:1px solid #dceeed;border-radius:8px;padding:8px 10px;"><strong style="color:#096475;">Points forts :</strong> ${esc(obs.forces)}</div>` : ''}
                  ${obs.axes ? `<div style="background:#fffbf2;border:1px solid #f5e7c2;border-radius:8px;padding:8px 10px;"><strong style="color:#9a5400;">Axes à travailler :</strong> ${esc(obs.axes)}</div>` : ''}
                  ${obs.engagement ? `<div style="background:#fafcfd;border:1px solid #edf2f3;border-radius:8px;padding:8px 10px;"><strong>Engagement final :</strong> ${esc(obs.engagement)}</div>` : ''}
                  ${obs.global ? `<div style="grid-column:span 2;background:#f6f9fa;border:1px solid #e1e9eb;border-radius:8px;padding:8px 10px;"><strong style="color:#096475;">Synthèse formateur :</strong> ${esc(obs.global)}</div>` : ''}
                </div>`
              : ''
          }
        </div>
      </article>`;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <title>${esc(config.reportTitle)} — Connecteo</title>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;700&family=Mada:wght@400;600;700;900&family=Source+Serif+4:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet" />
  <style>
    @page { size: A4 landscape; margin: 10mm 12mm; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    body { font-family: 'Mada', sans-serif; color: #1d2b30; background: #f4f7f8; margin: 0; padding: 28px 20px 60px; line-height: 1.6; }
    .slide-page { max-width: 1040px; margin: 0 auto 24px; background: linear-gradient(135deg, #054754 0%, #075b6b 58%, #09687a 100%); color: #ffffff; border-radius: 16px; min-height: 540px; padding: 44px 52px; position: relative; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between; }
    .slide-top-accent { position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #00c2ba 0%, #00e0d6 70%, #ffa900 100%); }
    .slide-brand-tag { margin-top: 6px; font-size: 11px; font-weight: 600; letter-spacing: 0.14em; color: rgba(255,255,255,0.95); text-transform: uppercase; }
    .slide-eyebrow { font-size: 11px; font-weight: 700; letter-spacing: 0.22em; color: #00c2ba; text-transform: uppercase; margin-bottom: 12px; }
    .slide-meta-row { display: flex; flex-wrap: wrap; align-items: center; gap: 16px 32px; padding-right: 170px; position: relative; z-index: 2; }
    .slide-meta-item { display: flex; align-items: center; gap: 12px; }
    .slide-meta-icon { width: 40px; height: 40px; border-radius: 999px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .doc-shell { max-width: 1040px; margin: 0 auto 24px; background: #ffffff; border: 1px solid #e1e9eb; border-radius: 16px; overflow: hidden; }
    .top-crown { height: 6px; width: 100%; background: linear-gradient(90deg, #064552 0%, #096475 52%, #00afa9 100%); }
    .doc-inner { padding: 30px 40px 36px; }
    .hero-header { background: linear-gradient(135deg, #f4fafa 0%, #ffffff 55%, #eef8f8 100%); border: 1px solid #d6e7e9; border-radius: 12px; padding: 18px 22px; margin-bottom: 28px; }
    h1 { font-size: 32px; font-weight: 900; color: #096475; margin: 0; line-height: 1.15; letter-spacing: -0.02em; }
    .sec-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin: 28px 0 14px; padding-bottom: 10px; border-bottom: 1px solid #dbe7e9; break-after: avoid; page-break-after: avoid; }
    .sec-head-left { display: flex; align-items: center; gap: 10px; }
    .sec-num { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 8px; background: #096475; color: #ffffff; font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 700; flex-shrink: 0; }
    .sec-title { margin: 0; font-size: 19px; font-weight: 900; color: #096475; }
    .sec-sub { font-size: 12px; font-weight: 600; color: #008c87; }
    .kpi-grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 12px; margin: 18px 0; }
    .kpi { border: 1px solid #e1ecee; border-top: 2px solid #096475; border-radius: 12px; padding: 13px 14px; background: #fafcfd; }
    .kpi .v { font-size: 24px; font-weight: 900; font-family: 'JetBrains Mono', monospace; color: #096475; }
    .kpi .l { font-size: 11px; font-weight: 600; color: #6d7d83; margin-top: 3px; }
    .quote { font-family: 'Source Serif 4', serif; font-style: italic; font-size: 18px; color: #096475; padding: 14px 20px; margin: 18px 0; background: #f4fafa; border: 1px solid #d6e9eb; border-radius: 12px; }
    .charts-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 16px; align-items: start; }
    .rec-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
    .plan-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
    .learner-card { border: 1px solid #d8e7e9; border-radius: 14px; overflow: hidden; margin-bottom: 18px; background: #ffffff; break-inside: avoid; page-break-inside: avoid; }
    .learner-head { display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap; padding: 14px 18px; background: linear-gradient(90deg, #f3fafa 0%, #fafdfd 55%, #ffffff 100%); border-bottom: 1px solid #dbe9eb; }
    .learner-body { padding: 16px 18px; }
    .monogram { width: 38px; height: 38px; border-radius: 10px; background: linear-gradient(135deg, #096475 0%, #00afa9 100%); color: #ffffff; font-weight: 900; font-size: 13px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .no-break { break-inside: avoid; page-break-inside: avoid; }
    @media print {
      body { background: #ffffff; padding: 0; }
      .slide-page { max-width: none; height: 184mm; min-height: 184mm; margin: 0; border-radius: 10px; overflow: hidden !important; break-inside: avoid; page-break-inside: avoid; }
      .doc-shell { max-width: none; border: none; border-radius: 0; margin: 0; overflow: visible !important; }
      .doc-inner { padding: 8px 0 0; }
      .hero-header { padding: 14px 18px; margin-bottom: 16px; break-inside: avoid; page-break-inside: avoid; }
      .sec-head { margin-top: 0; margin-bottom: 12px; }
      .kpi-grid { margin: 12px 0; }
      .quote { padding: 10px 16px; margin: 12px 0; }
      .section-break { break-before: page; page-break-before: always; }
      .learner-card { margin-bottom: 0; overflow: visible !important; }
      .learner-head { padding: 11px 16px; }
      .learner-body { padding: 14px 16px; }
      .learner-card + .learner-card { break-before: page; page-break-before: always; }
      footer { margin-top: 16px !important; padding-top: 10px !important; break-inside: avoid; page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  ${
    showCovers
      ? `
  <section class="slide-page" aria-label="Page de couverture">
    <div class="slide-top-accent"></div>
    ${coverArtworkSvg}
    <div style="position:relative;z-index:2;">
      <img src="${logoDataUri}" alt="Connecteo" style="height:46px;width:auto;display:block;" />
      <div class="slide-brand-tag">CHAQUE EXPÉRIENCE EST UNIQUE</div>
    </div>

    <div style="position:relative;z-index:2;max-width:640px;margin:auto 0;padding:24px 0;">
      <div class="slide-eyebrow">RAPPORT DE FORMATION</div>
      <div style="font-size:46px;line-height:1.08;letter-spacing:-0.02em;color:#ffffff;">
        ${coverLead ? `<div style="font-weight:400;">${esc(coverLead)}</div>` : ''}
        <div style="font-weight:900;">${esc(coverMain)}</div>
      </div>
      <p style="margin:18px 0 0;font-size:17px;line-height:1.55;color:rgba(255,255,255,0.85);max-width:540px;">
        ${esc(coverSubtitle)}
      </p>
    </div>

    <div class="slide-meta-row">
      <div class="slide-meta-item">
        <div class="slide-meta-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00c2ba" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        </div>
        <div>
          <div style="font-size:14px;font-weight:700;color:#ffffff;line-height:1.2;">${esc(periodLabel)}</div>
          <div style="font-size:12px;color:rgba(255,255,255,0.75);margin-top:2px;">${esc(groupLabel)} · Renforcement RC</div>
        </div>
      </div>

      <div class="slide-meta-item">
        <div class="slide-meta-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00c2ba" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        </div>
        <div>
          <div style="font-size:14px;font-weight:700;color:#ffffff;line-height:1.2;">${analysis.total} conseillers formés</div>
          <div style="font-size:12px;color:rgba(255,255,255,0.75);margin-top:2px;">${analysis.withFinalCount} évalués · ${analysis.passedCount} validés</div>
        </div>
      </div>

      <div class="slide-meta-item">
        <div class="slide-meta-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00c2ba" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </div>
        <div>
          <div style="font-size:14px;font-weight:700;color:#ffffff;line-height:1.2;">${esc(config.facilitator)}</div>
          <div style="font-size:12px;color:rgba(255,255,255,0.75);margin-top:2px;">Trainer Animator${config.clientName ? ` · ${esc(config.clientName)}` : ''}</div>
        </div>
      </div>
    </div>
  </section>`
      : ''
  }

  <div class="doc-shell${showCovers ? ' section-break' : ''}">
    <div class="top-crown"></div>
    <div class="doc-inner">
      <header class="hero-header">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:20px;margin-bottom:12px;">
          <img src="${logoDataUri}" alt="Connecteo" style="height:42px;width:auto;display:block;" />
          <span style="font-size:12px;color:#008c87;font-weight:700;">${esc(config.programTag)}</span>
        </div>
        <h1>${esc(config.reportTitle)}</h1>
        <div style="font-size:13px;color:#6d7d83;margin-top:10px;padding-top:10px;border-top:1px solid #e1eff1;">
          ${config.clientName ? `Client : <strong style="color:#1d2b30;">${esc(config.clientName)}</strong> · ` : ''}Périmètre : <strong style="color:#096475;">${esc(groupLabel)}</strong> · Facilitateur : ${esc(config.facilitator)} · Édité le ${esc(todayLabel)} · ${analysis.total} apprenants
        </div>
      </header>

      ${config.includeExecutiveNarrative ? `
      <section class="no-break">
        <div class="sec-head" style="margin-top:0;">
          <div class="sec-head-left">
            <span class="sec-num">01</span>
            <h2 class="sec-title">Synthèse exécutive & narration des résultats</h2>
          </div>
          <span class="sec-sub">Vue d’ensemble</span>
        </div>
        <p style="font-size:17px;font-weight:700;color:#1d2b30;margin:0 0 12px;">${esc(analysis.executiveHeadline)}</p>
        <div class="kpi-grid">
          <div class="kpi" style="border-top-color:#096475;"><div class="v">${analysis.total}</div><div class="l">Apprenants</div></div>
          <div class="kpi" style="border-top-color:#64748b;"><div class="v" style="color:#1d2b30;">${analysis.preAvg}%</div><div class="l">Diagnostic initial</div></div>
          <div class="kpi" style="border-top-color:#096475;background:#f5fbfb;"><div class="v">${analysis.postAvg}%</div><div class="l">Évaluation finale</div></div>
          <div class="kpi" style="border-top-color:#00afa9;background:#f5fbfb;"><div class="v" style="color:${analysis.progression >= 0 ? '#008c87' : '#c62828'};">${analysis.progression >= 0 ? '+' : ''}${analysis.progression} pts</div><div class="l">Progression nette</div></div>
          <div class="kpi" style="border-top-color:#ffa900;background:#fffdf8;"><div class="v" style="color:#b45309;">${analysis.validationRate}%</div><div class="l">Validation ≥ 60% (${analysis.passedCount}/${analysis.withFinalCount})</div></div>
        </div>
        ${config.customIntro ? `<p style="font-size:15px;color:#1d2b30;font-weight:600;margin:8px 0;">${esc(config.customIntro)}</p>` : ''}
        ${analysis.executiveNarrative.map((p) => `<p style="font-size:15px;color:#334155;margin:8px 0;">${esc(p)}</p>`).join('')}
        <div class="quote">${esc(analysis.pullQuote)}</div>
      </section>` : ''}

      ${config.includeCharts ? `
      <section class="${config.includeExecutiveNarrative ? 'section-break ' : ''}no-break">
        <div class="sec-head">
          <div class="sec-head-left">
            <span class="sec-num">02</span>
            <h2 class="sec-title">Visualisation des trajectoires & piliers pédagogiques</h2>
          </div>
          <span class="sec-sub">Trajectoires & piliers</span>
        </div>
        <div class="charts-grid">
          <div style="border:1px solid #dce9eb;border-top:2px solid #096475;border-radius:14px;padding:15px;background:#ffffff;">
            <h3 style="margin:0 0 10px;font-size:15px;font-weight:900;color:#096475;">Trajectoires individuelles (Pré-quiz → Final)</h3>
            ${slopeSvg}
          </div>
          <div style="border:1px solid #dce9eb;border-top:2px solid #00afa9;border-radius:14px;padding:15px;background:#ffffff;">
            <h3 style="margin:0 0 10px;font-size:15px;font-weight:900;color:#096475;">Performance comparée par pilier (J1–J4)</h3>
            ${modulesHtml}
          </div>
        </div>
        <div style="font-size:14px;color:#334155;margin-top:14px;padding:12px 16px;border:1px solid #d6e7e9;border-radius:12px;background:#f4fafa;">
          <strong style="color:#096475;">Lecture des piliers :</strong> ${esc(analysis.moduleNarrative)}
        </div>
      </section>` : ''}

      ${config.includeIndividualNarratives ? `
      <section class="${config.includeExecutiveNarrative || config.includeCharts ? 'section-break' : ''}">
        <div class="sec-head">
          <div class="sec-head-left">
            <span class="sec-num">03</span>
            <h2 class="sec-title">Bilans individuels (${analysis.learnerAnalyses.length})</h2>
          </div>
          <span class="sec-sub">Chaque expérience est unique</span>
        </div>
        ${learnersHtml}
      </section>` : ''}

      ${config.includeActionPlan ? `
      <section class="${config.includeExecutiveNarrative || config.includeCharts || config.includeIndividualNarratives ? 'section-break ' : ''}no-break">
        <div class="sec-head">
          <div class="sec-head-left">
            <span class="sec-num">04</span>
            <h2 class="sec-title">Recommandations managériales & accompagnement</h2>
          </div>
          <span class="sec-sub">Consolidation terrain</span>
        </div>
        <div class="rec-grid">
        ${analysis.recommendations
          .map((rec, idx) => {
            const accent =
              rec.priority === 'Priorité haute'
                ? '#c62828'
                : rec.priority === 'Planification J5'
                ? '#096475'
                : rec.priority === 'Consolidation'
                ? '#ffa900'
                : '#00afa9';
            const labelColor =
              rec.priority === 'Priorité haute'
                ? '#c62828'
                : rec.priority === 'Planification J5'
                ? '#096475'
                : rec.priority === 'Consolidation'
                ? '#b45309'
                : '#008c87';
            return `
          <div class="no-break" style="border:1px solid #dce9eb;border-top:2px solid ${accent};border-radius:12px;padding:15px;background:#fafcfd;display:flex;flex-direction:column;justify-content:space-between;">
            <div>
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;">
                <span style="font-size:11px;font-weight:700;color:${labelColor};">${esc(rec.priority)}</span>
                <span style="font-size:11px;font-family:'JetBrains Mono',monospace;font-weight:700;color:#6d7d83;">0${idx + 1}</span>
              </div>
              <div style="font-size:15px;font-weight:900;color:#096475;margin-bottom:4px;">${esc(rec.title)}</div>
              <div style="font-size:13px;color:#47585e;margin-bottom:10px;">${esc(rec.rationale)}</div>
            </div>
            <div style="padding-top:10px;border-top:1px solid #e5ecee;font-size:13px;color:#1d2b30;"><strong style="color:#096475;">Action :</strong> ${esc(rec.action)}</div>
          </div>`;
          })
          .join('')}
        </div>
      </section>` : ''}

      ${config.includeNextSteps ? `
      <section class="${config.includeExecutiveNarrative || config.includeCharts || config.includeIndividualNarratives || config.includeActionPlan ? 'section-break ' : ''}no-break">
        <div class="sec-head">
          <div class="sec-head-left">
            <span class="sec-num">05</span>
            <h2 class="sec-title">Next Steps — Déploiement terrain & verrouillage des acquis</h2>
          </div>
          <span class="sec-sub">Décembre → Janvier</span>
        </div>
        <p style="font-size:14px;color:#334155;margin:0 0 14px;line-height:1.55;">${esc(NEXT_STEPS_HEADLINE)}</p>
        <div class="rec-grid" style="margin-bottom:14px;">
          ${NEXT_STEPS_MILESTONES.map(
            (step, idx) => `
            <div style="border:1px solid #d6e6e8;border-top:2px solid ${idx === 0 ? '#00afa9' : '#096475'};border-radius:12px;padding:14px;background:#f5fbfb;display:flex;flex-direction:column;justify-content:space-between;">
              <div>
                <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:6px;font-size:11px;">
                  <span style="font-family:'JetBrains Mono',monospace;font-weight:700;color:#008c87;">${esc(step.badge)}</span>
                  <span style="font-weight:700;color:#096475;">${esc(step.period)}</span>
                </div>
                <div style="font-size:15px;font-weight:900;color:#096475;margin-bottom:4px;">${esc(step.title)}</div>
                <div style="font-size:12px;color:#47585e;margin-bottom:8px;line-height:1.5;">${esc(step.summary)}</div>
              </div>
              <div style="padding-top:8px;border-top:1px solid #d8e8ea;font-size:12px;color:#1d2b30;"><strong style="color:#096475;">Livrable :</strong> ${esc(step.deliverable)}</div>
            </div>`
          ).join('')}
        </div>
        <div style="border:1px solid #d8e7e9;border-top:2px solid #096475;border-radius:14px;padding:14px;background:#ffffff;">
          <div style="display:flex;justify-content:space-between;align-items:baseline;gap:12px;flex-wrap:wrap;margin-bottom:10px;">
            <h3 style="margin:0;font-size:15px;font-weight:900;color:#096475;">${esc(JANUARY_PLANNING_META.title)}</h3>
            <span style="font-size:12px;font-weight:700;color:#008c87;">${esc(JANUARY_PLANNING_META.subtitle)}</span>
          </div>
          <div class="plan-grid">
            ${JANUARY_PLANNING_DAYS.map(
              (item) => `
              <div style="border:1px solid #dce9eb;border-radius:10px;overflow:hidden;background:#fafcfd;display:flex;flex-direction:column;justify-content:space-between;">
                <div>
                  <div style="background:#eef7f8;padding:7px 12px;border-bottom:1px solid #e1eff1;display:flex;justify-content:space-between;align-items:center;gap:6px;">
                    <span style="font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:900;color:#096475;">${esc(item.day)}</span>
                    <span style="font-size:11px;font-weight:600;color:#008c87;">${esc(item.format)}</span>
                  </div>
                  <div style="padding:11px 12px;">
                    <div style="font-size:13px;font-weight:900;color:#096475;margin-bottom:6px;">${esc(item.title)}</div>
                    <p style="font-size:12px;color:#334155;margin:0 0 5px;line-height:1.45;"><strong style="color:#096475;">Matin :</strong> ${esc(item.morning)}</p>
                    <p style="font-size:12px;color:#334155;margin:0;line-height:1.45;"><strong style="color:#096475;">Après-midi :</strong> ${esc(item.afternoon)}</p>
                  </div>
                </div>
                <div style="padding:8px 12px;background:#f4fafa;border-top:1px solid #e1eff1;font-size:12px;color:#1d2b30;line-height:1.4;"><strong style="color:#008c87;">Cap visé :</strong> ${esc(item.outcome)}</div>
              </div>`
            ).join('')}
          </div>
        </div>
      </section>` : ''}

      <footer style="margin-top:36px;padding-top:14px;border-top:1px solid #d6e7e9;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;font-size:12px;color:#6d7d83;">
        <span style="font-weight:700;color:#096475;">Connecteo · Chaque expérience est unique</span>
        <span>Rapport généré automatiquement · ${esc(todayLabel)}</span>
      </footer>
    </div>
  </div>

  ${
    showCovers
      ? `
  <section class="slide-page section-break" aria-label="Page de clôture Merci">
    <div class="slide-top-accent"></div>
    ${closingArtworkSvg}
    <div style="position:relative;z-index:2;">
      <img src="${logoDataUri}" alt="Connecteo" style="height:46px;width:auto;display:block;" />
      <div class="slide-brand-tag">CHAQUE EXPÉRIENCE EST UNIQUE</div>
    </div>

    <div style="position:relative;z-index:2;max-width:560px;margin:auto 0;padding:24px 0;">
      <div style="font-size:74px;font-weight:900;letter-spacing:-0.02em;line-height:1;color:#ffffff;">
        Merci<span style="display:inline-block;width:16px;height:16px;border-radius:4px;background:#00bfb6;margin-left:6px;"></span>
      </div>
      <div style="margin-top:14px;font-size:24px;font-weight:900;color:#00c2ba;">Misaotra betsaka !</div>
      <div style="margin-top:18px;font-size:18px;line-height:1.55;color:rgba(255,255,255,0.9);">
        <div>À la PAMF, pour sa confiance.</div>
        <div>Aux conseillers, pour leur engagement.</div>
      </div>
    </div>

    <div style="position:relative;z-index:2;font-size:13px;color:rgba(255,255,255,0.85);padding-right:170px;">
      <strong style="color:#ffffff;">${esc(config.facilitator)}</strong>
      <span style="margin:0 8px;color:rgba(255,255,255,0.45);">·</span>
      <span>Trainer Animator</span>
      ${
        facilitatorEmail
          ? `<span style="margin:0 8px;color:rgba(255,255,255,0.45);">·</span><span>${esc(facilitatorEmail)}</span>`
          : ''
      }
    </div>
  </section>`
      : ''
  }
</body>
</html>`;
}
