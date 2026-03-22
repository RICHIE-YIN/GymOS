'use client';

import React from 'react';
import Link from 'next/link';
import { cn, getInitials, getAvatarColor, formatRelativeTime, formatGoal } from '@/lib/utils';
import { Client } from '@/types';
import { ClientStatusBadge, ComplianceBadge } from '@/components/ui/Badge';
import { TrendingUp, TrendingDown, Minus, MessageCircle, ClipboardList } from 'lucide-react';

interface ClientCardProps {
  client: Client;
  view?: 'card' | 'row';
}

function WeightTrendIcon({ trend }: { trend: Client['weightTrend'] }) {
  if (trend === 'up') return <TrendingUp className="h-4 w-4 text-danger-500" />;
  if (trend === 'down') return <TrendingDown className="h-4 w-4 text-success-500" />;
  return <Minus className="h-4 w-4 text-slate-400" />;
}

export function ClientCard({ client, view = 'card' }: ClientCardProps) {
  if (view === 'row') {
    return (
      <div className="flex items-center gap-4 py-3.5 px-4 hover:bg-slate-50 transition-colors rounded-lg">
        {/* Avatar */}
        <Link href={`/clients/${client.id}`} className="shrink-0">
          {client.avatarUrl ? (
            <img
              src={client.avatarUrl}
              alt={client.name}
              className="h-9 w-9 rounded-full object-cover"
            />
          ) : (
            <div
              className={cn(
                'h-9 w-9 rounded-full flex items-center justify-center text-white text-sm font-bold',
                getAvatarColor(client.name)
              )}
            >
              {getInitials(client.name)}
            </div>
          )}
        </Link>

        {/* Name + goal */}
        <div className="flex-1 min-w-0">
          <Link href={`/clients/${client.id}`}>
            <p className="text-sm font-semibold text-slate-900 hover:text-brand-600 transition-colors truncate">
              {client.name}
            </p>
          </Link>
          <p className="text-xs text-slate-500 truncate">{formatGoal(client.goal)}</p>
        </div>

        {/* Last active */}
        <div className="hidden sm:block text-xs text-slate-500 min-w-[90px] text-right">
          {formatRelativeTime(client.lastActiveAt)}
        </div>

        {/* Compliance */}
        <div className="hidden md:block min-w-[60px] text-right">
          <ComplianceBadge rate={client.complianceRate} />
        </div>

        {/* Weight trend */}
        <div className="hidden lg:flex items-center gap-1 min-w-[80px] justify-end">
          <WeightTrendIcon trend={client.weightTrend} />
          {client.weightTrendValue !== undefined && (
            <span className="text-xs text-slate-500">
              {client.weightTrendValue > 0 ? '+' : ''}
              {client.weightTrendValue.toFixed(1)}{client.metrics.weightUnit}
            </span>
          )}
        </div>

        {/* Status */}
        <div className="hidden lg:block">
          <ClientStatusBadge status={client.status} />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <Link
            href={`/clients/${client.id}?tab=messages`}
            className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
            title="Message"
          >
            <MessageCircle className="h-4 w-4" />
          </Link>
          <Link
            href={`/clients/${client.id}?tab=program`}
            className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
            title="Program"
          >
            <ClipboardList className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  // Card view
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-card-hover transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <Link href={`/clients/${client.id}`} className="flex items-center gap-3">
          {client.avatarUrl ? (
            <img
              src={client.avatarUrl}
              alt={client.name}
              className="h-11 w-11 rounded-full object-cover"
            />
          ) : (
            <div
              className={cn(
                'h-11 w-11 rounded-full flex items-center justify-center text-white font-bold',
                getAvatarColor(client.name)
              )}
            >
              {getInitials(client.name)}
            </div>
          )}
          <div className="min-w-0">
            <p className="font-semibold text-slate-900 hover:text-brand-600 transition-colors truncate">
              {client.name}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">{formatGoal(client.goal)}</p>
          </div>
        </Link>
        <ClientStatusBadge status={client.status} />
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center">
          <p className="text-lg font-bold text-slate-900">{client.complianceRate}%</p>
          <p className="text-xs text-slate-500">Compliance</p>
        </div>
        <div className="text-center border-x border-slate-100">
          <div className="flex items-center justify-center gap-1">
            <WeightTrendIcon trend={client.weightTrend} />
            <p className="text-lg font-bold text-slate-900">
              {client.weightTrendValue !== undefined
                ? `${Math.abs(client.weightTrendValue).toFixed(1)}`
                : '--'}
            </p>
          </div>
          <p className="text-xs text-slate-500">{client.metrics.weightUnit} / 30d</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-slate-900">{client.checkInsDue}</p>
          <p className="text-xs text-slate-500">Check-ins Due</p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <p className="text-xs text-slate-400">
          Active {formatRelativeTime(client.lastActiveAt)}
        </p>
        <div className="flex items-center gap-1">
          <Link
            href={`/clients/${client.id}?tab=messages`}
            className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
          </Link>
          <Link
            href={`/clients/${client.id}`}
            className="px-2.5 py-1 rounded-lg text-xs font-medium text-brand-600 hover:text-brand-700 hover:bg-brand-50 transition-colors"
          >
            View
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ClientCard;
