import React, { useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  Award,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Download,
  FileText,
  Printer,
  Search,
  SlidersHorizontal,
  TrendingUp,
} from 'lucide-react';
import {
  CohortAnalysis,
  ReportConfig,
  VerdictCategory,
} from '../types/dashboard';
import { getConnecteoLogoDataUri } from '../utils/connecteoLogo';
import { CalibrationQuadrantChart } from './charts/CalibrationQuadrantChart';
import { ModuleComparisonChart } from './charts/ModuleComparisonChart';
import { ProgressionSlopeChart } from './charts/ProgressionSlopeChart';
import { VerdictDistributionChart } from './charts/VerdictDistributionChart';

interface Props {
  analysis: CohortAnalysis;
  groupLabel: string;
  config: ReportConfig;
  onUpdateConfig: (patch: Partial<ReportConfig>) => void;
  onDownloadHtml: () => void;
  onLoadDemo: () => void;
}

const ROADMAP_DAYS = [
  {
    day: 'Jour 1',
    title: 'Relation Client',
    summary: 'Fondations, acteurs, enjeux économiques et articulation satisfaction / fidélisation.',
  },
  {
    day: 'Jour 2',
    title: 'Communication',
    summary: 'Verbal, non-verbal, posture vocale au téléphone, DIVA, écoute active et excellence.',
  },
  {
    day: 'Jour 3',
    title: 'Recouvrement',
    summary: 'Cadre légal et déontologique, profils débiteurs, appel en 7 temps et négociation ferme.',
  },
  {
    day: 'Jour 4',
    title: 'Situations Complexes',
    summary: 'Causes du conflit, méthode FOS, désamorçage émotionnel et protocole des 5 R.',
  },
  {
    day: 'Jour 5',
    title: 'Évaluation finale',
    summary: 'Consolidation des acquis, simulations évaluées, plan d’action et engagement individuel.',
  },
];

export const ReportView: React.FC<Props> = ({
  analysis,
  groupLabel,
  config,
  onUpdateConfig,
  onDownloadHtml,
  onLoadDemo,
}) => {
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [verdictFilter, setVerdictFilter] = useState<VerdictCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const learnerRefs = useRef<Record<string, HTMLElement | null>>({});

  const today = useMemo(
    () =>
      new Date().toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    []
  );

  const logoDataUri = useMemo(() => getConnecteoLogoDataUri(), []);

  const handleSelectLearner = (emailKey: string) => {
    setSelectedEmail(emailKey);
    setVerdictFilter('all');
    setSearchQuery('');
    setTimeout(() => {
      const target = learnerRefs.current[emailKey];
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 60);
  };

  const filteredLearners = useMemo(() => {
    return analysis.learnerAnalyses.filter((item) => {
      if (verdictFilter !== 'all' && item.verdictCategory !== verdictFilter) return false;
      const q = searchQuery.trim().toLowerCase();
      if (!q) return true;
      return (
        (item.learner.name || '').toLowerCase().includes(q) ||
        (item.learner.email || '').toLowerCase().includes(q) ||
        (item.learner.verdict || '').toLowerCase().includes(q)
      );
    });
  }, [analysis.learnerAnalyses, verdictFilter, searchQuery]);

  if (analysis.total === 0) {
    return (
      <div className="bg-white border border-dashed border-[#cddadd] rounded-2xl py-16 px-6 text-center max-w-3xl mx-auto">
        <FileText className="w-11 h-11 text-[#9db4b9] mx-auto mb-3" />
        <h3 className="text-xl font-black text-[#096475]">
          Aucun apprenant disponible pour générer le rapport
        </h3>
        <p className="text-sm text-[#6d7d83] mt-1.5 mb-6 max-w-md mx-auto">
          Importez vos données JSON dans l’onglet Import ou chargez le jeu de démonstration pour prévisualiser immédiatement le rapport narratif interactif.
        </p>
        <button
          type="button"
          onClick={onLoadDemo}
          className="px-5 py-2.5 rounded-lg bg-[#00afa9] text-white text-sm font-bold hover:bg-[#009690] transition-colors cursor-pointer"
        >
          Charger le jeu de démonstration (6 apprenants)
        </button>
      </div>
    );
  }

  const verdictStyle = (cat: VerdictCategory) => {
    switch (cat) {
      case 'expert':
        return {
          text: 'text-[#096475]',
          bg: 'bg-[#edf7f7]',
          border: 'border-[#bfe1e1]',
          icon: <Award className="w-3.5 h-3.5 text-[#096475]" />,
        };
      case 'maitrise':
        return {
          text: 'text-[#007e79]',
          bg: 'bg-[#f0faf9]',
          border: 'border-[#bfeae7]',
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-[#008c87]" />,
        };
      case 'consolidation':
        return {
          text: 'text-[#9a5400]',
          bg: 'bg-[#fff9ec]',
          border: 'border-[#f5dfa9]',
          icon: <TrendingUp className="w-3.5 h-3.5 text-[#b45309]" />,
        };
      default:
        return {
          text: 'text-[#b91c1c]',
          bg: 'bg-[#fff5f5]',
          border: 'border-[#f5c6c6]',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-[#c62828]" />,
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Report Control Toolbar (hidden on print) */}
      <section className="bg-white border border-[#e1e9eb] rounded-2xl p-5 no-print">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-[#096475]">
              Éditeur & prévisualisation du rapport client
            </h2>
            <p className="text-xs text-[#6d7d83] mt-0.5">
              Narration automatisée, graphiques interactifs et recommandations J+30 prêts pour diffusion client ou export PDF.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setShowCustomizer((v) => !v)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-[#d6e1e3] bg-[#fafcfd] text-[#096475] text-sm font-bold hover:bg-[#f0f6f7] transition-colors cursor-pointer whitespace-nowrap"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Personnaliser
              {showCustomizer ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00afa9] text-white text-sm font-bold hover:bg-[#009690] transition-colors cursor-pointer whitespace-nowrap"
            >
              <Printer className="w-4 h-4" />
              Imprimer / PDF
            </button>

            <button
              type="button"
              onClick={onDownloadHtml}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#096475] text-white text-sm font-bold hover:bg-[#064552] transition-colors cursor-pointer whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              Télécharger HTML
            </button>
          </div>
        </div>

        {/* Collapsible Customization Drawer */}
        {showCustomizer && (
          <div className="mt-5 pt-5 border-t border-[#edf2f3] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#47585e] mb-1">
                Titre du rapport
              </label>
              <input
                type="text"
                value={config.reportTitle}
                onChange={(e) => onUpdateConfig({ reportTitle: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-[#d6e1e3] focus:outline-none focus:border-[#00afa9]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#47585e] mb-1">
                Client / Entreprise destinataire
              </label>
              <input
                type="text"
                value={config.clientName}
                onChange={(e) => onUpdateConfig({ clientName: e.target.value })}
                placeholder="Ex. Direction Relation Client"
                className="w-full px-3 py-2 text-sm rounded-lg border border-[#d6e1e3] focus:outline-none focus:border-[#00afa9]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#47585e] mb-1">
                Facilitateur
              </label>
              <input
                type="text"
                value={config.facilitator}
                onChange={(e) => onUpdateConfig({ facilitator: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-[#d6e1e3] focus:outline-none focus:border-[#00afa9]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#47585e] mb-1">
                Référence programme
              </label>
              <input
                type="text"
                value={config.programTag}
                onChange={(e) => onUpdateConfig({ programTag: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-[#d6e1e3] focus:outline-none focus:border-[#00afa9]"
              />
            </div>

            <div className="md:col-span-2 lg:col-span-4">
              <label className="block text-xs font-bold text-[#47585e] mb-1">
                Note contextuelle du formateur (optionnelle, insérée en ouverture)
              </label>
              <textarea
                value={config.customIntro}
                onChange={(e) => onUpdateConfig({ customIntro: e.target.value })}
                placeholder="Ex. Cette promotion a suivi le parcours intensif de 5 jours dans un contexte de montée en charge sur les dossiers amiables…"
                className="w-full min-h-[64px] p-3 text-sm rounded-lg border border-[#d6e1e3] focus:outline-none focus:border-[#00afa9]"
              />
            </div>

            <div className="md:col-span-2 lg:col-span-4 flex flex-wrap items-center gap-5 pt-1 text-xs font-semibold text-[#47585e]">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.includeExecutiveNarrative}
                  onChange={(e) =>
                    onUpdateConfig({ includeExecutiveNarrative: e.target.checked })
                  }
                  className="accent-[#00afa9]"
                />
                Synthèse narrative
              </label>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.includeRoadmap}
                  onChange={(e) => onUpdateConfig({ includeRoadmap: e.target.checked })}
                  className="accent-[#00afa9]"
                />
                Parcours 5 jours
              </label>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.includeCharts}
                  onChange={(e) => onUpdateConfig({ includeCharts: e.target.checked })}
                  className="accent-[#00afa9]"
                />
                Graphiques interactifs
              </label>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.includeActionPlan}
                  onChange={(e) => onUpdateConfig({ includeActionPlan: e.target.checked })}
                  className="accent-[#00afa9]"
                />
                Recommandations J+30
              </label>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.includeIndividualNarratives}
                  onChange={(e) =>
                    onUpdateConfig({ includeIndividualNarratives: e.target.checked })
                  }
                  className="accent-[#00afa9]"
                />
                Bilans individuels
              </label>
            </div>
          </div>
        )}
      </section>

      {/* ================================================================
          REPORT EDITORIAL DOCUMENT CANVAS
         ================================================================ */}
      <div className="bg-white border border-[#e1e9eb] rounded-2xl px-6 py-8 sm:px-12 sm:py-12 max-w-[1040px] mx-auto print-only-full">
        {/* Document Header */}
        <header className="pb-8 border-b border-[#d9e5e7] mb-10">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <img
              src={logoDataUri}
              alt="Connecteo"
              className="h-10 sm:h-11 w-auto block"
            />
            <span className="text-xs font-bold tracking-wide text-[#008c87]">
              {config.programTag}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-[#096475] tracking-tight leading-tight max-w-3xl [text-wrap:balance]">
            {config.reportTitle}
          </h1>

          {/* Unboxed typographic metadata */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[#6d7d83] mt-3">
            {config.clientName && (
              <>
                <span>
                  Client : <strong className="text-[#1d2b30]">{config.clientName}</strong>
                </span>
                <span aria-hidden="true">·</span>
              </>
            )}
            <span>
              Périmètre : <strong className="text-[#096475]">{groupLabel}</strong>
            </span>
            <span aria-hidden="true">·</span>
            <span>Facilitateur : {config.facilitator}</span>
            <span aria-hidden="true">·</span>
            <span>Édité le {today}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{analysis.total} apprenants</span>
          </div>
        </header>

        {/* 01. SYNTHÈSE EXÉCUTIVE & NARRATION */}
        {config.includeExecutiveNarrative && (
          <section className="mb-12">
            <div className="flex items-baseline gap-2.5 mb-4 pb-2.5 border-b border-[#e8eff1]">
              <span className="text-xs font-mono font-bold text-[#00afa9]">01.</span>
              <h2 className="text-xl font-black text-[#096475]">
                Synthèse exécutive & narration des résultats
              </h2>
            </div>

            <p className="text-lg sm:text-xl font-bold text-[#1d2b30] leading-snug mb-6 max-w-3xl [text-wrap:balance]">
              {analysis.executiveHeadline}
            </p>

            {/* Clean KPI Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-7">
              <div className="rounded-xl border border-[#e5ecee] bg-[#fafcfd] p-4">
                <div className="text-xs text-[#6d7d83] font-semibold">Effectif évalué</div>
                <div className="text-2xl font-black text-[#096475] font-mono tabular-nums mt-1">
                  {analysis.total}
                </div>
                <div className="text-[11px] text-[#6d7d83] mt-0.5">
                  {analysis.priorTrainingRate}% déjà formés RC
                </div>
              </div>

              <div className="rounded-xl border border-[#e5ecee] bg-[#fafcfd] p-4">
                <div className="text-xs text-[#6d7d83] font-semibold">Diagnostic initial</div>
                <div className="text-2xl font-black text-[#1d2b30] font-mono tabular-nums mt-1">
                  {analysis.preAvg}%
                </div>
                <div className="text-[11px] text-[#6d7d83] mt-0.5">
                  Auto-éval : {analysis.selfEvalAvg ? `${analysis.selfEvalAvg}%` : '—'}
                </div>
              </div>

              <div className="rounded-xl border border-[#e5ecee] bg-[#fafcfd] p-4">
                <div className="text-xs text-[#6d7d83] font-semibold">Évaluation finale</div>
                <div className="text-2xl font-black text-[#096475] font-mono tabular-nums mt-1">
                  {analysis.postAvg}%
                </div>
                <div className="text-[11px] text-[#6d7d83] mt-0.5">
                  Médiane : {analysis.medianPost}%
                </div>
              </div>

              <div className="rounded-xl border border-[#e5ecee] bg-[#fafcfd] p-4">
                <div className="text-xs text-[#6d7d83] font-semibold">Progression nette</div>
                <div
                  className={`text-2xl font-black font-mono tabular-nums mt-1 ${
                    analysis.progression >= 0 ? 'text-[#008c87]' : 'text-[#c62828]'
                  }`}
                >
                  {analysis.progression >= 0 ? '+' : ''}
                  {analysis.progression} pts
                </div>
                <div className="text-[11px] text-[#6d7d83] mt-0.5">
                  Écart min–max : {analysis.spreadPost} pts
                </div>
              </div>

              <div className="rounded-xl border border-[#e5ecee] bg-[#fafcfd] p-4">
                <div className="text-xs text-[#6d7d83] font-semibold">Validation ≥ 60%</div>
                <div className="text-2xl font-black text-[#096475] font-mono tabular-nums mt-1">
                  {analysis.validationRate}%
                </div>
                <div className="text-[11px] text-[#6d7d83] mt-0.5">
                  {analysis.passedCount}/{analysis.withFinalCount} validés
                </div>
              </div>

              <div className="rounded-xl border border-[#e5ecee] bg-[#fafcfd] p-4">
                <div className="text-xs text-[#6d7d83] font-semibold">Simulation appel</div>
                <div className="text-2xl font-black text-[#b45309] font-mono tabular-nums mt-1">
                  {analysis.withSimCount ? `${analysis.simAvg}%` : '—'}
                </div>
                <div className="text-[11px] text-[#6d7d83] mt-0.5">
                  {analysis.withSimCount
                    ? `${analysis.withSimCount} mises en situation`
                    : 'Non évaluée'}
                </div>
              </div>
            </div>

            {/* Automated Editorial Narrative */}
            <div className="space-y-3.5 max-w-3xl text-[15px] text-[#334155] leading-relaxed">
              {config.customIntro.trim() && (
                <p className="text-[#1d2b30] font-medium">{config.customIntro.trim()}</p>
              )}
              {analysis.executiveNarrative.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            {/* Editorial Serif Pull Quote (no thick left border — subtle top & bottom hairlines) */}
            <blockquote className="my-7 py-5 border-y border-[#dbe7e9] font-serif italic text-lg sm:text-xl text-[#096475] leading-relaxed max-w-3xl">
              {analysis.pullQuote}
            </blockquote>
          </section>
        )}

        {/* 02. ARCHITECTURE DU PARCOURS */}
        {config.includeRoadmap && (
          <section className="mb-12 print-break-inside-avoid">
            <div className="flex items-baseline gap-2.5 mb-4 pb-2.5 border-b border-[#e8eff1]">
              <span className="text-xs font-mono font-bold text-[#00afa9]">02.</span>
              <h2 className="text-xl font-black text-[#096475]">
                Architecture pédagogique — Parcours 5 jours
              </h2>
            </div>

            <p className="text-sm text-[#47585e] mb-5 max-w-3xl">
              Le dispositif s’est articulé autour d’une progression opérationnelle en cinq étapes, guidée par le fil rouge « Chaque expérience est unique ».
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {ROADMAP_DAYS.map((step) => (
                <div
                  key={step.day}
                  className="rounded-xl border border-[#e5ecee] bg-[#fafcfd] p-4 flex flex-col"
                >
                  <span className="text-xs font-mono font-bold text-[#008c87]">
                    {step.day}
                  </span>
                  <h3 className="text-sm font-black text-[#096475] mt-1 mb-1.5">
                    {step.title}
                  </h3>
                  <p className="text-xs text-[#52636a] leading-relaxed">{step.summary}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 03. GRAPHIQUES INTERACTIFS & ANALYSE PAR COMPÉTENCE */}
        {config.includeCharts && (
          <section className="mb-12">
            <div className="flex items-baseline gap-2.5 mb-5 pb-2.5 border-b border-[#e8eff1]">
              <span className="text-xs font-mono font-bold text-[#00afa9]">03.</span>
              <h2 className="text-xl font-black text-[#096475]">
                Visualisations interactives & analyse par compétence
              </h2>
            </div>

            {/* Chart 1 & 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
              <div className="lg:col-span-7 rounded-2xl border border-[#e5ecee] bg-white p-5">
                <ProgressionSlopeChart
                  analyses={analysis.learnerAnalyses}
                  selectedEmail={selectedEmail}
                  onSelectLearner={handleSelectLearner}
                />
              </div>

              <div className="lg:col-span-5 rounded-2xl border border-[#e5ecee] bg-white p-5">
                <ModuleComparisonChart modules={analysis.modules} />
              </div>
            </div>

            {/* Automated Module & Transfer Prose */}
            <div className="rounded-2xl border border-[#e5ecee] bg-[#f8fbfb] p-5 sm:p-6 mb-6 space-y-3 text-sm text-[#334155] leading-relaxed">
              <div>
                <h4 className="text-sm font-black text-[#096475] mb-1">
                  Analyse automatisée des piliers J1–J4
                </h4>
                <p>{analysis.moduleNarrative}</p>
              </div>
              {analysis.transferNarrative && (
                <div className="pt-3 border-t border-[#e5ecee]">
                  <h4 className="text-sm font-black text-[#096475] mb-1">
                    Transfert pratique & posture terrain
                  </h4>
                  <p>{analysis.transferNarrative}</p>
                </div>
              )}
            </div>

            {/* Chart 3 & 4 */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-6 rounded-2xl border border-[#e5ecee] bg-white p-5">
                <CalibrationQuadrantChart
                  analyses={analysis.learnerAnalyses}
                  onSelectLearner={handleSelectLearner}
                />
              </div>

              <div className="lg:col-span-6 rounded-2xl border border-[#e5ecee] bg-white p-5 flex flex-col justify-between gap-5">
                <VerdictDistributionChart
                  buckets={analysis.verdictDistribution}
                  total={analysis.total}
                  activeFilter={verdictFilter}
                  onFilterChange={setVerdictFilter}
                />

                {/* Top Remaining Axes Summary */}
                <div className="pt-4 border-t border-[#edf2f3]">
                  <h5 className="text-xs font-bold text-[#096475] mb-2">
                    Thématiques prioritaires de consolidation post-formation
                  </h5>
                  {analysis.topRemainingAxes.length > 0 ? (
                    <ul className="space-y-1.5 text-xs text-[#47585e]">
                      {analysis.topRemainingAxes.map((ax) => (
                        <li
                          key={ax.label}
                          className="flex items-center justify-between gap-3"
                        >
                          <span>{ax.label}</span>
                          <span className="font-mono font-bold text-[#096475] shrink-0">
                            {ax.count} apprenant{ax.count > 1 ? 's' : ''}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-[#6d7d83]">
                      Aucun axe critique résiduel signalé sur cette sélection.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 04. RECOMMANDATIONS MANAGÉRIALES & SUIVI J+30 */}
        {config.includeActionPlan && (
          <section className="mb-12 print-break-inside-avoid">
            <div className="flex items-baseline gap-2.5 mb-5 pb-2.5 border-b border-[#e8eff1]">
              <span className="text-xs font-mono font-bold text-[#00afa9]">04.</span>
              <h2 className="text-xl font-black text-[#096475]">
                Recommandations managériales & plan d’ancrage J+30
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {analysis.recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-[#e5ecee] bg-[#fafcfd] p-5 flex flex-col justify-between"
                >
                  <div>
                    <div
                      className={`text-xs font-bold mb-1.5 ${
                        rec.priority === 'Priorité haute'
                          ? 'text-[#c62828]'
                          : rec.priority === 'Consolidation'
                          ? 'text-[#b45309]'
                          : 'text-[#008c87]'
                      }`}
                    >
                      {rec.priority}
                    </div>
                    <h3 className="text-base font-black text-[#096475] mb-2">
                      {rec.title}
                    </h3>
                    <p className="text-xs text-[#52636a] leading-relaxed mb-3">
                      {rec.rationale}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[#e5ecee] text-xs text-[#1d2b30] leading-relaxed">
                    <strong className="text-[#096475]">Action :</strong> {rec.action}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 05. BILANS INDIVIDUELS NARRATIFS */}
        {config.includeIndividualNarratives && (
          <section>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-5 pb-2.5 border-b border-[#e8eff1]">
              <div className="flex items-baseline gap-2.5">
                <span className="text-xs font-mono font-bold text-[#00afa9]">05.</span>
                <h2 className="text-xl font-black text-[#096475]">
                  Bilans individuels narratifs ({filteredLearners.length})
                </h2>
              </div>

              {/* Filter controls (hidden on print) */}
              <div className="flex flex-wrap items-center gap-2 no-print">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[#6d7d83] absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filtrer un apprenant…"
                    className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-[#d6e1e3] focus:outline-none focus:border-[#00afa9]"
                  />
                </div>
                {verdictFilter !== 'all' && (
                  <button
                    type="button"
                    onClick={() => setVerdictFilter('all')}
                    className="px-2.5 py-1.5 text-xs font-bold rounded-lg bg-[#eef7f7] text-[#096475] cursor-pointer"
                  >
                    Tout afficher
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-6">
              {filteredLearners.map((item) => {
                const style = verdictStyle(item.verdictCategory);
                const isSelected = selectedEmail === item.emailKey;
                const obs = item.observation;
                const hasObs = Boolean(
                  obs.participation || obs.forces || obs.axes || obs.engagement || obs.global
                );

                return (
                  <article
                    key={item.emailKey}
                    ref={(el) => {
                      learnerRefs.current[item.emailKey] = el;
                    }}
                    className={`rounded-2xl border p-6 transition-colors print-break-inside-avoid ${
                      isSelected
                        ? 'border-[#00afa9] bg-[#fcffff]'
                        : 'border-[#e1e9eb] bg-white'
                    }`}
                  >
                    {/* Header Row */}
                    <div className="flex flex-wrap items-start justify-between gap-4 pb-4 mb-5 border-b border-[#edf2f3]">
                      <div>
                        <h3 className="text-lg font-black text-[#096475]">
                          {item.learner.name || '—'}
                        </h3>
                        <div className="text-xs text-[#6d7d83] mt-0.5">
                          {item.learner.email || '—'} · {item.learner.wave || 'Sans vague'} ·{' '}
                          {item.learner.seniority || 'Ancienneté N/C'} · Langues :{' '}
                          {item.learner.langues || '—'}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md border text-xs font-bold ${style.bg} ${style.border} ${style.text}`}
                        >
                          {style.icon}
                          {item.learner.verdict || 'Évaluation'}
                        </span>
                        <span className="text-[11px] font-semibold text-[#6d7d83]">
                          {item.trajectoryTag}
                        </span>
                      </div>
                    </div>

                    {/* Numeric Summary Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                      <div className="rounded-xl bg-[#f6f9fa] p-3">
                        <div className="text-[11px] text-[#6d7d83] font-semibold">Pré-quiz</div>
                        <div className="text-xl font-black text-[#1d2b30] font-mono tabular-nums">
                          {item.hasPre ? `${item.prePct}%` : '—'}
                        </div>
                        <div className="text-[11px] text-[#6d7d83]">
                          Auto-éval : {item.hasSelfEval ? `${item.selfEvalPct}%` : '—'}
                        </div>
                      </div>

                      <div className="rounded-xl bg-[#f6f9fa] p-3">
                        <div className="text-[11px] text-[#6d7d83] font-semibold">Quiz final</div>
                        <div className="text-xl font-black text-[#096475] font-mono tabular-nums">
                          {item.hasPost ? `${item.postPct}%` : '—'}
                        </div>
                        <div className="text-[11px] text-[#6d7d83]">Seuil requis : 60%</div>
                      </div>

                      <div className="rounded-xl bg-[#f6f9fa] p-3">
                        <div className="text-[11px] text-[#6d7d83] font-semibold">Progression</div>
                        <div
                          className={`text-xl font-black font-mono tabular-nums ${
                            item.progression >= 0 ? 'text-[#008c87]' : 'text-[#c62828]'
                          }`}
                        >
                          {item.hasPre && item.hasPost
                            ? `${item.progression >= 0 ? '+' : ''}${item.progression} pts`
                            : '—'}
                        </div>
                        <div className="text-[11px] text-[#6d7d83] truncate">
                          {item.calibrationLabel}
                        </div>
                      </div>

                      <div className="rounded-xl bg-[#f6f9fa] p-3">
                        <div className="text-[11px] text-[#6d7d83] font-semibold">
                          Simulation d’appel
                        </div>
                        <div className="text-xl font-black text-[#b45309] font-mono tabular-nums">
                          {item.hasSim ? `${item.simPct}%` : '—'}
                        </div>
                        <div className="text-[11px] text-[#6d7d83] truncate">
                          {item.learner.sim_verdict || 'Non renseignée'}
                        </div>
                      </div>
                    </div>

                    {/* Per-Module Mini Progress Bars (J1-J4) */}
                    {item.moduleScores.some((m) => m.postPct !== null) && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                        {item.moduleScores.map((m) => (
                          <div
                            key={m.key}
                            className="rounded-lg border border-[#edf2f3] p-2.5 bg-[#fcfdfe]"
                          >
                            <div className="flex items-center justify-between text-[11px] font-bold text-[#47585e] mb-1">
                              <span>{m.title}</span>
                              <span className="font-mono text-[#096475]">
                                {m.postPct !== null ? `${m.postPct}%` : '—'}
                              </span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-[#e8eff1] overflow-hidden">
                              <div
                                className="h-full rounded-full bg-[#00afa9]"
                                style={{ width: `${m.postPct ?? 0}%` }}
                              />
                            </div>
                            <div className="flex items-center justify-between text-[10px] font-mono text-[#6d7d83] mt-1">
                              <span>{m.preRaw || '—'}</span>
                              <span>→ {m.postRaw || '—'}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Automated Narrative Analysis */}
                    <div className="space-y-2.5 text-sm text-[#334155] leading-relaxed">
                      <p>{item.automatedSummary}</p>
                      <p className="text-xs font-semibold text-[#096475] bg-[#f3f9f9] rounded-lg px-3.5 py-2.5 border border-[#dcecec]">
                        Suite opérationnelle recommandée :{' '}
                        <span className="font-normal text-[#1d2b30]">
                          {item.operationalAdvice}
                        </span>
                      </p>
                    </div>

                    {/* Quiz Axes */}
                    {(item.preAxes.length > 0 || item.finalAxes.length > 0) && (
                      <div className="mt-4 pt-4 border-t border-[#edf2f3] grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        {item.preAxes.length > 0 && (
                          <div>
                            <div className="font-bold text-[#6d7d83] mb-1">
                              Axes détectés au pré-quiz
                            </div>
                            <ul className="list-disc pl-4 space-y-0.5 text-[#47585e]">
                              {item.preAxes.map((ax, idx) => (
                                <li key={idx}>{ax}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {item.finalAxes.length > 0 && (
                          <div>
                            <div className="font-bold text-[#096475] mb-1">
                              Axes résiduels post-formation
                            </div>
                            <ul className="list-disc pl-4 space-y-0.5 text-[#1d2b30]">
                              {item.finalAxes.map((ax, idx) => (
                                <li key={idx}>{ax}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Trainer Observations */}
                    {hasObs && (
                      <div className="mt-4 pt-4 border-t border-[#edf2f3]">
                        <div className="text-xs font-black text-[#096475] mb-2.5">
                          Observations terrain du formateur
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-[#334155]">
                          {obs.participation && (
                            <div className="rounded-lg bg-[#fafcfd] border border-[#edf2f3] p-3">
                              <div className="font-bold text-[#47585e] mb-0.5">Participation</div>
                              <p>{obs.participation}</p>
                            </div>
                          )}
                          {obs.forces && (
                            <div className="rounded-lg bg-[#f4faf9] border border-[#dceeed] p-3">
                              <div className="font-bold text-[#096475] mb-0.5">Points forts</div>
                              <p>{obs.forces}</p>
                            </div>
                          )}
                          {obs.axes && (
                            <div className="rounded-lg bg-[#fffbf2] border border-[#f5e7c2] p-3">
                              <div className="font-bold text-[#9a5400] mb-0.5">
                                Axes à travailler
                              </div>
                              <p>{obs.axes}</p>
                            </div>
                          )}
                          {obs.engagement && (
                            <div className="rounded-lg bg-[#fafcfd] border border-[#edf2f3] p-3">
                              <div className="font-bold text-[#47585e] mb-0.5">
                                Engagement final
                              </div>
                              <p>{obs.engagement}</p>
                            </div>
                          )}
                          {obs.global && (
                            <div className="md:col-span-2 rounded-lg bg-[#f6f9fa] border border-[#e1e9eb] p-3">
                              <div className="font-bold text-[#096475] mb-0.5">
                                Synthèse formateur
                              </div>
                              <p>{obs.global}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-[#e1e9eb] flex flex-wrap items-center justify-between gap-2 text-xs text-[#6d7d83]">
          <span>Connecteo · Chaque expérience est unique</span>
          <span>Rapport généré automatiquement · {today}</span>
        </footer>
      </div>
    </div>
  );
};
