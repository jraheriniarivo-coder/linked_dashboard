import {
  CohortAnalysis,
  CohortRecommendation,
  Learner,
  LearnerAnalysis,
  LearnerModuleScore,
  ModuleMetric,
  ObservationsMap,
  VerdictBucket,
  VerdictCategory,
} from '../types/dashboard';

export const TRAINING_MODULES: Array<{
  key: 'j1' | 'j2' | 'j3' | 'j4';
  dayLabel: string;
  title: string;
  shortTitle: string;
  description: string;
}> = [
  {
    key: 'j1',
    dayLabel: 'Jour 1',
    title: 'Relation Client & Valeur',
    shortTitle: 'J1 · Relation Client',
    description:
      'Fondations de l’expérience client, acteurs, missions, enjeux économiques et articulation satisfaction / fidélisation.',
  },
  {
    key: 'j2',
    dayLabel: 'Jour 2',
    title: 'Communication Interpersonnelle',
    shortTitle: 'J2 · Communication',
    description:
      'Maîtrise du verbal et non-verbal, posture vocale au téléphone, référentiel DIVA, écoute active et comportements d’excellence.',
  },
  {
    key: 'j3',
    dayLabel: 'Jour 3',
    title: 'Techniques de Recouvrement',
    shortTitle: 'J3 · Recouvrement',
    description:
      'Cadre légal et déontologique, typologie des débiteurs, conduite d’appel en 7 temps et négociation ferme orientée engagement.',
  },
  {
    key: 'j4',
    dayLabel: 'Jour 4',
    title: 'Situations Complexes & Conflits',
    shortTitle: 'J4 · Situations Complexes',
    description:
      'Analyse des causes d’escalade, méthode FOS, techniques de désamorçage émotionnel et protocole des 5 R.',
  },
];

export function toNumber(v: unknown): number {
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
  if (typeof v === 'string') {
    const cleaned = v.replace('%', '').replace(',', '.').trim();
    const parsed = parseFloat(cleaned);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

export function parseFractionPct(raw?: string): number | null {
  if (!raw || typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const slashMatch = trimmed.match(/^(\d+(?:[.,]\d+)?)\s*\/\s*(\d+(?:[.,]\d+)?)$/);
  if (slashMatch) {
    const num = parseFloat(slashMatch[1].replace(',', '.'));
    const den = parseFloat(slashMatch[2].replace(',', '.'));
    if (den > 0) return Math.round((num / den) * 100);
  }
  const numOnly = parseFloat(trimmed.replace('%', '').replace(',', '.'));
  if (Number.isFinite(numOnly) && numOnly >= 0 && numOnly <= 100) {
    return Math.round(numOnly);
  }
  return null;
}

export function getVerdictCategory(
  verdict?: string,
  postPct = 0,
  hasPost = true,
  hasSim = true
): VerdictCategory {
  const v = (verdict || '').toLowerCase();
  if (v.includes('attente') || v.includes('absent') || v.includes('reprise') || v.includes('finaliser')) {
    return 'pending';
  }
  if (v.includes('expert')) return 'expert';
  if (v.includes('maîtrise') || v.includes('maitrise') || v.includes('avancé') || v.includes('avance') || v.includes('acquis')) {
    if (v.includes('non acquis')) return 'renforcer';
    return 'maitrise';
  }
  if (v.includes('consolidation') || v.includes('cours') || v.includes('intermédiaire') || v.includes('intermediaire')) {
    return 'consolidation';
  }
  if (v.includes('renforcer') || v.includes('débutant') || v.includes('debutant') || v.includes('non acquis')) {
    return 'renforcer';
  }
  if (!hasPost && !hasSim) return 'pending';
  if (postPct >= 85) return 'expert';
  if (postPct >= 75) return 'maitrise';
  if (postPct >= 60) return 'consolidation';
  return 'renforcer';
}

export function splitAxes(raw?: string): string[] {
  if (!raw) return [];
  return raw
    .split('|')
    .map((s) => s.trim())
    .filter(Boolean);
}

function median(values: number[]): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

function avg(values: number[]): number {
  if (!values.length) return 0;
  return Math.round(values.reduce((acc, n) => acc + n, 0) / values.length);
}

export function analyzeLearner(learner: Learner, observations: ObservationsMap): LearnerAnalysis {
  const emailKey = (learner.email || learner.name || '').toLowerCase();
  const obs =
    (learner.email && observations[learner.email]) ||
    (emailKey && observations[emailKey]) ||
    {};

  const prePct = toNumber(learner.pre_score_pct);
  const postPct = toNumber(learner.score_pct);
  const simPct = toNumber(learner.sim_score_pct);
  const selfEvalPct = toNumber(learner.niveau_recouvrement_pct);

  const hasPre = prePct > 0;
  const hasPost = postPct > 0;
  const hasSim = simPct > 0;
  const hasSelfEval = selfEvalPct > 0;

  const progression = hasPre && hasPost ? Math.round(postPct - prePct) : 0;
  const calibrationGap = hasSelfEval && hasPre ? Math.round(selfEvalPct - prePct) : null;

  let calibrationLabel = 'Calibration non renseignée';
  if (calibrationGap !== null) {
    if (Math.abs(calibrationGap) <= 8) {
      calibrationLabel = 'Auto-évaluation lucide et réaliste';
    } else if (calibrationGap > 8) {
      calibrationLabel = `Surestimation initiale (+${calibrationGap} pts vs pré-quiz)`;
    } else {
      calibrationLabel = `Sous-estimation initiale (${calibrationGap} pts vs pré-quiz)`;
    }
  }

  let trajectoryTag = 'Quiz final & évaluation en attente';
  if (hasPre && hasPost) {
    if (progression >= 22) trajectoryTag = 'Progression accélérée';
    else if (progression >= 12) trajectoryTag = 'Montée en compétence solide';
    else if (progression >= 5 && postPct >= 80) trajectoryTag = 'Consolidation vers l’excellence';
    else if (progression >= 1) trajectoryTag = 'Progression régulière';
    else if (progression === 0 && postPct >= 80) trajectoryTag = 'Acquis élevés maintenus';
    else trajectoryTag = 'Vigilance pédagogique';
  } else if (hasPost) {
    trajectoryTag = 'Évaluation finale complétée';
  }

  const moduleScores: LearnerModuleScore[] = TRAINING_MODULES.map((mod) => {
    const preRaw = (learner[`pre_score_${mod.key}`] as string) || '';
    const postRaw = (learner[`score_${mod.key}`] as string) || '';
    const mPre = parseFractionPct(preRaw);
    const mPost = parseFractionPct(postRaw);
    return {
      key: mod.key,
      title: mod.shortTitle,
      prePct: mPre,
      postPct: mPost,
      preRaw,
      postRaw,
      delta: mPre !== null && mPost !== null ? mPost - mPre : null,
    };
  });

  const validPostModules = moduleScores.filter((m) => m.postPct !== null);
  const strongestModule = validPostModules.length
    ? [...validPostModules].sort((a, b) => (b.postPct ?? 0) - (a.postPct ?? 0))[0]
    : null;
  const focusModule = validPostModules.length
    ? [...validPostModules].sort((a, b) => (a.postPct ?? 0) - (b.postPct ?? 0))[0]
    : null;

  const preAxes = splitAxes(learner.pre_axes);
  const finalAxes = splitAxes(learner.axes_amelioration);
  const resolvedAxesCount = Math.max(0, preAxes.length - finalAxes.length);

  const verdictCategory = getVerdictCategory(learner.verdict, postPct, hasPost, hasSim);
  const name = learner.name || 'Cet apprenant';
  const seniorityTxt = learner.seniority ? `avec une ancienneté de ${learner.seniority.toLowerCase()}` : '';
  const priorTxt =
    learner.deja_formation_rc === 'Oui'
      ? 'ayant déjà suivi une formation relation client par le passé'
      : learner.deja_formation_rc === 'Non'
      ? 'formé(e) jusqu’ici par la pratique terrain sans cursus RC formalisé'
      : '';

  const introFragments = [seniorityTxt, priorTxt].filter(Boolean).join(' et ');

  let narrativeParts: string[] = [];

  if (verdictCategory === 'pending') {
    narrativeParts.push(
      `${name}${introFragments ? ` (${introFragments})` : ''} — déjà actif(ve) en production sur la campagne de recouvrement — n’a pas encore pu passer le quiz final ni l’évaluation pratique de fin de parcours${
        hasPre
          ? ` (niveau initial mesuré au pré-quiz à ${prePct}%${hasSelfEval ? `, auto-évaluation à ${selfEvalPct}%` : ''})`
          : ''
      }. Sa session de rattrapage est prévue lorsque le deuxième groupe atteindra le dernier jour de formation afin de finaliser son parcours en bonne et due forme.`
    );
  } else if (hasPre && hasPost) {
    const calibrationNote =
      calibrationGap !== null
        ? calibrationGap > 10
          ? ` Son auto-évaluation initiale (${selfEvalPct}%) surestimait ses réflexes théoriques face au pré-quiz (${prePct}%), un écart que ce renforcement a permis d’objectiver sur les fondamentaux.`
          : calibrationGap < -10
          ? ` Sous-estimant ses acquis au départ (${selfEvalPct}% perçus pour ${prePct}% mesurés), ce bilan confirme de solides réflexes déjà ancrés en production.`
          : ` Son positionnement initial (${selfEvalPct}% estimés pour ${prePct}% mesurés) traduisait déjà une bonne lucidité sur son niveau réel en campagne.`
        : '';

    narrativeParts.push(
      `${name}${introFragments ? ` (${introFragments})` : ''} démarre ce renforcement à ${prePct}% et atteint ${postPct}% à l’évaluation finale, enregistrant une évolution de ${progression >= 0 ? '+' : ''}${progression} points.${calibrationNote}`
    );
  } else if (hasPost) {
    narrativeParts.push(
      `${name}${introFragments ? ` (${introFragments})` : ''} obtient un score de ${postPct}% à l’évaluation finale de ce parcours de renforcement.`
    );
  }

  if (verdictCategory !== 'pending' && strongestModule && focusModule && strongestModule.key !== focusModule.key) {
    narrativeParts.push(
      `L’analyse par pilier met en évidence une maîtrise particulière sur « ${strongestModule.title} » (${strongestModule.postPct}%${
        strongestModule.delta !== null ? `, soit ${strongestModule.delta >= 0 ? '+' : ''}${strongestModule.delta} pts` : ''
      }), tandis que « ${focusModule.title} » (${focusModule.postPct}%) constitue la principale marge de consolidation en activité.`
    );
  }

  if (hasSim) {
    const theoryPracticeGap = hasPost ? Math.round(simPct - postPct) : 0;
    if (simPct >= 80) {
      narrativeParts.push(
        `En simulation d’appel (${simPct}%${learner.sim_verdict ? ` — ${learner.sim_verdict}` : ''}), la transposition des méthodes structurées dans sa pratique quotidienne de recouvrement est pleinement confirmée.`
      );
    } else if (simPct >= 60) {
      narrativeParts.push(
        `La mise en situation pratique (${simPct}%${learner.sim_verdict ? ` — ${learner.sim_verdict}` : ''}) montre une appropriation fonctionnelle${
          theoryPracticeGap < -8
            ? ', légèrement en retrait par rapport aux acquis théoriques, invitant à surveiller les automatismes vocaux en production'
            : ', cohérente avec son niveau d’aisance sur le terrain'
        }.`
      );
    } else {
      narrativeParts.push(
        `Le score en simulation (${simPct}%${learner.sim_verdict ? ` — ${learner.sim_verdict}` : ''}) indique que certains réflexes ancrés sur le terrain méritent d’être recalibrés en production via un coaching vocal ciblé.`
      );
    }
  }

  let operationalAdvice = '';
  if (verdictCategory === 'pending') {
    operationalAdvice =
      'Parcours à finaliser : intégrer ce conseiller à la dernière journée du Groupe 2 pour passer le quiz final et l’évaluation pratique, tout en poursuivant son activité habituelle sur le plateau.';
  } else if (verdictCategory === 'expert') {
    operationalAdvice =
      'Maîtrise confirmée en production : capitaliser sur son expérience campagne en le mobilisant comme référent ou binôme lors des sessions d’écoute croisée entre pairs.';
  } else if (verdictCategory === 'maitrise') {
    operationalAdvice = finalAxes.length
      ? `Acquis consolidés sur le poste : maintenir le niveau de performance en activité avec un point de calibrage à J+15 sur : ${finalAxes[0].toLowerCase()}.`
      : 'Acquis consolidés sur le poste : poursuivre l’activité en veillant à la régularité des engagements de paiement et à la rigueur du discours.';
  } else if (verdictCategory === 'consolidation') {
    operationalAdvice =
      'Renforcement à poursuivre en production : programmer un débriefing hebdomadaire sur 2 appels réels enregistrés durant 3 semaines afin de sécuriser les automatismes.';
  } else {
    operationalAdvice =
      'Recalibrage terrain prioritaire : planifier des séances de double écoute sur appels de production (structure 7 temps / méthode FOS) et un point de contrôle à J+15.';
  }

  return {
    learner,
    emailKey,
    prePct,
    postPct,
    simPct,
    selfEvalPct,
    progression,
    hasPre,
    hasPost,
    hasSim,
    hasSelfEval,
    calibrationGap,
    calibrationLabel,
    trajectoryTag,
    verdictCategory,
    moduleScores,
    strongestModule,
    focusModule,
    preAxes,
    finalAxes,
    resolvedAxesCount,
    observation: obs,
    automatedSummary: narrativeParts.join(' '),
    operationalAdvice,
  };
}

export function analyzeCohort(
  learners: Learner[],
  observations: ObservationsMap,
  groupLabel?: string
): CohortAnalysis {
  const learnerAnalyses = learners.map((l) => analyzeLearner(l, observations));

  const preVals = learnerAnalyses.filter((a) => a.hasPre).map((a) => a.prePct);
  const postVals = learnerAnalyses.filter((a) => a.hasPost).map((a) => a.postPct);
  const simVals = learnerAnalyses.filter((a) => a.hasSim).map((a) => a.simPct);
  const selfVals = learnerAnalyses.filter((a) => a.hasSelfEval).map((a) => a.selfEvalPct);
  const calibGaps = learnerAnalyses
    .map((a) => a.calibrationGap)
    .filter((g): g is number => g !== null);

  const preAvg = avg(preVals);
  const postAvg = avg(postVals);
  const simAvg = avg(simVals);
  const selfEvalAvg = avg(selfVals);
  const progression = preVals.length && postVals.length ? postAvg - preAvg : 0;

  const passedCount = learnerAnalyses.filter((a) => a.hasPost && a.postPct >= 60).length;
  const withFinalCount = postVals.length;
  const withPreCount = preVals.length;
  const withSimCount = simVals.length;
  const validationRate = withFinalCount ? Math.round((passedCount / withFinalCount) * 100) : 0;
  const excellenceCount = learnerAnalyses.filter((a) => a.hasPost && a.postPct >= 80).length;
  const excellenceRate = withFinalCount ? Math.round((excellenceCount / withFinalCount) * 100) : 0;

  const minPost = postVals.length ? Math.min(...postVals) : 0;
  const maxPost = postVals.length ? Math.max(...postVals) : 0;
  const medianPost = median(postVals);
  const spreadPost = postVals.length ? maxPost - minPost : 0;

  const priorTrainingCount = learners.filter((l) => l.deja_formation_rc === 'Oui').length;
  const priorTrainingRate = learners.length
    ? Math.round((priorTrainingCount / learners.length) * 100)
    : 0;
  const calibrationGapAvg = calibGaps.length ? avg(calibGaps) : null;

  // Modules J1 - J4
  const modules: ModuleMetric[] = TRAINING_MODULES.map((mod) => {
    const preScores = learnerAnalyses
      .map((a) => a.moduleScores.find((m) => m.key === mod.key)?.prePct)
      .filter((v): v is number => v !== null && v !== undefined);
    const postScores = learnerAnalyses
      .map((a) => a.moduleScores.find((m) => m.key === mod.key)?.postPct)
      .filter((v): v is number => v !== null && v !== undefined);
    const mPreAvg = avg(preScores);
    const mPostAvg = avg(postScores);
    return {
      key: mod.key,
      dayLabel: mod.dayLabel,
      title: mod.title,
      shortTitle: mod.shortTitle,
      description: mod.description,
      prePct: mPreAvg,
      postPct: mPostAvg,
      delta: preScores.length && postScores.length ? mPostAvg - mPreAvg : 0,
      preCount: preScores.length,
      postCount: postScores.length,
    };
  });

  const activeModules = modules.filter((m) => m.postCount > 0);
  const strongestModule = activeModules.length
    ? [...activeModules].sort((a, b) => b.postPct - a.postPct)[0]
    : null;
  const biggestGainModule = activeModules.length
    ? [...activeModules].sort((a, b) => b.delta - a.delta)[0]
    : null;
  const reinforcementModule = activeModules.length
    ? [...activeModules].sort((a, b) => a.postPct - b.postPct)[0]
    : null;

  const pendingLearners = learnerAnalyses.filter((a) => a.verdictCategory === 'pending');

  // Verdict distribution
  const bucketDefs: Array<{ category: VerdictCategory; label: string; color: string }> = [
    { category: 'expert', label: 'Expert', color: '#096475' },
    { category: 'maitrise', label: 'Maîtrise', color: '#00afa9' },
    { category: 'consolidation', label: 'En consolidation', color: '#ffa900' },
    { category: 'renforcer', label: 'À renforcer', color: '#c62828' },
  ];

  if (pendingLearners.length > 0) {
    bucketDefs.push({
      category: 'pending',
      label: 'En attente J5',
      color: '#64748b',
    });
  }

  const verdictDistribution: VerdictBucket[] = bucketDefs.map((b) => {
    const count = learnerAnalyses.filter((a) => a.verdictCategory === b.category).length;
    return {
      ...b,
      count,
      percentage: learners.length ? Math.round((count / learners.length) * 100) : 0,
    };
  });

  // Axes frequency aggregation
  const countFrequency = (items: string[]) => {
    const map = new Map<string, number>();
    items.forEach((txt) => {
      const clean = txt.trim();
      if (!clean) return;
      map.set(clean, (map.get(clean) || 0) + 1);
    });
    return [...map.entries()]
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count);
  };

  const topInitialAxes = countFrequency(learnerAnalyses.flatMap((a) => a.preAxes)).slice(0, 5);
  const topRemainingAxes = countFrequency(learnerAnalyses.flatMap((a) => a.finalAxes)).slice(0, 5);

  // Executive Headline & Automated Narrative
  const scopeText = groupLabel ? `du groupe « ${groupLabel} »` : 'de la cohorte';
  let executiveHeadline = 'Bilan pédagogique de la promotion';
  if (withFinalCount > 0) {
    if (validationRate >= 85 && progression >= 15) {
      executiveHeadline = `Une montée en compétence remarquable : ${validationRate}% de validation et +${progression} points de progression moyenne.`;
    } else if (validationRate >= 75) {
      executiveHeadline = `Une promotion opérationnelle : ${validationRate}% des apprenants atteignent le seuil de validation.`;
    } else {
      executiveHeadline = `Une progression collective engagée (+${progression} pts), avec un accompagnement ciblé à poursuivre sur le terrain.`;
    }
  }

  const executiveNarrative: string[] = [];

  if (learners.length > 0) {
    const expSentence = `Composée de ${learners.length} conseiller${learners.length > 1 ? 's' : ''} déjà en activité sur la campagne de recouvrement (${priorTrainingRate}% ayant déjà suivi une sensibilisation relation client par le passé), cette promotion ${scopeText} engagée dans un parcours de renforcement de compétences affichait un niveau de départ mesuré à ${preAvg}% en pré-quiz.`;
    const calibSentence =
      calibrationGapAvg !== null
        ? Math.abs(calibrationGapAvg) <= 5
          ? ` L’auto-évaluation initiale (${selfEvalAvg}%) correspondait fidèlement au niveau réel mesuré, traduisant une bonne lucidité collective sur les acquis.`
          : calibrationGapAvg > 5
          ? ` L’auto-évaluation initiale (${selfEvalAvg}%) révélait une légère surestimation moyenne (+${calibrationGapAvg} pts par rapport au pré-quiz), liée à la confiance issue de l’habitude terrain et recadrée sur les fondamentaux méthodologiques.`
          : ` Les conseillers sous-estimaient initialement leurs acquis théoriques (${selfEvalAvg}% perçus contre ${preAvg}% mesurés), ce qui a permis de valoriser et structurer des réflexes déjà présents en production.`
        : '';
    executiveNarrative.push(expSentence + calibSentence);
  }

  if (withFinalCount > 0) {
    const homogeneity =
      spreadPost <= 18
        ? `L’homogénéité de l’équipe s’est nettement renforcée en fin de semaine (écart contenu de ${spreadPost} points entre ${minPost}% et ${maxPost}%, médiane à ${medianPost}%).`
        : `La cohorte conserve une amplitude de niveaux de ${spreadPost} points (de ${minPost}% à ${maxPost}%, médiane à ${medianPost}%), justifiant un suivi qualité différencié sur le plateau entre profils référents et conseillers à recalibrer.`;

    executiveNarrative.push(
      `À l’issue des cinq journées, la moyenne finale des participants évalués s’établit à ${postAvg}% (soit ${progression >= 0 ? '+' : ''}${progression} points par rapport au diagnostic initial). ${passedCount} conseiller${passedCount > 1 ? 's' : ''} sur ${withFinalCount} (${validationRate}%) valident les acquis au seuil minimal de 60%, dont ${excellenceCount} (${excellenceRate}%) à un niveau d’excellence (≥ 80%). ${homogeneity}`
    );
  }

  if (pendingLearners.length > 0) {
    const pendingNames = pendingLearners.map((a) => a.learner.name || 'Une participante').join(', ');
    executiveNarrative.push(
      `Point d’attention administratif et pédagogique : ${pendingNames} n’a pas pu effectuer le quiz final ni l’évaluation pratique en fin de session. Une reprise est prévue dès que le deuxième groupe atteindra le dernier jour de formation afin de lui permettre de finaliser son parcours en bonne et due forme.`
    );
  }

  // Module narrative
  let moduleNarrative =
    'Les scores détaillés par module (J1 à J4) ne sont pas encore renseignés pour cette sélection.';
  if (strongestModule && biggestGainModule && reinforcementModule) {
    moduleNarrative = `L’analyse transversale des quatre piliers pédagogiques montre une performance maximale sur « ${strongestModule.title} » avec une moyenne finale de ${strongestModule.postPct}%. La dynamique de progression la plus marquée concerne « ${biggestGainModule.title} » (${biggestGainModule.delta >= 0 ? '+' : ''}${biggestGainModule.delta} points entre le pré-quiz et l’évaluation finale). À l’inverse, « ${reinforcementModule.title} » (${reinforcementModule.postPct}% en moyenne) demeure le levier prioritaire à consolider lors des briefings qualité en plateau.`;
  }

  // Transfer narrative (Simulation & Axes)
  let transferNarrative = '';
  if (withSimCount > 0) {
    const simDelta = withFinalCount ? simAvg - postAvg : 0;
    transferNarrative = `Sur les ${withSimCount} simulations d’appel évaluées, le score pratique moyen atteint ${simAvg}%. ${
      Math.abs(simDelta) <= 5
        ? 'Cet alignement quasi parfait avec le score théorique confirme que les réflexes méthodologiques (7 temps, écoute active, reformulation) sont directement activables au téléphone.'
        : simDelta > 5
        ? 'La performance pratique dépasse même les résultats théoriques, démontrant une excellente aisance vocale et comportementale en situation réelle.'
        : 'Un léger écart subsiste entre la compréhension théorique et l’exécution à chaud sous contrainte de temps : des séances de double écoute permettront de fluidifier les automatismes.'
    }`;
  } else if (topRemainingAxes.length > 0) {
    transferNarrative = `Les axes de vigilance résiduels exprimés en fin de parcours convergent principalement autour de : ${topRemainingAxes
      .slice(0, 3)
      .map((a) => `« ${a.label} »`)
      .join(', ')}.`;
  }

  // Pull quote
  const pullQuote =
    withFinalCount > 0
      ? `« Sur l’ensemble du parcours, le groupe gagne ${progression >= 0 ? '+' : ''}${progression} points de maîtrise et porte ${validationRate}% des conseillers au-dessus du seuil de validation opérationnelle. »`
      : '« Chaque expérience est unique : l’évaluation continue transforme les réflexes quotidiens en valeur durable pour le client. »';

  // Recommendations & Accompagnement (tailored to agents already in production + Group 2 J5 retake)
  const recommendations: CohortRecommendation[] = [];

  const toReinforce = learnerAnalyses.filter((a) => a.verdictCategory === 'renforcer');
  const experts = learnerAnalyses.filter((a) => a.verdictCategory === 'expert');

  if (pendingLearners.length > 0) {
    const pendingNames = pendingLearners.map((a) => a.learner.name || 'La participante').join(', ');
    recommendations.push({
      priority: 'Planification J5',
      title: `Reprise du quiz final et de l’évaluation (${pendingNames})`,
      rationale: `${pendingNames} n’a pas pu passer le quiz final ni l’évaluation pratique en clôture de cette vague ; son bilan reste à finaliser.`,
      action:
        'Planifier sa participation à la dernière journée de formation du deuxième groupe pour passer le quiz final et l’évaluation pratique dans les mêmes conditions.',
    });
  }

  if (toReinforce.length > 0) {
    recommendations.push({
      priority: 'Priorité haute',
      title: `Recalibrage terrain pour ${toReinforce.length} conseiller${toReinforce.length > 1 ? 's' : ''} en activité`,
      rationale: `${toReinforce.map((a) => a.learner.name).join(', ')} reste${toReinforce.length > 1 ? 'nt' : ''} sous le seuil de 60%, traduisant des habitudes de campagne à réaligner sur la méthode structurée.`,
      action:
        'Mettre en place 2 séances hebdomadaires de double écoute sur leurs appels de production réels avec grille de débriefing (7 temps & méthode FOS) durant 15 jours.',
    });
  }

  if (reinforcementModule) {
    recommendations.push({
      priority: 'Consolidation',
      title: `Atelier flash qualité sur « ${reinforcementModule.title} »`,
      rationale: `C’est le pilier affichant la moyenne la plus basse de l’équipe (${reinforcementModule.postPct}%), constituant le principal levier de montée en qualité sur la campagne.`,
      action:
        'Animer un débriefing d’équipe de 20 minutes à J+7 à partir de 2 enregistrements réels issus de la production.',
    });
  }

  if (experts.length > 0) {
    recommendations.push({
      priority: 'Accompagnement',
      title: `Accompagnement croisé avec les ${experts.length} conseiller${experts.length > 1 ? 's' : ''} Expert`,
      rationale: `${experts.map((a) => a.learner.name).join(', ')} allie${experts.length > 1 ? 'nt' : ''} expérience de la campagne et maîtrise exemplaire des techniques de recouvrement.`,
      action:
        'Les associer en binôme avec les collègues en consolidation lors d’écoutes croisées en plateau pour harmoniser les pratiques d’appel.',
    });
  } else {
    recommendations.push({
      priority: 'Accompagnement',
      title: 'Accompagnement qualité et suivi des KPI en production',
      rationale:
        'Pour des équipes déjà en production, l’enjeu principal est d’éviter le retour aux anciens automatismes après la semaine de renforcement.',
      action:
        'Mettre en place un accompagnement régulier croisant la grille qualité d’appel (7 temps / FOS) et l’évolution du taux de promesses de paiement tenues.',
    });
  }

  return {
    total: learners.length,
    preAvg,
    postAvg,
    simAvg,
    selfEvalAvg,
    progression,
    passedCount,
    withFinalCount,
    withPreCount,
    withSimCount,
    validationRate,
    excellenceCount,
    excellenceRate,
    minPost,
    maxPost,
    medianPost,
    spreadPost,
    priorTrainingCount,
    priorTrainingRate,
    calibrationGapAvg,
    modules,
    strongestModule,
    biggestGainModule,
    reinforcementModule,
    verdictDistribution,
    topRemainingAxes,
    topInitialAxes,
    learnerAnalyses,
    executiveHeadline,
    executiveNarrative,
    moduleNarrative,
    transferNarrative,
    pullQuote,
    recommendations,
  };
}
