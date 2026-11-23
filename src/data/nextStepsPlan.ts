export interface NextStepMilestone {
  badge: string;
  period: string;
  title: string;
  summary: string;
  deliverable: string;
}

export interface PlanningDayItem {
  day: string;
  format: string;
  title: string;
  morning: string;
  afternoon: string;
  outcome: string;
}

export const NEXT_STEPS_HEADLINE =
  'Déploiement post-formation en deux temps : immersion directe sur plateau dès fin décembre pour capter la réalité du terrain, suivie d’une session commando de verrouillage en janvier pour pérenniser les résultats en production.';

export const NEXT_STEPS_MILESTONES: NextStepMilestone[] = [
  {
    badge: 'Étape 01 · Terrain',
    period: 'Semaines du 25 et 31 décembre',
    title: 'Immersion & audit terrain en agence',
    summary:
      'Présence opérationnelle au cœur des agences pour observer à chaud l’application des réflexes travaillés (structure en 7 temps, méthode FOS, posture d’appel) sur des dossiers réels de fin d’année et corriger immédiatement les écarts en situation de production.',
    deliverable:
      'Relevé des pratiques réelles sur plateau & sélection de cas concrets pour la session de janvier.',
  },
  {
    badge: 'Étape 02 · Verrouillage',
    period: 'Mois de janvier · 3 jours · 12 participants',
    title: 'Accompagnement intensif & verrouillage des acquis',
    summary:
      'Session de consolidation ciblée pour neutraliser le retour aux anciens automatismes, élever la maîtrise des objections complexes et verrouiller durablement la prise d’engagement ferme sur chaque appel (incluant la finalisation J5 des profils en attente).',
    deliverable:
      'Calibrage individuel validé en mise en situation & feuille de route qualité par conseiller.',
  },
];

export const JANUARY_PLANNING_META = {
  title: 'Ligne directrice — Session d’accompagnement de janvier',
  subtitle: 'Format opérationnel : 3 jours intensifs · 12 participants déjà en production',
};

export const JANUARY_PLANNING_DAYS: PlanningDayItem[] = [
  {
    day: 'Jour 1',
    format: 'Plénière & 2 sous-groupes de 6',
    title: 'Diagnostic terrain & réalignement de posture',
    morning:
      'Restitution à froid des observations recueillies en agence (25–31 déc.), analyse des écarts de production et recalibrage collectif sur la structure d’appel en 7 temps.',
    afternoon:
      'Ateliers ciblés sur la découverte active (méthode FOS) et la lecture du profil psychologique du débiteur à partir d’enregistrements.',
    outcome: 'Réaligner les 12 conseillers sur un standard d’ouverture et de diagnostic homogène.',
  },
  {
    day: 'Jour 2',
    format: 'Rotations en trios (4 îlots de 3)',
    title: 'Objections critiques & verrouillage de l’engagement',
    morning:
      'Clinique des objections complexes (blocages financiers, contestations, reports récurrents) via la méthode des 5 R et construction de réparties percutantes.',
    afternoon:
      'Atelier sur la fermeté bienveillante, la conclusion directe et la sécurisation des promesses de paiement.',
    outcome: 'Ancrer des réflexes de négociation et de closing immédiatement mobilisables sous pression.',
  },
  {
    day: 'Jour 3',
    format: 'Évaluation individuelle & clôture',
    title: 'Validation pratique en production',
    morning:
      'Double écoute ciblée sur cas difficiles et passage des évaluations finales pour les participants devant finaliser leur parcours.',
    afternoon:
      'Débriefing individuel de calibrage, remise des fiches réflexes opérationnelles par conseiller et partage des indicateurs de suivi avec l’encadrement.',
    outcome: 'Verrouiller les acquis des 12 participants.',
  },
];
