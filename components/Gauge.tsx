import React from 'react';

interface GaugeProps {
  value: number;
  max: number;
  label: string;
  unit: string;
  statusLabel: string; // "LOCKED" or "MEASURING"
  isStable: boolean;
}

export const Gauge: React.FC<GaugeProps> = ({ value, max, label, unit, statusLabel, isStable }) => {
  const radius = 120;
  const stroke = 15;
  const normalizedValue = Math.min(value, max);
  const strokeDasharray = `${(normalizedValue / max) * (2 * Math.PI * radius)} ${2 * Math.PI * radius}`;
  
  // Color determination: Green (#22C55E) if stable, Slate-400 (#94a3b8) if measuring
  const strokeColor = isStable ? "#22C55E" : "#94a3b8";

  return (
    <div className="relative flex flex-col items-center justify-center p-2 sm:p-6 w-full">
      <div className="relative w-full max-w-72 aspect-square">
        {/* Background Circle */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 300 300">
          <circle
            cx="150"
            cy="150"
            r={radius}
            stroke="#1E293B" // surface color
            strokeWidth={stroke}
            fill="transparent"
          />
          {/* Progress Circle */}
          <circle
            cx="150"
            cy="150"
            r={radius}
            stroke={strokeColor}
            strokeWidth={stroke}
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeLinecap="round"
            className={`transition-all duration-500 ease-out ${isStable ? 'opacity-100' : 'opacity-60'}`}
          />
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-gray-400 text-sm tracking-widest uppercase mb-2">{label}</span>
          <div className="flex items-baseline">
            <span className={`text-5xl sm:text-6xl font-bold font-mono ${isStable ? 'text-white' : 'text-gray-300'}`}>
              {value.toFixed(2)}
            </span>
            <span className={`text-xl ml-2 ${isStable ? 'text-boohee' : 'text-gray-500'}`}>{unit}</span>
          </div>
          <div className={`mt-4 px-3 py-1 rounded-full text-xs font-bold ${isStable ? 'bg-boohee text-black' : 'bg-gray-800 text-gray-400'}`}>
            {statusLabel}
          </div>
        </div>
      </div>
    </div>
  );
};
