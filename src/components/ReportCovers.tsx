import React from 'react';
import { Calendar, User, Users } from 'lucide-react';
import { CohortAnalysis, ReportConfig } from '../types/dashboard';
import { splitCoverTitle } from '../utils/connecteoSlides';

interface CoverProps {
  logoDataUri: string;
  config: ReportConfig;
  analysis: CohortAnalysis;
  groupLabel: string;
}

interface ClosingProps {
  logoDataUri: string;
  config: ReportConfig;
}

const CoverSignalArtwork: React.FC = () => (
  <svg
    viewBox="0 0 420 540"
    preserveAspectRatio="xMaxYMid slice"
    aria-hidden="true"
    className="pointer-events-none select-none absolute right-0 top-0 h-full w-[250px] sm:w-[400px] print:w-[400px]"
  >
    <defs>
      <linearGradient id="rc-bar-1" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#00c4bc" stopOpacity={0.34} />
        <stop offset="100%" stopColor="#00c4bc" stopOpacity={0.04} />
      </linearGradient>
      <linearGradient id="rc-bar-2" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#00d2c8" stopOpacity={0.58} />
        <stop offset="100%" stopColor="#00afa9" stopOpacity={0.08} />
      </linearGradient>
      <linearGradient id="rc-bar-3" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#4ce6de" stopOpacity={0.88} />
        <stop offset="100%" stopColor="#00afa9" stopOpacity={0.14} />
      </linearGradient>
      <linearGradient id="rc-wave" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#00c2ba" stopOpacity={0} />
        <stop offset="55%" stopColor="#00e0d6" stopOpacity={0.7} />
        <stop offset="100%" stopColor="#ffa900" stopOpacity={0.85} />
      </linearGradient>
    </defs>

    {/* Subtle architectural radar rings */}
    <circle cx={385} cy={480} r={145} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={1} />
    <circle
      cx={385}
      cy={480}
      r={235}
      fill="none"
      stroke="rgba(255,255,255,0.06)"
      strokeWidth={1}
      strokeDasharray="4 6"
    />
    <circle cx={385} cy={480} r={325} fill="none" stroke="rgba(0,194,186,0.14)" strokeWidth={1.2} />

    {/* Soft structural diagonals */}
    <line x1={90} y1={540} x2={420} y2={210} stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
    <line x1={170} y1={540} x2={420} y2={290} stroke="rgba(255,255,255,0.05)" strokeWidth={1} />

    {/* 5-day ascending geometric pillars (J1 -> J5) */}
    <rect x={132} y={348} width={38} height={122} rx={10} fill="url(#rc-bar-1)" stroke="rgba(0,194,186,0.22)" strokeWidth={1} />
    <rect x={184} y={302} width={38} height={168} rx={10} fill="url(#rc-bar-1)" stroke="rgba(0,194,186,0.28)" strokeWidth={1} />
    <rect x={236} y={250} width={38} height={220} rx={10} fill="url(#rc-bar-2)" stroke="rgba(0,210,200,0.35)" strokeWidth={1} />
    <rect x={288} y={194} width={38} height={276} rx={10} fill="url(#rc-bar-2)" stroke="rgba(0,224,214,0.45)" strokeWidth={1} />
    <rect x={340} y={132} width={38} height={338} rx={10} fill="url(#rc-bar-3)" stroke="rgba(255,255,255,0.45)" strokeWidth={1.2} />

    {/* Acoustic voice trajectory climbing across pillars */}
    <path
      d="M 78 395 C 145 390, 165 322, 203 310 C 242 298, 260 228, 307 205 C 335 190, 348 148, 359 112"
      fill="none"
      stroke="url(#rc-wave)"
      strokeWidth={3}
      strokeLinecap="round"
    />
    <path
      d="M 96 422 C 165 415, 195 352, 245 330 C 288 310, 315 245, 368 190"
      fill="none"
      stroke="rgba(255,255,255,0.18)"
      strokeWidth={1.5}
      strokeDasharray="3 5"
      strokeLinecap="round"
    />

    {/* Trajectory nodes */}
    <circle cx={151} cy={348} r={4.5} fill="#00c2ba" />
    <circle cx={203} cy={302} r={5} fill="#00d6cc" />
    <circle cx={255} cy={250} r={5.5} fill="#8ff3ed" />
    <circle cx={307} cy={194} r={6} fill="#ffffff" />

    {/* Summit beacon */}
    <circle cx={359} cy={112} r={19} fill="none" stroke="rgba(255,169,0,0.38)" strokeWidth={1.5} />
    <circle cx={359} cy={112} r={10} fill="#ffa900" stroke="#ffffff" strokeWidth={2.5} />
  </svg>
);

const ClosingWaveArtwork: React.FC = () => (
  <svg
    viewBox="0 0 420 540"
    preserveAspectRatio="xMaxYMid slice"
    aria-hidden="true"
    className="pointer-events-none select-none absolute right-0 top-0 h-full w-[250px] sm:w-[400px] print:w-[400px]"
  >
    <defs>
      <linearGradient id="cl-rib-1" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#00e0d6" stopOpacity={0.34} />
        <stop offset="100%" stopColor="#008c87" stopOpacity={0.04} />
      </linearGradient>
      <linearGradient id="cl-rib-2" x1="0" y1="1" x2="1" y2="0">
        <stop offset="0%" stopColor="#ffffff" stopOpacity={0.18} />
        <stop offset="100%" stopColor="#00c2ba" stopOpacity={0.02} />
      </linearGradient>
    </defs>

    {/* Harmonic concentric rings */}
    <circle cx={330} cy={270} r={95} fill="none" stroke="rgba(0,224,214,0.28)" strokeWidth={1.5} />
    <circle cx={330} cy={270} r={155} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={1} />
    <circle
      cx={330}
      cy={270}
      r={215}
      fill="none"
      stroke="rgba(255,255,255,0.07)"
      strokeWidth={1}
      strokeDasharray="5 7"
    />

    {/* Flowing acoustic ribbons */}
    <path
      d="M 110 470 C 175 360, 255 340, 315 245 C 350 188, 375 120, 420 65 L 420 220 C 370 285, 310 340, 225 415 C 185 450, 155 495, 130 540 Z"
      fill="url(#cl-rib-1)"
    />
    <path
      d="M 185 540 C 225 435, 290 385, 345 305 C 380 255, 400 205, 420 155"
      fill="none"
      stroke="url(#cl-rib-2)"
      strokeWidth={2.5}
      strokeLinecap="round"
    />
    <path
      d="M 140 420 C 215 355, 265 295, 330 270 C 375 252, 398 208, 420 175"
      fill="none"
      stroke="rgba(0,224,214,0.62)"
      strokeWidth={2}
      strokeLinecap="round"
    />

    {/* Constellation beacons */}
    <circle cx={330} cy={270} r={14} fill="#00c2ba" stroke="#ffffff" strokeWidth={3} />
    <circle cx={330} cy={270} r={26} fill="none" stroke="rgba(0,194,186,0.45)" strokeWidth={1.5} />
    <circle cx={238} cy={354} r={6} fill="#8ff3ed" />
    <circle cx={385} cy={136} r={7} fill="#ffa900" stroke="#ffffff" strokeWidth={1.5} />
    <circle cx={176} cy={402} r={4.5} fill="rgba(255,255,255,0.55)" />
    <circle cx={288} cy={148} r={5} fill="rgba(255,255,255,0.35)" />
  </svg>
);

const SlideBrandHeader: React.FC<{ logoDataUri: string }> = ({ logoDataUri }) => (
  <div>
    <img src={logoDataUri} alt="Connecteo" className="h-11 sm:h-12 w-auto block" />
    <div className="mt-1.5 text-[11px] sm:text-xs font-semibold tracking-[0.14em] text-white/95 uppercase">
      CHAQUE EXPÉRIENCE EST UNIQUE
    </div>
  </div>
);

export const ReportCoverSlide: React.FC<CoverProps> = ({
  logoDataUri,
  config,
  analysis,
  groupLabel,
}) => {
  const { lead, main } = splitCoverTitle(config.reportTitle);
  const periodLabel = (config.trainingPeriod || '').trim() || 'Parcours 5 jours';
  const subtitleText =
    (config.coverSubtitle || '').trim() ||
    'Renforcer la posture, l’écoute active et la maîtrise du recouvrement amiable en production.';

  return (
    <section
      aria-label="Page de couverture du rapport"
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#054754] via-[#075b6b] to-[#09687a] text-white max-w-[1040px] mx-auto px-8 py-10 sm:px-14 sm:py-12 min-h-[480px] sm:min-h-[540px] flex flex-col justify-between report-slide-page"
    >
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00c2ba] via-[#00e0d6] to-[#ffa900]" />
      <CoverSignalArtwork />

      <div className="relative z-10">
        <SlideBrandHeader logoDataUri={logoDataUri} />
      </div>

      <div className="relative z-10 max-w-2xl my-auto py-8">
        <div className="text-[11px] sm:text-xs font-bold tracking-[0.22em] text-[#00c2ba] uppercase mb-3">
          RAPPORT DE FORMATION
        </div>

        <h1 className="text-4xl sm:text-5xl leading-[1.08] tracking-tight text-white [text-wrap:balance]">
          {lead && <span className="block font-normal">{lead}</span>}
          <span className="block font-black">{main}</span>
        </h1>

        <p className="mt-5 text-base sm:text-lg text-white/85 leading-relaxed max-w-xl font-normal">
          {subtitleText}
        </p>
      </div>

      <div className="relative z-10 flex flex-wrap items-center gap-x-8 gap-y-4 pt-2 pr-12 sm:pr-44">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4 text-[#00c2ba]" />
          </div>
          <div>
            <div className="text-sm font-bold text-white leading-tight">{periodLabel}</div>
            <div className="text-xs text-white/75 mt-0.5">{groupLabel} · Renforcement RC</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
            <Users className="w-4 h-4 text-[#00c2ba]" />
          </div>
          <div>
            <div className="text-sm font-bold text-white leading-tight">
              {analysis.total} conseillers formés
            </div>
            <div className="text-xs text-white/75 mt-0.5">
              {analysis.withFinalCount} évalués · {analysis.passedCount} validés
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
            <User className="w-4 h-4 text-[#00c2ba]" />
          </div>
          <div>
            <div className="text-sm font-bold text-white leading-tight">
              {config.facilitator}
            </div>
            <div className="text-xs text-white/75 mt-0.5">
              Trainer Animator{config.clientName.trim() ? ` · ${config.clientName.trim()}` : ''}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export const ReportClosingSlide: React.FC<ClosingProps> = ({ logoDataUri, config }) => {
  const email = (config.facilitatorEmail || '').trim();

  return (
    <section
      aria-label="Page de clôture Merci"
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#054754] via-[#075b6b] to-[#09687a] text-white max-w-[1040px] mx-auto px-8 py-10 sm:px-14 sm:py-12 min-h-[480px] sm:min-h-[540px] flex flex-col justify-between report-slide-page print-page-break-before"
    >
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00c2ba] via-[#00e0d6] to-[#ffa900]" />
      <ClosingWaveArtwork />

      <div className="relative z-10">
        <SlideBrandHeader logoDataUri={logoDataUri} />
      </div>

      <div className="relative z-10 max-w-xl my-auto py-8">
        <div className="text-6xl sm:text-7xl font-black tracking-tight text-white leading-none flex items-baseline">
          <span>Merci</span>
          <span
            aria-hidden="true"
            className="inline-block w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-[4px] bg-[#00bfb6] ml-1.5"
          />
        </div>

        <div className="mt-4 text-xl sm:text-2xl font-black text-[#00c2ba]">
          Misaotra betsaka !
        </div>

        <div className="mt-5 space-y-1 text-base sm:text-lg text-white/90 leading-relaxed">
          <p>À la PAMF, pour sa confiance.</p>
          <p>Aux conseillers, pour leur engagement.</p>
        </div>
      </div>

      <div className="relative z-10 text-xs sm:text-sm text-white/85 pt-2 pr-12 sm:pr-44">
        <strong className="font-bold text-white">{config.facilitator}</strong>
        <span className="mx-2 text-white/50">·</span>
        <span>Trainer Animator</span>
        {email && (
          <>
            <span className="mx-2 text-white/50">·</span>
            <span>{email}</span>
          </>
        )}
      </div>
    </section>
  );
};
