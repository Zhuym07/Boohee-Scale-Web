import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  evaluation?: {
    label: string; // Translated text like "Normal", "Overweight"
    status: 'normal' | 'warning' | 'danger' | 'info' | 'low' | 'high' | 'veryHigh' | 'underweight' | 'overweight' | 'obese';
  };
  description?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ label, value, unit, evaluation, description }) => {
  let badgeColor = 'bg-gray-800 text-gray-400';

  if (evaluation) {
    const s = evaluation.status;
    if (s === 'normal') {
      badgeColor = 'bg-green-500/20 text-green-400';
    } else if (s === 'low' || s === 'underweight') {
      badgeColor = 'bg-blue-500/20 text-blue-400';
    } else if (s === 'high' || s === 'overweight') {
      badgeColor = 'bg-yellow-500/20 text-yellow-400';
    } else if (s === 'veryHigh' || s === 'obese') {
      badgeColor = 'bg-red-500/20 text-red-400';
    }
  }

  return (
    <article className="bg-surface rounded-lg p-5 border border-slate-700 shadow-lg hover:border-boohee/50 transition-colors flex flex-col justify-between min-h-[126px]">
      <div>
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider">{label}</h3>
          {description && <span className="text-[10px] text-gray-500 hidden sm:inline-block">{description}</span>}
        </div>
        <div className="flex items-baseline mb-2">
          <span className="text-3xl font-bold text-white">{value}</span>
          {unit && <span className="ml-1 text-sm text-gray-400">{unit}</span>}
        </div>
      </div>
      
      {evaluation && (
        <div className={`self-start px-2 py-1 rounded text-[10px] font-bold uppercase ${badgeColor}`}>
          {evaluation.label}
        </div>
      )}
    </article>
  );
};
