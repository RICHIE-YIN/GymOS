'use client';

import React from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';
import { useClientSummary, useActivityFeed, useClientsNeedingAttention } from '@/hooks/useClients';
import { StatCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ClientStatusBadge } from '@/components/ui/Badge';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { ComplianceChart } from '@/components/charts/ComplianceChart';
import { InviteClientModal } from '@/components/clients/InviteClientModal';
import { cn, getInitials, getAvatarColor, formatRelativeTime, formatGoal } from '@/lib/utils';
import {
  Users,
  Activity,
  ClipboardCheck,
  TrendingUp,
  UserPlus,
  BookOpen,
  MessageCircle,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';

// Mock compliance data for the chart
const mockComplianceData = [
  { week: 'W1', rate: 72 },
  { week: 'W2', rate: 85 },
  { week: 'W3', rate: 78 },
  { week: 'W4', rate: 91 },
  { week: 'W5', rate: 88 },
  { week: 'W6', rate: 76 },
  { week: 'W7', rate: 93 },
  { week: 'W8', rate: 89 },
];

// Mock messages
const mockMessages = [
  {
    id: '1',
    from: 'Sarah Chen',
    preview: 'Hey! Just finished Week 3 Day 2. That AMRAP was brutal 🔥',
    time: '10 min ago',
    unread: true,
    avatarColor: 'bg-purple-500',
  },
  {
    id: '2',
    from: 'Marcus Lee',
    preview: 'Quick question about the overhead press form...',
    time: '2 hours ago',
    unread: true,
    avatarColor: 'bg-green-500',
  },
  {
    id: '3',
    from: 'Jordan Kim',
    preview: 'Feeling amazing! Down 3 lbs this week 🎉',
    time: '5 hours ago',
    unread: false,
    avatarColor: 'bg-orange-500',
  },
];

export default function DashboardPage() {
  const { trainer } = useAuthStore();
  const [inviteOpen, setInviteOpen] = React.useState(false);

  const { data: summary, isLoading: summaryLoading } = useClientSummary();
  const { data: activityFeed, isLoading: activityLoading } = useActivityFeed(10);
  const { data: needsAttention, isLoading: attentionLoading } = useClientsNeedingAttention();

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (summaryLoading) return <PageLoader text="Loading dashboard..." />;

  // Use mock data as fallback when API is not connected
  const stats = summary || {
    totalClients: 24,
    activeThisWeek: 18,
    checkInsDue: 7,
    avgCompliance: 83,
  };

  return (
    <div className="page-container">
      {/* Welcome header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            {greeting()}, {trainer?.name?.split(' ')[0] || 'Trainer'} 👋
          </h2>
          <p className="text-slate-500 mt-1">
            Here&apos;s what&apos;s happening with your clients today.
          </p>
        </div>
        <Button
          leftIcon={<UserPlus className="h-4 w-4" />}
          onClick={() => setInviteOpen(true)}
          className="hidden sm:flex"
        >
          Invite Client
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Clients"
          value={stats.totalClients}
          icon={<Users className="h-5 w-5 text-brand-600" />}
          iconBg="bg-brand-50"
          change={{ value: '2 this month', positive: true }}
        />
        <StatCard
          title="Active This Week"
          value={stats.activeThisWeek}
          icon={<Activity className="h-5 w-5 text-green-600" />}
          iconBg="bg-green-50"
          change={{ value: `${Math.round((stats.activeThisWeek / stats.totalClients) * 100)}% of roster`, positive: true }}
        />
        <StatCard
          title="Check-ins Due"
          value={stats.checkInsDue}
          icon={<ClipboardCheck className="h-5 w-5 text-orange-500" />}
          iconBg="bg-orange-50"
          change={{ value: 'Need review', positive: false }}
        />
        <StatCard
          title="Avg Compliance"
          value={`${stats.avgCompliance}%`}
          icon={<TrendingUp className="h-5 w-5 text-purple-600" />}
          iconBg="bg-purple-50"
          change={{ value: '+4% vs last week', positive: true }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Compliance chart */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-slate-900">Workout Compliance</h3>
                <p className="text-sm text-slate-500 mt-0.5">8-week rolling average across all clients</p>
              </div>
              <Badge variant="success" dot>83% avg</Badge>
            </div>
            <ComplianceChart data={mockComplianceData} height={200} />
          </div>

          {/* Activity feed */}
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900">Recent Activity</h3>
              <Link href="/clients" className="text-sm text-brand-600 hover:text-brand-700 font-medium">
                View all
              </Link>
            </div>
            <div className="divide-y divide-slate-50">
              {activityLoading ? (
                <div className="px-6 py-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 py-3 animate-pulse">
                      <div className="h-8 w-8 rounded-full bg-slate-200 shrink-0" />
                      <div className="flex-1">
                        <div className="h-3.5 bg-slate-200 rounded w-48 mb-1.5" />
                        <div className="h-3 bg-slate-200 rounded w-28" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : activityFeed && activityFeed.length > 0 ? (
                activityFeed.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 px-6 py-3.5">
                    {item.clientAvatarUrl ? (
                      <img src={item.clientAvatarUrl} className="h-8 w-8 rounded-full object-cover shrink-0" alt="" />
                    ) : (
                      <div className={cn('h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0', getAvatarColor(item.clientName))}>
                        {getInitials(item.clientName)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700">
                        <span className="font-medium">{item.clientName}</span>{' '}
                        <span className="text-slate-500">{item.description}</span>
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">{formatRelativeTime(item.occurredAt)}</p>
                    </div>
                    {item.type === 'workout_completed' && <CheckCircle className="h-4 w-4 text-success-500 shrink-0" />}
                    {item.type === 'check_in_submitted' && <ClipboardCheck className="h-4 w-4 text-brand-500 shrink-0" />}
                  </div>
                ))
              ) : (
                // Mock activity when API not connected
                [
                  { id: '1', name: 'Sarah Chen', text: 'completed Week 3 Day 2 - Push Day', time: '12 min ago', icon: 'workout' },
                  { id: '2', name: 'Marcus Lee', text: 'submitted weekly check-in', time: '45 min ago', icon: 'checkin' },
                  { id: '3', name: 'Jordan Kim', text: 'logged in to the app', time: '1 hour ago', icon: 'login' },
                  { id: '4', name: 'Alex Torres', text: 'completed Week 1 Day 4 - Leg Day', time: '2 hours ago', icon: 'workout' },
                  { id: '5', name: 'Emma Davis', text: 'submitted weekly check-in', time: '3 hours ago', icon: 'checkin' },
                ].map((item) => (
                  <div key={item.id} className="flex items-center gap-3 px-6 py-3.5">
                    <div className={cn('h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0', getAvatarColor(item.name))}>
                      {getInitials(item.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700">
                        <span className="font-medium">{item.name}</span>{' '}
                        <span className="text-slate-500">{item.text}</span>
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">{item.time}</p>
                    </div>
                    {item.icon === 'workout' && <CheckCircle className="h-4 w-4 text-success-500 shrink-0" />}
                    {item.icon === 'checkin' && <ClipboardCheck className="h-4 w-4 text-brand-500 shrink-0" />}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Quick actions */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Quick Actions</h3>
            <div className="space-y-2.5">
              <button
                onClick={() => setInviteOpen(true)}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-lg border border-slate-200 hover:border-brand-300 hover:bg-brand-50 transition-all group text-left"
              >
                <div className="p-2 rounded-lg bg-brand-100 group-hover:bg-brand-200 transition-colors">
                  <UserPlus className="h-4 w-4 text-brand-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">Invite Client</p>
                  <p className="text-xs text-slate-500">Add a new client to your roster</p>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-brand-600 transition-colors" />
              </button>

              <Link
                href="/templates"
                className="flex items-center gap-3 w-full px-4 py-3 rounded-lg border border-slate-200 hover:border-purple-300 hover:bg-purple-50 transition-all group text-left"
              >
                <div className="p-2 rounded-lg bg-purple-100 group-hover:bg-purple-200 transition-colors">
                  <BookOpen className="h-4 w-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">Create Template</p>
                  <p className="text-xs text-slate-500">Build a reusable program</p>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-purple-600 transition-colors" />
              </Link>

              <Link
                href="/clients?filter=needs_attention"
                className="flex items-center gap-3 w-full px-4 py-3 rounded-lg border border-slate-200 hover:border-orange-300 hover:bg-orange-50 transition-all group text-left"
              >
                <div className="p-2 rounded-lg bg-orange-100 group-hover:bg-orange-200 transition-colors">
                  <ClipboardCheck className="h-4 w-4 text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">Review Check-ins</p>
                  <p className="text-xs text-slate-500">{stats.checkInsDue} pending reviews</p>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-orange-600 transition-colors" />
              </Link>

              <Link
                href="/messages"
                className="flex items-center gap-3 w-full px-4 py-3 rounded-lg border border-slate-200 hover:border-green-300 hover:bg-green-50 transition-all group text-left"
              >
                <div className="p-2 rounded-lg bg-green-100 group-hover:bg-green-200 transition-colors">
                  <MessageCircle className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">Messages</p>
                  <p className="text-xs text-slate-500">2 unread conversations</p>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-green-600 transition-colors" />
              </Link>
            </div>
          </div>

          {/* Clients needing attention */}
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
              <AlertTriangle className="h-4 w-4 text-warning-500" />
              <h3 className="font-semibold text-slate-900">Needs Attention</h3>
              {!attentionLoading && (
                <Badge variant="warning" className="ml-auto">
                  {needsAttention?.length || 3}
                </Badge>
              )}
            </div>
            <div className="divide-y divide-slate-50">
              {attentionLoading ? (
                <div className="px-5 py-4 space-y-3 animate-pulse">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-slate-200" />
                      <div className="flex-1">
                        <div className="h-3 bg-slate-200 rounded w-24 mb-1" />
                        <div className="h-2.5 bg-slate-200 rounded w-36" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : needsAttention && needsAttention.length > 0 ? (
                needsAttention.slice(0, 5).map((client) => (
                  <Link key={client.id} href={`/clients/${client.id}`}>
                    <div className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors">
                      <div className={cn('h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0', getAvatarColor(client.name))}>
                        {getInitials(client.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{client.name}</p>
                        <p className="text-xs text-slate-400 truncate">{formatGoal(client.goal)}</p>
                      </div>
                      <ClientStatusBadge status={client.status} />
                    </div>
                  </Link>
                ))
              ) : (
                // Mock attention clients
                [
                  { id: 'a1', name: 'Mike Johnson', reason: 'No login in 8 days', color: 'bg-red-500' },
                  { id: 'a2', name: 'Lisa Park', reason: 'Check-in overdue 3 days', color: 'bg-orange-500' },
                  { id: 'a3', name: 'Tom Wilson', reason: 'Compliance dropped to 42%', color: 'bg-yellow-500' },
                ].map((item) => (
                  <div key={item.id} className="flex items-center gap-3 px-5 py-3.5">
                    <div className={cn('h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0', item.color)}>
                      {getInitials(item.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">{item.name}</p>
                      <p className="text-xs text-warning-600">{item.reason}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent messages */}
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900">Recent Messages</h3>
              <Link href="/messages" className="text-sm text-brand-600 hover:text-brand-700 font-medium">
                View all
              </Link>
            </div>
            <div className="divide-y divide-slate-50">
              {mockMessages.map((msg) => (
                <Link key={msg.id} href="/messages">
                  <div className="flex items-start gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors">
                    <div className={cn('h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0', msg.avatarColor)}>
                      {getInitials(msg.from)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={cn('text-sm truncate', msg.unread ? 'font-semibold text-slate-900' : 'font-medium text-slate-700')}>
                          {msg.from}
                        </p>
                        <span className="text-xs text-slate-400 shrink-0">{msg.time}</span>
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{msg.preview}</p>
                    </div>
                    {msg.unread && <span className="h-2 w-2 rounded-full bg-brand-600 shrink-0 mt-1.5" />}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <InviteClientModal isOpen={inviteOpen} onClose={() => setInviteOpen(false)} />
    </div>
  );
}
