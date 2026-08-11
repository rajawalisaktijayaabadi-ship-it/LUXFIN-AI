import React from 'react';

export interface ProgressBarProps {
  value: number; // 0 - 100
  max?: number;
  label?: string;
  showValue?: boolean;
  color?: 'gold' | 'emerald' | 'crimson' | 'amber';
  height?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  showValue = true,
  color = 'gold',
  height = 'md',
  className = '',
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  }[height];

  const colorClasses = {
    gold: 'bg-gradient-to-r from-[#E2B963] to-[#F3E5AB]',
    emerald: 'bg-gradient-to-r from-emerald-500 to-teal-400',
    crimson: 'bg-gradient-to-r from-red-500 to-rose-400',
    amber: 'bg-gradient-to-r from-amber-500 to-yellow-400',
  }[color];

  return (
    <div className={`space-y-1.5 text-xs w-full ${className}`}>
      {(label || showValue) && (
        <div className="flex justify-between items-center text-[11px] font-semibold">
          {label && <span className="text-[#9CA3AF]">{label}</span>}
          {showValue && <span className="text-[#F7F6F2]">{percentage.toFixed(0)}%</span>}
        </div>
      )}
      <div className={`w-full bg-white/10 rounded-full overflow-hidden ${heightClasses}`}>
        <div
          className={`${colorClasses} ${heightClasses} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export const CircularProgress: React.FC<{
  value: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  children?: React.ReactNode;
}> = ({ value, size = 64, strokeWidth = 6, color = '#E2B963', children }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
};

export const StepIndicator: React.FC<{
  steps: string[];
  currentStep: number;
  className?: string;
}> = ({ steps, currentStep, className = '' }) => {
  return (
    <div className={`flex items-center justify-between w-full ${className}`}>
      {steps.map((step, idx) => {
        const isCompleted = idx < currentStep;
        const isCurrent = idx === currentStep;
        return (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-7 h-7 rounded-full text-[11px] font-bold flex items-center justify-center transition-all ${
                  isCompleted
                    ? 'bg-[#E2B963] text-black'
                    : isCurrent
                    ? 'bg-[#14171E] text-[#E2B963] border-2 border-[#E2B963]'
                    : 'bg-white/5 text-[#9CA3AF] border border-white/10'
                }`}
              >
                {idx + 1}
              </div>
              <span className={`text-[10px] ${isCurrent ? 'text-white font-semibold' : 'text-[#9CA3AF]'}`}>
                {step}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 ${
                  idx < currentStep ? 'bg-[#E2B963]' : 'bg-white/10'
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
