import React from 'react';
import { VerdictBucket, VerdictCategory } from '../../types/dashboard';

interface Props {
  buckets: VerdictBucket[];
  total: number;
  activeFilter: VerdictCategory | 'all';
  onFilterChange: (cat: VerdictCategory | 'all') => void;
}

export const VerdictDistributionChart: React.FC<Props> = ({
  buckets,
  total,
  activeFilter,
  onFilterChange,
}) => {
  if (!total) return null;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div>
          <h4 className="text-base font-bold text-[#096475]">
            Distribution des niveaux de maîtrise
          </h4>
          <p className="text-xs text-[#6d7d83]">
            Cliquez sur un niveau pour filtrer les bilans individuels ci-dessous.
          </p>
        </div>
        {activeFilter !== 'all' && (
          <button
            type="button"
            onClick={() => onFilterChange('all')}
            className="text-xs font-bold text-[#00afa9] hover:underline no-print"
          >
            Réinitialiser le filtre
          </button>
        )}
      </div>

      {/* Proportional Stacked Bar */}
      <div className="h-4 w-full rounded-full overflow-hidden flex bg-[#eef3f4] mb-4">
        {buckets.map((b) =>
          b.count > 0 ? (
            <button
              key={b.category}
              type="button"
              onClick={() =>
                onFilterChange(activeFilter === b.category ? 'all' : b.category)
              }
              title={`${b.label} : ${b.count} (${b.percentage}%)`}
              style={{ width: `${b.percentage}%`, backgroundColor: b.color }}
              className="h-full transition-opacity hover:opacity-85 cursor-pointer border-r border-white last:border-r-0"
            />
          ) : null
        )}
      </div>

      {/* Interactive Breakdown Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {buckets.map((b) => {
          const isActive = activeFilter === b.category;
          return (
            <button
              key={b.category}
              type="button"
              onClick={() =>
                onFilterChange(isActive ? 'all' : b.category)
              }
              className={`text-left rounded-xl p-3 border transition-all cursor-pointer ${
                isActive
                  ? 'border-[#096475] bg-[#f0f9f9]'
                  : 'border-[#e5ecee] bg-[#fafcfd] hover:border-[#b7ced2]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-[#1d2b30]">{b.label}</span>
                <span
                  className="w-2.5 h-2.5 rounded-sm shrink-0"
                  style={{ backgroundColor: b.color }}
                />
              </div>
              <div className="text-xl font-black text-[#096475] font-mono tabular-nums leading-tight">
                {b.count}
                <span className="text-xs font-semibold text-[#6d7d83] ml-1.5">
                  ({b.percentage}%)
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
