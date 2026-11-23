export type TabId = 'import' | 'learners' | 'observations' | 'report';

export interface Learner {
  name?: string;
  email?: string;
  wave?: string;
  seniority?: string;
  deja_formation_rc?: string;
  niveau_recouvrement_pct?: string | number;
  langues?: string;
  pre_score_pct?: string | number;
  pre_score_j1?: string;
  pre_score_j2?: string;
  pre_score_j3?: string;
  pre_score_j4?: string;
  pre_axes?: string;
  score_pct?: string | number;
  score_j1?: string;
  score_j2?: string;
  score_j3?: string;
  score_j4?: string;
  verdict?: string;
  axes_amelioration?: string;
  sim_score_pct?: string | number;
  sim_verdict?: string;
  [key: string]: unknown;
}

export interface Observation {
  participation?: string;
  forces?: string;
  axes?: string;
  engagement?: string;
  global?: string;
}

export type ObservationsMap = Record<string, Observation>;

export interface ReportConfig {
  reportTitle: string;
  clientName: string;
  facilitator: string;
  programTag: string;
  customIntro: string;
  includeExecutiveNarrative: boolean;
  includeRoadmap: boolean;
  includeCharts: boolean;
  includeModuleAnalysis: boolean;
  includeActionPlan: boolean;
  includeIndividualNarratives: boolean;
}

export interface ModuleMetric {
  key: 'j1' | 'j2' | 'j3' | 'j4';
  dayLabel: string;
  title: string;
  shortTitle: string;
  description: string;
  prePct: number;
  postPct: number;
  delta: number;
  preCount: number;
  postCount: number;
}

export interface LearnerModuleScore {
  key: 'j1' | 'j2' | 'j3' | 'j4';
  title: string;
  prePct: number | null;
  postPct: number | null;
  preRaw: string;
  postRaw: string;
  delta: number | null;
}

export type VerdictCategory = 'expert' | 'maitrise' | 'consolidation' | 'renforcer' | 'pending';

export interface LearnerAnalysis {
  learner: Learner;
  emailKey: string;
  prePct: number;
  postPct: number;
  simPct: number;
  selfEvalPct: number;
  progression: number;
  hasPre: boolean;
  hasPost: boolean;
  hasSim: boolean;
  hasSelfEval: boolean;
  calibrationGap: number | null;
  calibrationLabel: string;
  trajectoryTag: string;
  verdictCategory: VerdictCategory;
  moduleScores: LearnerModuleScore[];
  strongestModule: LearnerModuleScore | null;
  focusModule: LearnerModuleScore | null;
  preAxes: string[];
  finalAxes: string[];
  resolvedAxesCount: number;
  observation: Observation;
  automatedSummary: string;
  operationalAdvice: string;
}

export interface VerdictBucket {
  category: VerdictCategory;
  label: string;
  count: number;
  percentage: number;
  color: string;
}

export interface CohortRecommendation {
  priority: 'Planification J5' | 'Priorité haute' | 'Consolidation' | 'Accompagnement';
  title: string;
  rationale: string;
  action: string;
}

export interface CohortAnalysis {
  total: number;
  preAvg: number;
  postAvg: number;
  simAvg: number;
  selfEvalAvg: number;
  progression: number;
  passedCount: number;
  withFinalCount: number;
  withPreCount: number;
  withSimCount: number;
  validationRate: number;
  excellenceCount: number;
  excellenceRate: number;
  minPost: number;
  maxPost: number;
  medianPost: number;
  spreadPost: number;
  priorTrainingCount: number;
  priorTrainingRate: number;
  calibrationGapAvg: number | null;
  modules: ModuleMetric[];
  strongestModule: ModuleMetric | null;
  biggestGainModule: ModuleMetric | null;
  reinforcementModule: ModuleMetric | null;
  verdictDistribution: VerdictBucket[];
  topRemainingAxes: Array<{ label: string; count: number }>;
  topInitialAxes: Array<{ label: string; count: number }>;
  learnerAnalyses: LearnerAnalysis[];
  executiveHeadline: string;
  executiveNarrative: string[];
  moduleNarrative: string;
  transferNarrative: string;
  pullQuote: string;
  recommendations: CohortRecommendation[];
}
