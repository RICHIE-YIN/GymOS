'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { NutritionLog, MacroTargets } from '@/types';

interface MacroChartProps {
  data: NutritionLog[];
  targets?: MacroTargets;
  height?: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 min-w-[140px]">
      <p className="text-xs text-slate-500 mb-2">{label}</p>
      {payload.map((item) => (
        <div key={item.name} className="flex items-center justify-between gap-3 text-sm">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-slate-600 capitalize">{item.name}</span>
          </span>
          <span className="font-medium text-slate-900">
            {item.name === 'calories' ? `${item.value} kcal` : `${item.value}g`}
          </span>
        </div>
      ))}
    </div>
  );
}

export function MacroChart({ data, height = 220 }: MacroChartProps) {
  const chartData = [...data]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-14) // Last 14 days
    .map((log) => ({
      ...log,
      dateLabel: format(parseISO(log.date), 'MMM d'),
    }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis
          dataKey="dateLabel"
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          axisLine={false}
          tickLine={false}
          width={35}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
        />
        <Bar dataKey="protein" name="protein" fill="#3b82f6" radius={[2, 2, 0, 0]} maxBarSize={32} stackId="macro" />
        <Bar dataKey="carbs" name="carbs" fill="#f59e0b" radius={[0, 0, 0, 0]} maxBarSize={32} stackId="macro" />
        <Bar dataKey="fat" name="fat" fill="#ef4444" radius={[2, 2, 0, 0]} maxBarSize={32} stackId="macro" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default MacroChart;
