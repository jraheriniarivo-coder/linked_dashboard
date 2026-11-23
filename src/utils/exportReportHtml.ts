import { CohortAnalysis, ReportConfig } from '../types/dashboard';
import { getConnecteoLogoDataUri } from './connecteoLogo';

function esc(value: string): string {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
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
      <div style="padding:12px 14px;border:1px solid #e2eaec;border-radius:10px;margin-bottom:10px;background:#fafcfd;">
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:13px;">
          <strong><span style="color:#00afa9;">${esc(m.dayLabel)}</span> · ${esc(m.title)}</strong>
          <span style="font-family:monospace;color:#096475;">Départ ${m.prePct}% → Final <strong>${m.postPct}%</strong> (${m.delta >= 0 ? '+' : ''}${m.delta} pts)</span>
        </div>
        <div style="height:8px;background:#e8eff1;border-radius:999px;overflow:hidden;margin-bottom:5px;">
          <div style="height:100%;width:${m.prePct}%;background:#94a3b8;"></div>
        </div>
        <div style="height:10px;background:#e8eff1;border-radius:999px;overflow:hidden;">
          <div style="height:100%;width:${m.postPct}%;background:linear-gradient(90deg,#096475,#00afa9);"></div>
        </div>
      </div>`
    )
    .join('');

  const learnersHtml = analysis.learnerAnalyses
    .map((a) => {
      const obs = a.observation;
      return `
      <article class="learner-card">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:16px;flex-wrap:wrap;margin-bottom:12px;">
          <div>
            <h3 style="margin:0;font-size:18px;color:#096475;">${esc(a.learner.name || '—')}</h3>
            <div style="font-size:12px;color:#6d7d83;margin-top:2px;">
              ${esc(a.learner.email || '')} · ${esc(a.learner.wave || 'Sans vague')} · ${esc(a.learner.seniority || 'Ancienneté N/C')} · Langues : ${esc(a.learner.langues || '—')}
            </div>
          </div>
          <div style="text-align:right;">
            <span style="font-size:12px;font-weight:700;color:#096475;border:1px solid #cce1e1;padding:4px 10px;border-radius:6px;background:#f2f9f9;">
              ${esc(a.learner.verdict || verdictLabel[a.verdictCategory])}
            </span>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-bottom:14px;padding:12px;background:#f6f9fa;border-radius:10px;">
          <div><div style="font-size:11px;color:#6d7d83;">Pré-quiz</div><div style="font-size:18px;font-weight:900;font-family:monospace;color:#1d2b30;">${a.hasPre ? `${a.prePct}%` : '—'}</div></div>
          <div><div style="font-size:11px;color:#6d7d83;">Quiz final</div><div style="font-size:18px;font-weight:900;font-family:monospace;color:#096475;">${a.hasPost ? `${a.postPct}%` : '—'}</div></div>
          <div><div style="font-size:11px;color:#6d7d83;">Progression</div><div style="font-size:18px;font-weight:900;font-family:monospace;color:${a.progression >= 0 ? '#00afa9' : '#c62828'};">${a.hasPre && a.hasPost ? `${a.progression >= 0 ? '+' : ''}${a.progression} pts` : '—'}</div></div>
          <div><div style="font-size:11px;color:#6d7d83;">Simulation</div><div style="font-size:18px;font-weight:900;font-family:monospace;color:#1d2b30;">${a.hasSim ? `${a.simPct}%` : '—'}</div></div>
        </div>

        ${a.automatedSummary ? `<p style="font-size:14px;color:#334155;margin:0 0 10px;line-height:1.65;">${esc(a.automatedSummary)}</p>` : ''}
        <p style="font-size:13px;color:#096475;margin:0 0 10px;"><strong>Observation :</strong> ${esc(a.operationalAdvice)}</p>

        ${a.finalAxes.length ? `<p style="font-size:13px;color:#47585e;margin:0 0 8px;"><strong>Axes d’amélioration résiduels :</strong> ${esc(a.finalAxes.join(' • '))}</p>` : ''}

        ${
          obs.forces || obs.axes || obs.engagement || obs.global
            ? `<div style="margin-top:12px;padding-top:12px;border-top:1px solid #e8eff1;font-size:13px;color:#47585e;">
                ${obs.forces ? `<p style="margin:4px 0;"><strong>Points forts observés :</strong> ${esc(obs.forces)}</p>` : ''}
                ${obs.axes ? `<p style="margin:4px 0;"><strong>Axes à travailler :</strong> ${esc(obs.axes)}</p>` : ''}
                ${obs.engagement ? `<p style="margin:4px 0;"><strong>Engagement final :</strong> ${esc(obs.engagement)}</p>` : ''}
                ${obs.global ? `<p style="margin:4px 0;"><strong>Synthèse formateur :</strong> ${esc(obs.global)}</p>` : ''}
              </div>`
            : ''
        }
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
    body { font-family: 'Mada', sans-serif; color: #1d2b30; background: #ffffff; max-width: 1040px; margin: 36px auto; padding: 0 28px 60px; line-height: 1.65; }
    h1 { font-size: 32px; font-weight: 900; color: #096475; margin: 0 0 8px; line-height: 1.15; }
    h2 { font-size: 19px; font-weight: 900; color: #096475; margin: 34px 0 14px; padding-bottom: 8px; border-bottom: 1px solid #d7e4e7; break-after: avoid; page-break-after: avoid; }
    .kpi-grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 12px; margin: 20px 0; }
    .kpi { border: 1px solid #e1e9eb; border-radius: 12px; padding: 14px; background: #fafcfd; }
    .kpi .v { font-size: 24px; font-weight: 900; font-family: 'JetBrains Mono', monospace; color: #096475; }
    .kpi .l { font-size: 11px; color: #6d7d83; margin-top: 4px; }
    .quote { font-family: 'Source Serif 4', serif; font-style: italic; font-size: 19px; color: #096475; padding: 18px 0; margin: 20px 0; border-top: 1px solid #d7e4e7; border-bottom: 1px solid #d7e4e7; }
    .charts-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 18px; align-items: start; }
    .rec-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
    .learner-card { border: 1px solid #e1e9eb; border-radius: 14px; padding: 20px; margin-bottom: 18px; break-inside: avoid; page-break-inside: avoid; }
    .no-break { break-inside: avoid; page-break-inside: avoid; }
    @media print {
      body { max-width: none; margin: 0; padding: 0; }
      header { padding-bottom: 14px !important; margin-bottom: 18px !important; break-inside: avoid; page-break-inside: avoid; }
      h2 { margin-top: 0; margin-bottom: 12px; }
      .kpi-grid { margin: 14px 0; }
      .quote { padding: 12px 0; margin: 14px 0; }
      .section-break { break-before: page; page-break-before: always; }
      .learner-card { padding: 16px; margin-bottom: 0; }
      .learner-card + .learner-card { break-before: page; page-break-before: always; }
      footer { margin-top: 20px !important; padding-top: 12px !important; break-inside: avoid; page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <header style="display:flex;justify-content:space-between;align-items:flex-end;gap:20px;padding-bottom:20px;border-bottom:2px solid #096475;margin-bottom:28px;">
    <div>
      <img src="${logoDataUri}" alt="Connecteo" style="height:44px;width:auto;display:block;margin-bottom:12px;" />
      <h1>${esc(config.reportTitle)}</h1>
      <div style="font-size:13px;color:#6d7d83;">
        ${config.clientName ? `Client : ${esc(config.clientName)} · ` : ''}Groupe : ${esc(groupLabel)} · Facilitateur : ${esc(config.facilitator)} · Édité le ${esc(todayLabel)}
      </div>
    </div>
    <div style="text-align:right;font-size:12px;color:#00afa9;font-weight:700;">${esc(config.programTag)}</div>
  </header>

  ${config.includeExecutiveNarrative ? `
  <section class="no-break">
    <h2>01. Synthèse exécutive & narration des résultats</h2>
    <p style="font-size:17px;font-weight:700;color:#1d2b30;margin-bottom:12px;">${esc(analysis.executiveHeadline)}</p>
    <div class="kpi-grid">
      <div class="kpi"><div class="v">${analysis.total}</div><div class="l">Apprenants</div></div>
      <div class="kpi"><div class="v">${analysis.preAvg}%</div><div class="l">Score initial moyen</div></div>
      <div class="kpi"><div class="v">${analysis.postAvg}%</div><div class="l">Score final moyen</div></div>
      <div class="kpi"><div class="v">${analysis.progression >= 0 ? '+' : ''}${analysis.progression} pts</div><div class="l">Progression moyenne</div></div>
      <div class="kpi"><div class="v">${analysis.validationRate}%</div><div class="l">Validation ≥ 60% (${analysis.passedCount}/${analysis.withFinalCount})</div></div>
    </div>
    ${config.customIntro ? `<p style="font-size:15px;color:#334155;">${esc(config.customIntro)}</p>` : ''}
    ${analysis.executiveNarrative.map((p) => `<p style="font-size:15px;color:#334155;">${esc(p)}</p>`).join('')}
    <div class="quote">${esc(analysis.pullQuote)}</div>
  </section>` : ''}

  ${config.includeCharts ? `
  <section class="${config.includeExecutiveNarrative ? 'section-break ' : ''}no-break">
    <h2>02. Visualisation des trajectoires & piliers pédagogiques</h2>
    <div class="charts-grid">
      <div style="border:1px solid #e1e9eb;border-radius:14px;padding:16px;">
        <h3 style="margin:0 0 10px;font-size:15px;color:#096475;">Trajectoires individuelles (Pré-quiz → Final)</h3>
        ${slopeSvg}
      </div>
      <div style="border:1px solid #e1e9eb;border-radius:14px;padding:16px;">
        <h3 style="margin:0 0 10px;font-size:15px;color:#096475;">Performance comparée par pilier (J1–J4)</h3>
        ${modulesHtml}
      </div>
    </div>
    <p style="font-size:14px;color:#334155;margin-top:14px;padding:12px 14px;border:1px solid #e1e9eb;border-radius:10px;background:#f8fbfb;">${esc(analysis.moduleNarrative)}</p>
  </section>` : ''}

  ${config.includeIndividualNarratives ? `
  <section class="${config.includeExecutiveNarrative || config.includeCharts ? 'section-break' : ''}">
    <h2>03. Bilans individuels détaillés</h2>
    ${learnersHtml}
  </section>` : ''}

  ${config.includeActionPlan ? `
  <section class="${config.includeExecutiveNarrative || config.includeCharts || config.includeIndividualNarratives ? 'section-break ' : ''}no-break">
    <h2>04. Recommandations managériales & accompagnement</h2>
    <div class="rec-grid">
    ${analysis.recommendations
      .map(
        (rec) => `
      <div class="no-break" style="border:1px solid #e1e9eb;border-radius:12px;padding:16px;background:#fafcfd;">
        <div style="font-size:11px;font-weight:700;color:#00afa9;margin-bottom:4px;">${esc(rec.priority)}</div>
        <div style="font-size:15px;font-weight:700;color:#096475;margin-bottom:4px;">${esc(rec.title)}</div>
        <div style="font-size:13px;color:#47585e;margin-bottom:6px;">${esc(rec.rationale)}</div>
        <div style="font-size:13px;color:#1d2b30;"><strong>Action recommandée :</strong> ${esc(rec.action)}</div>
      </div>`
      )
      .join('')}
    </div>
  </section>` : ''}

  <footer style="margin-top:42px;padding-top:18px;border-top:1px solid #e1e9eb;text-align:center;font-size:12px;color:#6d7d83;">
    Connecteo · Chaque expérience est unique · Rapport généré automatiquement depuis les évaluations et observations terrain
  </footer>
</body>
</html>`;
}
