import React from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant =
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'outline';

type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-slate-100 text-slate-700',
  primary: 'bg-brand-100 text-brand-700',
  success: 'bg-success-100 text-success-700',
  warning: 'bg-warning-100 text-warning-700',
  danger: 'bg-danger-100 text-danger-700',
  info: 'bg-cyan-100 text-cyan-700',
  outline: 'border border-slate-300 text-slate-600 bg-white',
};

const dotColors: Record<BadgeVariant, string> = {
  default: 'bg-slate-400',
  primary: 'bg-brand-500',
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  danger: 'bg-danger-500',
  info: 'bg-cyan-500',
  outline: 'bg-slate-400',
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
};

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {dot && (
        <span className={cn('h-1.5 w-1.5 rounded-full', dotColors[variant])} />
      )}
      {children}
    </span>
  );
}

// Status-specific badges
export function ClientStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; variant: BadgeVariant }> = {
    active: { label: 'Active', variant: 'success' },
    inactive: { label: 'Inactive', variant: 'default' },
    needs_attention: { label: 'Needs Attention', variant: 'warning' },
    pending: { label: 'Pending', variant: 'info' },
  };
  const { label, variant } = config[status] || { label: status, variant: 'default' };
  return <Badge variant={variant} dot>{label}</Badge>;
}

export function ComplianceBadge({ rate }: { rate: number }) {
  const variant: BadgeVariant = rate >= 80 ? 'success' : rate >= 60 ? 'warning' : 'danger';
  return <Badge variant={variant}>{rate}%</Badge>;
}

export function GoalBadge({ goal }: { goal: string }) {
  const labels: Record<string, string> = {
    weight_loss: 'Weight Loss',
    muscle_gain: 'Muscle Gain',
    strength: 'Strength',
    endurance: 'Endurance',
    general_fitness: 'General Fitness',
    flexibility: 'Flexibility',
    sport_performance: 'Sport Performance',
  };
  return <Badge variant="primary">{labels[goal] || goal}</Badge>;
}

export function ExperienceBadge({ level }: { level: string }) {
  const config: Record<string, { label: string; variant: BadgeVariant }> = {
    beginner: { label: 'Beginner', variant: 'info' },
    intermediate: { label: 'Intermediate', variant: 'primary' },
    advanced: { label: 'Advanced', variant: 'warning' },
  };
  const { label, variant } = config[level] || { label: level, variant: 'default' };
  return <Badge variant={variant}>{label}</Badge>;
}

export default Badge;
