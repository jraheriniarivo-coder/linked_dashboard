import React, { useState } from 'react';
import { LearnerAnalysis } from '../../types/dashboard';

interface Props {
  analyses: LearnerAnalysis[];
  selectedEmail: string | null;
  onSelectLearner: (emailKey: string) => void;
}

export const ProgressionSlopeChart: React.FC<Props> = ({
  analyses,
  selectedEmail,
  onSelectLearner,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!analyses.length) return null;

  const sorted = [...analyses].sort((a, b) => b.postPct - a.postPct);
  const leftPad = 148;
  const rightPad = 58;
  const topPad = 36;
  const rowH = 38;
  const width = 680;
  const plotW = width - leftPad - rightPad;
  const height = topPad + sorted.length * rowH + 28;

  const xPos = (pct: number) => leftPad + (Math.max(0, Math.min(100, pct)) / 100) * plotW;
  const ticks = [0, 20, 40, 60, 80, 100];

  const hovered = hoveredIdx !== null ? sorted[hoveredIdx] : null;

  return (
    <div className="relative">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div>
          <h4 className="text-base font-bold text-[#096475]">
            Trajectoire individuelle : Pré-quiz → Quiz final
          </h4>
          <p className="text-xs text-[#6d7d83]">
            Survolez un apprenant pour lire le détail ou cliquez pour accéder à sa fiche narrative.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-xs text-[#47585e]">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#94a3b8] inline-block" />
            Pré-quiz
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00afa9] inline-block" />
            Final
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rotate-45 bg-[#ffa900] inline-block" />
            Simulation
          </span>
        </div>
      </div>

      <div className="w-full overflow-x-auto print:overflow-visible">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto min-w-[520px] print-svg-fit select-none"
          role="img"
          aria-label="Graphique de progression individuelle du pré-quiz au quiz final"
        >
          {/* Vertical Grid Lines */}
          {ticks.map((t) => {
            const x = xPos(t);
            const isThreshold = t === 60;
            const isExcellence = t === 80;
            return (
              <g key={t}>
                <line
                  x1={x}
                  y1={topPad - 10}
                  x2={x}
                  y2={height - 20}
                  stroke={isThreshold ? '#d97706' : isExcellence ? '#096475' : '#e5ecee'}
                  strokeWidth={isThreshold ? 1.5 : 1}
                  strokeDasharray={isThreshold || isExcellence ? '4 4' : undefined}
                />
                <text
                  x={x}
                  y={16}
                  textAnchor="middle"
                  className="fill-[#6d7d83] text-[10px] font-mono tabular-nums"
                >
                  {t}%
                </text>
              </g>
            );
          })}

          {/* Threshold Labels */}
          <text
            x={xPos(60)}
            y={topPad - 13}
            textAnchor="middle"
            className="fill-[#b45309] text-[9px] font-bold"
          >
            Seuil 60%
          </text>
          <text
            x={xPos(80)}
            y={topPad - 13}
            textAnchor="middle"
            className="fill-[#096475] text-[9px] font-bold"
          >
            Excellence 80%
          </text>

          {/* Rows */}
          {sorted.map((item, idx) => {
            const cy = topPad + idx * rowH + rowH / 2;
            const isSelected = selectedEmail === item.emailKey;
            const isHovered = hoveredIdx === idx;
            const xPre = xPos(item.prePct);
            const xPost = xPos(item.postPct);
            const xSim = xPos(item.simPct);
            const isPositive = item.progression >= 0;
            const lineColor =
              item.postPct >= 80
                ? '#096475'
                : item.postPct >= 60
                ? '#00afa9'
                : '#c62828';

            const displayName =
              (item.learner.name || 'Apprenant').length > 20
                ? (item.learner.name || 'Apprenant').slice(0, 19) + '…'
                : item.learner.name || 'Apprenant';

            return (
              <g
                key={item.emailKey + idx}
                className="cursor-pointer transition-opacity"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                onClick={() => onSelectLearner(item.emailKey)}
              >
                {/* Row highlight */}
                <rect
                  x={4}
                  y={cy - rowH / 2 + 2}
                  width={width - 8}
                  height={rowH - 4}
                  rx={6}
                  fill={isSelected ? '#e6f7f6' : isHovered ? '#f4f8f9' : 'transparent'}
                />

                {/* Learner Name */}
                <text
                  x={12}
                  y={cy + 4}
                  className={`text-[12px] font-semibold ${
                    isSelected || isHovered ? 'fill-[#096475]' : 'fill-[#1d2b30]'
                  }`}
                >
                  {displayName}
                </text>

                {/* Background track */}
                <line
                  x1={leftPad}
                  y1={cy}
                  x2={leftPad + plotW}
                  y2={cy}
                  stroke="#eef3f4"
                  strokeWidth={2}
                />

                {/* Progression Connector */}
                {item.hasPre && item.hasPost && (
                  <line
                    x1={xPre}
                    y1={cy}
                    x2={xPost}
                    y2={cy}
                    stroke={isPositive ? lineColor : '#c62828'}
                    strokeWidth={isHovered || isSelected ? 4 : 3}
                    strokeLinecap="round"
                  />
                )}

                {/* Pre dot */}
                {item.hasPre && (
                  <circle
                    cx={xPre}
                    cy={cy}
                    r={isHovered ? 6 : 5}
                    fill="#94a3b8"
                    stroke="#ffffff"
                    strokeWidth={1.5}
                  />
                )}

                {/* Post dot */}
                {item.hasPost && (
                  <circle
                    cx={xPost}
                    cy={cy}
                    r={isHovered ? 7.5 : 6.5}
                    fill={lineColor}
                    stroke="#ffffff"
                    strokeWidth={2}
                  />
                )}

                {/* Sim diamond */}
                {item.hasSim && (
                  <polygon
                    points={`${xSim},${cy - 6} ${xSim + 6},${cy} ${xSim},${cy + 6} ${xSim - 6},${cy}`}
                    fill="#ffa900"
                    stroke="#ffffff"
                    strokeWidth={1.5}
                  />
                )}

                {/* Delta label on right */}
                <text
                  x={width - 10}
                  y={cy + 4}
                  textAnchor="end"
                  className="text-[11px] font-mono font-bold tabular-nums"
                  fill={
                    !item.hasPre || !item.hasPost
                      ? '#6d7d83'
                      : isPositive
                      ? '#096475'
                      : '#c62828'
                  }
                >
                  {item.hasPre && item.hasPost
                    ? `${item.progression >= 0 ? '+' : ''}${item.progression} pts`
                    : item.hasPost
                    ? `${item.postPct}%`
                    : item.verdictCategory === 'pending'
                    ? 'J5 att.'
                    : '—'}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Interactive Hover Detail Strip */}
      <div className="mt-2 min-h-[38px] rounded-lg bg-[#f4f8f9] border border-[#e1e9eb] px-3.5 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
        {hovered ? (
          <>
            <span className="font-bold text-[#096475]">{hovered.learner.name}</span>
            <span className="text-[#47585e] font-mono tabular-nums">
              Pré-quiz : <strong>{hovered.hasPre ? `${hovered.prePct}%` : '—'}</strong> · Final :{' '}
              <strong>{hovered.hasPost ? `${hovered.postPct}%` : '—'}</strong>
              {hovered.hasSim ? ` · Simulation : ${hovered.simPct}%` : ''} ·{' '}
              {hovered.hasPre && hovered.hasPost ? (
                <>
                  Évolution :{' '}
                  <strong className={hovered.progression >= 0 ? 'text-[#096475]' : 'text-[#c62828]'}>
                    {hovered.progression >= 0 ? '+' : ''}
                    {hovered.progression} pts
                  </strong>
                </>
              ) : (
                <strong>Quiz final & évaluation en attente (reprise Groupe 2)</strong>
              )}
            </span>
          </>
        ) : (
          <span className="text-[#6d7d83]">
            Pointez une barre pour inspecter le détail pré-quiz / final / simulation, ou cliquez pour ouvrir l’analyse individuelle.
          </span>
        )}
      </div>
    </div>
  );
};
