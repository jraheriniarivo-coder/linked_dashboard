import React, { useState } from 'react';
import { LearnerAnalysis } from '../../types/dashboard';

interface Props {
  analyses: LearnerAnalysis[];
  onSelectLearner: (emailKey: string) => void;
}

export const CalibrationQuadrantChart: React.FC<Props> = ({
  analyses,
  onSelectLearner,
}) => {
  const [hovered, setHovered] = useState<LearnerAnalysis | null>(null);
  const valid = analyses.filter((a) => a.hasPre && a.hasPost);

  if (!valid.length) {
    return (
      <div className="py-10 text-center text-sm text-[#6d7d83] border border-dashed border-[#d6e1e3] rounded-xl">
        Données pré-quiz et finales requises pour afficher la matrice de positionnement.
      </div>
    );
  }

  const width = 460;
  const height = 310;
  const padL = 46;
  const padR = 24;
  const padT = 24;
  const padB = 42;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;

  const xOf = (val: number) => padL + (Math.max(0, Math.min(100, val)) / 100) * plotW;
  const yOf = (val: number) => padT + plotH - (Math.max(0, Math.min(100, val)) / 100) * plotH;

  const colorFor = (a: LearnerAnalysis) => {
    if (a.verdictCategory === 'expert') return '#096475';
    if (a.verdictCategory === 'maitrise') return '#00afa9';
    if (a.verdictCategory === 'consolidation') return '#ffa900';
    return '#c62828';
  };

  return (
    <div>
      <div className="mb-3">
        <h4 className="text-base font-bold text-[#096475]">
          Matrice Départ vs Évaluation finale
        </h4>
        <p className="text-xs text-[#6d7d83]">
          Lecture des profils au-dessus de la diagonale d’équilibre (zone de progression nette).
        </p>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto select-none"
        role="img"
        aria-label="Matrice de dispersion pré-quiz versus score final"
      >
        {/* Quadrant Shaded Zones */}
        <rect
          x={padL}
          y={padT}
          width={xOf(60) - padL}
          height={yOf(60) - padT}
          fill="#f0faf9"
        />
        <rect
          x={xOf(60)}
          y={padT}
          width={padL + plotW - xOf(60)}
          height={yOf(60) - padT}
          fill="#eef6f8"
        />
        <rect
          x={padL}
          y={yOf(60)}
          width={xOf(60) - padL}
          height={padT + plotH - yOf(60)}
          fill="#fff8f6"
        />

        {/* Grid ticks */}
        {[20, 40, 60, 80, 100].map((t) => (
          <g key={t}>
            <line
              x1={xOf(t)}
              y1={padT}
              x2={xOf(t)}
              y2={padT + plotH}
              stroke={t === 60 ? '#d97706' : '#e2eaec'}
              strokeDasharray={t === 60 ? '4 4' : undefined}
              strokeWidth={1}
            />
            <line
              x1={padL}
              y1={yOf(t)}
              x2={padL + plotW}
              y2={yOf(t)}
              stroke={t === 60 ? '#d97706' : '#e2eaec'}
              strokeDasharray={t === 60 ? '4 4' : undefined}
              strokeWidth={1}
            />
            <text
              x={xOf(t)}
              y={padT + plotH + 15}
              textAnchor="middle"
              className="fill-[#6d7d83] text-[9px] font-mono"
            >
              {t}%
            </text>
            <text
              x={padL - 8}
              y={yOf(t) + 3}
              textAnchor="end"
              className="fill-[#6d7d83] text-[9px] font-mono"
            >
              {t}%
            </text>
          </g>
        ))}

        {/* Diagonal Parity Line (No Change) */}
        <line
          x1={xOf(0)}
          y1={yOf(0)}
          x2={xOf(100)}
          y2={yOf(100)}
          stroke="#94a3b8"
          strokeWidth={1.2}
          strokeDasharray="3 3"
        />

        {/* Quadrant Captions */}
        <text x={padL + 8} y={padT + 15} className="fill-[#007a75] text-[9px] font-bold">
          Déblocage & forte progression
        </text>
        <text x={padL + plotW - 8} y={padT + 15} textAnchor="end" className="fill-[#096475] text-[9px] font-bold">
          Excellence confirmée
        </text>
        <text x={padL + 8} y={padT + plotH - 8} className="fill-[#b91c1c] text-[9px] font-bold">
          Tutorat prioritaire (&lt;60%)
        </text>

        {/* Axis Titles */}
        <text
          x={padL + plotW / 2}
          y={height - 6}
          textAnchor="middle"
          className="fill-[#47585e] text-[10px] font-bold"
        >
          Score pré-quiz (%)
        </text>
        <text
          x={14}
          y={padT + plotH / 2}
          textAnchor="middle"
          transform={`rotate(-90 14 ${padT + plotH / 2})`}
          className="fill-[#47585e] text-[10px] font-bold"
        >
          Score final (%)
        </text>

        {/* Learner Points */}
        {valid.map((item) => {
          const cx = xOf(item.prePct);
          const cy = yOf(item.postPct);
          const isHover = hovered?.emailKey === item.emailKey;
          const fill = colorFor(item);
          const shortLast = (item.learner.name || '').split(' ')[0];

          return (
            <g
              key={item.emailKey}
              className="cursor-pointer"
              onMouseEnter={() => setHovered(item)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onSelectLearner(item.emailKey)}
            >
              <circle
                cx={cx}
                cy={cy}
                r={isHover ? 9 : 6.5}
                fill={fill}
                fillOpacity={0.9}
                stroke="#ffffff"
                strokeWidth={2}
              />
              <text
                x={cx}
                y={cy - 10}
                textAnchor="middle"
                className="fill-[#1d2b30] text-[9.5px] font-semibold"
              >
                {shortLast}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="mt-2 min-h-[38px] rounded-lg bg-[#f4f8f9] border border-[#e1e9eb] px-3 py-2 text-xs text-[#47585e]">
        {hovered ? (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-bold text-[#096475]">{hovered.learner.name}</span>
            <span className="font-mono tabular-nums">
              {hovered.prePct}% → {hovered.postPct}% ({hovered.progression >= 0 ? '+' : ''}
              {hovered.progression} pts) · {hovered.trajectoryTag}
            </span>
          </div>
        ) : (
          <span className="text-[#6d7d83]">
            Tout point situé au-dessus de la ligne pointillée reflète un gain net acquis durant les 5 jours.
          </span>
        )}
      </div>
    </div>
  );
};
