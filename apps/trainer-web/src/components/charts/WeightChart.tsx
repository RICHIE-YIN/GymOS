'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { WeightLog } from '@/types';

interface WeightChartProps {
  data: WeightLog[];
  targetWeight?: number;
  unit?: 'kg' | 'lbs';
  height?: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: WeightLog }>;
  label?: string;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3">
      <p className="text-xs text-slate-500">
        {format(parseISO(item.payload.date), 'MMM d, yyyy')}
      </p>
      <p className="text-sm font-semibold text-slate-900 mt-0.5">
        {item.value.toFixed(1)} {item.payload.unit}
      </p>
      {item.payload.bodyFat && (
        <p className="text-xs text-slate-500 mt-0.5">Body fat: {item.payload.bodyFat}%</p>
      )}
    </div>
  );
}

export function WeightChart({
  data,
  targetWeight,
  unit = 'kg',
  height = 250,
}: WeightChartProps) {
  const chartData = [...data]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((log) => ({
      ...log,
      dateLabel: format(parseISO(log.date), 'MMM d'),
    }));

  const weights = chartData.map((d) => d.weight);
  const minWeight = Math.min(...weights);
  const maxWeight = Math.max(...weights);
  const padding = (maxWeight - minWeight) * 0.1 || 2;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis
          dataKey="dateLabel"
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[minWeight - padding, maxWeight + padding]}
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${v.toFixed(0)}${unit}`}
          width={45}
        />
        <Tooltip content={<CustomTooltip />} />
        {targetWeight && (
          <ReferenceLine
            y={targetWeight}
            stroke="#22c55e"
            strokeDasharray="4 4"
            strokeWidth={1.5}
            label={{
              value: `Goal: ${targetWeight}${unit}`,
              fill: '#16a34a',
              fontSize: 11,
              position: 'right',
            }}
          />
        )}
        <Line
          type="monotone"
          dataKey="weight"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={{ r: 3, fill: '#3b82f6', strokeWidth: 0 }}
          activeDot={{ r: 5, fill: '#2563eb', strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default WeightChart;
