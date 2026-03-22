'use client';

import React from 'react';
import { Card, StatCard } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ComplianceChart } from '@/components/charts/ComplianceChart';
import { cn } from '@/lib/utils';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from 'recharts';
import {
  Users,
  TrendingUp,
  Activity,
  ClipboardCheck,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

// Mock analytics data
const retentionData = [
  { month: 'Oct', retained: 18, new: 3, churned: 1 },
  { month: 'Nov', retained: 20, new: 4, churned: 2 },
  { month: 'Dec', retained: 19, new: 2, churned: 3 },
  { month: 'Jan', retained: 21, new: 5, churned: 1 },
  { month: 'Feb', retained: 23, new: 4, churned: 2 },
  { month: 'Mar', retained: 24, new: 3, churned: 2 },
];

const complianceData = [
  { week: 'W1', rate: 72 },
  { week: 'W2', rate: 78 },
  { week: 'W3', rate: 85 },
  { week: 'W4', rate: 81 },
  { week: 'W5', rate: 88 },
  { week: 'W6', rate: 91 },
  { week: 'W7', rate: 86 },
  { week: 'W8', rate: 89 },
  { week: 'W9', rate: 93 },
  { week: 'W10', rate: 90 },
  { week: 'W11', rate: 87 },
  { week: 'W12', rate: 83 },
];

const goalDistribution = [
  { name: 'Weight Loss', value: 35, color: '#ef4444' },
  { name: 'Muscle Gain', value: 28, color: '#3b82f6' },
  { name: 'Strength', value: 18, color: '#8b5cf6' },
  { name: 'General Fitness', value: 12, color: '#22c55e' },
  { name: 'Other', value: 7, color: '#94a3b8' },
];

const splitDistribution = [
  { split: 'PPL', clients: 8, percentage: 33 },
  { split: 'Upper/Lower', clients: 7, percentage: 29 },
  { split: 'Full Body', clients: 5, percentage: 21 },
  { split: 'Bro Split', clients: 3, percentage: 13 },
  { split: 'Custom', clients: 1, percentage: 4 },
];

const revenueData = [
  { month: 'Oct', revenue: 2850 },
  { month: 'Nov', revenue: 3200 },
  { month: 'Dec', revenue: 2950 },
  { month: 'Jan', revenue: 3600 },
  { month: 'Feb', revenue: 3850 },
  { month: 'Mar', revenue: 4200 },
];

const checkInData = [
  { week: 'W1', submitted: 18, reviewed: 14 },
  { week: 'W2', submitted: 20, reviewed: 18 },
  { week: 'W3', submitted: 17, reviewed: 17 },
  { week: 'W4', submitted: 22, reviewed: 19 },
  { week: 'W5', submitted: 21, reviewed: 21 },
  { week: 'W6', submitted: 19, reviewed: 16 },
];

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3">
      <p className="text-xs text-slate-500 mb-2">{label}</p>
      {payload.map((item) => (
        <div key={item.name} className="flex items-center gap-2 text-sm">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
          <span className="text-slate-600 capitalize">{item.name}:</span>
          <span className="font-semibold text-slate-900">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <div className="page-container">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-slate-900">Analytics</h2>
        <p className="text-slate-500 text-sm mt-0.5">Platform performance overview · Last 90 days</p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Clients"
          value="24"
          icon={<Users className="h-5 w-5 text-brand-600" />}
          iconBg="bg-brand-50"
          change={{ value: '+3 this month', positive: true }}
        />
        <StatCard
          title="Client Retention"
          value="91%"
          icon={<TrendingUp className="h-5 w-5 text-green-600" />}
          iconBg="bg-green-50"
          change={{ value: '+2% vs last month', positive: true }}
        />
        <StatCard
          title="Avg Compliance"
          value="87%"
          icon={<Activity className="h-5 w-5 text-purple-600" />}
          iconBg="bg-purple-50"
          change={{ value: '+5% vs last month', positive: true }}
        />
        <StatCard
          title="Revenue (MRR)"
          value="$4,200"
          icon={<DollarSign className="h-5 w-5 text-amber-600" />}
          iconBg="bg-amber-50"
          change={{ value: '+9% vs last month', positive: true }}
        />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Client retention */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-900">Client Retention</h3>
              <p className="text-xs text-slate-500 mt-0.5">Monthly active, new, and churned clients</p>
            </div>
            <Badge variant="success">91% rate</Badge>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={retentionData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={25} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="retained" name="Retained" stackId="1" stroke="#3b82f6" fill="#dbeafe" strokeWidth={2} />
              <Area type="monotone" dataKey="new" name="New" stackId="1" stroke="#22c55e" fill="#dcfce7" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Revenue */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-900">Monthly Revenue</h3>
              <p className="text-xs text-slate-500 mt-0.5">Total training revenue over 6 months</p>
            </div>
            <div className="flex items-center gap-1 text-sm text-success-600 font-medium">
              <ArrowUpRight className="h-4 w-4" />
              +47%
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={revenueData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} width={45} />
              <Tooltip
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" fill="#ede9fe" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Compliance over time */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-slate-900">Compliance Trend</h3>
                <p className="text-xs text-slate-500 mt-0.5">12-week workout completion rate</p>
              </div>
              <Badge variant="success">87% avg</Badge>
            </div>
            <ComplianceChart data={complianceData} height={200} />
          </Card>
        </div>

        {/* Goal distribution */}
        <Card>
          <div className="mb-4">
            <h3 className="font-semibold text-slate-900">Client Goals</h3>
            <p className="text-xs text-slate-500 mt-0.5">Distribution of client goals</p>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={goalDistribution}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={65}
                paddingAngle={2}
                dataKey="value"
              >
                {goalDistribution.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {goalDistribution.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600">{item.name}</span>
                </div>
                <span className="font-medium text-slate-900">{item.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Check-in rates */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-900">Check-in Completion</h3>
              <p className="text-xs text-slate-500 mt-0.5">Submitted vs reviewed weekly</p>
            </div>
            <Badge variant="primary">6-week view</Badge>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={checkInData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={25} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="submitted" name="Submitted" fill="#93c5fd" radius={[2, 2, 0, 0]} maxBarSize={30} />
              <Bar dataKey="reviewed" name="Reviewed" fill="#3b82f6" radius={[2, 2, 0, 0]} maxBarSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Popular splits */}
        <Card>
          <div className="mb-4">
            <h3 className="font-semibold text-slate-900">Popular Training Splits</h3>
            <p className="text-xs text-slate-500 mt-0.5">Most used program structures</p>
          </div>
          <div className="space-y-3">
            {splitDistribution.map((item, i) => (
              <div key={item.split}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-700">{item.split}</span>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-slate-500">{item.clients} clients</span>
                    <span className="font-medium text-slate-900">{item.percentage}%</span>
                  </div>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: ['#3b82f6', '#8b5cf6', '#22c55e', '#f59e0b', '#94a3b8'][i],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
