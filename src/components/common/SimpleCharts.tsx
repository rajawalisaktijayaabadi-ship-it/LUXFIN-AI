import React from 'react';

export const MiniSparkline: React.FC<{
  data: number[];
  color?: string;
  height?: number;
}> = ({ data, color = '#E2B963', height = 30 }) => {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * 100;
      const y = height - ((val - min) / range) * (height - 6) - 3;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg className="w-full overflow-visible" height={height} viewBox={`0 0 100 ${height}`}>
      <polyline fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={points} />
    </svg>
  );
};

export interface BarChartData {
  label: string;
  value: number;
  color?: string;
}

export const SimpleBarChart: React.FC<{
  data: BarChartData[];
  height?: number;
}> = ({ data, height = 120 }) => {
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="flex items-end justify-between gap-2 pt-2" style={{ height }}>
      {data.map((item, idx) => {
        const heightPct = (item.value / maxValue) * 100;
        return (
          <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
            <span className="text-[9px] text-[#9CA3AF] font-mono">
              {item.value > 1000000 ? `${(item.value / 1000000).toFixed(1)}jt` : item.value}
            </span>
            <div
              className="w-full rounded-t-lg transition-all duration-500"
              style={{
                height: `${Math.max(8, heightPct)}%`,
                backgroundColor: item.color || '#E2B963',
              }}
            />
            <span className="text-[10px] text-[#9CA3AF] font-semibold truncate w-full text-center">
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export const SimpleDonutChart: React.FC<{
  items: { label: string; value: number; color: string }[];
  size?: number;
}> = ({ items, size = 100 }) => {
  const total = items.reduce((sum, item) => sum + item.value, 0) || 1;
  let cumulativeAngle = 0;

  return (
    <div className="flex items-center gap-4">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox="0 0 36 36" className="transform -rotate-90">
          {items.map((item, idx) => {
            const pct = (item.value / total) * 100;
            const strokeDasharray = `${pct} ${100 - pct}`;
            const strokeDashoffset = -cumulativeAngle;
            cumulativeAngle += pct;

            return (
              <circle
                key={idx}
                cx="18"
                cy="18"
                r="15.91549430918954"
                fill="transparent"
                stroke={item.color}
                strokeWidth="4"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
              />
            );
          })}
        </svg>
      </div>

      <div className="space-y-1.5 flex-1">
        {items.map((item, idx) => {
          const pct = ((item.value / total) * 100).toFixed(1);
          return (
            <div key={idx} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 truncate">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-[#9CA3AF] truncate">{item.label}</span>
              </div>
              <span className="text-[#F7F6F2] font-semibold">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
