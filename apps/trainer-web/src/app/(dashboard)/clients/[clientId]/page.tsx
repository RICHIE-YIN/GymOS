'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useClient, useWeightLogs, useNutritionLogs, useMacroTargets, useCheckIns } from '@/hooks/useClients';
import { useClientProgram } from '@/hooks/usePrograms';
import { WeightChart } from '@/components/charts/WeightChart';
import { MacroChart } from '@/components/charts/MacroChart';
import { ComplianceChart } from '@/components/charts/ComplianceChart';
import { ClientStatusBadge, GoalBadge, ExperienceBadge, ComplianceBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, StatCard } from '@/components/ui/Card';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn, getInitials, getAvatarColor, formatDate, formatRelativeTime, formatGoal, formatSplitType, formatWeight } from '@/lib/utils';
import {
  ArrowLeft,
  MessageCircle,
  Dumbbell,
  TrendingDown,
  TrendingUp,
  Minus,
  Activity,
  ClipboardCheck,
  Scale,
  Target,
  Calendar,
  Send,
  Zap,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

type Tab = 'overview' | 'program' | 'nutrition' | 'progress' | 'messages';

// Mock data for a demo client
const MOCK_CLIENT = {
  id: 'demo',
  name: 'Sarah Chen',
  email: 'sarah@example.com',
  phone: '+1 (555) 234-5678',
  goal: 'weight_loss' as const,
  experienceLevel: 'intermediate' as const,
  status: 'active' as const,
  trainerId: 'trainer1',
  metrics: { currentWeight: 68, startingWeight: 75, targetWeight: 62, weightUnit: 'kg' as const, heightUnit: 'cm' as const, height: 165, bodyFat: 24 },
  complianceRate: 91,
  lastActiveAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  joinedAt: '2024-01-15T00:00:00Z',
  checkInsDue: 0,
  weightTrend: 'down' as const,
  weightTrendValue: -1.8,
  avatarUrl: undefined,
};

const MOCK_WEIGHT_LOGS = [
  { date: '2024-01-15T00:00:00Z', weight: 75, unit: 'kg' as const },
  { date: '2024-01-22T00:00:00Z', weight: 74.2, unit: 'kg' as const },
  { date: '2024-01-29T00:00:00Z', weight: 73.5, unit: 'kg' as const },
  { date: '2024-02-05T00:00:00Z', weight: 72.8, unit: 'kg' as const },
  { date: '2024-02-12T00:00:00Z', weight: 72.1, unit: 'kg' as const },
  { date: '2024-02-19T00:00:00Z', weight: 71.3, unit: 'kg' as const },
  { date: '2024-02-26T00:00:00Z', weight: 70.5, unit: 'kg' as const },
  { date: '2024-03-04T00:00:00Z', weight: 69.8, unit: 'kg' as const },
  { date: '2024-03-11T00:00:00Z', weight: 68.9, unit: 'kg' as const },
  { date: '2024-03-18T00:00:00Z', weight: 68, unit: 'kg' as const },
];

const MOCK_COMPLIANCE_DATA = [
  { week: 'W1', rate: 85 },
  { week: 'W2', rate: 92 },
  { week: 'W3', rate: 88 },
  { week: 'W4', rate: 100 },
  { week: 'W5', rate: 85 },
  { week: 'W6', rate: 92 },
  { week: 'W7', rate: 96 },
  { week: 'W8', rate: 91 },
];

const MOCK_MESSAGES = [
  { id: '1', senderRole: 'client', senderName: 'Sarah Chen', content: 'Hey! Just finished Week 3 Day 2. That AMRAP was brutal but I loved it! 🔥', sentAt: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
  { id: '2', senderRole: 'trainer', senderName: 'You', content: 'Great work Sarah! That AMRAP is designed to push you. How did you feel energy-wise?', sentAt: new Date(Date.now() - 1000 * 60 * 25).toISOString() },
  { id: '3', senderRole: 'client', senderName: 'Sarah Chen', content: 'Pretty good actually! I had to drop the weight on the last set of thrusters but kept moving', sentAt: new Date(Date.now() - 1000 * 60 * 20).toISOString() },
  { id: '4', senderRole: 'trainer', senderName: 'You', content: 'That\'s perfectly fine - it\'s all about maintaining technique. You\'re progressing really well! Down 7kg since we started 💪', sentAt: new Date(Date.now() - 1000 * 60 * 15).toISOString() },
  { id: '5', senderRole: 'client', senderName: 'Sarah Chen', content: 'I know, I\'m so happy! Scale said 68.0 this morning. Can we review my nutrition plan?', sentAt: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
];

const TABS: { value: Tab; label: string }[] = [
  { value: 'overview', label: 'Overview' },
  { value: 'program', label: 'Program' },
  { value: 'nutrition', label: 'Nutrition' },
  { value: 'progress', label: 'Progress' },
  { value: 'messages', label: 'Messages' },
];

export default function ClientDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const clientId = params.clientId as string;
  const [activeTab, setActiveTab] = useState<Tab>(
    (searchParams.get('tab') as Tab) || 'overview'
  );
  const [messageText, setMessageText] = useState('');

  const { data: client, isLoading: clientLoading } = useClient(clientId);
  const { data: weightLogs } = useWeightLogs(clientId);
  const { data: nutritionLogs } = useNutritionLogs(clientId);
  const { data: macroTargets } = useMacroTargets(clientId);
  const { data: checkIns } = useCheckIns(clientId);
  const { data: program } = useClientProgram(clientId);

  // Use mock data when API isn't connected
  const displayClient = client || MOCK_CLIENT;
  const displayWeightLogs = weightLogs || MOCK_WEIGHT_LOGS;
  const displayMessages = MOCK_MESSAGES;

  if (clientLoading) return <PageLoader text="Loading client..." />;

  const weightChange = displayClient.metrics.currentWeight && displayClient.metrics.startingWeight
    ? displayClient.metrics.currentWeight - displayClient.metrics.startingWeight
    : null;

  return (
    <div className="page-container">
      {/* Back navigation */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/clients">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Clients
          </Button>
        </Link>
      </div>

      {/* Client header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          {/* Avatar */}
          {displayClient.avatarUrl ? (
            <img
              src={displayClient.avatarUrl}
              alt={displayClient.name}
              className="h-16 w-16 rounded-2xl object-cover shrink-0"
            />
          ) : (
            <div
              className={cn(
                'h-16 w-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold shrink-0',
                getAvatarColor(displayClient.name)
              )}
            >
              {getInitials(displayClient.name)}
            </div>
          )}

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start gap-2 mb-1">
              <h2 className="text-xl font-bold text-slate-900">{displayClient.name}</h2>
              <ClientStatusBadge status={displayClient.status} />
            </div>
            <p className="text-slate-500 text-sm mb-3">{displayClient.email}</p>
            <div className="flex flex-wrap items-center gap-2">
              <GoalBadge goal={displayClient.goal} />
              <ExperienceBadge level={displayClient.experienceLevel} />
              <span className="text-xs text-slate-400">
                Member since {formatDate(displayClient.joinedAt)}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<MessageCircle className="h-4 w-4" />}
              onClick={() => setActiveTab('messages')}
            >
              Message
            </Button>
            <Link href={`/clients/${clientId}/assign-program`}>
              <Button size="sm" leftIcon={<Dumbbell className="h-4 w-4" />}>
                Assign Program
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-6 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
              activeTab === tab.value
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Metric cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Current Weight"
              value={displayClient.metrics.currentWeight
                ? formatWeight(displayClient.metrics.currentWeight, displayClient.metrics.weightUnit)
                : 'N/A'
              }
              icon={<Scale className="h-5 w-5 text-brand-600" />}
              iconBg="bg-brand-50"
              change={weightChange ? {
                value: `${weightChange > 0 ? '+' : ''}${weightChange.toFixed(1)}${displayClient.metrics.weightUnit} total`,
                positive: weightChange < 0,
              } : undefined}
            />
            <StatCard
              title="Target Weight"
              value={displayClient.metrics.targetWeight
                ? formatWeight(displayClient.metrics.targetWeight, displayClient.metrics.weightUnit)
                : 'Not set'
              }
              icon={<Target className="h-5 w-5 text-green-600" />}
              iconBg="bg-green-50"
            />
            <StatCard
              title="Compliance"
              value={`${displayClient.complianceRate}%`}
              icon={<Activity className="h-5 w-5 text-purple-600" />}
              iconBg="bg-purple-50"
              change={{ value: '8-week average', positive: displayClient.complianceRate >= 75 }}
            />
            <StatCard
              title="Last Active"
              value={formatRelativeTime(displayClient.lastActiveAt)}
              icon={<Calendar className="h-5 w-5 text-orange-500" />}
              iconBg="bg-orange-50"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <h3 className="font-semibold text-slate-900 mb-4">Weight Trend</h3>
              {displayWeightLogs.length > 0 ? (
                <WeightChart
                  data={displayWeightLogs}
                  targetWeight={displayClient.metrics.targetWeight}
                  unit={displayClient.metrics.weightUnit}
                  height={220}
                />
              ) : (
                <EmptyState title="No weight data" description="This client hasn't logged any weight yet." />
              )}
            </Card>

            <Card>
              <h3 className="font-semibold text-slate-900 mb-4">Workout Compliance</h3>
              <ComplianceChart data={MOCK_COMPLIANCE_DATA} height={220} />
            </Card>
          </div>

          {/* Recent check-ins */}
          {checkIns && checkIns.length > 0 ? (
            <Card>
              <h3 className="font-semibold text-slate-900 mb-4">Recent Check-ins</h3>
              <div className="space-y-3">
                {checkIns.slice(0, 3).map((ci) => (
                  <div key={ci.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <ClipboardCheck className="h-5 w-5 text-brand-600 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">{formatDate(ci.date)}</p>
                      {ci.notes && <p className="text-xs text-slate-500 mt-0.5">{ci.notes}</p>}
                    </div>
                    <div className="text-xs text-slate-500">
                      {ci.weight && `${ci.weight}${ci.weightUnit}`}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ) : null}
        </div>
      )}

      {activeTab === 'program' && (
        <div className="space-y-6">
          {program ? (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{program.name}</h3>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {formatSplitType(program.splitType)} · {program.durationWeeks} weeks · {program.daysPerWeek} days/week
                  </p>
                </div>
                <Link href={`/clients/${clientId}/assign-program`}>
                  <Button variant="outline" size="sm">Reassign Program</Button>
                </Link>
              </div>

              {program.weeks.map((week) => (
                <Card key={week.id} padding="none">
                  <div className="px-5 py-4 border-b border-slate-100">
                    <h4 className="font-medium text-slate-900">Week {week.weekNumber}</h4>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {week.days.map((day) => (
                      <div key={day.id} className="px-5 py-4 flex items-center gap-4">
                        <div
                          className={cn(
                            'h-8 w-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0',
                            day.isRestDay ? 'bg-slate-100 text-slate-500' : 'bg-brand-600 text-white'
                          )}
                        >
                          {day.dayNumber}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900">{day.name}</p>
                          {!day.isRestDay && (
                            <p className="text-xs text-slate-500 mt-0.5">
                              {day.exercises.length} exercises
                            </p>
                          )}
                        </div>
                        {day.isRestDay && (
                          <span className="text-xs text-slate-400">Rest Day</span>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </>
          ) : (
            <EmptyState
              icon={<Dumbbell className="h-8 w-8" />}
              title="No program assigned"
              description="This client doesn't have an active training program yet."
              action={{
                label: 'Assign Program',
                onClick: () => window.location.href = `/clients/${clientId}/assign-program`,
              }}
            />
          )}
        </div>
      )}

      {activeTab === 'nutrition' && (
        <div className="space-y-6">
          {macroTargets ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard title="Daily Calories" value={`${macroTargets.calories} kcal`} icon={<Zap className="h-5 w-5 text-orange-500" />} iconBg="bg-orange-50" />
              <StatCard title="Protein" value={`${macroTargets.protein}g`} icon={<TrendingUp className="h-5 w-5 text-blue-600" />} iconBg="bg-blue-50" />
              <StatCard title="Carbs" value={`${macroTargets.carbs}g`} icon={<TrendingUp className="h-5 w-5 text-amber-600" />} iconBg="bg-amber-50" />
              <StatCard title="Fat" value={`${macroTargets.fat}g`} icon={<TrendingUp className="h-5 w-5 text-red-600" />} iconBg="bg-red-50" />
            </div>
          ) : (
            <Card>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Daily Calories', value: '1,750 kcal', color: 'text-orange-500' },
                  { label: 'Protein', value: '140g', color: 'text-blue-600' },
                  { label: 'Carbs', value: '175g', color: 'text-amber-600' },
                  { label: 'Fat', value: '58g', color: 'text-red-600' },
                ].map((m) => (
                  <div key={m.label} className="text-center p-4 bg-slate-50 rounded-xl">
                    <p className={cn('text-2xl font-bold', m.color)}>{m.value}</p>
                    <p className="text-xs text-slate-500 mt-1">{m.label}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <Card>
            <h3 className="font-semibold text-slate-900 mb-4">Recent Nutrition Logs</h3>
            {nutritionLogs && nutritionLogs.length > 0 ? (
              <MacroChart data={nutritionLogs} targets={macroTargets} />
            ) : (
              <EmptyState
                title="No nutrition data"
                description="This client hasn't logged any meals recently."
              />
            )}
          </Card>
        </div>
      )}

      {activeTab === 'progress' && (
        <div className="space-y-6">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">Weight Progress</h3>
              <div className="flex items-center gap-1.5 text-sm text-success-600 font-medium">
                <TrendingDown className="h-4 w-4" />
                {weightChange ? `${Math.abs(weightChange).toFixed(1)}kg lost` : 'No change'}
              </div>
            </div>
            <WeightChart
              data={displayWeightLogs}
              targetWeight={displayClient.metrics.targetWeight}
              unit={displayClient.metrics.weightUnit}
              height={280}
            />
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <h3 className="font-semibold text-slate-900 mb-4">Body Measurements</h3>
              <EmptyState
                title="No measurements logged"
                description="Body measurement data will appear here once logged."
              />
            </Card>
            <Card>
              <h3 className="font-semibold text-slate-900 mb-4">Progress Photos</h3>
              <EmptyState
                title="No progress photos"
                description="Progress photos will appear here when submitted."
              />
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'messages' && (
        <Card padding="none" className="flex flex-col h-[600px]">
          {/* Messages header */}
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
            <div className={cn('h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold', getAvatarColor(displayClient.name))}>
              {getInitials(displayClient.name)}
            </div>
            <div>
              <p className="font-medium text-slate-900 text-sm">{displayClient.name}</p>
              <p className="text-xs text-green-500">Active recently</p>
            </div>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {displayMessages.map((msg) => {
              const isTrainer = msg.senderRole === 'trainer';
              return (
                <div key={msg.id} className={cn('flex', isTrainer ? 'justify-end' : 'justify-start')}>
                  <div
                    className={cn(
                      'max-w-[75%] rounded-2xl px-4 py-2.5',
                      isTrainer
                        ? 'bg-brand-600 text-white rounded-tr-sm'
                        : 'bg-slate-100 text-slate-900 rounded-tl-sm'
                    )}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <p className={cn('text-xs mt-1', isTrainer ? 'text-blue-200' : 'text-slate-400')}>
                      {formatRelativeTime(msg.sentAt)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Message input */}
          <div className="px-5 py-4 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Type a message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    setMessageText('');
                  }
                }}
              />
              <Button
                size="sm"
                className="rounded-xl"
                leftIcon={<Send className="h-4 w-4" />}
                onClick={() => setMessageText('')}
              >
                Send
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
