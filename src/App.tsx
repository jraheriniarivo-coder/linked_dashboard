import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Edit3, FileBarChart2, FileUp, Filter, Users } from 'lucide-react';
import { ImportView } from './components/ImportView';
import { LearnersView } from './components/LearnersView';
import { ObservationsView } from './components/ObservationsView';
import { ReportView } from './components/ReportView';
import { DEMO_LEARNERS, DEMO_OBSERVATIONS } from './data/demoLearners';
import {
  Learner,
  Observation,
  ObservationsMap,
  ReportConfig,
  TabId,
} from './types/dashboard';
import { buildStandaloneReportHtml } from './utils/exportReportHtml';
import { analyzeCohort } from './utils/reportAnalytics';

const STORAGE_KEY = 'connecteo_dashboard_v1';
const OBS_KEY = `${STORAGE_KEY}_obs`;
const WAVE_KEY = `${STORAGE_KEY}_wave`;
const CONFIG_KEY = `${STORAGE_KEY}_report_cfg`;
const INIT_KEY = `${STORAGE_KEY}_initialized`;
const HUB_RETURN_KEY = 'connecteo_hub_return_url';

function resolveHubReturnUrl(): string {
  try {
    if (typeof window === 'undefined') return '../index.html';
    const ref = document.referrer;
    if (ref) {
      const refUrl = new URL(ref);
      const currentPath = window.location.pathname
        .toLowerCase()
        .replace(/\/index\.html$/, '/');
      const refPath = refUrl.pathname
        .toLowerCase()
        .replace(/\/index\.html$/, '/');
      if (refUrl.origin === window.location.origin && refPath !== currentPath) {
        sessionStorage.setItem(HUB_RETURN_KEY, ref);
        return ref;
      }
    }
    const stored = sessionStorage.getItem(HUB_RETURN_KEY);
    if (stored) return stored;
  } catch {
    // Ignore URL or sessionStorage access errors
  }
  return '../index.html';
}

const DEFAULT_REPORT_CONFIG: ReportConfig = {
  reportTitle: 'Formation Recouvrement — Bilan 5 jours',
  clientName: '',
  facilitator: 'Joatina Dylan RAHERINIARIVO',
  programTag: 'Connecteo 2026 · Parcours Opérationnel',
  customIntro: '',
  includeExecutiveNarrative: true,
  includeRoadmap: true,
  includeCharts: true,
  includeModuleAnalysis: true,
  includeActionPlan: true,
  includeIndividualNarratives: true,
};

function readJsonStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [learners, setLearners] = useState<Learner[]>(() => {
    const existing = readJsonStorage<Learner[]>(STORAGE_KEY, []);
    if (Array.isArray(existing) && existing.length > 0) return existing;
    if (!localStorage.getItem(INIT_KEY)) {
      localStorage.setItem(INIT_KEY, '1');
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_LEARNERS));
      localStorage.setItem(OBS_KEY, JSON.stringify(DEMO_OBSERVATIONS));
      return DEMO_LEARNERS;
    }
    return [];
  });

  const [observations, setObservations] = useState<ObservationsMap>(() => {
    const existing = readJsonStorage<ObservationsMap>(OBS_KEY, {});
    return existing && typeof existing === 'object' && !Array.isArray(existing)
      ? existing
      : {};
  });

  const [waveFilter, setWaveFilter] = useState<string>(
    () => localStorage.getItem(WAVE_KEY) || 'all'
  );

  const [reportConfig, setReportConfig] = useState<ReportConfig>(() => {
    const saved = readJsonStorage<Partial<ReportConfig>>(CONFIG_KEY, {});
    const merged = { ...DEFAULT_REPORT_CONFIG, ...saved };
    if (merged.programTag === 'Connecteo 2026 · Parcours Certifiant') {
      merged.programTag = DEFAULT_REPORT_CONFIG.programTag;
    }
    return merged;
  });

  const [activeTab, setActiveTab] = useState<TabId>('report');
  const [focusedEmail, setFocusedEmail] = useState<string | null>(null);
  const [hubReturnUrl] = useState<string>(() => resolveHubReturnUrl());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(learners));
  }, [learners]);

  useEffect(() => {
    localStorage.setItem(OBS_KEY, JSON.stringify(observations));
  }, [observations]);

  useEffect(() => {
    localStorage.setItem(WAVE_KEY, waveFilter);
  }, [waveFilter]);

  useEffect(() => {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(reportConfig));
  }, [reportConfig]);

  const waves = useMemo(() => {
    return [...new Set(learners.map((l) => l.wave).filter((w): w is string => Boolean(w)))].sort();
  }, [learners]);

  const hasNoWave = useMemo(() => learners.some((l) => !l.wave), [learners]);

  const effectiveWave = useMemo(() => {
    if (waveFilter === 'all') return 'all';
    if (waveFilter === '__none') return hasNoWave ? '__none' : 'all';
    return waves.includes(waveFilter) ? waveFilter : 'all';
  }, [waveFilter, waves, hasNoWave]);

  const filteredLearners = useMemo(() => {
    if (effectiveWave === 'all') return learners;
    if (effectiveWave === '__none') return learners.filter((l) => !l.wave);
    return learners.filter((l) => l.wave === effectiveWave);
  }, [learners, effectiveWave]);

  const groupLabel = useMemo(() => {
    if (effectiveWave === 'all') return 'Toutes les vagues';
    if (effectiveWave === '__none') return 'Sans vague';
    return effectiveWave;
  }, [effectiveWave]);

  const cohortAnalysis = useMemo(
    () =>
      analyzeCohort(
        filteredLearners,
        observations,
        effectiveWave === 'all' ? undefined : groupLabel
      ),
    [filteredLearners, observations, effectiveWave, groupLabel]
  );

  const handleImport = (items: Learner[]) => {
    let added = 0;
    let updated = 0;
    setLearners((prev) => {
      const next = [...prev];
      items.forEach((item) => {
        if (!item.email) {
          next.push(item);
          added++;
          return;
        }
        const idx = next.findIndex(
          (l) => l.email && l.email.toLowerCase() === item.email!.toLowerCase()
        );
        if (idx >= 0) {
          next[idx] = { ...next[idx], ...item };
          updated++;
        } else {
          next.push(item);
          added++;
        }
      });
      return next;
    });
    localStorage.setItem(INIT_KEY, '1');
    return { added, updated };
  };

  const handleLoadDemo = () => {
    localStorage.setItem(INIT_KEY, '1');
    handleImport(DEMO_LEARNERS);
    setObservations((prev) => ({ ...DEMO_OBSERVATIONS, ...prev }));
  };

  const handleClearAll = () => {
    localStorage.setItem(INIT_KEY, '1');
    setLearners([]);
    setObservations({});
    setWaveFilter('all');
  };

  const handleUpdateObservation = (
    email: string,
    field: keyof Observation,
    value: string
  ) => {
    setObservations((prev) => ({
      ...prev,
      [email]: {
        ...(prev[email] || {}),
        [field]: value,
      },
    }));
  };

  const handleExportJSON = () => {
    const blob = new Blob(
      [JSON.stringify({ learners, observations }, null, 2)],
      { type: 'application/json' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard_export_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const headers = [
      'Nom',
      'Email',
      'Vague',
      'Ancienneté',
      'Formation RC',
      'Niveau initial (%)',
      'Langues',
      'Pré-quiz (%)',
      'Pré J1',
      'Pré J2',
      'Pré J3',
      'Pré J4',
      'Quiz final (%)',
      'Final J1',
      'Final J2',
      'Final J3',
      'Final J4',
      'Verdict',
      'Axes',
      'Simulation (%)',
      'Simulation verdict',
      'Observation',
    ];
    const rows = filteredLearners.map((l) => {
      const o = (l.email && observations[l.email]) || {};
      return [
        l.name || '',
        l.email || '',
        l.wave || '',
        l.seniority || '',
        l.deja_formation_rc || '',
        l.niveau_recouvrement_pct || '',
        l.langues || '',
        l.pre_score_pct || '',
        l.pre_score_j1 || '',
        l.pre_score_j2 || '',
        l.pre_score_j3 || '',
        l.pre_score_j4 || '',
        l.score_pct || '',
        l.score_j1 || '',
        l.score_j2 || '',
        l.score_j3 || '',
        l.score_j4 || '',
        l.verdict || '',
        (l.axes_amelioration || '').replace(/,/g, ';'),
        l.sim_score_pct || '',
        l.sim_verdict || '',
        (o.global || '').replace(/\n/g, ' ').replace(/,/g, ';'),
      ];
    });
    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard_export_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadReportHtml = () => {
    const todayLabel = new Date().toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const html = buildStandaloneReportHtml(
      cohortAnalysis,
      reportConfig,
      groupLabel,
      todayLabel
    );
    const suffix =
      effectiveWave === 'all'
        ? ''
        : `_${groupLabel.replace(/\s+/g, '_').toLowerCase()}`;
    const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport_formation_connecteo${suffix}_${new Date()
      .toISOString()
      .slice(0, 10)}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const tabs: Array<{ id: TabId; label: string; icon: typeof FileUp }> = [
    { id: 'import', label: 'Import', icon: FileUp },
    { id: 'learners', label: 'Apprenants', icon: Users },
    { id: 'observations', label: 'Observations', icon: Edit3 },
    { id: 'report', label: 'Rapport client', icon: FileBarChart2 },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Unified Top Bar (3-zone layout, hidden on print) */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-[#064552] via-[#096475] to-[#00afa9] text-white shadow-sm no-print">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-3 flex items-center justify-between gap-6">
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="connecteo-navbar-logo" role="img" aria-label="Connecteo" />
            <span className="hidden xl:inline-block text-sm font-bold text-white/90 whitespace-nowrap border-l border-white/25 pl-4">
              Tableau de bord formateur
            </span>
          </div>

          {/* Zone 2: Clean Single-Line Navigation */}
          <nav
            aria-label="Navigation principale"
            className="hidden md:flex items-center gap-1 bg-white/10 p-1 rounded-xl border border-white/15"
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-white text-[#096475]'
                      : 'text-white/90 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Back to Hub (index.html) */}
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={hubReturnUrl}
              title="Retour vers le Hub Connecteo (index.html)"
              aria-label="Retour vers index.html"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white text-[#096475] text-xs sm:text-sm font-bold hover:bg-[#eef9f9] transition-colors whitespace-nowrap shrink-0 shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour Hub</span>
            </a>
          </div>
        </div>

        {/* Mobile Tab Strip */}
        <div className="md:hidden border-t border-white/15 px-3 py-2 flex items-center gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive ? 'bg-white text-[#096475]' : 'text-white/85'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-8 py-6 sm:py-8">
        {/* Wave Filter Bar (shown on Learners, Observations, Report; hidden on print) */}
        {activeTab !== 'import' && (
          <div className="bg-white border border-[#e1e9eb] rounded-xl px-4 py-3 mb-6 flex flex-wrap items-center justify-between gap-3 no-print">
            <div className="flex flex-wrap items-center gap-3">
              <label
                htmlFor="wave-select"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#096475]"
              >
                <Filter className="w-3.5 h-3.5 text-[#00afa9]" />
                Groupe / vague
              </label>
              <select
                id="wave-select"
                value={effectiveWave}
                onChange={(e) => setWaveFilter(e.target.value)}
                className="px-3 py-1.5 text-sm font-semibold text-[#1d2b30] rounded-lg border border-[#d6e1e3] bg-[#fafcfd] focus:outline-none focus:border-[#00afa9]"
              >
                <option value="all">Toutes les vagues ({learners.length})</option>
                {waves.map((w) => (
                  <option key={w} value={w}>
                    {w} ({learners.filter((l) => l.wave === w).length})
                  </option>
                ))}
                {hasNoWave && (
                  <option value="__none">
                    Sans vague ({learners.filter((l) => !l.wave).length})
                  </option>
                )}
              </select>
            </div>

            <div className="text-xs font-semibold text-[#6d7d83] font-mono tabular-nums">
              {filteredLearners.length} apprenant{filteredLearners.length > 1 ? 's' : ''} affiché
              {filteredLearners.length > 1 ? 's' : ''}
            </div>
          </div>
        )}

        {activeTab === 'import' && (
          <ImportView
            learnersCount={learners.length}
            onImport={handleImport}
            onLoadDemo={handleLoadDemo}
            onClearAll={handleClearAll}
            onExportJSON={handleExportJSON}
            onExportCSV={handleExportCSV}
            onGoToReport={() => setActiveTab('report')}
          />
        )}

        {activeTab === 'learners' && (
          <LearnersView
            analyses={cohortAnalysis.learnerAnalyses}
            preAvg={cohortAnalysis.preAvg}
            postAvg={cohortAnalysis.postAvg}
            progression={cohortAnalysis.progression}
            onEditObservation={(emailKey) => {
              setFocusedEmail(emailKey);
              setActiveTab('observations');
            }}
            onGoToImport={() => setActiveTab('import')}
          />
        )}

        {activeTab === 'observations' && (
          <ObservationsView
            analyses={cohortAnalysis.learnerAnalyses}
            focusedEmail={focusedEmail}
            onUpdateObservation={handleUpdateObservation}
          />
        )}

        {activeTab === 'report' && (
          <ReportView
            analysis={cohortAnalysis}
            groupLabel={groupLabel}
            config={reportConfig}
            onUpdateConfig={(patch) =>
              setReportConfig((prev) => ({ ...prev, ...patch }))
            }
            onDownloadHtml={handleDownloadReportHtml}
            onLoadDemo={handleLoadDemo}
          />
        )}
      </main>
    </div>
  );
}
